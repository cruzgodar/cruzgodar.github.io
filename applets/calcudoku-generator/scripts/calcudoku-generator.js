!function()
{
	"use strict";
	
	let grid_size = 4;
	
	let grid = generate_number_grid(grid_size);
	
	let cages = assign_initial_cages(grid);
	
	
	console.log(grid);
	console.log(cages);
	
	
	
	
	
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
	
	
	
	//Assigns cages to the graph. It begins with only 1x1 and 1x2 cages -- we'll make it harder later.
	function assign_initial_cages(grid)
	{
		let cages = [];
		
		
		
		let uncaged_cells = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				uncaged_cells.push([i, j]);
			}
		}
		
		
		
		while (uncaged_cells.length > 0)
		{
			//Pick a random cell.
			let index = Math.floor(Math.random() * uncaged_cells.length);
			let cell = uncaged_cells[index];
			
			let row = cell[0];
			let col = cell[1];
			
			console.log(uncaged_cells, cell);
				
			//Try to find an adjacent cell that's not already caged.
			let direction_to_look = Math.random();
			
			//Up/down.
			if (direction_to_look < .5)
			{
				let index_up = pair_in_array([row - 1, col], uncaged_cells);
				
				if (index_up != -1)
				{
					cages.push(["", 0, [cell, [row - 1, col]]]);
					
					uncaged_cells.splice(index_up, 1);
				}
				
				else
				{
					let index_down = pair_in_array([row + 1, col], uncaged_cells);
					
					if (index_down != -1)
					{
						cages.push(["", 0, [cell, [row + 1, col]]]);
						
						uncaged_cells.splice(index_down, 1);
					}
					
					//Oh well -- this will just have to be a single-cell cage.
					else
					{
						cages.push(["", 0, [cell]]);
					}
				}
			}
			
			//Left/right.
			else
			{
				let index_left = pair_in_array([row, col - 1], uncaged_cells);
				
				if (index_left != -1)
				{
					cages.push(["", 0, [cell, [row, col - 1]]]);
					
					uncaged_cells.splice(index_left, 1);
				}
				
				else
				{
					let index_right = pair_in_array([row, col + 1], uncaged_cells);
					
					if (index_right != -1)
					{
						cages.push(["", 0, [cell, [row, col + 1]]]);
						
						uncaged_cells.splice(index_right, 1);
					}
					
					//Oh well -- this will just have to be a single-cell cage.
					else
					{
						cages.push(["", 0, [cell]]);
					}
				}
			}
			
			
			
			//We need to get this again because cell may have moved when we removed other things.
			index = pair_in_array(cell, uncaged_cells);
			
			uncaged_cells.splice(index, 1);
		}
		
		
		
		//Now for each cage, give it a random operation.
		for (let i = 0; i < cages.length; i++)
		{
			let max_digit = grid[cages[i][2][0][0]][cages[i][2][0][1]];
			let cage_sum = grid[cages[i][2][0][0]][cages[i][2][0][1]];
			
			if (cages[i][2].length > 1)
			{
				if (grid[cages[i][2][1][0]][cages[i][2][1][1]] > max_digit)
				{
					max_digit = grid[cages[i][2][1][0]][cages[i][2][1][1]];
				}
				
				cage_sum += grid[cages[i][2][1][0]][cages[i][2][1][1]];
			}
			
			cages[i].push(max_digit);
			cages[i].push(cage_sum);
			
			
			
			if (cages[i][2].length == 1)
			{
				cages[i][1] = cages[i][3];
				
				continue;
			}
			
			
			
			let possible_operations = ["+", "x"];
			let possible_values = [cages[i][4]];
			
			possible_values.push(grid[cages[i][2][0][0]][cages[i][2][0][1]] * grid[cages[i][2][1][0]][cages[i][2][1][1]]);
			
			
			
			//Subtraction is only valid if the largest number is bigger than or equal to the sum of all the other numbers.
			if (cages[i][4] <= 2 * cages[i][3])
			{
				possible_operations.push("-");
				
				possible_values.push(Math.abs(grid[cages[i][2][0][0]][cages[i][2][0][1]] - grid[cages[i][2][1][0]][cages[i][2][1][1]]));
			}
			
			
			
			//Division is only valid if every digit divides the max digit.
			if (cages[i][3] % grid[cages[i][2][0][0]][cages[i][2][0][1]] == 0 && cages[i][3] % grid[cages[i][2][1][0]][cages[i][2][1][1]] == 0)
			{
				possible_operations.push(":");
				
				possible_values.push(cages[i][3] * cages[i][3] / possible_values[1]);
			}
			
			
			//Great. Now pick a random operation and apply it -- random, unless division is possible, in which case it gets a flat 50% chance since it's so rare.
			
			if (possible_operations.includes(":") && Math.random() < .5)
			{
				let operation_index = possible_operations.indexOf(":");
				
				cages[i][0] = possible_operations[operation_index];
				cages[i][1] = possible_values[operation_index];
			}
			
			else
			{
				let operation_index = Math.floor(Math.random() * possible_operations.length);
				
				cages[i][0] = possible_operations[operation_index];
				cages[i][1] = possible_values[operation_index];
			}
		}
		
		
		
		return cages;
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