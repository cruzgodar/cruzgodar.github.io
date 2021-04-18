!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image = [];
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_snowflake);
	
	document.querySelector("#randomize-parameters-button").addEventListener("click", randomize_parameters);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	Applets.Canvases.to_resize = [document.querySelector("#output-canvas")];
	
	Applets.Canvases.true_fullscreen = false;
	
	Applets.Canvases.set_up_resizer();
	
	
	
	
	
	function randomize_parameters()
	{
		document.querySelector("#rho-input").value = .9 * (Math.random() + .5);
		document.querySelector("#beta-input").value = 1.6 * (Math.random() + .5);
		document.querySelector("#alpha-input").value = .4 * (Math.random() + .5);
		document.querySelector("#theta-input").value = .025 * (Math.random() + .5);
		document.querySelector("#kappa-input").value = .0025 * (Math.random() + .5);
		document.querySelector("#mu-input").value = .015 * (Math.random() + .5);
		document.querySelector("#gamma-input").value = .0005 * (Math.random() + .5);
	}
	
	
	
	function request_snowflake()
	{
		let grid_size = parseInt(document.querySelector("#grid-size-input").value || 200);
		
		let rho = parseFloat(document.querySelector("#rho-input").value || .635);
		let beta = parseFloat(document.querySelector("#beta-input").value || 1.6);
		let alpha = parseFloat(document.querySelector("#alpha-input").value || .4);
		let theta = parseFloat(document.querySelector("#theta-input").value || .025);
		let kappa = parseFloat(document.querySelector("#kappa-input").value || .0025);
		let mu = parseFloat(document.querySelector("#mu-input").value || .015);
		let gamma = parseFloat(document.querySelector("#gamma-input").value || .0005);
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", 2 * grid_size);
		document.querySelector("#output-canvas").setAttribute("height", 2 * grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, 2 * grid_size, 2 * grid_size);
		
		
		
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
			if (e.data[0] === "log")
			{
				console.log(e.data);
				
				return;
			}
			
			let img_data = ctx.getImageData(0, 0, 2 * grid_size, 2 * grid_size);
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
			
			ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([grid_size, rho, beta, alpha, theta, kappa, mu, gamma]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "a-gravner-griffeath-snowflake.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()