"use strict";



onmessage = function(e)
{
	grid_size = e.data[0];
	max_cage_size = e.data[1];
	unique_solution = e.data[2];
	
	generate_magic_carpet();
};



let grid_size = null;
let max_cage_size = null;
let unique_solution = null;

//Each element is of the form [top-left row, top-left col, width, height, label row offset, label col offset].
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
				//Shift the rest of the cages in the cage order down so that none is out of bounds.
				for (let j = 0; j < cage_order.length; j++)
				{
					if (cage_order[j] >= cages.length)
					{
						cage_order[j]--;
					}
				}
				
				if (unique_solution)
				{
					num_solutions_found = solve_puzzle();
					
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
						expanded_a_cage = true;
						cages_backup = JSON.parse(JSON.stringify(cages));
						cages_by_location_backup = JSON.parse(JSON.stringify(cages_by_location));
					}
				}
				
				else
				{
					expanded_a_cage = true;
				}
			}
		}
		
		if (!expanded_a_cage || cages.length <= grid_size)
		{
			postMessage([cages.sort((a, b) => (b[3]*grid_size + b[2]) - (a[3]*grid_size + a[2]))]);
			return;
		}
	}
}



function print_grid()
{
	let string = "";
	
	let labels = new Array(grid_size);
	
	for (let i = 0; i < grid_size; i++)
	{
		labels[i] = new Array(grid_size);
		
		for (let j = 0; j < grid_size; j++)
		{
			labels[i][j] = 0;
		}
	}
	
	for (let i = 0; i < cages.length; i++)
	{
		const row = cages[i][0] + cages[i][4];
		const col = cages[i][1] + cages[i][5];
		
		labels[row][col] = cages[i][2] * cages[i][3];
	}
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			string += `${labels[i][j] !== 0 ? labels[i][j] : " "} `;
		}
		
		string += "\n";
	}
	
	postMessage(string);
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
			cages[index] = [i, j, 1, 1, 0, 0];
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
	const row_offset = cage[4];
	const col_offset = cage[5];
	
	//Cages only merge up and left.
	let directions = [];
	
	//First, let's see if we can merge up. We can't leave the boundary.
	if (row !== 0)
	{
		const neighbor = cages[cages_by_location[row - 1][col]];
		
		//We don't care how tall this one is, but we need it to have the same starting column and width.
		
		if (neighbor[1] === col && neighbor[3] === width && neighbor[2] * neighbor[3] + width * height <= max_cage_size)
		{
			directions.push([1, 0]);
		}
	}
	
	//Now we'll see if we can move left.
	if (col !== 0)
	{
		const neighbor = cages[cages_by_location[row][col - 1]];
		
		//We don't care how wide this one is, but we need it to have the same starting row and height.
		
		if (neighbor[0] === row && neighbor[2] === height && neighbor[2] * neighbor[3] + width * height <= max_cage_size)
		{
			directions.push([0, 1]);
		}
	}
	
	if (directions.length === 0)
	{
		return false;
	}
	
	
	
	const direction = directions[Math.floor(Math.random() * directions.length)];
	
	const neighbor_index = cages_by_location[row - direction[0]][col - direction[1]];
	
	
	
	//There are two easy places to put the label: either we leave it where it was in the neighbor, or we leave it where it was in the merged cage.
	if (Math.random() < .5)
	{
		cages[neighbor_index][4] = cages[neighbor_index][2] * direction[0] + row_offset;
		cages[neighbor_index][5] = cages[neighbor_index][3] * direction[1] + col_offset;
	}
	
	
	
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



//Returns the number of solutions to the current cage layout.
function solve_puzzle()
{
	let occupied_cage_locations = new Array(grid_size);
	
	for (let i = 0; i < grid_size; i++)
	{
		occupied_cage_locations[i] = new Array(grid_size);
		
		for (let j = 0; j < grid_size; j++)
		{
			occupied_cage_locations[i][j] = false;
		}
	}
	
	for (let i = 0; i < cages.length; i++)
	{
		const row = cages[i][0] + cages[i][4];
		const col = cages[i][1] + cages[i][5];
		
		occupied_cage_locations[row][col] = true;
	}
	
	return solve_puzzle_step(0, occupied_cage_locations);
}

//Attempts to put a rectangle in all possible ways in cage_index.
function solve_puzzle_step(cage_index, occupied_cage_locations)
{
	if (cage_index === cages.length)
	{
		return 1;
	}
	
	
	
	const row = cages[cage_index][0] + cages[cage_index][4];
	const col = cages[cage_index][1] + cages[cage_index][5];
	
	const size = cages[cage_index][2] * cages[cage_index][3];
	
	if (size === 1)
	{
		//Nothing to do here.
		return solve_puzzle_step(cage_index + 1, occupied_cage_locations);
	}
	
	let num_solutions = 0;
	
	
	
	//First loop over sizes.
	
	let valid_sides = [];
	
	for (let side = 1; side <= Math.sqrt(size); side++)
	{
		if (size % side !== 0 || side > grid_size || size / side > grid_size)
		{
			continue;
		}
		
		valid_sides.push(side);
		
		if (size / side !== side)
		{
			valid_sides.push(size / side);
		}
	}
	
	
	
	valid_sides.forEach(side_1 =>
	{
		const side_2 = size / side_1;
		
		//Now look at positions for the top-left square.
		
		const min_row = Math.max(row - side_1 + 1, 0);
		const max_row = Math.min(row, grid_size - side_1);
		
		const min_col = Math.max(col - side_2 + 1, 0);
		const max_col = Math.min(col, grid_size - side_2);
		
		for (let i = min_row; i <= max_row; i++)
		{
			for (let j = min_col; j <= max_col; j++)
			{
				//Now we need to see which rectangles fit. This is a hard problem, and we're just searching the entire rectangle here.
				let broken = false;
				
				for (let k = 0; k < side_1; k++)
				{
					for (let l = 0; l < side_2; l++)
					{
						if (occupied_cage_locations[i + k][j + l] && !(i + k === row && j + l === col))
						{
							broken = true;
							break;
						}
					}
					
					if (broken)
					{
						break;
					}
				}
				
				
				
				if (!broken)
				{
					let new_occupied_cage_locations = new Array(grid_size);
					
					for (let k = 0; k < grid_size; k++)
					{
						new_occupied_cage_locations[k] = new Array(grid_size);
						
						for (let l = 0; l < grid_size; l++)
						{
							new_occupied_cage_locations[k][l] = occupied_cage_locations[k][l];
						}
					}
					
					for (let k = 0; k < side_1; k++)
					{
						for (let l = 0; l < side_2; l++)
						{
							new_occupied_cage_locations[i + k][j + l] = true;
						}
					}
					
					num_solutions += solve_puzzle_step(cage_index + 1, new_occupied_cage_locations);
				}
			}
		}
	});
	
	return num_solutions;
}