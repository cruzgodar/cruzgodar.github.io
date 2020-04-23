"use strict";



onmessage = function(e)
{
	grid_size = e.data[0];
	max_cage_size = e.data[1];
	
	importScripts("/applets/calcudoku-generator/scripts/solver.js");

	Module["onRuntimeInitialized"] = function()
	{
		importScripts("/scripts/wasm-arrays.min.js");
		
		generate_calcudoku_grid();
	};
}



let grid_size = null;

let max_cage_size = null;

let grid = [];

let cages = [];

//This is a grid_size * grid_size array that holds the index of the cage that each cell is in.
let cages_by_location = [];

let num_solutions_found = 0;





function generate_calcudoku_grid()
{
	grid = [];
	
	cages = [];
	
	cages_by_location = [];
	
	
	
	//First, generate cages until we get a unique solution. We start with all 1x1 cages -- we'll make it much harder later.
	generate_number_grid();
	
	assign_initial_cages();
	
	
	
	let cages_backup = JSON.parse(JSON.stringify(cages));
	let cages_by_location_backup = JSON.parse(JSON.stringify(cages_by_location));
	
	
	
	while (true)
	{
		let expanded_a_cage = false;
		
		//Go through the cages from smallest to largest, but in a random order for each size.
		let cage_order = shuffle_array([...Array(cages.length).keys()]);
		
		cage_order.sort((a, b) => cages[a][2].length - cages[b][2].length);
		
		
		for (let i = 0; i < cage_order.length; i++)
		{
			let cage = cage_order[i];
			
			if (expand_cages(cage) !== -1)
			{
				expanded_a_cage = true;
				
				//Shift the rest of the cages in the cage order down so that none is out of bounds.
				for (let j = 0; j < cage_order.length; j++)
				{
					if (cage_order[j] >= cages.length)
					{
						cage_order[j]--;
					}
				}
			}
			
			num_solutions_found = wasm_solve_puzzle(cages);
			
			//If this is no longer a unique solution, no problem! We'll just try a different cage next time. We'll just revert to our last uniquely-solvable grid and try again.
			if (num_solutions_found !== 1)
			{
				cages = JSON.parse(JSON.stringify(cages_backup));
				cages_by_location = JSON.parse(JSON.stringify(cages_by_location_backup));
				
				num_solutions_found = 1;
			}
			
			//Great! We just merged a cage, so we have a harder puzzle, but the solution is still unique. Now we can set a checkpoint here and keep going.
			else
			{
				cages_backup = JSON.parse(JSON.stringify(cages));
				cages_by_location_backup = JSON.parse(JSON.stringify(cages_by_location));
				
				postMessage([grid, cages, cages_by_location]);
			}
		}
		
		
		
		//The program almost never ends this way, but if no cell can be expanded in the first place (this is before we've even thought about unique solutions), then there's no point in continuing.
		if (expanded_a_cage === false)
		{
			return;
		}
	}
}



//Shuffles an array with the Fisher-Yates method.
function shuffle_array(array)
{
	let current_index = array.length;

	//While there are still elements to shuffle
	while (current_index !== 0)
	{
		//Pick a remaining element.
		let random_index = Math.floor(Math.random() * current_index);
		current_index -= 1;
		
		//Swap it with the current element.
		let temp = array[current_index];
		array[current_index] = array[random_index];
		array[random_index] = temp;
	}
	
	return array;
}



//Creates a grid of numbers with side length grid_size such that no column or row contains a repeated number. This is normally a very hard thing to do, becoming pretty much impossible most of the time after a side length of 10. Good news is, we can do things much more simply -- becuase we don't need a uniformly random grid.
function generate_number_grid()
{
	grid = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		grid[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			grid[i][j] = 0;
		}
	}
	
	
	
	//First of all, it's very easy to get A grid with no repeating digits: we'll just start with 1, ..., n in the first row, then n, 1, 2, ..., n-1 in the second, and so on.
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			grid[i][j] = ((j + i) % grid_size) + 1;
		}
	}
	
	
	
	//Now we're going to do three things: shuffle the rows, shuffle the columns, and shuffle the digits themselves. To top it all off, we'll do these three things in random order, twice each.
	
	let shuffles = shuffle_array([shuffle_grid_rows, shuffle_grid_rows, shuffle_grid_columns, shuffle_grid_columns, shuffle_grid_digits, shuffle_grid_digits]);
	
	for (let i = 0; i < 6; i++)
	{
		shuffles[i]();
	}
}



function shuffle_grid_rows()
{
	let permutation = shuffle_array([...Array(grid_size).keys()]);
	
	
	
	let temp_grid = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		temp_grid[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			temp_grid[i][j] = 0;
		}
	}
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		temp_grid[i] = JSON.parse(JSON.stringify(grid[permutation[i]]));
	}
	
	
	
	grid = JSON.parse(JSON.stringify(temp_grid));
}



function shuffle_grid_columns()
{
	let permutation = shuffle_array([...Array(grid_size).keys()]);
	
	
	
	let temp_grid = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		temp_grid[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			temp_grid[i][j] = 0;
		}
	}
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			temp_grid[i][j] = grid[i][permutation[j]];
		}
	}
	
	
	
	grid = JSON.parse(JSON.stringify(temp_grid));
}



function shuffle_grid_digits()
{
	let permutation = shuffle_array([...Array(grid_size).keys()]);
	
	
	
	let temp_grid = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		temp_grid[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			temp_grid[i][j] = 0;
		}
	}
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			temp_grid[i][j] = permutation[grid[i][j] - 1] + 1;
		}
	}
	
	
	
	grid = JSON.parse(JSON.stringify(temp_grid));
}




//Assigns cages to the graph. It begins with only 1x1 cages -- we'll make it harder later.
function assign_initial_cages()
{
	cages = [];
	
	cages_by_location = [];
	
	cages_by_location = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		cages_by_location[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			let value = grid[i][j];
			cages.push(["", value, [[i, j]], value, value, value]);
			cages_by_location[i][j] = cages.length - 1;
		}
	}
}



//Destroys a cage, using the cells left over to merge with an adjacent cage.
function expand_cages(cage_to_destroy)
{
	let cage_that_grew = null;

	
	
	//For simplicity, we're only trying to connect the first one to an adjacent cell.
	let row = cages[cage_to_destroy][2][0][0];
	let col = cages[cage_to_destroy][2][0][1];
	
	//Try left/right first.
	if (Math.random() < .5)
	{
		if (row !== 0 && cages_by_location[row - 1][col] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row - 1][col]))
		{
			cage_that_grew = cages_by_location[row - 1][col];
		}
		
		else if (row !== grid_size - 1 && cages_by_location[row + 1][col] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row + 1][col]))
		{
			cage_that_grew = cages_by_location[row + 1][col];
		}
		
		else if (col !== 0 && cages_by_location[row][col - 1] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row][col - 1]))
		{
			cage_that_grew = cages_by_location[row][col - 1];
		}
		
		else if (col !== grid_size - 1 && cages_by_location[row][col + 1] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row][col + 1]))
		{
			cage_that_grew = cages_by_location[row][col + 1];
		}
		
		else
		{
			//Apparently this cell can't join with anything, so we're forced to move on.			
			return;
		}
	}
	
	
	
	//Try up/down first.
	else
	{
		if (col !== 0 && cages_by_location[row][col - 1] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row][col - 1]))
		{
			cage_that_grew = cages_by_location[row][col - 1];
		}
		
		else if (col !== grid_size - 1 && cages_by_location[row][col + 1] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row][col + 1]))
		{
			cage_that_grew = cages_by_location[row][col + 1];
		}
		
		else if (row !== 0 && cages_by_location[row - 1][col] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row - 1][col]))
		{
			cage_that_grew = cages_by_location[row - 1][col];
		}
		
		else if (row !== grid_size - 1 && cages_by_location[row + 1][col] !== cage_to_destroy && try_to_add_cage_to_cage(cages_by_location[row][col], cages_by_location[row + 1][col]))
		{
			cage_that_grew = cages_by_location[row + 1][col];
		}
		
		else
		{
			//Apparently this cell can't join with anything, so we're forced to move on.				
			return;
		}
	}
	
	
	
	//Now we'll actually remove this cage from the list and add all the cells to the new cage.
	add_cage_to_cage(cage_to_destroy, cage_that_grew);
	
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
}



function try_to_add_cage_to_cage(cage_to_destroy, cage_to_grow)
{
	if (cages[cage_to_grow][2].length + cages[cage_to_destroy][2].length > max_cage_size)
	{
		return false;
	}
	
	
	
	//There are no problems if the new cage is an addition or multiplication cell, but there could be if it's subtraction or division.
	
	//This will be treated either as addition or multiplication.
	if (cages[cage_to_grow][0] === "")
	{
		return true;
	}
	
	
	
	if (cages[cage_to_grow][0] === "+")
	{
		return true;
	}
	
	
	
	else if (cages[cage_to_grow][0] === "x")
	{
		return true;
	}
	
	
	
	//The new cage sum must be less than or equal to twice the max digit.
	else if (cages[cage_to_grow][0] === "-" && cages[cage_to_grow][4] + cages[cage_to_destroy][4] <= 2 * Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]))
	{
		return true;
	}
	
	
	
	//This one is finnicky. Either:
	//1. cage_to_destroy contains the new max digit, in which case the product of cage_to_grow must divide the quotient of cage_to_destroy.
	//2. or cage_to_grow contains the new max digit, in which case the product of cage_to_destroy must divide the quotient of cage_to_grow.
	//Now we don't have easy access to the quotient of cage_to_destroy, so what we'll do in both cases is take the max digit squared over the products of both cages multiplied together. If this division is remainderless, we're golden.
	else if (cages[cage_to_grow][0] === ":")
	{
		let max_digit = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
		let total_product = cages[cage_to_grow][5] * cages[cage_to_destroy][5];
		
		if ((max_digit * max_digit) % total_product === 0)
		{
			return true;
		}
	}
	
	return false;
}



function add_cage_to_cage(cage_to_destroy, cage_to_grow)
{
	//The other operations aren't too bad, but if a cage tries to merge with a 1x1, we need to create a new operation.
	if (cages[cage_to_grow][0] === "")
	{
		let possible_operations = ["+", "x"];
		let possible_values = [
			cages[cage_to_grow][1] + cages[cage_to_destroy][4],
			cages[cage_to_grow][1] * cages[cage_to_destroy][5]
		];
		
		
		
		let new_max_digit = Math.max(cages[cage_to_grow][1], cages[cage_to_destroy][3]);
		
		
		
		//Subtraction is only valid if the largest number is bigger than or equal to the sum of all the other numbers.
		if (2 * new_max_digit >= cages[cage_to_grow][1] + cages[cage_to_destroy][4])
		{
			possible_operations.push("-");
			
			possible_values.push(2 * new_max_digit - (cages[cage_to_grow][1] + cages[cage_to_destroy][4]));
		}
		
		
		
		//Division is only valid if every digit divides the max digit.
		if ((new_max_digit * new_max_digit) % (cages[cage_to_grow][1] * cages[cage_to_destroy][5]) === 0)
		{
			possible_operations.push(":");
			
			possible_values.push((new_max_digit * new_max_digit) / (cages[cage_to_grow][1] * cages[cage_to_destroy][5]));
		}
		
		
		//Great. Now pick a random operation and apply it -- random, unless division is possible, in which case it gets a flat 50% chance since it's so rare.
		
		if (possible_operations.includes(":") && Math.random() < .5)
		{
			let operation_index = possible_operations.indexOf(":");
			
			cages[cage_to_grow][0] = possible_operations[operation_index];
			cages[cage_to_grow][1] = possible_values[operation_index];
		}
		
		else
		{
			let operation_index = Math.floor(Math.random() * possible_operations.length);
			
			cages[cage_to_grow][0] = possible_operations[operation_index];
			cages[cage_to_grow][1] = possible_values[operation_index];
		}
	}
	
	
	
	else if (cages[cage_to_grow][0] === "+")
	{
		cages[cage_to_grow][1] += cages[cage_to_destroy][4];
	}
	
	
	
	else if (cages[cage_to_grow][0] === "x")
	{
		cages[cage_to_grow][1] *= cages[cage_to_destroy][5];
	}
	
	
	
	else if (cages[cage_to_grow][0] === "-")
	{
		cages[cage_to_grow][1] = 2 * Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]) - (cages[cage_to_grow][4] + cages[cage_to_destroy][4]);
	}
	
	
	
	else if (cages[cage_to_grow][0] === ":")
	{
		let max_digit = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
		let total_product = cages[cage_to_grow][5] * cages[cage_to_destroy][5];
		
		cages[cage_to_grow][1] = (max_digit * max_digit) / total_product;
	}
	
	
	
	cages[cage_to_grow][2] = cages[cage_to_grow][2].concat(cages[cage_to_destroy][2]);
	
	cages[cage_to_grow][3] = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
	
	cages[cage_to_grow][4] += cages[cage_to_destroy][4];
	cages[cage_to_grow][5] *= cages[cage_to_destroy][5];
	
	
	
	for (let i = 0; i < cages[cage_to_destroy][2].length; i++)
	{
		let row = cages[cage_to_destroy][2][i][0];
		let col = cages[cage_to_destroy][2][i][1];
		
		cages_by_location[row][col] = cage_to_grow;
	}
}



//By default, we can't pass arrays to C functions. However, with the help of a library, we can pass 1D arrays, but not higher-dimensional ones. Therefore, we need to find a way to pass all of the cage data as a sequence of 1D arrays. Good news is, this isn't so bad.
function wasm_solve_puzzle()
{
	//This contains the operations that each cage uses, where 0 corresponds to "", 1 to "+", 2 to "-", and so on.
	let cage_operations = [];
	
	let cage_operations_table = {"": 0, "+": 1, "x": 2, "-": 3, ":": 4};
	
	//This just contains the values of each cage.
	let cage_values = [];
	
	let cage_lengths = [];
	
	let cage_max_digits = [];
	let cage_sums = [];
	let cage_products = [];



	for (let i = 0; i < cages.length; i++)
	{
		cage_operations[i] = cage_operations_table[cages[i][0]];

		cage_values[i] = cages[i][1];

		cage_lengths[i] = cages[i][2].length;

		cage_max_digits[i] = cages[i][3];
		cage_sums[i] = cages[i][4];
		cage_products[i] = cages[i][5];
	}
	
	
	
	//Now you may be thinking that this was the easy part. After all, the most important part of the cages -- what cells actually make them up -- is buried way down deep, and every cage has a different length list of cells. However, we're good. We can just flatten cages_by_location and pass that -- it contains all the information we need to reconstruct cages on the other side.
	
	let cages_by_location_flat = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		cages_by_location_flat = cages_by_location_flat.concat(cages_by_location[i]);
	}
	
	
	
	//With everything in place, we can now call the C function and let it do the heavy lifting. We'd be fine with using HEAPU8 for everything, except for the fact that cage_values can have entries that are quite large.
	return ccallArrays("solve_puzzle", "number", ["number", "array", "array", "array", "array", "array", "array", "array"], [grid_size, cage_operations, cage_values, cage_lengths, cage_max_digits, cage_sums, cage_products, cages_by_location_flat], {heapIn: "HEAPU32"});
}



function pair_in_array(element, array)
{
	for (let i = 0; i < array.length; i++)
	{
		if (array[i][0] === element[0] && array[i][1] === element[1])
		{
			return i;
		}
	}
	
	return -1;
}