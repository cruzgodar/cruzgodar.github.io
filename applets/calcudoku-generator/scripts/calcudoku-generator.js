!function()
{
	"use strict";
	
	let grid_size = 5;
	
	console.log(generate_number_grid(grid_size));	
	
	
	
	
	
	//Creates a grid of numbers with side length grid_size such that no column or row contains a repeated number. 
	function generate_number_grid()
	{
		let grid = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			grid[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				grid[i][j] = 0;
			}
		}
		
		
		
		//What possible numbers can go in each cell.
		let grid_possibilities = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			grid_possibilities[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				//This puts [1, 2, ..., grid_size] in each entry.
				grid_possibilities[i][j] = [...Array(grid_size).keys()].map(x => x + 1);
			}
		}
		
		
		
		let empty_cells = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				empty_cells.push([i, j]);
			}
		}
		
		
		
		return generate_number_grid_step(grid, grid_possibilities, empty_cells);
	}
	
	
	
	function generate_number_grid_step(grid, grid_possibilities, empty_cells)
	{
		if (empty_cells.length == 0)
		{
			return grid;
		}
		
		
		
		//Pick a random cell.
		let cell = empty_cells[Math.floor(Math.random() * empty_cells.length)];
		
		let row = cell[0];
		let col = cell[1];
		
		//If there are no possibilities for this cell, something has gone wrong.
		if (grid_possibilities[row][col].length == 0)
		{
			return false;
		}
		
		
		
		//Otherwise, start trying numbers.
		for (let i = 0; i < grid_possibilities[row][col].length; i++)
		{
			//This is cursed code, but it's the simplest way to clone a multidimensional array.
			let new_grid = JSON.parse(JSON.stringify(grid));
			let new_grid_possibilities = JSON.parse(JSON.stringify(grid_possibilities));
			let new_empty_cells = JSON.parse(JSON.stringify(empty_cells));
			
			
			
			new_grid[row][col] = grid_possibilities[row][col][i];
			
			for (let j = 0; j < grid_size; j++)
			{
				if (new_grid_possibilities[row][j].includes(new_grid[row][col]))
				{
					new_grid_possibilities[row][j].splice(new_grid_possibilities[row][j].indexOf(new_grid[row][col]), 1);
				}
				
				if (new_grid_possibilities[j][col].includes(new_grid[row][col]))
				{
					new_grid_possibilities[j][col].splice(new_grid_possibilities[j][col].indexOf(new_grid[row][col]), 1);
				}
			}
			
			
			
			let index = pair_in_array(cell, new_empty_cells);
			
			if (index != -1)
			{
				new_empty_cells.splice(index, 1);
			}
			
			
			
			let result = generate_number_grid_step(new_grid, new_grid_possibilities, new_empty_cells);
			
			if (result !== false)
			{
				return result;
			}
		}
		
		return false;
	}
	
	
	
	function pair_in_array(element, array)
	{
		for (let i = 0; i < array.length; i++)
		{
			if (array[i][0] == element[0] && array[i][1] == element[1])
			{
				return i;
			}
		}
		
		return -1;
	}
	
	
	
	function prepare_download()
	{
		window.open(document.querySelector("#annealing-graph").toDataURL(), "_blank");
	}


	
	function adjust_for_settings()
	{
		if (url_vars["contrast"] == 1)
		{
			if (url_vars["theme"] == 1)
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