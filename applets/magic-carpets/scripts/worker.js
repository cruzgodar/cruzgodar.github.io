"use strict";



onmessage = function(e)
{
	grid_size = e.data[0];
	
	//importScripts("/applets/magic-carpets/scripts/solver.js");
	
	generate_magic_carpet();
	/*
	Module["onRuntimeInitialized"] = function()
	{
		importScripts("/scripts/wasm-arrays.min.js");
		
		generate_magic_carpet();
	};
	*/
};



let grid_size = null;

//Each element is of the form [top-left row, top-left col, width, height].
let cages = [];

//This is a grid_size * grid_size array that holds the index of the cage that each cell is in.
let cages_by_location = [];

let num_solutions_found = 0;





function generate_magic_carpet()
{
	cages = [];
	
	cages_by_location = [];
	
	
	
	//First, generate rectangles until we get a unique solution. We start with all 1x1 cages -- we'll make it much harder later.
	initialize_grid();
	
	
	let cages_backup = JSON.parse(JSON.stringify(cages));
	let cages_by_location_backup = JSON.parse(JSON.stringify(cages_by_location));
	
	
	
	while (true)
	{
		let expanded_a_cage = false;
		
		//Go through the cages from smallest to largest, but in a random order for each size.
		let cage_order = shuffle_array([...Array(cages.length).keys()]);
		
		cage_order.sort((a, b) => cages[a][2]*cages[a][3] - cages[b][2]*cages[b][3]);
		
		
		
		
		for (let i = 0; i < cage_order.length; i++)
		{
			const cage_index = cage_order[i];
			
			if (expand_cage(cage_index))
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
			
			postMessage([cages, cages_by_location]);
			/*
			num_solutions_found = solve_puzzle(cages);
			
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
			
			*/
		}
		
		//The program almost never ends this way, but if no cell can be expanded in the first place (this is before we've even thought about unique solutions), then there's no point in continuing.
		if (!expanded_a_cage)
		{
			return;
		}
	}
}



//Makes a grid_size * grid_size grid with all 1x1 rects.
function initialize_grid()
{
	cages = new Array(grid_size * grid_size);
	
	cages_by_location = new Array(grid_size);
	
	let index = 0;
	
	for (let i = 0; i < grid_size; i++)
	{
		cages_by_location[i] = new Array(grid_size);
		
		for (let j = 0; j < grid_size; j++)
		{
			cages[index] = [i, j, 1, 1];
			cages_by_location[i][j] = index;
			index++;
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
		const random_index = Math.floor(Math.random() * current_index);
		current_index--;
		
		//Swap it with the current element.
		const temp = array[current_index];
		array[current_index] = array[random_index];
		array[random_index] = temp;
	}
	
	return array;
}




function expand_cage(cage_index)
{
	const cage = cages[cage_index];
	
	const row = cage[0];
	const col = cage[1];
	const height = cage[2];
	const width = cage[3];
	
	//Cages only merge up and left.
	let directions = [];
	
	//First, let's see if we can merge up. We can't leave the boundary.
	if (row !== 0)
	{
		const neighbor = cages[cages_by_location[row - 1][col]];
		
		//We don't care how tall this one is, but we need it to have the same starting column and width.
		
		if (neighbor[1] === col && neighbor[3] === width)
		{
			directions.push([1, 0]);
		}
	}
	
	//Now we'll see if we can move left.
	if (col !== 0)
	{
		const neighbor = cages[cages_by_location[row][col - 1]];
		
		//We don't care how wide this one is, but we need it to have the same starting row and height.
		
		if (neighbor[0] === row && neighbor[2] === height)
		{
			directions.push([0, 1]);
		}
	}
	
	if (directions.length === 0)
	{
		return false;
	}
	
	
	
	const direction = directions[Math.floor(Math.random() * 2)];
	
	const neighbor_index = cages_by_location[row - direction[0]][col - direction[1]];
	
	//This is a cute way of avoiding an if statement. If the column is the same but the row moved, then we want only the height to increase, and vice versa.
	cages[neighbor_index][2] += height * direction[0];
	cages[neighbor_index][3] += width * direction[1];
	
	//Now we need to remove any trace of the cage we were passed.
	
	cages.splice(cage_index, 1);
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (cages_by_location[i][j] === cage_index)
			{
				cages_by_location[i][j] = neighbor_index;
			}
			
			if (cages_by_location[i][j] > cage_index)
			{
				cages_by_location[i][j]--;
			}
		}
	}
	
	return true;
}
/*


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
		const max_digit = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
		const total_product = cages[cage_to_grow][5] * cages[cage_to_destroy][5];
		
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
		
		
		
		const new_max_digit = Math.max(cages[cage_to_grow][1], cages[cage_to_destroy][3]);
		
		
		
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
		const max_digit = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
		const total_product = cages[cage_to_grow][5] * cages[cage_to_destroy][5];
		
		cages[cage_to_grow][1] = (max_digit * max_digit) / total_product;
	}
	
	
	
	cages[cage_to_grow][2] = cages[cage_to_grow][2].concat(cages[cage_to_destroy][2]);
	
	cages[cage_to_grow][3] = Math.max(cages[cage_to_grow][3], cages[cage_to_destroy][3]);
	
	cages[cage_to_grow][4] += cages[cage_to_destroy][4];
	cages[cage_to_grow][5] *= cages[cage_to_destroy][5];
	
	
	
	for (let i = 0; i < cages[cage_to_destroy][2].length; i++)
	{
		const row = cages[cage_to_destroy][2][i][0];
		const col = cages[cage_to_destroy][2][i][1];
		
		cages_by_location[row][col] = cage_to_grow;
	}
}



//By default, we can't pass arrays to C functions. However, with the help of a library, we can pass 1D arrays, but not higher-dimensional ones. Therefore, we need to find a way to pass all of the cage data as a sequence of 1D arrays. Good news is, this isn't so bad.
function wasm_solve_puzzle()
{
	//This contains the operations that each cage uses, where 0 corresponds to "", 1 to "+", 2 to "-", and so on.
	let cage_operations = [];
	
	const cage_operations_table = {"": 0, "+": 1, "x": 2, "-": 3, ":": 4};
	
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
*/