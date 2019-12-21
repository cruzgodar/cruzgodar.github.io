!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#calcudoku-grid").getContext("2d");
	
	let kill_worker_timeout_id = null;
	let fill_progress_bar_id = null;
	
	let progress_bar_width = 0;
	
	let grid = [];
	let cages = [];
	let cages_by_location = [];
	
	let web_worker = null;
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_calcudoku_grid);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_calcudoku_grid()
	{
		grid_size = parseInt(document.querySelector("#grid-size-input").value || 5);
		
		let max_cage_size = parseInt(document.querySelector("#max-cage-size-input").value || 1000);
		
		
		
		let canvas_size = grid_size * 200 + 9;
		
		document.querySelector("#calcudoku-grid").setAttribute("width", canvas_size);
		document.querySelector("#calcudoku-grid").setAttribute("height", canvas_size);
		
		ctx.clearRect(0, 0, canvas_size, canvas_size);
		
		
		
		document.querySelector(".progress-bar").style.opacity = 1;
		
		document.querySelector(".progress-bar span").style.width = 0;
		
		progress_bar_width = 0;
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/calcudoku-generator/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/calcudoku-generator/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "done")
			{
				clearInterval(fill_progress_bar_id);
				
				document.querySelector(".progress-bar").style.opacity = 0;
			}
			
			else if (e.data[0] === "first_grid_complete")
			{
				//We have a valid puzzle. The worker now gets 2 * grid_size seconds to live.
				kill_worker_timeout_id = setTimeout(function()
				{
					try {web_worker.terminate();}
					catch(ex) {}
					
					clearInterval(fill_progress_bar_id);
					
					document.querySelector(".progress-bar").style.opacity = 0;
				}, (2 * grid_size + 1) * 1000);
				
				
				
				//Fill the progress bar.
				fill_progress_bar_id = setInterval(function()
				{
					progress_bar_width += 100 / (2 * grid_size);
					
					document.querySelector(".progress-bar span").style.width = progress_bar_width + "%";
				}, 1000);
			}
			
			else if (e.data[0] === "log")
			{
				console.log(...e.data.slice(1));
			}
			
			else
			{
				grid = e.data[0];
				cages = e.data[1];
				cages_by_location = e.data[2];
				
				draw_calcudoku_grid(false);
			}
		}
		
		
		clearInterval(fill_progress_bar_id);
		
		clearTimeout(kill_worker_timeout_id);
		
		web_worker.postMessage([grid_size, max_cage_size]);
	}
	
	
	
	function draw_calcudoku_grid(print_mode)
	{
		let canvas_size = grid_size * 200 + 9;
		
		
		
		if (print_mode)
		{
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(0, 0, canvas_size, canvas_size);
			ctx.fillStyle = "rgb(0, 0, 0)";
		}
		
		else
		{
			ctx.clearRect(0, 0, canvas_size, canvas_size);
			
			if (url_vars["theme"] === 1)
			{
				if (url_vars["contrast"] === 1)
				{
					ctx.fillStyle = "rgb(255, 255, 255)";
				}
				
				else
				{
					ctx.fillStyle = "rgb(192, 192, 192)";
				}
			}
			
			else
			{
				if (url_vars["contrast"] === 1)
				{
					ctx.fillStyle = "rgb(0, 0, 0)";
				}
				
				else
				{
					ctx.fillStyle = "rgb(64, 64, 64)";
				}
			}
		}
		
		
		
		
		
		
		
		//Draw the light gridlines (width 2).
		for (let i = 0; i <= grid_size; i++)
		{
			ctx.fillRect(200 * i + 4, 0, 2, canvas_size + 9);
			ctx.fillRect(0, 200 * i + 4, canvas_size + 9, 2);
		}
		
		
		
		//Now draw the cages. For each cell of the grid, we draw a line with width 10 if an adjacent cell is part of a different cage.
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (i === 0 || cages_by_location[i - 1][j] !== cages_by_location[i][j])
				{
					ctx.fillRect(200 * j, 200 * i, 210, 10);
				}
				
				if (i === grid_size - 1 || cages_by_location[i + 1][j] !== cages_by_location[i][j])
				{
					ctx.fillRect(200 * j, 200 * (i + 1), 210, 10);
				}
				
				if (j === 0 || cages_by_location[i][j - 1] !== cages_by_location[i][j])
				{
					ctx.fillRect(200 * j, 200 * i, 10, 210);
				}
				
				if (j === grid_size - 1 || cages_by_location[i][j + 1] !== cages_by_location[i][j])
				{
					ctx.fillRect(200 * (j + 1), 200 * i, 10, 210);
				}
			}
		}
		
		
		
		//Finally, draw the numbers. These are in 30px font, so there can be at most a 5-digit number (plus a symbol).
		ctx.font = "30px sans-serif";
		
		for (let i = 0; i < cages.length; i++)
		{
			//Find the leftmost cell in the top row of the cage.
			let top_left_cell = [grid_size, grid_size];
			
			for (let j = 0; j < cages[i][2].length; j++)
			{
				let row = cages[i][2][j][0];
				let col = cages[i][2][j][1];
				
				if (row < top_left_cell[0])
				{
					top_left_cell = [row, col];
				}
				
				else if (row === top_left_cell[0] && col < top_left_cell[1])
				{
					top_left_cell = [row, col];
				}
			}
			
			
			
			let label = "";
			
			if (cages[i][0] === "x")
			{
				label = cages[i][1] + "\u00D7";
			}
			
			else
			{
				label = cages[i][1] + cages[i][0];
			}
			
			ctx.fillText(label, 200 * top_left_cell[1] + 15, 200 * top_left_cell[0] + 40);
		}
	}
	
	
	
	function prepare_download()
	{
		document.querySelector("#calcudoku-grid").style.opacity = 0;
		
		draw_calcudoku_grid(true);
		
		window.open(document.querySelector("#calcudoku-grid").toDataURL(), "_blank");
		
		draw_calcudoku_grid(false);
		
		document.querySelector("#calcudoku-grid").style.opacity = 1;
	}
}()