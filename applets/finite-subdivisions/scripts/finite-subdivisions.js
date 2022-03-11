!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 3000,
		canvas_height: 3000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let web_worker = null;
	
	let image = [];
	

	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_finite_subdivisions);
	
	
	
	let num_vertices_input_element = Page.element.querySelector("#num-vertices-input");
	
	num_vertices_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_finite_subdivisions();
		}
	});
	
	
	
	let num_iterations_input_element = Page.element.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_finite_subdivisions();
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-finite-subdivision.png");
	});
	
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	function request_finite_subdivisions()
	{
		let num_vertices = parseInt(num_vertices_input_element.value || 5);
		let num_iterations = parseInt(num_iterations_input_element.value || 5);
		
		num_iterations = Math.min(num_iterations, 9);
		
		let grid_size = 3000;
		
		let maximum_speed = maximum_speed_checkbox_element.checked;
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		wilson.ctx.lineWidth = 10 - num_iterations;
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/finite-subdivisions/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/finite-subdivisions/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			wilson.ctx.strokeStyle = e.data[4];
			
			wilson.ctx.beginPath();
			wilson.ctx.moveTo(e.data[1], e.data[0]);
			wilson.ctx.lineTo(e.data[3], e.data[2]);
			wilson.ctx.stroke();
		}
		
		
		
		web_worker.postMessage([num_vertices, num_iterations, grid_size, maximum_speed]);
	}
}()