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
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let resolution = 2000;
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_sandpile);
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-abelian-sandpile.png");
	});
	
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	Page.show();
	
	
	
	function request_sandpile()
	{
		let num_grains = parseInt(num_grains_input_element.value || 10000);
		
		let maximum_speed = maximum_speed_checkbox_element.checked;
		
		grid_size = Math.floor(Math.sqrt(num_grains)) + 2;
		
		if (grid_size % 2 === 0)
		{
			grid_size++;
		}
		
		
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		
		let canvas_pixel_size = Math.min(Page.Layout.window_width, Page.Layout.window_height);
		
		canvas_scale_factor = Math.ceil(canvas_pixel_size / grid_size);
		
		
		
		wilson.change_canvas_size(grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/abelian-sandpiles/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/abelian-sandpiles/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "done")
			{
				console.log("Finished");
			}
			
			else if (e.data[0] === "log")
			{
				console.log(...e.data.slice(1));
			}
			
			else
			{
				let image = e.data[0];
				
				for (let i = 0; i < grid_size; i++)
				{
					for (let j = 0; j < grid_size; j++)
					{
						wilson.ctx.fillStyle = image[i][j];
						
						wilson.ctx.fillRect(j * canvas_scale_factor, i * canvas_scale_factor, canvas_scale_factor, canvas_scale_factor);
					}
				}
			}
		}
		
		
		
		web_worker.postMessage([grid_size, num_grains, maximum_speed]);
	}
	
	
	
	function alert_about_hardware_acceleration()
	{
		let elements = Page.element.querySelector("main").children;
		
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