!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#sandpile-graph").getContext("2d");
	
	let canvas_scale_factor = 5;
	
	let web_worker = null;
	
	
	
	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", request_sandpile_graph);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	function request_sandpile_graph()
	{
		let num_grains = parseInt(document.querySelector("#num-grains-input").value || 10000);
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		grid_size = Math.floor(Math.sqrt(num_grains));
		
		if (grid_size % 2 === 0)
		{
			grid_size++;
		}
		
		
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		
		let canvas_pixel_size = Math.min(window_width, window_height) * .9;
		
		canvas_scale_factor = Math.ceil(canvas_pixel_size / grid_size);
		
		
		
		document.querySelector("#sandpile-graph").setAttribute("width", grid_size * canvas_scale_factor);
		document.querySelector("#sandpile-graph").setAttribute("height", grid_size * canvas_scale_factor);
		
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
			
			else
			{
				ctx.fillStyle = e.data[2];
				
				ctx.fillRect(e.data[0] * canvas_scale_factor, e.data[1] * canvas_scale_factor, canvas_scale_factor, canvas_scale_factor);
			}
		}
		
		
		
		web_worker.postMessage([grid_size, num_grains, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "abelian-sandpiles.png";
		
		link.href = document.querySelector("#sandpile-graph").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#sandpile-graph").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#sandpile-graph").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}
}()