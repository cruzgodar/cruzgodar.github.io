!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000
	};
	
	let wilson = new Wilson(document.querySelector("#calcudoku-grid"), options);
	
	
	
	let grid_size = null;
	
	let total_time = 0;
	let split_time = 0;
	
	let refresh_id = null;
	
	let grid = [];
	let cages = [];
	let cages_by_location = [];
	
	//Used to determine if we should reset the split timer.
	let old_cages_by_location = [];
	
	let web_worker = null;
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", request_calcudoku_grid);
	
	
	
	let grid_size_input_element = document.querySelector("#grid-size-input");
	
	grid_size_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_calcudoku_grid();
		}
	});
	
	
	
	let max_cage_size_input_element = document.querySelector("#max-cage-size-input");
	
	max_cage_size_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_calcudoku_grid();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-calcudoku-puzzle.png");
	});
	
	
	
	let total_time_clock_element = document.querySelector("#total-time-clock");
	let split_time_clock_element = document.querySelector("#split-time-clock");
	
	let total_time_label_element = document.querySelector("#total-time-label");
	let split_time_label_element = document.querySelector("#split-time-label");
	
	
	
	function request_calcudoku_grid()
	{
		grid_size = parseInt(grid_size_input_element.value || 6);
		
		let max_cage_size = parseInt(max_cage_size_input_element.value || 1000);
		
		
		
		for (let i = 0; i < grid_size; i++)
		{
			cages_by_location.push([]);
			
			for (let j = 0; j < grid_size; j++)
			{
				cages_by_location[i].push(0);
			}
		}
		
		
		
		total_time = 0;
		split_time = 0;
		
		total_time_clock_element.textContent = "0";
		split_time_clock_element.textContent = "0";
		
		
		
		if (document.querySelector("#total-time-label").style.opacity == 0)
		{
			show_timers();
		}
		
		else
		{
			total_time_label_element.style.opacity = 0;
			total_time_clock_element.style.opacity = 0;
			split_time_label_element.style.opacity = 0;
			split_time_clock_element.style.opacity = 0;
			
			wilson.canvas.style.opacity = 0;
			
			setTimeout(show_timers, 350);
		}
		
		
		
		setTimeout(() =>
		{
			let canvas_size = grid_size * 200 + 9;
			
			wilson.change_canvas_size(canvas_size, canvas_size);
			
			wilson.ctx.clearRect(0, 0, canvas_size, canvas_size);
		}, Site.opacity_animation_time);
		
		
		
		clearInterval(refresh_id);
		
		refresh_id = setInterval(update_timers, 1000);
		
		Page.temporary_intervals.push(refresh_id);
		
		
		
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
				cages = e.data[1];
				old_cages_by_location = JSON.parse(JSON.stringify(cages_by_location));
				cages_by_location = e.data[2];
				
				draw_calcudoku_grid(false);
				
				
				
				let cages_by_locations_differ = false;
				
				for (let i = 0; i < grid_size; i++)
				{
					for (let j = 0; j < grid_size; j++)
					{
						if (cages_by_location[i][j] !== old_cages_by_location[i][j])
						{
							cages_by_locations_differ = true;
							
							split_time = 0;
							
							break;
						}
					}
					
					if (cages_by_locations_differ)
					{
						break;
					}
				}
			}
		}
		
		
		
		setTimeout(() =>
		{
			web_worker.postMessage([grid_size, max_cage_size]);
		}, Site.opacity_animation_time);
	}
	
	
	
	function show_timers()
	{
		total_time_label_element.style.opacity = 1;
		
		setTimeout(() =>
		{
			total_time_clock_element.style.opacity = 1;
			
			setTimeout(() =>
			{
				split_time_label_element.style.opacity = 1;
				
				setTimeout(() =>
				{
					split_time_clock_element.style.opacity = 1;
					
					setTimeout(() =>
					{
						wilson.canvas.style.opacity = 1;
					}, Site.aos_separation_time);
				}, Site.aos_separation_time);
			}, Site.aos_separation_time);
		}, Site.aos_separation_time);
	}
	
	
	
	function update_timers()
	{
		let seconds = total_time % 60;
		let minutes = Math.floor(total_time / 60) % 60;
		let hours = Math.floor(total_time / 3600);
		
		let total_time_string = "";
		
		if (hours > 0)
		{
			total_time_string += hours + ":";
			
			if (minutes < 10)
			{
				total_time_string += "0";
			}
		}
		
		if (minutes > 0 || hours > 0)
		{
			total_time_string += minutes + ":";
			
			if (seconds < 10)
			{
				total_time_string += "0";
			}
		}
		
		total_time_string += seconds;
		
		total_time_clock_element.textContent = total_time_string;
		
		
		
		seconds = split_time % 60;
		minutes = Math.floor(split_time / 60) % 60;
		hours = Math.floor(split_time / 3600);
		
		let split_time_string = "";
		
		if (hours > 0)
		{
			split_time_string += hours + ":";
			
			if (minutes < 10)
			{
				split_time_string += "0";
			}
		}
		
		if (minutes > 0 || hours > 0)
		{
			split_time_string += minutes + ":";
			
			if (seconds < 10)
			{
				split_time_string += "0";
			}
		}
		
		split_time_string += seconds;
		
		split_time_clock_element.textContent = split_time_string;
		
		
		
		total_time++;
		split_time++;
	}
	
	
	
	function draw_calcudoku_grid(print_mode)
	{
		let canvas_size = grid_size * 200 + 9;
		
		
		
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
		
		
		
		
		
		
		
		//Draw the light gridlines (width 2).
		for (let i = 0; i <= grid_size; i++)
		{
			wilson.ctx.fillRect(200 * i + 4, 0, 2, canvas_size + 9);
			wilson.ctx.fillRect(0, 200 * i + 4, canvas_size + 9, 2);
		}
		
		
		
		//Now draw the cages. For each cell of the grid, we draw a line with width 10 if an adjacent cell is part of a different cage.
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (i === 0 || cages_by_location[i - 1][j] !== cages_by_location[i][j])
				{
					wilson.ctx.fillRect(200 * j, 200 * i, 210, 10);
				}
				
				if (i === grid_size - 1 || cages_by_location[i + 1][j] !== cages_by_location[i][j])
				{
					wilson.ctx.fillRect(200 * j, 200 * (i + 1), 210, 10);
				}
				
				if (j === 0 || cages_by_location[i][j - 1] !== cages_by_location[i][j])
				{
					wilson.ctx.fillRect(200 * j, 200 * i, 10, 210);
				}
				
				if (j === grid_size - 1 || cages_by_location[i][j + 1] !== cages_by_location[i][j])
				{
					wilson.ctx.fillRect(200 * (j + 1), 200 * i, 10, 210);
				}
			}
		}
		
		
		
		//Finally, draw the numbers.
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
			
			if (cages[i][0] === "+")
			{
				label = cages[i][1] + "+";
			}
			
			else if (cages[i][0] === "x")
			{
				label = cages[i][1] + "\u00D7";
			}
			
			else if (cages[i][0] === "-")
			{
				label = cages[i][1] + "\u2013";
			}
			
			else if (cages[i][0] === ":")
			{
				label = cages[i][1] + "\uA789";
			}
			
			else
			{
				label = cages[i][1] + "";
			}
			
			
			
			let font_size = null;
			
			if (label.length <= 6)
			{
				wilson.ctx.font = "50px sans-serif";
				
				font_size = 50;
			}
			
			else
			{
				wilson.ctx.font = (300 / label.length) + "px sans-serif";
				
				font_size = 300 / label.length;
			}
			
			wilson.ctx.fillText(label, 200 * top_left_cell[1] + 15, 200 * top_left_cell[0] + font_size + 5);
		}
	}
}()