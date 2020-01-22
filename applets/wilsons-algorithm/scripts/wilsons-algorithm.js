!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let canvas_scale_factor = 5;
	
	let ctx = document.querySelector("#grid-graph").getContext("2d");
	
	let web_worker = null;
	
	
	
	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", request_wilson_graph);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_wilson_graph()
	{
		grid_size = parseInt(document.querySelector("#dim-input").value || 50);
		
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		
		let canvas_pixel_size = Math.min(window_width, window_height) * .9;
		
		canvas_scale_factor = Math.ceil(canvas_pixel_size / grid_size);
		
		console.log(canvas_scale_factor);
	
	
	
		document.querySelector("#grid-graph").setAttribute("width", (2 * grid_size + 1) * canvas_scale_factor);
		document.querySelector("#grid-graph").setAttribute("height", (2 * grid_size + 1) * canvas_scale_factor);
		
		
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, (2 * grid_size + 1) * canvas_scale_factor, (2 * grid_size + 1) * canvas_scale_factor);
		
		
		
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
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			ctx.fillStyle = e.data[4];
			
			ctx.fillRect(e.data[0] * canvas_scale_factor, e.data[1] * canvas_scale_factor, e.data[2] * canvas_scale_factor, e.data[3] * canvas_scale_factor);
		}
		
		
		
		web_worker.postMessage([grid_size, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		window.open(document.querySelector("#grid-graph").toDataURL(), "_blank");
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#grid-graph").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#grid-graph").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}
}()