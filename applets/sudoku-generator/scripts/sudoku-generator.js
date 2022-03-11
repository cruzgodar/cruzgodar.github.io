!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000
	};
	
	let wilson = new Wilson(Page.element.querySelector("#sudoku-grid"), options);
	
	
	
	let grid = [];
	
	let web_worker = null;
	
	let generated_first_puzzle = false;
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_sudoku_grid);
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("sudoku.png");
	});
	
	
	
	
	
	function request_sudoku_grid()
	{
		grid = new Array(9);
		
		for (let i = 0; i < 9; i++)
		{
			grid[i] = new Array(9);
			
			for (let j = 0; j < 9; j++)
			{
				grid[i][j] = 0;
			}
		}
		
		
		
		if (generated_first_puzzle)
		{
			wilson.canvas.style.opacity = 0;
			
			
			
			setTimeout(() =>
			{
				let canvas_size = 9 * 200 + 9;
				
				wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
			}, Site.opacity_animation_time);
		}
		
		else
		{
			let canvas_size = 9 * 200 + 9;
			
			wilson.canvas.setAttribute("width", canvas_size);
			wilson.canvas.setAttribute("height", canvas_size);
			
			wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		}
		
		
		
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
		
		Page.temporary_web_workers.push(web_worker);
		
		
		
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
				
				wilson.canvas.style.opacity = 1;
				
				generated_first_puzzle = true;
			}
		}
		
		
		
		if (generated_first_puzzle)
		{
			setTimeout(() =>
			{
				web_worker.postMessage([]);
			}, Site.opacity_animation_time);
		}
		
		else
		{
			web_worker.postMessage([]);
		}
	}
	
	
	
	function draw_sudoku_grid(print_mode)
	{
		let canvas_size = 9 * 200 + 9;
		
		
		
		if (print_mode)
		{
			wilson.ctx.fillStyle = "rgb(255, 255, 255)";
			wilson.ctx.fillRect(0, 0, canvas_size, canvas_size);
			wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		}
		
		else
		{
			wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
			
			if (Site.Settings.url_vars["theme"] === 1)
			{
				if (Site.Settings.url_vars["contrast"] === 1)
				{
					wilson.ctx.fillStyle = "rgb(255, 255, 255)";
				}
				
				else
				{
					wilson.ctx.fillStyle = "rgb(192, 192, 192)";
				}
			}
			
			else
			{
				if (Site.Settings.url_vars["contrast"] === 1)
				{
					wilson.ctx.fillStyle = "rgb(0, 0, 0)";
				}
				
				else
				{
					wilson.ctx.fillStyle = "rgb(64, 64, 64)";
				}
			}
		}
		
		
		
		//Draw the inner gridlines (width 2).
		for (let i = 0; i <= 9; i++)
		{
			if (i % 3 === 0)
			{
				wilson.ctx.fillRect(200 * i, 0, 10, canvas_size + 9);
				wilson.ctx.fillRect(0, 200 * i, canvas_size + 9, 10);
			}
			
			wilson.ctx.fillRect(200 * i + 4, 0, 2, canvas_size + 9);
			wilson.ctx.fillRect(0, 200 * i + 4, canvas_size + 9, 2);
		}		
		
		
		
		//Finally, draw the numbers.
		for (let i = 0; i < 9; i++)
		{
			for (let j = 0; j < 9; j++)
			{
				wilson.ctx.font = "150px sans-serif";
				
				if (grid[i][j] !== 0)
				{
					wilson.ctx.fillText(grid[i][j], 200 * j + 64, 200 * i + 156);
				}
			}
		}
	}
}()