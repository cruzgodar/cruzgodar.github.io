!function()
{
	"use strict";
	
	
	
	let resolution = 2000;
	
	let data_length = null;
	let data = [];
	let brightness = [];
	let max_brightness = 40;
	
	let current_generator = null;
	
	let min_frequency = 20;
	let max_frequency = 600;
	
	let do_play_sound = true;
	
	let last_timestamp = -1;
	let time_elapsed = 0;
	
	let starting_process_id = null;
	
	let algorithms =
	{
		"bubble": bubble_sort,
		"insertion": insertion_sort,
		"selection": selection_sort,
		"heap": heapsort,
		"merge": merge_sort,
		"quick": quicksort,
		"cycle": cycle_sort,
		"msd-radix": msd_radix_sort,
		"lsd-radix": lsd_radix_sort,
		"gravity": gravity_sort
	};
	
	let generators = [shuffle_array, null, verify_array];
	let current_generator_index = 0;
	
	let num_reads = 0;
	let num_writes = 0;
	let in_frame_operations = 0;
	let operations_per_frame = 1;
	let update_reads_and_writes = false;
	
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
				
				float v = clamp((1.0 - length(uv) / circle_size) * 100.0, 0.0, 1.0);
				
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
	
	
	
	let algorithm_selector_dropdown_element = document.querySelector("#algorithm-selector-dropdown");
	
	algorithm_selector_dropdown_element.addEventListener("input", () =>
	{
		Page.set_element_styles(".info-text", "opacity", 0);
		
		setTimeout(() =>
		{
			Page.set_element_styles(".info-text", "display", "none");
			
			let element = document.querySelector(`#${algorithm_selector_dropdown_element.value}-info`);
			
			element.style.display = "block";
			
			setTimeout(() =>
			{
				element.style.opacity = 1;
			}, 10);
		}, Site.opacity_animation_time);	
	});
	
	
	
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
	
	play_sound_checkbox_element.checked = true;
	
	let audio_context = null;
	let audio_oscillator = null;
	let audio_gain_node = null;
	
	
	
	let num_reads_element = document.querySelector("#num-reads");
	
	let num_writes_element = document.querySelector("#num-writes");
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-aztec-diamond.png");
	});
	
	
	
	function draw_sorting_algorithm()
	{
		try {audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);}
		catch(ex) {}
		
		
		
		starting_process_id = Site.applet_process_id;
		
		
		
		resolution = parseInt(resolution_input_element.value || 2000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		
		
		let old_data_length = data_length;
		data_length = parseInt(array_size_input_element.value || 256);
		
		if (data_length !== old_data_length)
		{
			data = new Array(data_length);
			brightness = new Array(data_length);
			
			for (let i = 0; i < data_length; i++)
			{
				data[i] = i;
				brightness[i] = 0;
			}
			
			wilson.gl.uniform1f(wilson.uniforms["data_length"], data_length);
		}	
		
		
		
		num_reads = 0;
		num_writes = 0;
		in_frame_operations = 0;
		
		update_reads_and_writes = false;
		
		num_reads_element.textContent = "0";
		num_writes_element.textContent = "0";
		
		
		
		do_play_sound = play_sound_checkbox_element.checked;
		
		
		
		generators = [shuffle_array, algorithms[algorithm_selector_dropdown_element.value], verify_array];
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
		time_elapsed = timestamp - last_timestamp;
		
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
		
		if (update_reads_and_writes)
		{
			num_reads_element.textContent = num_reads;
			num_writes_element.textContent = num_writes;
		}
		
		if (!changing_sound)
		{
			current_generator.next();
		}
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			try {audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);}
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
	
	function read_from_position(index, highlight = false)
	{
		num_reads++;
	}
	
	function write_to_position(index, highlight = true, sound = true)
	{
		if (highlight)
		{
			brightness[index] = max_brightness - 1;
		}	
		
		num_writes++;
		
		in_frame_operations++;
		
		if (in_frame_operations >= operations_per_frame)
		{
			in_frame_operations = 0;
			
			if (sound)
			{
				play_sound(index);
			}	
				
			return true;
		}
		
		return false;
	}
	
	function play_sound(index)
	{
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][1].frequency.linearRampToValueAtTime((max_frequency - min_frequency) * data[index] / data_length + min_frequency, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);
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
			audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);
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
		operations_per_frame = Math.ceil(data_length / 60);
		
		for (let i = 0; i < data_length - 1; i++)
		{
			let j = Math.floor(Math.random() * (data_length - i - 1)) + i;
			
			let temp = data[i];
			data[i] = data[j];
			data[j] = temp;
			
			if (write_to_position(i)) {yield}
			if (write_to_position(j)) {yield}
		}
		
		num_reads = 0;
		num_writes = 0;
		
		update_reads_and_writes = true;
		
		advance_generator();
	}
	
	
	
	function* verify_array()
	{
		update_reads_and_writes = false;
		
		operations_per_frame = Math.ceil(data_length / 60);
		
		for (let i = 0; i < data_length; i++)
		{
			//This isn't actually a write, but we want to animate the process.
			if (write_to_position(i)) {yield}
		}
		
		if (do_play_sound)
		{
			audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);
		}
	}
	
	
	
	function* bubble_sort()
	{
		operations_per_frame = Math.ceil(data_length * data_length / 2500);
		
		while (true)
		{
			let done = true;
			
			for (let i = 0; i < data_length - 1; i++)
			{
				read_from_position(i);
				read_from_position(i + 1);
				
				if (data[i] > data[i + 1])
				{
					done = false;
					
					let temp = data[i];
					data[i] = data[i + 1];
					data[i + 1] = temp;
					
					if (write_to_position(i)) {yield}
					if (write_to_position(i + 1)) {yield}
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
		operations_per_frame = Math.ceil(data_length * data_length / 5000);
		
		for (let i = 1; i < data_length; i++)
		{
			read_from_position(i);
			read_from_position(i - 1);
			
			if (data[i] < data[i - 1])
			{
				for (let j = 0; j < i; j++)
				{
					read_from_position(j);
					read_from_position(i);
					
					if (data[j] > data[i])
					{
						let temp = data[i];
						
						for (let k = i; k > j; k--)
						{
							data[k] = data[k - 1];
							
							if (write_to_position(k)) {yield}
						}
						
						data[j] = temp;
						
						if (write_to_position(j)) {yield}
					}
				}
			}
		}
		
		advance_generator();
	}
	
	
	
	function* selection_sort()
	{
		operations_per_frame = Math.ceil(data_length / 1000);
		
		for (let i = 0; i < data_length; i++)
		{
			let min_index = -1;
			let min_element = data_length;
			
			for (let j = i; j < data_length; j++)
			{
				read_from_position(j);
				read_from_position(min_element);
				
				if (data[j] < min_element)
				{
					min_element = data[j];
					min_index = j;
				}
			}
			
			let temp = data[i];
			data[i] = min_element;
			data[min_index] = temp;
			
			if (write_to_position(i)) {yield}
			if (write_to_position(min_index)) {yield}
		}
		
		advance_generator();
	}
	
	
	
	function* heapsort()
	{
		operations_per_frame = Math.ceil(data_length * Math.log(data_length) / 500);
		
		//Build the heap.
		for (let i = 1; i < data_length; i++)
		{
			let index = i;
			let index_2 = 0;
			
			while (index !== 0)
			{
				index_2 = Math.floor((index - 1) / 2);
				
				read_from_position(index);
				read_from_position(index_2);
				
				if (data[index] > data[index_2])
				{
					let temp = data[index];
					data[index] = data[index_2];
					data[index_2] = temp;
					
					if (write_to_position(index)) {yield}
					if (write_to_position(index_2)) {yield}
					
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
			
			if (write_to_position(0)) {yield}
			if (write_to_position(i)) {yield}
			
			
			
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
					read_from_position(child_1);
					read_from_position(child_2);
					
					max_child = data[child_1] > data[child_2] ? child_1 : child_2;
				}
				
				
				
				read_from_position(index);
				read_from_position(max_child);
				
				if (data[index] < data[max_child])
				{
					let temp = data[index];
					data[index] = data[max_child];
					data[max_child] = temp;
					
					if (write_to_position(index)) {yield}
					if (write_to_position(max_child)) {yield}
					
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
	
	
	
	function* merge_sort()
	{
		operations_per_frame = Math.ceil(data_length * Math.log(data_length) / 450);
		
		let aux_array = new Array(data_length);
		
		let block_size = 1;
		
		while (true)
		{
			//First iterate over blocks.
			for (let i = 0; i < data_length; i += 2 * block_size)
			{
				//Within each block, we need to place things in the right order into the auxiliary array.
				let index_1 = 0;
				let index_2 = block_size;
				let aux_index = 0;
				
				while (true)
				{
					if (index_2 + i >= data_length || index_2 >= 2*block_size)
					{
						if (index_1 >= block_size || i + index_1 >= data_length)
						{
							break;
						}
						
						aux_array[aux_index] = data[i + index_1];
						
						if (write_to_position(i + index_1)) {yield}
						
						index_1++;
						aux_index++;
					}
					
					else if (index_1 >= block_size || i + index_1 >= data_length)
					{
						aux_array[aux_index] = data[i + index_2];
						
						if (write_to_position(i + index_2)) {yield}
						
						index_2++;
						aux_index++;
					}
					
					else
					{
						read_from_position(i + index_1);
						read_from_position(i + index_2);
						
						if (data[i + index_1] < data[i + index_2])
						{
							aux_array[aux_index] = data[i + index_1];
							
							if (write_to_position(i + index_1)) {yield}
							
							index_1++;
							aux_index++;
						}
						
						else
						{
							aux_array[aux_index] = data[i + index_2];
							
							if (write_to_position(i + index_2)) {yield}
							
							index_2++;
							aux_index++;
						}
					}
				}
				
				//Copy the aux array back into the original one.
				for (let j = 0; j < 2 * block_size; j++)
				{
					if (i + j >= data_length)
					{
						break;
					}
					
					data[i + j] = aux_array[j];
					
					if (write_to_position(i + j)) {yield}
				}
			}
			
			block_size *= 2;
			
			if (block_size >= data_length)
			{
				break;
			}
		}
		
		advance_generator();
	}
	
	
	
	function* quicksort()
	{
		operations_per_frame = Math.ceil(data_length * Math.log(data_length) / 2250);
		
		let current_endpoints = new Array(data_length);
		current_endpoints[0] = 0;
		current_endpoints[1] = data_length - 1;
		
		let next_endpoints = new Array(data_length);
		
		let num_blocks = 1;
		let next_num_blocks = 0;
		
		
		
		while (num_blocks > 0)
		{
			for (let i = 0; i < num_blocks; i++)
			{
				//For each block, pick the middle element as the pivot.
				let pivot = data[Math.floor((current_endpoints[2 * i] + current_endpoints[2 * i + 1]) / 2)];
				read_from_position(Math.floor((current_endpoints[2 * i] + current_endpoints[2 * i + 1]) / 2));
				
				//Now we need to split the block so that everything before the pivot is less than it and everything after is greater.
				let left_index = current_endpoints[2 * i] - 1;
				let right_index = current_endpoints[2 * i + 1] + 1;
				
				while (true)
				{
					do
					{
						left_index++;
						read_from_position(left_index);
					} while (data[left_index] < pivot)
					
					read_from_position(left_index);
					
					do
					{
						right_index--;
						read_from_position(right_index);
					} while (data[right_index] > pivot)
					
					read_from_position(right_index);
					
					if (left_index >= right_index)
					{
						break;
					}
					
					let temp = data[left_index];
					data[left_index] = data[right_index];
					data[right_index] = temp;
					
					if (write_to_position(left_index)) {yield}
					if (write_to_position(right_index)) {yield}
				}
				
				if (right_index > current_endpoints[2 * i])
				{
					next_endpoints[2 * next_num_blocks] = current_endpoints[2 * i];
					next_endpoints[2 * next_num_blocks + 1] = right_index;
					
					next_num_blocks++;
				}
				
				if (current_endpoints[2 * i + 1] > right_index + 1)
				{
					next_endpoints[2 * next_num_blocks] = right_index + 1;
					next_endpoints[2 * next_num_blocks + 1] = current_endpoints[2 * i + 1];
					
					next_num_blocks++;
				}
			}
			
			
			
			num_blocks = next_num_blocks;
			next_num_blocks = 0;
			
			for (let i = 0; i < 2 * num_blocks; i++)
			{
				current_endpoints[i] = next_endpoints[i];
			}
		}
		
		advance_generator();
	}
	
	
	
	function* cycle_sort()
	{
		operations_per_frame = Math.ceil(data_length / 2000);
		
		let done = new Array(data_length);
		
		for (let i = 0; i < data_length; i++)
		{
			done[i] = false;
		}
		
		for (let i = 0; i < data_length; i++)
		{
			if (done[i])
			{
				continue;
			}
			
			read_from_position(i);
			
			let popped_entry = data[i];
			let first_popped_entry = popped_entry;
			let index = 0;
			
			do
			{
				//Figure out where this index should go.
				index = 0;
				
				for (let j = 0; j < data_length; j++)
				{
					read_from_position(j);
					
					if (data[j] < popped_entry)
					{
						index++;
					}
				}
				
				if (popped_entry > first_popped_entry)
				{
					index--;
				}
				
				let temp = data[index];
				data[index] = popped_entry;
				popped_entry = temp;
				
				if (write_to_position(index)) {yield}
				
				done[index] = true;
			} while (index !== i)
		}	
		
		advance_generator();
	}
	
	
	
	function* msd_radix_sort()
	{
		let max_key_length = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < data_length; i++)
		{
			read_from_position(i);
			
			let key_length = Math.log(data[i]) * denom;
			
			max_key_length = Math.max(max_key_length, key_length);
		}
		
		max_key_length = Math.round(max_key_length);
		
		
		
		operations_per_frame = Math.ceil(data_length * max_key_length / 650);
		
		
		
		let current_endpoints = new Array(data_length);
		current_endpoints[0] = 0;
		current_endpoints[1] = data_length - 1;
		
		let next_endpoints = new Array(data_length);
		
		let num_blocks = 1;
		let next_num_blocks = 0;
		
		let aux_array = new Array(data_length);
		
		
		
		let div = Math.pow(2, max_key_length - 1);
		
		for (let key_pos = 0; key_pos < max_key_length; key_pos++)
		{
			for (let i = 0; i < num_blocks; i++)
			{
				let index_0 = current_endpoints[2 * i];
				let index_1 = current_endpoints[2 * i + 1];
				
				for (let j = current_endpoints[2 * i]; j <= current_endpoints[2 * i + 1]; j++)
				{
					read_from_position(j);
					
					let digit = Math.floor(data[j] / div) % 2;
					
					if (digit === 0)
					{
						aux_array[index_0] = data[j];
						
						if (write_to_position(index_0)) {yield}
						
						index_0++;
					}
					
					else
					{
						aux_array[index_1] = data[j];
						
						if (write_to_position(index_1)) {yield}
						
						index_1--;
					}
				}
				
				for (let j = current_endpoints[2 * i]; j <= current_endpoints[2 * i + 1]; j++)
				{
					data[j] = aux_array[j];
					
					if (write_to_position(j)) {yield}
				}
				
				index_0--;
				index_1++;
				
				if (index_0 > current_endpoints[2 * i])
				{
					next_endpoints[2 * next_num_blocks] = current_endpoints[2 * i];
					next_endpoints[2 * next_num_blocks + 1] = index_0;
					
					next_num_blocks++;
				}	
				
				if (current_endpoints[2 * i + 1] > index_1)
				{
					next_endpoints[2 * next_num_blocks] = index_1;
					next_endpoints[2 * next_num_blocks + 1] = current_endpoints[2 * i + 1];
					
					next_num_blocks++;
				}			
			}
			
			num_blocks = next_num_blocks;
			next_num_blocks = 0;
			
			for (let i = 0; i < 2 * num_blocks; i++)
			{
				current_endpoints[i] = next_endpoints[i];
			}
			
			div /= 2;
		}
		
		
		
		advance_generator();
	}
	
	
	
	function* lsd_radix_sort()
	{
		let max_key_length = 0;
		
		let denom = 1 / Math.log(2);
		
		for (let i = 0; i < data_length; i++)
		{
			read_from_position(i);
			
			let key_length = Math.log(data[i]) * denom;
			
			max_key_length = Math.max(max_key_length, key_length);
		}
		
		max_key_length = Math.round(max_key_length);
		
		
		
		operations_per_frame = Math.ceil(data_length * max_key_length / 650);
		
		
		
		let aux_array = new Array(data_length);
		
		
		
		let div = 1;
		
		for (let key_pos = 0; key_pos < max_key_length; key_pos++)
		{
			let index_0 = 0;
			let index_1 = data_length - 1;
			
			for (let j = 0; j < data_length; j++)
			{
				read_from_position(j);
				
				let digit = Math.floor(data[j] / div) % 2;
				
				if (digit === 0)
				{
					aux_array[index_0] = data[j];
					
					if (write_to_position(index_0)) {yield}
					
					index_0++;
				}
				
				else
				{
					aux_array[index_1] = data[j];
					
					if (write_to_position(index_1)) {yield}
					
					index_1--;
				}
			}
			
			index_0--;
			index_1++;
			
			for (let j = 0; j <= index_0; j++)
			{
				data[j] = aux_array[j];
				
				if (write_to_position(j)) {yield}
			}
			
			//We need to take care to reverse the top half of aux_array.
			for (let j = 0; j < data_length - index_1; j++)
			{
				data[index_1 + j] = aux_array[data_length - 1 - j];
				
				if (write_to_position(index_1 + j)) {yield}
			}
			
			div *= 2;
		}
		
		
		
		advance_generator();
	}
	
	
	
	function* gravity_sort()
	{
		operations_per_frame = 1;//Math.ceil(data_length * data_length / 10000);
		
		let beads = new Array(data_length);
		
		for (let i = 0; i < data_length; i++)
		{
			beads[i] = new Array(data_length);
			
			for (let j = 0; j < data_length; j++)
			{
				beads[i][j] = false;
			}
		}
		
		let max_index = 0;
		let max_entry = 0;
		
		for (let i = 0; i < data_length; i++)
		{
			read_from_position(i);
			
			let size = data[i];
			
			for (let j = 0; j < size; j++)
			{
				beads[i][j] = true;
			}
			
			if (size - i > max_entry)
			{
				max_entry = size - i;
				max_index = i;
			}
		}
		
		for (let j = 0; j < data_length; j++)
		{
			for (let i = data_length - 1; i >= 0; i--)
			{
				if (beads[i][j])
				{	
					let target_row = i;
					
					do
					{
						target_row++;
					} while (target_row < data_length && !beads[target_row][j])
					
					target_row--;
					
					beads[i][j] = false;
					beads[target_row][j] = true;
					
					data[i]--;
					data[target_row]++;
					
					write_to_position(i, false, false);
					write_to_position(target_row, false, false);
				}
			}
			
			if (write_to_position(max_index, false, true)) {yield}
			
			num_writes--;
			in_frame_operations--;
		}
		
		advance_generator();
	}
}()