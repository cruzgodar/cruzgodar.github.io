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
	
	
	
	let web_worker = null;
	
	let image = [];
	
	let brightness_scale = 10;
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_lorenz_attractor);
	
	
	
	let grid_size_input_element = Page.element.querySelector("#grid-size-input");
	
	let sigma_input_element = Page.element.querySelector("#sigma-input");
	
	let rho_input_element = Page.element.querySelector("#rho-input");
	
	let beta_input_element = Page.element.querySelector("#beta-input");
	
	
	
	grid_size_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_lorenz_attractor();
		}
	});
	
	sigma_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_lorenz_attractor();
		}
	});
	
	rho_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_lorenz_attractor();
		}
	});
	
	beta_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			request_lorenz_attractor();
		}
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-lorenz-attractor.png");
	});
	
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	Page.show();
	
	
	
	function request_lorenz_attractor()
	{
		let grid_size = parseInt(grid_size_input_element.value || 1000);
		
		let sigma = parseFloat(sigma_input_element.value || 10);
		
		let rho = parseFloat(rho_input_element.value || 28);
		
		let beta = parseFloat(beta_input_element.value || 2.666667);
		
		let maximum_speed = maximum_speed_checkbox_element.checked;
		
		
		
		wilson.change_canvas_size(grid_size, grid_size);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		image = new Array(grid_size * grid_size);
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				image[grid_size * i + j] = 0;
			}
		}
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/strange-attractors/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/strange-attractors/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let pixels = e.data[0];
			
			let rgb = e.data[1];
			
			
			
			for (let i = 0; i < pixels.length; i++)
			{
				image[grid_size * pixels[i][0] + pixels[i][1]]++;
				
				let brightness_adjust = image[grid_size * pixels[i][0] + pixels[i][1]] / brightness_scale;
				
				wilson.ctx.fillStyle = `rgb(${rgb[0] * brightness_adjust}, ${rgb[1] * brightness_adjust}, ${rgb[2] * brightness_adjust})`;
						
				wilson.ctx.fillRect(pixels[i][1], pixels[i][0], 1, 1);
			}
		}
		
		
		
		web_worker.postMessage([grid_size, sigma, rho, beta, maximum_speed]);
	}
}()