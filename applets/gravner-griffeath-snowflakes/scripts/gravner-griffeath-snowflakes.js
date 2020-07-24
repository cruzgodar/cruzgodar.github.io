!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image = [];
	
	
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_snowflake);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_snowflake()
	{
		let grid_size = 100;
		
		
		
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
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			console.log(e.data);
			
			//Copy this array into the canvas like an image.
			let img_data = ctx.getImageData(0, 0, grid_size, grid_size);
			let data = img_data.data;
			
			for (let i = 0; i < grid_size; i++)
			{
				for (let j = 0; j < grid_size; j++)
				{
					let brightness = e.data[0][i][j] * 200;
					
					ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
					
					if (j % 2 === 0)
					{
						ctx.fillRect(2 * i, 2 * j, 2, 2);
					}
					
					else
					{
						ctx.fillRect(2 * i + 1, 2 * j, 2, 2);
					}
				}
			}
			
			ctx.putImageData(img_data, 0, 0);
		}
		
		
		
		web_worker.postMessage([grid_size]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "gravner-griffeath-snowflakes.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()