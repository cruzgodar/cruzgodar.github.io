!function()
{
	let grid_size = null;
	
	let ctx = document.querySelector("#sandpile-graph").getContext("2d");
	
	
	
	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", request_sandpile_graph);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	let web_worker = null;
	
	let worker_is_busy = false;
	
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
		if (e.data[0] == "done")
		{
			worker_is_busy = false;
		}
		
		else
		{
			ctx.fillStyle = e.data[2];
			
			ctx.fillRect(e.data[0], e.data[1], 1, 1);
		}
	}
	
	
	
	
	
	function request_sandpile_graph()
	{
		if (worker_is_busy)
		{
			console.log("Worker is busy -- refusing request");
			
			return;
		}
		
		
		
		worker_is_busy = true;
		
		let num_grains = parseInt(document.querySelector("#num-grains-input").value || 10000);
		let maximum_speed = document.querySelector("#toggle-maximum-speed-checkbox").checked;
		
		grid_size = Math.floor(Math.sqrt(num_grains));
		
		if (grid_size % 2 == 0)
		{
			grid_size++;
		}
		
		
	
	
	
		document.querySelector("#sandpile-graph").setAttribute("width", grid_size);
		document.querySelector("#sandpile-graph").setAttribute("height", grid_size);
		
		
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		web_worker.postMessage([grid_size, num_grains, maximum_speed]);
	}
	
	
	
	function prepare_download()
	{
		window.open(document.querySelector("#sandpile-graph").toDataURL(), "_blank");
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] == 1)
		{
			if (url_vars["theme"] == 1)
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