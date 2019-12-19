!function()
{
	"use strict";
	
	let grid_size = 5;
	
	let num_solutions_found = 0;
	
	
	
	let grid = generate_number_grid(grid_size);
	
	console.log(grid);
	
	let cages = [];
	
	//This is a grid_size * grid_size array that holds the index of the cage that each cell is in.
	let cages_by_location = [];
	
	
	
	let attempt_counter = 1;
	
	console.log("Generating initial cages...");
	
	//First, generate cages until we get a unique solution.
	while (num_solutions_found != 1)
	{
		attempt_counter++;
		
		
		
		cages = assign_initial_cages(grid);
		
		solve_puzzle(cages);
	}
	
	console.log(attempt_counter + " attempts required.");
	
	
	
	//Now expand one cage at a time until there's no longer a unique solution.
	console.log("Expanding cages...");
	
	attempt_counter = 1;
	
	let old_cages = [];
	
	while (num_solutions_found == 1)
	{
		old_cages = cages;
		
		attempt_counter++;
		
		
		
		let result = expand_cages(cages);
		
		if (result === -1)
		{
			break;
		}
		
		solve_puzzle(cages);
	}
	
	console.log(attempt_counter + " expansions total.");
	
	cages = old_cages;
	
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
			
			
			
			place_digit(new_grid, new_grid_possibilities, new_empty_cells, row, col, grid_possibilities[row][col][i]);
			
			
			
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
		
		
		
		cages_by_location = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			cages_by_location[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				cages_by_location[i][j] = -1;
			}
		}
		
		
		
		while (uncaged_cells.length > 0)
		{
			//Pick a random cell.
			let index = Math.floor(Math.random() * uncaged_cells.length);
			let cell = uncaged_cells[index];
			
			let row = cell[0];
			let col = cell[1];
				
			//Try to find an adjacent cell that's not already caged.
			let direction_to_look = Math.random();
			
			//Up/down.
			if (direction_to_look < .5)
			{
				let index_up = pair_in_array([row - 1, col], uncaged_cells);
				
				if (index_up != -1)
				{
					cages.push(["", 0, [cell, [row - 1, col]]]);
					
					cages_by_location[row][col] = cages.length - 1;
					cages_by_location[row - 1][col] = cages.length - 1;
					
					uncaged_cells.splice(index_up, 1);
				}
				
				else
				{
					let index_down = pair_in_array([row + 1, col], uncaged_cells);
					
					if (index_down != -1)
					{
						cages.push(["", 0, [cell, [row + 1, col]]]);
						
						cages_by_location[row][col] = cages.length - 1;
						cages_by_location[row + 1][col] = cages.length - 1;
						
						uncaged_cells.splice(index_down, 1);
					}
					
					//Oh well -- this will just have to be a single-cell cage.
					else
					{
						cages.push(["", 0, [cell]]);
						
						cages_by_location[row][col] = cages.length - 1;
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
					
					cages_by_location[row][col] = cages.length - 1;
					cages_by_location[row][col - 1] = cages.length - 1;
					
					uncaged_cells.splice(index_left, 1);
				}
				
				else
				{
					let index_right = pair_in_array([row, col + 1], uncaged_cells);
					
					if (index_right != -1)
					{
						cages.push(["", 0, [cell, [row, col + 1]]]);
						
						cages_by_location[row][col] = cages.length - 1;
						cages_by_location[row][col + 1] = cages.length - 1;
						
						uncaged_cells.splice(index_right, 1);
					}
					
					//Oh well -- this will just have to be a single-cell cage.
					else
					{
						cages.push(["", 0, [cell]]);
						
						cages_by_location[row][col] = cages.length - 1;
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
			let cage_product = grid[cages[i][2][0][0]][cages[i][2][0][1]];
			
			if (cages[i][2].length > 1)
			{
				if (grid[cages[i][2][1][0]][cages[i][2][1][1]] > max_digit)
				{
					max_digit = grid[cages[i][2][1][0]][cages[i][2][1][1]];
				}
				
				cage_sum += grid[cages[i][2][1][0]][cages[i][2][1][1]];
				cage_product *= grid[cages[i][2][1][0]][cages[i][2][1][1]];
			}
			
			cages[i].push(max_digit);
			cages[i].push(cage_sum);
			cages[i].push(cage_product);
			
			
			
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
	
	
	
	//Picks the final cage in the list and destroys it, using the cells left over to merge with an adjacent cage.
	function expand_cages()
	{
		//Find the first cage that can be joined to something else.
		let cage_to_destroy = cages.length - 1;
		
		while (typeof cages[cage_to_destroy][6] !== "undefined")
		{
			cage_to_destroy--;
			
			if (cage_to_destroy == -1)
			{
				return -1;
			}
		}
		
		
		
		let cage_that_grew = null;

		
		
		//For simplicity, we're only trying to connect the first one to an adjacent cell.
		let row = cages[cage_to_destroy][2][0][0];
		let col = cages[cage_to_destroy][2][0][1];
		
		//Try left/right first.
		if (Math.random() < .5)
		{
			if (row != 0 && cages_by_location[row - 1][col] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row - 1][col]))
			{
				cage_that_grew = cages_by_location[row - 1][col];
			}
			
			else if (row != grid_size - 1 && cages_by_location[row + 1][col] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row + 1][col]))
			{
				cage_that_grew = cages_by_location[row + 1][col];
			}
			
			else if (col != 0 && cages_by_location[row][col - 1] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row][col - 1]))
			{
				cage_that_grew = cages_by_location[row][col - 1];
			}
			
			else if (col != grid_size - 1 && cages_by_location[row][col + 1] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row][col + 1]))
			{
				cage_that_grew = cages_by_location[row][col + 1];
			}
			
			else
			{
				//Apparently this cell can't join with anything, so we're forced to mark it as unjoinable and move on.				
				
				cages[cage_to_destroy].push(true);
				
				return;
			}
		}
		
		
		
		//Try up/down first.
		else
		{
			if (col != 0 && cages_by_location[row][col - 1] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row][col - 1]))
			{
				cage_that_grew = cages_by_location[row][col - 1];
			}
			
			else if (col != grid_size - 1 && cages_by_location[row][col + 1] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row][col + 1]))
			{
				cage_that_grew = cages_by_location[row][col + 1];
			}
			
			else if (row != 0 && cages_by_location[row - 1][col] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row - 1][col]))
			{
				cage_that_grew = cages_by_location[row - 1][col];
			}
			
			else if (row != grid_size - 1 && cages_by_location[row + 1][col] != cage_to_destroy && try_to_add_cell_to_cage(row, col, cages_by_location[row + 1][col]))
			{
				cage_that_grew = cages_by_location[row + 1][col];
			}
			
			else
			{
				//Apparently this cell can't join with anything, so we're forced to mark it as unjoinable and move on.				
				
				cages[cage_to_destroy].push(true);
				
				return;
			}
		}
		
		
		
		//Now we'll actually remove this cage from the list and add all the cells to the new cage.
		for (let i = 0; i < cages[cage_to_destroy][2].length; i++)
		{
			let row = cages[cage_to_destroy][2][i][0];
			let col = cages[cage_to_destroy][2][i][1];
			
			add_cell_to_cage(row, col, cage_that_grew);
		}
		
		cages.splice(cage_to_destroy, 1);
		
		//Finally, for all the other cages, we need to shift their numbers down by one.
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (cages_by_location[i][j] > cage_to_destroy)
				{
					cages_by_location[i][j]--;
				}
			}
		}
		
		console.log("Added cage " + cage_to_destroy + " to cage " + cage_that_grew);
	}
	
	
	
	function try_to_add_cell_to_cage(row, col, cage)
	{
		//There are no problems if the new cage is an addition or multiplication cell, but there could be if it's subtraction or division.
		
		if (cages[cage][0] === "+")
		{
			return true;
		}
		
		
		
		else if (cages[cage][0] === "x")
		{
			return true;
		}
		
		
		
		//The cage sum must be less than or equal to twice the max digit.
		else if (cages[cage][0] === "-" && cages[cage][4] + grid[row][col] <= 2 * Math.max(cages[cage][3], grid[row][col]))
		{
			return true;
		}
		
		
		
		//This one is finnicky. Either the new cell has to divide the quotient that's already there, or if the new digit is the biggest, then the product of all the cells in the cage must divide it.
		else if (cages[cage][0] === ":")
		{
			if (grid[row][col] < cages[cage][3] && cages[cage][1] % grid[row][col] == 0)
			{
				return true;
			}
			
			else if (grid[row][col] >= cages[cage][3] && grid[row][col] % cages[cage][5] == 0)
			{
				return true;
			}
		}
		
		return false;
	}
	
	
	
	function add_cell_to_cage(row, col, cage)
	{
		if (cages[cage][0] === "+")
		{
			cages[cage][1] += grid[row][col];
		}
		
		
		
		else if (cages[cage][0] === "x")
		{
			cages[cage][1] *= grid[row][col];
		}
		
		
		
		else if (cages[cage][0] === "-")
		{
			cages[cage][1] = 2 * Math.max(cages[cage][3], grid[row][col]) - (cages[cage][4] + grid[row][col]);
		}
		
		
		
		else if (cages[cage][0] === ":")
		{
			if (grid[row][col] < cages[cage][3])
			{
				cages[cage][1] = cages[cage][1] / grid[row][col];
			}
			
			else
			{
				cages[cage][1] = grid[row][col] / cages[cage][5];
			}
		}
		
		
		
		cages[cage][2].push([row, col]);
		
		cages[cage][3] = Math.max(cages[cage][3], grid[row][col]);
		
		cages[cage][4] += grid[row][col];
		cages[cage][5] *= grid[row][col];
		
		cages_by_location[row][col] = cage;
	}
	
	
	
	//Finds ALL possible solutions to a given puzzle.
	function solve_puzzle(cages)
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
		
		
		
		//Trying everything will take forever if we don't narrow our possibilities first. This is where things get a little more complicated than just generating a random grid.
		for (let i = 0; i < cages.length; i++)
		{
			//1x1 cages are easy.
			if (cages[i][0] === "")
			{
				place_digit(grid, grid_possibilities, empty_cells, cages[i][2][0][0], cages[i][2][0][1], cages[i][1]);
			}
			
			
			
			//These are integer partitions, and they're a pain in the ass. Right now, we're just going to say that any cell in the cage can be at most the sum minus the number of cells plus 1. For example, a 3-cell cage that sums to 8 can have a max entry of 6.
			else if (cages[i][0] === "+")
			{
				let max_allowable_entry = cages[i][4] - cages[i][2].length + 1;
				
				//For each cell in the cage,
				for (let j = 0; j < cages[i][2].length; j++)
				{
					let row = cages[i][2][j][0];
					let col = cages[i][2][j][1];
					
					//remove any number higher than what is allowed.
					for (let k = max_allowable_entry + 1; k <= grid_size; k++)
					{
						let index = grid_possibilities[row][col].indexOf(k);
						
						if (index != -1)
						{
							grid_possibilities[row][col].splice(index, 1);
						}
					}
				}
			}
			
			
			
			//This involves a number's factorization. Again, that's a pain, so we're just going to remove numbers that don't divide the product.
			else if (cages[i][0] === "x")
			{
				//For each cell in the cage,
				for (let j = 0; j < cages[i][2].length; j++)
				{
					let row = cages[i][2][j][0];
					let col = cages[i][2][j][1];
					
					//remove any number that doesn't divide the product.
					for (let k = 2; k <= grid_size; k++)
					{
						if (cages[i][5] % k != 0)
						{
							let index = grid_possibilities[row][col].indexOf(k);
							
							if (index != -1)
							{
								grid_possibilities[row][col].splice(index, 1);
							}
						}
					}
				}
			}
			
			
			
			//There's not much we can do for subtraction or division, unfortunately.
		}
		
		
		
		//Okay, now the fun begins.
		
		num_solutions_found = 0;
		
		solve_puzzle_step(grid, grid_possibilities, empty_cells);
	}
	
	
	
	//This is just like the grid generating function, except that it tries to find every solution.
	function solve_puzzle_step(grid, grid_possibilities, empty_cells)
	{
		if (empty_cells.length == 0)
		{
			num_solutions_found++;
			
			return true;
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
			//Again, this is cursed code, but it's the simplest way to clone a multidimensional array.
			let new_grid = JSON.parse(JSON.stringify(grid));
			let new_grid_possibilities = JSON.parse(JSON.stringify(grid_possibilities));
			let new_empty_cells = JSON.parse(JSON.stringify(empty_cells));
			
			
			
			place_digit(new_grid, new_grid_possibilities, new_empty_cells, row, col, grid_possibilities[row][col][i]);
			
			if (check_cage(new_grid, cages_by_location[row][col]) === false)
			{
				continue;
			}
			
			
			
			solve_puzzle_step(new_grid, new_grid_possibilities, new_empty_cells);
		}
		
		return false;
	}
	
	
	
	function check_cage(grid, cage)
	{
		//If the cage isn't full, we don't care.
		for (let i = 0; i < cages[cage][2].length; i++)
		{
			let row = cages[cage][2][i][0];
			let col = cages[cage][2][i][1];
			
			if (grid[row][col] == 0)
			{
				return true;
			}
		}
		
		
		
		//Otherwise, we need to check that the operation works.
		if (cages[cage][0] == "+")
		{
			let cage_sum = 0;
			
			for (let i = 0; i < cages[cage][2].length; i++)
			{
				let row = cages[cage][2][i][0];
				let col = cages[cage][2][i][1];
				
				cage_sum += grid[row][col];
			}
			
			if (cage_sum != cages[cage][1])
			{
				return false;
			}
		}
		
		
		
		else if (cages[cage][0] == "x")
		{
			let cage_product = 1;
			
			for (let i = 0; i < cages[cage][2].length; i++)
			{
				let row = cages[cage][2][i][0];
				let col = cages[cage][2][i][1];
				
				cage_product *= grid[row][col];
			}
			
			if (cage_product != cages[cage][1])
			{
				return false;
			}
		}
		
		
		
		else if (cages[cage][0] == "-")
		{
			let cage_sum = 0;
			
			for (let i = 0; i < cages[cage][2].length; i++)
			{
				let row = cages[cage][2][i][0];
				let col = cages[cage][2][i][1];
				
				cage_sum += grid[row][col];
			}
			
			//This is equivalent to taking the max digit minus the rest.
			if ((2 * cages[cage][3]) - cage_sum != cages[cage][1])
			{
				return false;
			}
		}
		
		
		
		else if (cages[cage][0] == ":")
		{
			let cage_product = 1;
			
			for (let i = 0; i < cages[cage][2].length; i++)
			{
				let row = cages[cage][2][i][0];
				let col = cages[cage][2][i][1];
				
				cage_product *= grid[row][col];
			}
			
			//This is equivalent to taking the max digit divided by the rest.
			if ((cages[cage][3] * cages[cage][3]) / cage_product != cages[cage][1])
			{
				return false;
			}
		}
		
		
		
		return true;
	}
	
	
	
	function place_digit(grid, grid_possibilities, empty_cells, row, col, digit)
	{
		//Actually place the digit.
		grid[row][col] = digit;
		
		
		
		//Remove this possibility from that row and column.
		for (let j = 0; j < grid_size; j++)
		{
			let index = grid_possibilities[row][j].indexOf(digit);
			
			if (index != -1)
			{
				grid_possibilities[row][j].splice(index, 1);
			}
			
			index = grid_possibilities[j][col].indexOf(digit);
			
			if (index != -1)
			{
				grid_possibilities[j][col].splice(index, 1);
			}
		}
		
		//This isn't strictly necessary, but it makes things a lot easier to see.
		grid_possibilities[row][col] = [digit];
		
		
		
		//This cell is no longer empty.
		let index = pair_in_array([row, col], empty_cells);
		
		if (index != -1)
		{
			empty_cells.splice(index, 1);
		}
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