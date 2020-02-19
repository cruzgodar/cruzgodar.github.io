!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let no_borders = null;
	
	let canvas_scale_factor = null;
	
	let ctx = document.querySelector("#grid-graph").getContext("2d");
	
	let web_worker = null;
	
	
	
	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", function()
	{
		request_wilson_graph(false);
	});
	
	document.querySelector("#dim-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_wilson_graph(false);
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_wilson_graph(reverse_generate_skeleton)
	{
		grid_size = parseInt(document.querySelector("#dim-input").value || 50);
		
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		no_borders = document.querySelector("#no-borders-checkbox").checked;
		
		let timeout_id = null;
		
		
		
		let canvas_dim = 2 * grid_size + 1;
		
		if (no_borders)
		{
			canvas_dim = grid_size;
		}
		
		//Make sure that there is a proper density of pixels so that the canvas doesn't look blurry.
		let canvas_pixels = Math.min(window_width, window_height) * .9;
		
		canvas_scale_factor = Math.ceil(canvas_pixels / canvas_dim);
	
	
		
		if (no_borders)
		{
			document.querySelector("#grid-graph").setAttribute("width", grid_size * canvas_scale_factor);
			document.querySelector("#grid-graph").setAttribute("height", grid_size * canvas_scale_factor);
			
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(0, 0, grid_size * canvas_scale_factor, grid_size * canvas_scale_factor);
		}
		
		else
		{
			document.querySelector("#grid-graph").setAttribute("width", (2 * grid_size + 1) * canvas_scale_factor);
			document.querySelector("#grid-graph").setAttribute("height", (2 * grid_size + 1) * canvas_scale_factor);
			
			ctx.fillStyle = "rgb(0, 0, 0)";
			ctx.fillRect(0, 0, (2 * grid_size + 1) * canvas_scale_factor, (2 * grid_size + 1) * canvas_scale_factor);
		}
		
		
		
		if (!reverse_generate_skeleton)
		{
			try
			{
				document.querySelector("#progress-bar").style.opacity = 0;
				
				setTimeout(function()
				{
					document.querySelector("#progress-bar").style.marginTop = 0;
					document.querySelector("#progress-bar").style.marginBottom = 0;
				}, 600);
			}
			
			catch(ex) {}
		}
		
		document.querySelector("#progress-bar span").style.width = 0;
		
		
		
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
			if (e.data[0] === "log")
			{
				clearTimeout(timeout_id);
				
				console.log(...e.data.slice(1));
				return;
			}
			
			
			
			if (e.data[0] === "progress")
			{
				document.querySelector("#progress-bar span").style.width = e.data[1] + "%";
				
				if (e.data[1] === 100)
				{
					setTimeout(function()
					{
						document.querySelector("#progress-bar").style.opacity = 0;
						
						setTimeout(function()
						{
							document.querySelector("#progress-bar").style.marginTop = 0;
							document.querySelector("#progress-bar").style.marginBottom = 0;
							document.querySelector("#progress-bar span").style.width = 0;
						}, 300);
					}, 600);
				}
				
				return;
			}
			
			
			
			ctx.fillStyle = e.data[4];
			
			ctx.fillRect(e.data[0] * canvas_scale_factor, e.data[1] * canvas_scale_factor, e.data[2] * canvas_scale_factor, e.data[3] * canvas_scale_factor);
		}
		
		
		
		web_worker.postMessage([grid_size, maximum_speed, no_borders, reverse_generate_skeleton]);
		
		
		
		//The worker has three seconds to draw its initial line. If it can't do that, we cancel it and spawn a new worker that reverse-generates a skeleton.
		if (reverse_generate_skeleton === false)
		{
			timeout_id = setTimeout(function()
			{
				console.log("Didn't draw anything within three seconds -- attempting to reverse-generate a skeleton.");
				
				web_worker.terminate();
				
				
				
				document.querySelector("#progress-bar").style.marginTop = "5vh";
				document.querySelector("#progress-bar").style.marginBottom = "5vh";
				
				setTimeout(function()
				{
					document.querySelector("#progress-bar").style.opacity = 1;
				}, 600);
				
				
				
				request_wilson_graph(true);
			}, 3000);
		}
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "wilsons-algorithm.png";
		
		link.href = document.querySelector("#grid-graph").toDataURL();
		
		link.click();
		
		link.remove();
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