!function()
{
	"use strict";
	
	
	
	let resolution = 2000;
	
	let last_timestamp = -1;
	let time_elapsed = 0;
	
	let starting_process_id = null;
	
	let audio_nodes = [];
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_sorting_algorithm);
	
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
		try {audio_nodes[current_generator_index][2].gain.linearRampToValueAtTime(.0001, audio_nodes[current_generator_index][0].currentTime + time_elapsed / 1000);}
		catch(ex) {}
		
		
		
		starting_process_id = Site.applet_process_id;
		
		
		
		audio_nodes = [];
		create_audio_node();
		/*create_audio_node();
		
		audio_nodes[0][3].setPosition(-1, 0, 0);
		audio_nodes[1][3].setPosition(1, 0, 0);
		
		audio_nodes[0][1].frequency.value = 50;
		audio_nodes[1][1].frequency.value = 500;
		
		audio_nodes[0][1].start(0);
		audio_nodes[1][1].start(0);
		*/
	}
	
	
	
	function draw_frame(timestamp)
	{
		time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			try {}
			catch(ex) {}
			
			return;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function create_audio_node()
	{
		let audio_context = new AudioContext();
		
		
		
		let sample_rate = 44100;
		let num_frames = 44100;
		let samples_per_frame = 12;
		let num_samples = Math.floor(44100 / samples_per_frame);
		
		let x = 0.3248430447992505;
		let y = 0.5649935486320172;
		let a = x;
		let b = y;
		
		let buffer = audio_context.createBuffer(2, num_frames, sample_rate);
		
		let left_data = buffer.getChannelData(0);
		let right_data = buffer.getChannelData(1);
		
		for (let i = 0; i < num_samples; i++)
		{
			let next_x = x*x - y*y + a;
			let next_y = 2*x*y + b;
			
			for (let j = 0; j < samples_per_frame; j++)
			{
				let t = j / samples_per_frame;
				
				left_data[samples_per_frame * i + j] = (1 - t) * (x / 2) + t * (next_x / 2);
				right_data[samples_per_frame * i + j] = (1 - t) * (y / 2) + t * (next_y / 2)
			}
			
			x = next_x;
			y = next_y;
		}
		
		
		
		let source = audio_context.createBufferSource();
		source.buffer = buffer;
		
		let audio_gain_node = audio_context.createGain();
		source.connect(audio_gain_node);
		audio_gain_node.connect(audio_context.destination);

		source.start();
		audio_gain_node.gain.exponentialRampToValueAtTime(.0001, num_frames / 44100);
	}
}()