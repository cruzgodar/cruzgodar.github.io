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
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_snowflake);
	
	
	
	let randomize_parameters_button_element = Page.element.querySelector("#randomize-parameters-button");

	randomize_parameters_button_element.addEventListener("click", randomize_parameters);
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-gravner-griffeath-snowflake.png");
	});
	
	
	
	let grid_size_input_element = Page.element.querySelector("#grid-size-input");
	let rho_input_element = Page.element.querySelector("#rho-input");
	let beta_input_element = Page.element.querySelector("#beta-input");
	let alpha_input_element = Page.element.querySelector("#alpha-input");
	let theta_input_element = Page.element.querySelector("#theta-input");
	let kappa_input_element = Page.element.querySelector("#kappa-input");
	let mu_input_element = Page.element.querySelector("#mu-input");
	let gamma_input_element = Page.element.querySelector("#gamma-input");
	
	
	
	Page.show();
	
	
	
	function randomize_parameters()
	{
		rho_input_element.value = .9 * (Math.random() + .5);
		beta_input_element.value = 1.6 * (Math.random() + .5);
		alpha_input_element.value = .4 * (Math.random() + .5);
		theta_input_element.value = .025 * (Math.random() + .5);
		kappa_input_element.value = .0025 * (Math.random() + .5);
		mu_input_element.value = .015 * (Math.random() + .5);
		gamma_input_element.value = .0005 * (Math.random() + .5);
	}
	
	
	
	function request_snowflake()
	{
		let grid_size = parseInt(grid_size_input_element.value || 200);
		
		let rho = parseFloat(rho_input_element.value || .635);
		let beta = parseFloat(beta_input_element.value || 1.6);
		let alpha = parseFloat(alpha_input_element.value || .4);
		let theta = parseFloat(theta_input_element.value || .025);
		let kappa = parseFloat(kappa_input_element.value || .0025);
		let mu = parseFloat(mu_input_element.value || .015);
		let gamma = parseFloat(gamma_input_element.value || .0005);
		
		wilson.change_canvas_size(2 * grid_size, 2 * grid_size);
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, 2 * grid_size, 2 * grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/gravner-griffeath-snowflakes/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/gravner-griffeath-snowflakes/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let img_data = wilson.ctx.getImageData(0, 0, 2 * grid_size, 2 * grid_size);
			let data = img_data.data;
			
			for (let i = 0; i < grid_size; i++)
			{
				for (let j = 0; j < grid_size; j++)
				{
					let brightness = e.data[0][j][i] * 127;
					
					if (brightness === 0)
					{
						continue;
					}
					
					if (j % 2 === 0)
					{
						let index = (4 * (2 * i) * 2 * grid_size) + (4 * (2 * j));
						
						data[index] = brightness;
						data[index + 1] = brightness;
						data[index + 2] = brightness;
						data[index + 3] = 255;
						data[index + 4] = brightness;
						data[index + 5] = brightness;
						data[index + 6] = brightness;
						data[index + 7] = 255;
						
						index = (4 * (2 * i + 1) * 2 * grid_size) + (4 * (2 * j));
						
						data[index] = brightness;
						data[index + 1] = brightness;
						data[index + 2] = brightness;
						data[index + 3] = 255;
						data[index + 4] = brightness;
						data[index + 5] = brightness;
						data[index + 6] = brightness;
						data[index + 7] = 255;
					}
					
					else
					{
						let index = (4 * (2 * i + 1) * 2 * grid_size) + (4 * (2 * j));
						
						data[index] = brightness;
						data[index + 1] = brightness;
						data[index + 2] = brightness;
						data[index + 3] = 255;
						data[index + 4] = brightness;
						data[index + 5] = brightness;
						data[index + 6] = brightness;
						data[index + 7] = 255;
						
						index = (4 * (2 * i + 2) * 2 * grid_size) + (4 * (2 * j));
						
						data[index] = brightness;
						data[index + 1] = brightness;
						data[index + 2] = brightness;
						data[index + 3] = 255;
						data[index + 4] = brightness;
						data[index + 5] = brightness;
						data[index + 6] = brightness;
						data[index + 7] = 255;
					}
				}
			}
			
			wilson.ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([grid_size, rho, beta, alpha, theta, kappa, mu, gamma]);
	}
}()