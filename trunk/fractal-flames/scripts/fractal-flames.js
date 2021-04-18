!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	
	
	let flame_function_weights = [[0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
	
	
	
	let grid_size = null;
	let scaled_grid_size = null;
	
	let num_iterations = null;

	let gamma = null;
	
	let supersampling = false;
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_fractal_flame);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_fractal_flame()
	{
		scaled_grid_size = parseInt(document.querySelector("#grid-size-input").value || 200);
		num_iterations = parseInt(document.querySelector("#num-iterations-input").value || 100) * 1000;
		gamma = parseFloat(document.querySelector("#gamma-input").value || 4);
		
		document.querySelector("#output-canvas").setAttribute("width", scaled_grid_size);
		document.querySelector("#output-canvas").setAttribute("height", scaled_grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, scaled_grid_size, scaled_grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/fractal-flames/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/fractal-flames/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			let scaled_image = e.data[0];
			
			let img_data = ctx.getImageData(0, 0, scaled_grid_size, scaled_grid_size);
			let data = img_data.data;
			
			for (let i = 0; i < scaled_grid_size; i++)
			{
				for (let j = 0; j < scaled_grid_size; j++)
				{
					//The index in the array of rgba values
					let index = (4 * i * scaled_grid_size) + (4 * j);
					
					data[index] = scaled_image[i][j][0];
					data[index + 1] = scaled_image[i][j][1];
					data[index + 2] = scaled_image[i][j][2];
					data[index + 3] = 255; //No transparency.
				}
			}
			
			ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([flame_function_weights, scaled_grid_size, num_iterations, gamma, supersampling]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "fractal-flame.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()