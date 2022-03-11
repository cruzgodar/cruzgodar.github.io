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
	
	
	
	let grid_size = null;
	
	let no_borders = null;
	
	let canvas_scale_factor = null;
	
	let web_worker = null;

	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", () =>
	{
		request_wilson_graph(false);
	});
	
	
	
	let grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_wilson_graph(false);
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("wilsons-algorithm.png");
	});
	
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	let no_borders_checkbox_element = Page.element.querySelector("#no-borders-checkbox");
	
	let progress_bar_element = Page.element.querySelector("#progress-bar");
	
	let progress_bar_child_element = Page.element.querySelector("#progress-bar span");
	
	
	
	function request_wilson_graph(reverse_generate_skeleton)
	{
		grid_size = parseInt(grid_size_input_element.value || 50);
		
		let maximum_speed = maximum_speed_checkbox_element.checked;
		
		no_borders = no_borders_checkbox_element.checked;
		
		let timeout_id = null;
		
		
		
		let canvas_dim = 2 * grid_size + 1;
		
		if (no_borders)
		{
			canvas_dim = grid_size;
		}
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		let canvas_pixels = Math.min(Page.Layout.window_width, Page.Layout.window_height);
		
		canvas_scale_factor = Math.ceil(canvas_pixels / canvas_dim);
	
	
		
		if (no_borders)
		{
			wilson.change_canvas_size(grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
		}
		
		else
		{
			wilson.change_canvas_size((2 * grid_size + 1) * canvas_scale_factor, (2 * grid_size + 1) * canvas_scale_factor);
			
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
			wilson.ctx.fillRect(0, 0, (2 * grid_size + 1) * canvas_scale_factor, (2 * grid_size + 1) * canvas_scale_factor);
		}
		
		
		
		if (!reverse_generate_skeleton)
		{
			try
			{
				progress_bar_element.style.opacity = 0;
				
				setTimeout(() =>
				{
					progress_bar_element.style.marginTop = 0;
					progress_bar_element.style.marginBottom = 0;
					progress_bar_element.style.height = 0;
				}, 600);
			}
			
			catch(ex) {}
		}
		
		Page.element.querySelector("#progress-bar span").insertAdjacentHTML("afterend", `<span></span>`);
		Page.element.querySelector("#progress-bar span").remove();
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/wilsons-algorithm/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/wilsons-algorithm/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "log")
			{
				clearTimeout(timeout_id);
				
				console.log(...e.data.slice(1));
				return;
			}
			
			
			
			if (e.data[0] === "progress")
			{
				progress_bar_child_element.style.width = e.data[1] + "%";
				
				if (e.data[1] === 100)
				{
					setTimeout(() =>
					{
						progress_bar_element.style.opacity = 0;
						
						setTimeout(() =>
						{
							progress_bar_element.style.marginTop = 0;
							progress_bar_element.style.marginBottom = 0;
							progress_bar_element.style.height = 0;
						}, Site.opacity_animation_time);
					}, Site.opacity_animation_time * 2);
				}
				
				return;
			}
			
			
			
			wilson.ctx.fillStyle = e.data[4];
			
			wilson.ctx.fillRect(e.data[0] * canvas_scale_factor, e.data[1] * canvas_scale_factor, e.data[2] * canvas_scale_factor, e.data[3] * canvas_scale_factor);
		}
		
		
		
		web_worker.postMessage([grid_size, maximum_speed, no_borders, reverse_generate_skeleton]);
		
		
		
		//The worker has three seconds to draw its initial line. If it can't do that, we cancel it and spawn a new worker that reverse-generates a skeleton.
		if (!reverse_generate_skeleton)
		{
			timeout_id = setTimeout(() =>
			{
				console.log("Didn't draw anything within three seconds -- attempting to reverse-generate a skeleton.");
				
				web_worker.terminate();
				
				
				
				progress_bar_element.style.marginTop = "10vh";
				progress_bar_element.style.marginBottom = "-5vh";
				progress_bar_element.style.height = "5vh";
				
				setTimeout(() =>
				{
					progress_bar_element.style.opacity = 1;
				}, Site.opacity_animation_time * 2);
				
				
				
				request_wilson_graph(true);
			}, 3000);
		}
	}
}()