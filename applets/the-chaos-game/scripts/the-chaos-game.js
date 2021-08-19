!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let grid_size = null;
	
	let web_worker = null;
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_chaos_game);
	
	
	
	let grid_size_input_element = document.querySelector("#grid-size-input");
	
	let num_vertices_input_element = document.querySelector("#num-vertices-input");
	
	
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_chaos_game();
		}
	});
	
	num_vertices_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_chaos_game();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-chaos-game.png");
	});
	
	
	
	function request_chaos_game()
	{
		let num_vertices = parseInt(num_vertices_input_element.value || 5);
		
		grid_size = parseInt(grid_size_input_element.value || 1000);
		
		
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/the-chaos-game/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/the-chaos-game/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			wilson.render.draw_frame(e.data[0]);
		}
		
		
		
		web_worker.postMessage([num_vertices, grid_size]);
	}
}()