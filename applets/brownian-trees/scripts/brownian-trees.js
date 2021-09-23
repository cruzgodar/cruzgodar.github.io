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

	generate_button_element.addEventListener("click", request_brownian_tree);
	
	
	
	let grid_size_input_element = document.querySelector("#grid-size-input");
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_brownian_tree();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-brownian-tree.png");
	});
	
	
	
	let progress_bar_element = document.querySelector("#progress-bar");
	let progress_bar_innards_element = document.querySelector("#progress-bar span");
	
	
	
	if (Browser.name === "Chrome" || Browser.name === "Opera")
	{
		alert_about_hardware_acceleration();
	}
	
	
	
	function request_brownian_tree()
	{
		let grid_size = parseInt(grid_size_input_element.value || 1000);
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		progress_bar_innards_element.insertAdjacentHTML("afterend", `<span></span>`);
		progress_bar_innards_element.remove();
		progress_bar_innards_element = document.querySelector("#progress-bar span");
		
		
		
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
			if (e.data[0] === 0)
			{
				progress_bar_innards_element.style.width = e.data[1] + "%";
				
				if (e.data[1] === 100)
				{
					setTimeout(() =>
					{
						progress_bar_element.style.opacity = 0;
						
						setTimeout(() =>
						{
							progress_bar_element.style.marginTop = 0;
							progress_bar_element.style.marginBottom = 0;
						}, Site.opacity_animation_time);
					}, Site.opacity_animation_time * 2);
				}
			}
			
			
			
			else if (e.data[0] === 1)
			{
				progress_bar_element.style.opacity = 0;
				
				setTimeout(() =>
				{
					progress_bar_element.style.marginTop = 0;
					progress_bar_element.style.marginBottom = 0;
				}, Site.opacity_animation_time);
			}
			
			
			
			else
			{
				wilson.ctx.fillStyle = e.data[3];
				
				wilson.ctx.fillRect(e.data[1], e.data[2], 1, 1);
			}
		}
		
		
		
		progress_bar_innards_element.style.width = 0;
		progress_bar_element.style.marginTop = "10vh";
		progress_bar_element.style.marginBottom = "-5vh";
		
		setTimeout(() =>
		{
			progress_bar_element.style.opacity = 1;
		}, Site.opacity_animation_time * 2);
		
		
		
		web_worker.postMessage([grid_size]);
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