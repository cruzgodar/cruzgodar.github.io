!function()
{
	"use strict";
	
	
	
	const options =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	const wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let grid_size = null;
	
	let web_worker = null;
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_brownian_tree);
	
	
	
	const grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_brownian_tree();
		}
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-brownian-tree.png");
	});
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	Page.show();
	
	
	
	function request_brownian_tree()
	{
		const grid_size = parseInt(grid_size_input_element.value || 1000);
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/brownian-trees/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/brownian-trees/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] !== 0 && e.data[0] !== 1)
			{
				wilson.ctx.fillStyle = e.data[3];
				
				wilson.ctx.fillRect(e.data[1], e.data[2], 1, 1);
			}
		}
		
		web_worker.postMessage([grid_size]);
	}
	
	
	
	function alert_about_hardware_acceleration()
	{
		const elements = Page.element.querySelector("main").children;
		
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