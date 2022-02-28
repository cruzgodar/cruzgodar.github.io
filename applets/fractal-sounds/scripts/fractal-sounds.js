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
			
			try {audio_nodes[0][2].gain.linearRampToValueAtTime(.0001, audio_nodes[0][0].currentTime + time_elapsed / 1000)}
			catch(ex) {}
			
			try {audio_nodes[1][2].gain.linearRampToValueAtTime(.0001, audio_nodes[1][0].currentTime + time_elapsed / 1000)}
			catch(ex) {}
			
			return;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function create_audio_node()
	{
		let audio_context = new AudioContext();
		
		
		
		let buffer = audio_context.createBuffer(2, 22050, 44100);
		
		let now_buffering = buffer.getChannelData(0);
		
		for (var i = 0; i < buffer.length; i++)
		{
			now_buffering[i] = Math.random() * 2 - 1;
		}
		
		now_buffering = buffer.getChannelData(1);
		
		for (var i = 0; i < buffer.length; i++)
		{
			now_buffering[i] = Math.random() * 2 - 1;
		}
		/*
		let audio_gain_node = audio_context.createGain();
		audio_oscillator.connect(audio_gain_node);
		
		let audio_panner_node = audio_context.createPanner();
		audio_gain_node.connect(audio_panner_node);
		audio_panner_node.connect(audio_context.destination);
		*/
		
		let source = audio_context.createBufferSource();
		source.buffer = buffer;
		source.connect(audio_context.destination);

		source.start();
		
		
		//audio_nodes.push([audio_context, audio_oscillator, audio_gain_node, audio_panner_node]);
	}
}()