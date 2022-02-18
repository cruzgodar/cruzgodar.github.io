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
		
		
		
		try {audio_gain_node.gain.exponentialRampToValueAtTime(.00001, audio_context.currentTime + .1)}
		catch(ex) {}
		
		do_play_sound = play_sound_checkbox_element.checked;
		
		if (do_play_sound)
		{
			audio_context = new AudioContext();
			
			audio_oscillator = audio_context.createOscillator();
			
			audio_oscillator.type = "sine";
			
			audio_oscillator.frequency.value = 50;
			
			audio_gain_node = audio_context.createGain();
			
			audio_oscillator.connect(audio_gain_node);
			
			audio_gain_node.connect(audio_context.destination);
			
			audio_oscillator.start(0);
		}
		
		
		
		current_generator = verify_array();//shuffle_array();
		
		
		
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
		
		current_generator.next();
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function highlight_position(index)
	{
		brightness[index] = max_brightness - 1;
	}
	
	function play_sound(index)
	{
		if (do_play_sound)
		{
			audio_oscillator.frequency.linearRampToValueAtTime((max_frequency - min_frequency) * data[index] / data_length + min_frequency, audio_context.currentTime + .016);
		}
	}
	
	function decrease_brightness()
	{
		for (let i = 0; i < data_length; i++)
		{
			brightness[i] = Math.max(brightness[i] - 1, 0);
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
			
			if ((i + 1) % step === 0)
			{
				play_sound(i);
				
				yield;
			}
		}
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
			audio_gain_node.gain.exponentialRampToValueAtTime(.00001, audio_context.currentTime + .1);
		}
	}
}()