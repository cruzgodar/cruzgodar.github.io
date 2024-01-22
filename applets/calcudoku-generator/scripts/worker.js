"use strict";



let gridSize = null;

let maxCageSize = null;

let grid = [];

let cages = [];

//This is a gridSize * gridSize array that holds the index of the cage that each cell is in.
let cagesByLocation = [];

let numSolutionsFound = 0;



function generateCalcudokuGrid()
{
	grid = [];

	cages = [];

	cagesByLocation = [];



	//First, generate cages until we get a unique solution.
	//We start with all 1x1 cages -- we'll make it much harder later.
	generateNumberGrid();

	assignInitialCages();



	let cagesBackup = JSON.parse(JSON.stringify(cages));
	let cagesByLocationBackup = JSON.parse(JSON.stringify(cagesByLocation));



	for (;;)
	{
		let expandedACage = false;

		//Go through the cages from smallest to largest, but in a random order for each size.
		const cageOrder = shuffleArray([...Array(cages.length).keys()]);

		cageOrder.sort((a, b) => cages[a][2].length - cages[b][2].length);


		for (let i = 0; i < cageOrder.length; i++)
		{
			const cage = cageOrder[i];

			if (expandCages(cage) !== -1)
			{
				expandedACage = true;

				//Shift the rest of the cages in the cage order down so that none is out of bounds.
				for (let j = 0; j < cageOrder.length; j++)
				{
					if (cageOrder[j] >= cages.length)
					{
						cageOrder[j]--;
					}
				}
			}

			numSolutionsFound = wasmSolvePuzzle(cages);

			//If this is no longer a unique solution, no problem!
			//We'll just try a different cage next time. We'll just revert
			//to our last uniquely-solvable grid and try again.
			if (numSolutionsFound !== 1)
			{
				cages = JSON.parse(JSON.stringify(cagesBackup));
				cagesByLocation = JSON.parse(JSON.stringify(cagesByLocationBackup));

				numSolutionsFound = 1;
			}

			//Great! We just merged a cage, so we have a harder puzzle,
			//but the solution is still unique. Now we can set a
			//checkpoint here and keep going.
			else
			{
				cagesBackup = JSON.parse(JSON.stringify(cages));
				cagesByLocationBackup = JSON.parse(JSON.stringify(cagesByLocation));

				postMessage([grid, cages, cagesByLocation]);
			}
		}



		//The program almost never ends this way, but if no cell
		//can be expanded in the first place (this is before we've even
		//thought about unique solutions), then there's no point in continuing.
		if (expandedACage === false)
		{
			return;
		}
	}
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



//Creates a grid of numbers with side length gridSize such that no column or row
//contains a repeated number. This is normally a very hard thing to do,
//becoming pretty much impossible most of the time after a side length of 10.
//Good news is, we can do things much more simply -- becuase we don't need a uniformly random grid.
function generateNumberGrid()
{
	grid = [];

	for (let i = 0; i < gridSize; i++)
	{
		grid[i] = [];

		for (let j = 0; j < gridSize; j++)
		{
			grid[i][j] = 0;
		}
	}



	//First of all, it's very easy to get A grid with no repeating digits:
	//we'll just start with 1, ..., n in the first row,
	//then n, 1, 2, ..., n-1 in the second, and so on.
	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			grid[i][j] = ((j + i) % gridSize) + 1;
		}
	}



	//Now we're going to do three things: shuffle the rows, shuffle the columns,
	//and shuffle the digits themselves. To top it all off, we'll do these three things
	//in random order, twice each.

	const shuffles = shuffleArray([
		shuffleGridRows,
		shuffleGridRows,
		shuffleGridColumns,
		shuffleGridColumns,
		shuffleGridDigits,
		shuffleGridDigits
	]);

	for (let i = 0; i < 6; i++)
	{
		shuffles[i]();
	}
}



function shuffleGridRows()
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
		tempGrid[i] = JSON.parse(JSON.stringify(grid[permutation[i]]));
	}



	grid = JSON.parse(JSON.stringify(tempGrid));
}



function shuffleGridColumns()
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
			tempGrid[i][j] = grid[i][permutation[j]];
		}
	}



	grid = JSON.parse(JSON.stringify(tempGrid));
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



//Assigns cages to the graph. It begins with only 1x1 cages -- we'll make it harder later.
function assignInitialCages()
{
	cages = [];

	cagesByLocation = [];

	cagesByLocation = [];

	for (let i = 0; i < gridSize; i++)
	{
		cagesByLocation[i] = [];

		for (let j = 0; j < gridSize; j++)
		{
			const value = grid[i][j];
			cages.push(["", value, [[i, j]], value, value, value]);
			cagesByLocation[i][j] = cages.length - 1;
		}
	}
}



//Destroys a cage, using the cells left over to merge with an adjacent cage.
function expandCages(cageToDestroy)
{
	let cageThatGrew = null;



	//For simplicity, we're only trying to connect the first one to an adjacent cell.
	const row = cages[cageToDestroy][2][0][0];
	const col = cages[cageToDestroy][2][0][1];

	//Try left/right first.
	if (Math.random() < .5)
	{
		if (
			row !== 0 && cagesByLocation[row - 1][col] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row - 1][col])
		) {
			cageThatGrew = cagesByLocation[row - 1][col];
		}

		else if (
			row !== gridSize - 1 && cagesByLocation[row + 1][col] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row + 1][col])
		) {
			cageThatGrew = cagesByLocation[row + 1][col];
		}

		else if (
			col !== 0 && cagesByLocation[row][col - 1] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row][col - 1])
		) {
			cageThatGrew = cagesByLocation[row][col - 1];
		}

		else if (
			col !== gridSize - 1 && cagesByLocation[row][col + 1] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row][col + 1])
		) {
			cageThatGrew = cagesByLocation[row][col + 1];
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
		if (
			col !== 0 && cagesByLocation[row][col - 1] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row][col - 1])
		) {
			cageThatGrew = cagesByLocation[row][col - 1];
		}

		else if (
			col !== gridSize - 1 && cagesByLocation[row][col + 1] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row][col + 1])
		) {
			cageThatGrew = cagesByLocation[row][col + 1];
		}

		else if (
			row !== 0 && cagesByLocation[row - 1][col] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row - 1][col])
		)
		) {cageThatGrew = cagesByLocation[row - 1][col];
		}

		else if (
			row !== gridSize - 1 && cagesByLocation[row + 1][col] !== cageToDestroy
			&& tryToAddCageToCage(cagesByLocation[row][col], cagesByLocation[row + 1][col])
		) {
		) {

		else
		{
			//Apparently this cell can't join with anything, so we're forced to move on.
			return;
		}
	}



	//Now we'll actually remove this cage from the list and add all the cells to the new cage.
	addCageToCage(cageToDestroy, cageThatGrew);

	cages.splice(cageToDestroy, 1);

	//Finally, for all the other cages, we need to shift their numbers down by one.
	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			if (cagesByLocation[i][j] > cageToDestroy)
			{
				cagesByLocation[i][j]--;
			}
		}
	}
}



function tryToAddCageToCage(cageToDestroy, cageToGrow)
{
	if (cages[cageToGrow][2].length + cages[cageToDestroy][2].length > maxCageSize)
	{
		return false;
	}



	//There are no problems if the new cage is an addition or multiplication cell,
	//but there could be if it's subtraction or division.

	//This will be treated either as addition or multiplication.
	if (cages[cageToGrow][0] === "")
	{
		return true;
	}



	if (cages[cageToGrow][0] === "+")
	{
		return true;
	}



	else if (cages[cageToGrow][0] === "x")
	{
		return true;
	}



	//The new cage sum must be less than or equal to twice the max digit.
	else if (
		cages[cageToGrow][0] === "-"
		&& cages[cageToGrow][4] + cages[cageToDestroy][4] <= (
			2 * Math.max(cages[cageToGrow][3], cages[cageToDestroy][3])
		)
	) {
		return true;
	}



	//This one is finnicky. Either:
	//1. cageToDestroy contains the new max digit, in which case the product of cageToGrow
	//must divide the quotient of cageToDestroy.
	//2. or cageToGrow contains the new max digit, in which case the product of cageToDestroy
	//must divide the quotient of cageToGrow.
	//Now we don't have easy access to the quotient of cageToDestroy, so what we'll do in both cases
	//is take the max digit squared over the products of both cages multiplied together.
	//If this division is remainderless, we're golden.
	else if (cages[cageToGrow][0] === ":")
	{
		const maxDigit = Math.max(cages[cageToGrow][3], cages[cageToDestroy][3]);
		const totalProduct = cages[cageToGrow][5] * cages[cageToDestroy][5];

		if ((maxDigit * maxDigit) % totalProduct === 0)
		{
			return true;
		}
	}

	return false;
}



function addCageToCage(cageToDestroy, cageToGrow)
{
	//The other operations aren't too bad, but if a cage tries to merge
	//with a 1x1, we need to create a new operation.
	if (cages[cageToGrow][0] === "")
	{
		const possibleOperations = ["+", "x"];
		const possibleValues = [
			cages[cageToGrow][1] + cages[cageToDestroy][4],
			cages[cageToGrow][1] * cages[cageToDestroy][5]
		];



		const newMaxDigit = Math.max(cages[cageToGrow][1], cages[cageToDestroy][3]);



		//Subtraction is only valid if the largest number
		//is bigger than or equal to the sum of all the other numbers.
		if (2 * newMaxDigit >= cages[cageToGrow][1] + cages[cageToDestroy][4])
		{
			possibleOperations.push("-");

			possibleValues.push(2 * newMaxDigit - (cages[cageToGrow][1] + cages[cageToDestroy][4]));
		}



		//Division is only valid if every digit divides the max digit.
		if ((newMaxDigit * newMaxDigit) % (cages[cageToGrow][1] * cages[cageToDestroy][5]) === 0)
		{
			possibleOperations.push(":");

			possibleValues.push(
				(newMaxDigit * newMaxDigit) / (cages[cageToGrow][1] * cages[cageToDestroy][5])
			);
		}


		//Great. Now pick a random operation and apply it -- random, unless division is possible,
		//in which case it gets a flat 50% chance since it's so rare.

		if (possibleOperations.includes(":") && Math.random() < .5)
		{
			const operationIndex = possibleOperations.indexOf(":");

			cages[cageToGrow][0] = possibleOperations[operationIndex];
			cages[cageToGrow][1] = possibleValues[operationIndex];
		}

		else
		{
			const operationIndex = Math.floor(Math.random() * possibleOperations.length);

			cages[cageToGrow][0] = possibleOperations[operationIndex];
			cages[cageToGrow][1] = possibleValues[operationIndex];
		}
	}



	else if (cages[cageToGrow][0] === "+")
	{
		cages[cageToGrow][1] += cages[cageToDestroy][4];
	}



	else if (cages[cageToGrow][0] === "x")
	{
		cages[cageToGrow][1] *= cages[cageToDestroy][5];
	}



	else if (cages[cageToGrow][0] === "-")
	{
		cages[cageToGrow][1] = 2 * Math.max(
			cages[cageToGrow][3],
			cages[cageToDestroy][3]) - (cages[cageToGrow][4] + cages[cageToDestroy][4]
		);
	}



	else if (cages[cageToGrow][0] === ":")
	{
		const maxDigit = Math.max(cages[cageToGrow][3], cages[cageToDestroy][3]);
		const totalProduct = cages[cageToGrow][5] * cages[cageToDestroy][5];

		cages[cageToGrow][1] = (maxDigit * maxDigit) / totalProduct;
	}



	cages[cageToGrow][2] = cages[cageToGrow][2].concat(cages[cageToDestroy][2]);

	cages[cageToGrow][3] = Math.max(cages[cageToGrow][3], cages[cageToDestroy][3]);

	cages[cageToGrow][4] += cages[cageToDestroy][4];
	cages[cageToGrow][5] *= cages[cageToDestroy][5];



	for (let i = 0; i < cages[cageToDestroy][2].length; i++)
	{
		const row = cages[cageToDestroy][2][i][0];
		const col = cages[cageToDestroy][2][i][1];

		cagesByLocation[row][col] = cageToGrow;
	}
}



//By default, we can't pass arrays to C functions. However, with the help of a library,
//we can pass 1D arrays, but not higher-dimensional ones. Therefore, we need to
//find a way to pass all of the cage data as a sequence of 1D arrays.
//Good news is, this isn't so bad.
function wasmSolvePuzzle()
{
	//This contains the operations that each cage uses,
	//where 0 corresponds to "", 1 to "+", 2 to "-", and so on.
	const cageOperations = [];

	const cageOperationsTable = { "": 0, "+": 1, "x": 2, "-": 3, ":": 4 };

	//This just contains the values of each cage.
	const cageValues = [];

	const cageLengths = [];

	const cageMaxDigits = [];
	const cageSums = [];
	const cageProducts = [];



	for (let i = 0; i < cages.length; i++)
	{
		cageOperations[i] = cageOperationsTable[cages[i][0]];

		cageValues[i] = cages[i][1];

		cageLengths[i] = cages[i][2].length;

		cageMaxDigits[i] = cages[i][3];
		cageSums[i] = cages[i][4];
		cageProducts[i] = cages[i][5];
	}



	//Now you may be thinking that this was the easy part. After all, the most important part of
	//the cages -- what cells actually make them up -- is buried way down deep, and every cage has
	//a different length list of cells. However, we're good. We can just flatten cagesByLocation
	//and pass that -- it contains all the information we need to reconstruct cages
	//on the other side.

	let cagesByLocationFlat = [];

	for (let i = 0; i < gridSize; i++)
	{
		cagesByLocationFlat = cagesByLocationFlat.concat(cagesByLocation[i]);
	}



	//With everything in place, we can now call the C function and let it do the heavy lifting.
	//We'd be fine with using HEAPU8 for everything, except for the fact that cageValues can have
	//entries that are quite large.
	// eslint-disable-next-line no-undef
	return ccallArrays("solve_puzzle", "number", [
		"number",
		"array",
		"array",
		"array",
		"array",
		"array",
		"array",
		"array"
	],
	[
		gridSize,
		cageOperations,
		cageValues,
		cageLengths,
		cageMaxDigits,
		cageSums,
		cageProducts,
		cagesByLocationFlat
	],
	{ heapIn: "HEAPU32" });
}



onmessage = (e) =>
{
	gridSize = e.data[0];
	maxCageSize = e.data[1];

	// eslint-disable-next-line no-undef
	importScripts("/applets/calcudoku-generator/scripts/solver.js");

	// eslint-disable-next-line no-undef
	Module["onRuntimeInitialized"] = function()
	{
		// eslint-disable-next-line no-undef
		importScripts("/scripts/wasm-arrays.min.js");

		generateCalcudokuGrid();
	};
};