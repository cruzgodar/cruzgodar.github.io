!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let num_iterations = 10000000;
	let grid_size = 1000;
	
	let web_worker = null;
	
	let fern_graph = [];
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_fern);
	
	
	
	let num_iterations_input_element = Page.element.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_fern();
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-barnsley-fern.png");
	});
	
	
	
	Page.show();
	
	
	
	function request_fern()
	{
		num_iterations = 1000 * parseInt(num_iterations_input_element.value || 10000);
		
		grid_size = Math.floor(Math.sqrt(num_iterations / 10));
		
		
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/barnsley-fern/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/barnsley-fern/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			wilson.render.draw_frame(e.data[0]);
		}
		
		
		
		web_worker.postMessage([grid_size, num_iterations]);
	}
}()