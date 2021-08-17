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
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let num_iterations = 10000000;
	let grid_size = 1000;
	
	let web_worker = null;
	
	let fern_graph = [];
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_fern);
	
	
	
	let num_iterations_input_element = document.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_fern();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-barnsley-fern.png");
	});
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	function request_fern()
	{
		num_iterations = 1000 * parseInt(num_iterations_input_element.value || 10000);
		
		grid_size = Math.floor(Math.sqrt(num_iterations / 10));
		
		
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/the-barnsley-fern/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/the-barnsley-fern/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			wilson.render.draw_frame(e.data[0]);
		}
		
		
		
		web_worker.postMessage([grid_size, num_iterations]);
	}
	
	
	
	function alert_about_hardware_acceleration()
	{
		let elements = document.querySelector("main").children;
		
		elements = elements[elements.length - 1].children;
		
		elements[elements.length - 1].insertAdjacentHTML("afterend", `
			<div data-aos="fade-up" style="margin-top: 10vh">
				<p class="body-text">
					Your browser treats canvases in a way that may make this applet stutter excessively. If this happens, try temporarily turning off hardware acceleration in the browser&#x2019;s settings.
				</p>
			</div>
		`);
		
		Page.Load.AOS.on_resize();
	}
}()