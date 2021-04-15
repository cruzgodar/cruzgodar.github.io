!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image = [];
	
	
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_finite_subdivisions);
	
	let elements = document.querySelectorAll("#num-vertices-input, #num-iterations-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				request_finite_subdivisions();
			}
		});
	}
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	Applets.canvases_to_resize = [document.querySelector("#output-canvas")];
	
	Applets.canvas_true_fullscreen = false;
	
	Applets.set_up_canvas_resizer();
	
	
	
	
	
	function request_finite_subdivisions()
	{
		let num_vertices = parseInt(document.querySelector("#num-vertices-input").value || 5);
		let num_iterations = parseInt(document.querySelector("#num-iterations-input").value || 5);
		
		if (num_iterations > 9)
		{
			num_iterations = 9;
		}
		
		let grid_size = 3000;
		
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", grid_size);
		document.querySelector("#output-canvas").setAttribute("height", grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		ctx.lineWidth = 10 - num_iterations;
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/finite-subdivisions/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/finite-subdivisions/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			ctx.strokeStyle = e.data[4];
			
			ctx.beginPath();
			ctx.moveTo(e.data[1], e.data[0]);
			ctx.lineTo(e.data[3], e.data[2]);
			ctx.stroke();
		}
		
		
		
		web_worker.postMessage([num_vertices, num_iterations, grid_size, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "finite-subdivisions.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()