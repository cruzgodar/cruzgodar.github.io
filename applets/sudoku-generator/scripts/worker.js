"use strict";



//Realistically this is never going to change, but since this code is adapted from the calcudoku applet's, it's easier to just leave this variable as-is.
const gridSize = 9;

let grid = [];

let nonzeroCells = [];

let numSolutionsFound = 0;





function generateSudokuGrid()
{
	grid = [];
	
	
	
	//First, we just need a random starting grid.
	generateNumberGrid();
	
	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			nonzeroCells.push([i, j]);
		}
	}
	
	nonzeroCells = shuffleArray(nonzeroCells);
	
	
	
	for (let i = 0; i < nonzeroCells.length; i++)
	{
		const cellToRemove = nonzeroCells[i];
		const numberToRemove = grid[cellToRemove[0]][cellToRemove[1]];
		
		grid[cellToRemove[0]][cellToRemove[1]] = 0;
		
		numSolutionsFound = wasmSolvePuzzle(grid);
		
		
		
		//If this is no longer a unique solution, no problem! We'll just revert to our last uniquely-solvable grid and try a different cell next time.
		if (numSolutionsFound !== 1)
		{
			grid[cellToRemove[0]][cellToRemove[1]] = numberToRemove;
			
			numSolutionsFound = 1;
		}
	}
	
	
	
	postMessage([grid]);
}



//Shuffles an array with the Fisher-Yates method.
function shuffleArray(array)
{
	let currentIndex = array.length;

	//While there are still elements to shuffle
	while (currentIndex !== 0)
	{
		//Pick a remaining element.
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		
		//Swap it with the current element.
		const temp = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temp;
	}
	
	return array;
}



//Creates a grid of numbers with side length gridSize such that no column or row contains a repeated number. This is normally a very hard thing to do, becoming pretty much impossible most of the time after a side length of 10. Good news is, we can do things much more simply -- becuase we don't need a uniformly random grid.
function generateNumberGrid()
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
	
	const shuffles = shuffleArray([shuffleGridRows, shuffleGridRows, shuffleGridColumns, shuffleGridColumns, shuffleGridDigits, shuffleGridDigits]);
	
	for (let i = 0; i < 6; i++)
	{
		shuffles[i]();
	}
}



function shuffleGridRows()
{
	const row1 = Math.floor(Math.random() * 3);
	const row2 = Math.floor(Math.random() * 3);
	
	const row3 = Math.floor(Math.random() * 3) + 3;
	const row4 = Math.floor(Math.random() * 3) + 3;
	
	const row5 = Math.floor(Math.random() * 3) + 6;
	const row6 = Math.floor(Math.random() * 3) + 6;
	
	
	
	for (let j = 0; j < gridSize; j++)
	{
		let temp = grid[row1][j];
		grid[row1][j] = grid[row2][j];
		grid[row2][j] = temp;
		
		temp = grid[row3][j];
		grid[row3][j] = grid[row4][j];
		grid[row4][j] = temp;
		
		temp = grid[row5][j];
		grid[row5][j] = grid[row6][j];
		grid[row6][j] = temp;
	}
}



function shuffleGridColumns()
{
	const col1 = Math.floor(Math.random() * 3);
	const col2 = Math.floor(Math.random() * 3);
	
	const col3 = Math.floor(Math.random() * 3) + 3;
	const col4 = Math.floor(Math.random() * 3) + 3;
	
	const col5 = Math.floor(Math.random() * 3) + 6;
	const col6 = Math.floor(Math.random() * 3) + 6;
	
	
	
	for (let i = 0; i < gridSize; i++)
	{
		let temp = grid[i][col1];
		grid[i][col1] = grid[i][col2];
		grid[i][col2] = temp;
		
		temp = grid[i][col3];
		grid[i][col3] = grid[i][col4];
		grid[i][col4] = temp;
		
		temp = grid[i][col5];
		grid[i][col5] = grid[i][col6];
		grid[i][col6] = temp;
	}
}



function shuffleGridDigits()
{
	const permutation = shuffleArray([...Array(gridSize).keys()]);
	
	
	
	const tempGrid = [];
	
	for (let i = 0; i < gridSize; i++)
	{
		tempGrid[i] = [];
		
		for (let j = 0; j < gridSize; j++)
		{
			tempGrid[i][j] = 0;
		}
	}
	
	
	
	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			tempGrid[i][j] = permutation[grid[i][j] - 1] + 1;
		}
	}
	
	
	
	grid = JSON.parse(JSON.stringify(tempGrid));
}



//By default, we can't pass arrays to C functions. However, with the help of a library, we can pass 1D arrays, but not higher-dimensional ones. Therefore, we need to find a way to pass all of the cage data as a sequence of 1D arrays. Good news is, this isn't so bad.
function wasmSolvePuzzle()
{
	let gridFlat = [];
	
	for (let i = 0; i < gridSize; i++)
	{
		gridFlat = gridFlat.concat(grid[i]);
	}
	
	
	
	//With everything in place, we can now call the C function and let it do the heavy lifting.
	// eslint-disable-next-line no-undef
	return ccallArrays("solve_puzzle", "number", ["array"], [gridFlat], {heapIn: "HEAPU8"});
}



onmessage = () =>
{
	// eslint-disable-next-line no-undef
	importScripts("/applets/sudoku-generator/scripts/solver.js");

	// eslint-disable-next-line no-undef
	Module["onRuntimeInitialized"] = () =>
	{
		// eslint-disable-next-line no-undef
		importScripts("/scripts/wasm-arrays.min.js");
		
		generateSudokuGrid();
	};
};