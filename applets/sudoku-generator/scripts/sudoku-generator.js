!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#sudoku-grid").getContext("2d", {alpha: false});
	
	let grid = [];
	
	let web_worker = null;
	
	
	
	document.querySelector("#generate-button").addEventListener("click", request_sudoku_grid);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function request_sudoku_grid()
	{
		for (let i = 0; i < 9; i++)
		{
			grid.push([]);
			
			for (let j = 0; j < 9; j++)
			{
				grid[i].push(0);
			}
		}
		
		document.querySelector("#sudoku-grid").style.opacity = 0;
		
		
		
		setTimeout(function()
		{
			let canvas_size = 9 * 200 + 9;
			
			document.querySelector("#sudoku-grid").setAttribute("width", canvas_size);
			document.querySelector("#sudoku-grid").setAttribute("height", canvas_size);
			
			ctx.clearRect(0, 0, canvas_size, canvas_size);
		}, 300);
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/sudoku-generator/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/sudoku-generator/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "log")
			{
				console.log(...e.data.slice(1));
			}
			
			else
			{
				grid = e.data[0];
				
				draw_sudoku_grid(false);
				
				document.querySelector("#sudoku-grid").style.opacity = 1;
			}
		}
		
		
		
		setTimeout(function()
		{
			web_worker.postMessage([]);
		}, 300);
	}
	
	
	
	function draw_sudoku_grid(print_mode)
	{
		let canvas_size = 9 * 200 + 9;
		
		
		
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
		
		
		
		//Draw the inner gridlines (width 2).
		for (let i = 0; i <= 9; i++)
		{
			if (i % 3 === 0)
			{
				ctx.fillRect(200 * i, 0, 10, canvas_size + 9);
				ctx.fillRect(0, 200 * i, canvas_size + 9, 10);
			}
			
			ctx.fillRect(200 * i + 4, 0, 2, canvas_size + 9);
			ctx.fillRect(0, 200 * i + 4, canvas_size + 9, 2);
		}		
		
		
		
		//Finally, draw the numbers.
		for (let i = 0; i < 9; i++)
		{
			for (let j = 0; j < 9; j++)
			{
				ctx.font = "150px sans-serif";
				
				if (grid[i][j] !== 0)
				{
					ctx.fillText(grid[i][j], 200 * j + 64, 200 * i + 156);
				}
			}
		}
	}
	
	
	
	function prepare_download()
	{
		document.querySelector("#sudoku-grid").style.opacity = 0;
		
		draw_sudoku_grid(true);
		
		
		
		let link = document.createElement("a");
		
		link.download = "sudoku.png";
		
		link.href = document.querySelector("#sudoku-grid").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		draw_sudoku_grid(false);
		
		document.querySelector("#sudoku-grid").style.opacity = 1;
	}
}()