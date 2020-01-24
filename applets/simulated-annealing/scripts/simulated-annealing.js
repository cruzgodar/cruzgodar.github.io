!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#annealing-graph").getContext("2d");
	
	let web_worker = null;
	
	
	
	adjust_for_settings();

	
	
	document.querySelector("#generate-button").addEventListener("click", request_annealing_graph);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_annealing_graph()
	{
		let num_nodes = parseInt(document.querySelector("#num-nodes-input").value || 20);
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		grid_size = 1000;
		
		
		
		document.querySelector("#annealing-graph").setAttribute("width", grid_size);
		document.querySelector("#annealing-graph").setAttribute("height", grid_size);
		
		
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/simulated-annealing/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/simulated-annealing/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			//A circle with arguments (x, y, r, color).
			if (e.data[0] === "node")
			{
				ctx.fillStyle = e.data[4];
				
				ctx.beginPath();
				ctx.moveTo(e.data[1], e.data[2]);
				ctx.arc(e.data[1], e.data[2], e.data[3], 0, 2 * Math.PI, false);
				ctx.fill();
			}
			
			//A line with arguments (x_1, y_1, x_2, y_2, color).
			else if (e.data[0] === "line")
			{
				ctx.strokeStyle = e.data[5];
				
				ctx.beginPath();
				ctx.moveTo(e.data[1], e.data[2]);
				ctx.lineTo(e.data[3], e.data[4]);
				ctx.stroke();
			}
			
			else if (e.data[0] === "clear")
			{
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(0, 0, grid_size, grid_size);
			}
		}
		
		
		
		web_worker.postMessage([grid_size, num_nodes, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "simulated-annealing.png";
		
		link.href = document.querySelector("#annealing-graph").toDataURL();
		
		link.click();
		
		link.remove();
	}


	
	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#annealing-graph").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#annealing-graph").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}
}()