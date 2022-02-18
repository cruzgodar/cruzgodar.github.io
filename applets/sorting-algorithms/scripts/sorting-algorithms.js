!function()
{
	"use strict";
	
	
	
	let resolution = 2000;
	
	let data_length = null;
	let data = [];
	let brightness = [];
	let max_brightness = 40;
	
	let current_generator = null;
	
	let min_frequency = 30;
	let max_frequency = 800;
	
	let do_play_sound = true;
	
	let last_timestamp = -1;
	
	let starting_process_id = null;
	
	let generators = [shuffle_array, bubble_sort, verify_array];
	let current_generator_index = 0;
	
	let changing_sound = false;
	
	let audio_nodes = [];
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float data_length;
		
		const float circle_size = .8;
		
		uniform sampler2D u_texture;
		
		
		
		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		
		
		void main(void)
		{
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			if (length(uv) <= circle_size)
			{
				float sample = mod(atan(uv.y, uv.x) / 6.283, 1.0);
				
				vec4 output_1 = texture2D(u_texture, vec2(floor(sample * data_length) / data_length, .5));
				vec4 output_2 = texture2D(u_texture, vec2(mod(floor(sample * data_length + 1.0) / data_length, 1.0), .5));
				
				float brightness = mix(output_1.z, output_2.z, fract(sample * data_length));
				
				float h_1 = (output_1.x * 256.0 + output_1.y) / data_length * 255.0;
				float h_2 = (output_2.x * 256.0 + output_2.y) / data_length * 255.0;
				
				if (abs(h_1 - h_2) > .5)
				{
					if (h_1 > h_2)
					{
						h_1 -= 1.0;
					}
					
					else
					{
						h_2 -= 1.0;
					}
				}
				
				
				
				float h = mix(h_1, h_2, fract(sample * data_length));
				
				float s = clamp((length(uv) / circle_size - .03) * (1.0 - brightness), 0.0, 1.0);
				
				float v = min(1.0, (1.0 - length(uv) / circle_size) * 100.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		}
	`;
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 2000,
		canvas_height: 2000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	wilson.render.init_uniforms(["data_length"]);
	
	
	
	let texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_sorting_algorithm);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_sorting_algorithm();
		}
	});
	
	
	
	let array_size_input_element = document.querySelector("#array-size-input");
	
	array_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_sorting_algorithm();
		}
	});
	
	
	
	let play_sound_checkbox_element = document.querySelector("#play-sound-checkbox");
	
	let audio_context = null;
	let audio_oscillator = null;
	let audio_gain_node = null;
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-aztec-diamond.png");
	});
	
	
	
	function draw_sorting_algorithm()
	{
		try {audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + .016);}
		catch(ex) {}
		
		
		
		starting_process_id = Site.applet_process_id;
		
		
		
		resolution = parseInt(resolution_input_element.value || 2000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		
		
		data_length = parseInt(array_size_input_element.value || 256);
		data = new Array(data_length);
		brightness = new Array(data_length);
		
		for (let i = 0; i < data_length; i++)
		{
			data[i] = i;
			brightness[i] = 0;
		}
		
		wilson.gl.uniform1f(wilson.uniforms["data_length"], data_length);
		
		
		
		do_play_sound = play_sound_checkbox_element.checked;
		
		
		
		generators = [shuffle_array, heapsort, verify_array];
		current_generator_index = 0;
		
		audio_nodes = [];
		create_audio_nodes();
		
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][1].start(0);
		}
		
		current_generator = generators[0]();
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		let texture_data = new Uint8Array(data_length * 4);
		
		for (let i = 0; i < data_length; i++)
		{
			texture_data[4 * i] = Math.floor(data[i] / 256);
			texture_data[4 * i + 1] = data[i] % 256;
			
			texture_data[4 * i + 2] = Math.floor(brightness[i] / max_brightness * 256);
		}
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, data_length, 1, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, texture_data);
		
		wilson.render.draw_frame();
		
		decrease_brightness();
		
		if (!changing_sound)
		{
			current_generator.next();
		}
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			try {audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + .016);}
			catch(ex) {}
			
			return;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function create_audio_nodes()
	{
		if (do_play_sound)
		{
			for (let i = 0; i < generators.length; i++)
			{
				let audio_context = new AudioContext();
				
				let audio_oscillator = audio_context.createOscillator();
				
				audio_oscillator.type = "sine";
				
				audio_oscillator.frequency.value = 50;
				
				let audio_gain_node = audio_context.createGain();
				
				audio_oscillator.connect(audio_gain_node);
				
				audio_gain_node.connect(audio_context.destination);
				
				
				
				audio_nodes.push([audio_context, audio_oscillator, audio_gain_node]);
			}
		}
	}
	
	function highlight_position(index)
	{
		brightness[index] = max_brightness - 1;
	}
	
	function play_sound(index)
	{
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][1].frequency.linearRampToValueAtTime((max_frequency - min_frequency) * data[index] / data_length + min_frequency, audio_nodes[current_generator_index][0].currentTime + .016);
		}
	}
	
	function decrease_brightness()
	{
		for (let i = 0; i < data_length; i++)
		{
			brightness[i] = Math.max(brightness[i] - 1, 0);
		}
	}
	
	function advance_generator()
	{
		changing_sound = true;
		
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + .016);
		}
		
		current_generator_index++;
		
		if (current_generator_index < generators.length)
		{
			setTimeout(() =>
			{
				if (do_play_sound)
				{
					audio_nodes[current_generator_index][1].start(0);
				}
				
				current_generator = generators[current_generator_index]();
				
				changing_sound = false;
			}, 1000);
		}
	}
	
	
	
	function* shuffle_array()
	{
		let step = Math.ceil(data_length / 100);
		
		for (let i = 0; i < data_length - 1; i++)
		{
			let j = Math.floor(Math.random() * (data_length - i - 1)) + i;
			
			let temp = data[i];
			data[i] = data[j];
			data[j] = temp;
			
			highlight_position(i);
			highlight_position(j);
			
			if ((i + 1) % step === 0)
			{
				play_sound(i);
				
				yield;
			}
		}
		
		advance_generator();
	}
	
	
	
	function* verify_array()
	{
		let step = Math.ceil(data_length / 100);
		
		for (let i = 0; i < data_length; i++)
		{
			highlight_position(i);
			
			if ((i + 1) % step === 0)
			{
				play_sound(i);
				
				yield;
			}
		}
		
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + .016);
		}
	}
	
	
	
	function* bubble_sort()
	{
		let step = Math.ceil(data_length / 50);
		
		let num_operations = 0;
		
		
		
		while (true)
		{
			let done = true;
			
			for (let i = 0; i < data_length - 1; i++)
			{
				if (data[i] > data[i + 1])
				{
					done = false;
					
					let temp = data[i];
					data[i] = data[i + 1];
					data[i + 1] = temp;
					
					
					
					highlight_position(i);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(i);
						
						yield;
					}
					
					
					
					highlight_position(i + 1);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(i);
						
						yield;
					}
				}
			}
			
			if (done)
			{
				break;
			}
		}
		
		
		
		advance_generator();
	}
	
	
	
	function* insertion_sort()
	{
		let step = Math.ceil(data_length * data_length / 20000);
		
		let num_operations = 0;
		
		
		
		for (let i = 1; i < data_length; i++)
		{
			if (data[i] < data[i - 1])
			{
				for (let j = 0; j < i; j++)
				{
					if (data[j] > data[i])
					{
						let temp = data[i];
						
						for (let k = i; k > j; k--)
						{
							data[k] = data[k - 1];
							
							
							
							highlight_position(k);
							
							num_operations++;
							
							if (num_operations % step === 0)
							{
								play_sound(k);
								
								yield;
							}
						}
						
						data[j] = temp;
						
						
						
						highlight_position(j);
						
						num_operations++;
						
						if (num_operations % step === 0)
						{
							play_sound(j);
							
							yield;
						}
					}
				}
			}
		}
		
		
		
		advance_generator();
	}
	
	
	
	function* selection_sort()
	{
		let step = Math.ceil(data_length / 500);
		
		let num_operations = 0;
		
		
		
		for (let i = 0; i < data_length; i++)
		{
			let min_index = -1;
			let min_element = data_length;
			
			for (let j = i; j < data_length; j++)
			{
				if (data[j] < min_element)
				{
					min_element = data[j];
					min_index = j;
				}
			}
			
			let temp = data[i];
			data[i] = min_element;
			data[min_index] = temp;
			
			
			
			highlight_position(i);
			
			num_operations++;
			
			if (num_operations % step === 0)
			{
				play_sound(i);
				
				yield;
			}
			
			
			
			highlight_position(min_index);
			
			num_operations++;
			
			if (num_operations % step === 0)
			{
				play_sound(min_index);
				
				yield;
			}
		}
		
		
		
		advance_generator();
	}
	
	
	
	function* heapsort()
	{
		let step = Math.ceil(data_length / 200);
		
		let num_operations = 0;
		
		
		
		//Build the heap.
		
		for (let i = 1; i < data_length; i++)
		{
			let index = i;
			let index_2 = 0;
			
			while (index !== 0)
			{
				index_2 = Math.floor((index - 1) / 2);
				
				if (data[index] > data[index_2])
				{
					let temp = data[index];
					data[index] = data[index_2];
					data[index_2] = temp;
					
					
					
					highlight_position(index);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(index);
						
						yield;
					}
					
					
					
					highlight_position(index_2);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(index_2);
						
						yield;
					}
					
					
					
					index = index_2;
				}
				
				else
				{
					break;
				}
			}
		}
		
		
		
		//Disassemble the heap.
		
		for (let i = data_length - 1; i >= 0; i--)
		{
			let temp = data[0];
			data[0] = data[i];
			data[i] = temp;
			
			
			
			highlight_position(0);
			
			num_operations++;
			
			if (num_operations % step === 0)
			{
				play_sound(0);
				
				yield;
			}
			
			
			
			highlight_position(i);
			
			num_operations++;
			
			if (num_operations % step === 0)
			{
				play_sound(i);
				
				yield;
			}
			
			
			
			let index = 0;
			
			let child_1 = 0;
			let child_2 = 0;
			let max_child = 0;
			
			while (true)
			{
				child_1 = 2 * index + 1;
				child_2 = child_1 + 1;
				
				if (child_1 >= i)
				{
					break;
				}
				
				else if (child_2 >= i)
				{
					max_child = child_1;
				}
				
				else
				{
					max_child = data[child_1] > data[child_2] ? child_1 : child_2;
				}
				
				
				
				if (data[index] < data[max_child])
				{
					let temp = data[index];
					data[index] = data[max_child];
					data[max_child] = temp;
					
					
					
					highlight_position(index);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(index);
						
						yield;
					}
					
					
					
					highlight_position(max_child);
					
					num_operations++;
					
					if (num_operations % step === 0)
					{
						play_sound(max_child);
						
						yield;
					}
					
					
					
					index = max_child;
				}
				
				else
				{
					break;
				}
			}
		}
		
		
		
		advance_generator();
	}
}()