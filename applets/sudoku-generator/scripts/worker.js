"use strict";



onmessage = function(e)
{
	importScripts("/applets/sudoku-generator/scripts/solver.js");

	Module["onRuntimeInitialized"] = function()
	{
		importScripts("/scripts/wasm-arrays.min.js");
		
		generate_sudoku_grid();
	};
}



//Rralistically this is never going to change, but since this code is adapted from the calcudoku applet's, it's easier to just leave this variable as-is.
let grid_size = 9;

let grid = [];

let nonzero_cells = [];

let num_solutions_found = 0;





function generate_sudoku_grid()
{
	grid = [];
	
	
	
	//First, we just need a random starting grid.
	generate_number_grid();
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			nonzero_cells.push([i, j]);
		}
	}
	
	nonzero_cells = shuffle_array(nonzero_cells);
	
	
	
	for (let i = 0; i < nonzero_cells.length; i++)
	{
		let cell_to_remove = nonzero_cells[i];
		let number_to_remove = grid[cell_to_remove[0]][cell_to_remove[1]];
		
		grid[cell_to_remove[0]][cell_to_remove[1]] = 0;
		
		num_solutions_found = wasm_solve_puzzle(grid);
		
		
		
		//If this is no longer a unique solution, no problem! We'll just revert to our last uniquely-solvable grid and try a different cell next time.
		if (num_solutions_found !== 1)
		{
			grid[cell_to_remove[0]][cell_to_remove[1]] = number_to_remove;
			
			num_solutions_found = 1;
		}
	}
	
	
	
	postMessage([grid]);
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
	//I have no clue what the pattern is supposed to be, so I give up. Here's a random one from the internet.
	grid = [
		[2, 9, 5, 7, 4, 3, 8, 6, 1],
		[4, 3, 1, 8, 6, 5, 9, 2, 7],
		[8, 7, 6, 1, 9, 2, 5, 4, 3],
		[3, 8, 7, 4, 5, 9, 2, 1, 6],
		[6, 1, 2, 3, 8, 7, 4, 9, 5],
		[5, 4, 9, 2, 1, 6, 7, 3, 8],
		[7, 6, 3, 5, 2, 4, 1, 8, 9],
		[9, 2, 8, 6, 7, 1, 3, 5, 4],
		[1, 5, 4, 9, 3, 8, 6, 7, 2]
	];
	
	
	
	//Now we're going to do three things: shuffle some rows (within the same minigrid), shuffle some columns (also within the same minigrid), and shuffle the digits themselves. To top it all off, we'll do these three things in random order, twice each.
	
	let shuffles = shuffle_array([shuffle_grid_rows, shuffle_grid_rows, shuffle_grid_columns, shuffle_grid_columns, shuffle_grid_digits, shuffle_grid_digits]);
	
	for (let i = 0; i < 6; i++)
	{
		shuffles[i]();
	}
}



function shuffle_grid_rows()
{
	let row_1 = Math.floor(Math.random() * 3);
	let row_2 = Math.floor(Math.random() * 3);
	
	let row_3 = Math.floor(Math.random() * 3) + 3;
	let row_4 = Math.floor(Math.random() * 3) + 3;
	
	let row_5 = Math.floor(Math.random() * 3) + 6;
	let row_6 = Math.floor(Math.random() * 3) + 6;
	
	
	
	for (let j = 0; j < grid_size; j++)
	{
		let temp = grid[row_1][j];
		grid[row_1][j] = grid[row_2][j];
		grid[row_2][j] = temp;
		
		temp = grid[row_3][j];
		grid[row_3][j] = grid[row_4][j];
		grid[row_4][j] = temp;
		
		temp = grid[row_5][j];
		grid[row_5][j] = grid[row_6][j];
		grid[row_6][j] = temp;
	}
}



function shuffle_grid_columns()
{
	let col_1 = Math.floor(Math.random() * 3);
	let col_2 = Math.floor(Math.random() * 3);
	
	let col_3 = Math.floor(Math.random() * 3) + 3;
	let col_4 = Math.floor(Math.random() * 3) + 3;
	
	let col_5 = Math.floor(Math.random() * 3) + 6;
	let col_6 = Math.floor(Math.random() * 3) + 6;
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		let temp = grid[i][col_1];
		grid[i][col_1] = grid[i][col_2];
		grid[i][col_2] = temp;
		
		temp = grid[i][col_3];
		grid[i][col_3] = grid[i][col_4];
		grid[i][col_4] = temp;
		
		temp = grid[i][col_5];
		grid[i][col_5] = grid[i][col_6];
		grid[i][col_6] = temp;
	}
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



//By default, we can't pass arrays to C functions. However, with the help of a library, we can pass 1D arrays, but not higher-dimensional ones. Therefore, we need to find a way to pass all of the cage data as a sequence of 1D arrays. Good news is, this isn't so bad.
function wasm_solve_puzzle()
{
	let grid_flat = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		grid_flat = grid_flat.concat(grid[i]);
	}
	
	
	
	//With everything in place, we can now call the C function and let it do the heavy lifting.
	return ccallArrays("solve_puzzle", "number", ["array"], [grid_flat], {heapIn: "HEAPU8"});
}