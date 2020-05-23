!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let canvas_scale_factor = 5;
	
	let web_worker = null;



	document.querySelector("#generate-button").addEventListener("click", request_sandpile_graph);
	
	document.querySelector("#num-grains-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_sandpile_graph();
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	function request_sandpile_graph()
	{
		let num_grains = parseInt(document.querySelector("#num-grains-input").value || 10000);
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		grid_size = Math.floor(Math.sqrt(num_grains)) + 2;
		
		if (grid_size % 2 === 0)
		{
			grid_size++;
		}
		
		
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		
		let canvas_pixel_size = Math.min(window_width, window_height) * .8;
		
		canvas_scale_factor = Math.ceil(canvas_pixel_size / grid_size);
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", grid_size * canvas_scale_factor);
		document.querySelector("#output-canvas").setAttribute("height", grid_size * canvas_scale_factor);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
		
		
		
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
		
		temporary_web_workers.push(web_worker);
		
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
						ctx.fillStyle = image[i][j];
						
						ctx.fillRect(j * canvas_scale_factor, i * canvas_scale_factor, canvas_scale_factor, canvas_scale_factor);
					}
				}
			}
		}
		
		
		
		web_worker.postMessage([grid_size, num_grains, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "abelian-sandpiles.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()