"use strict";



let gridSize = null;
let maxCageSize = null;
let uniqueSolution = null;

//Each element is of the form [top-left row, top-left col, width, height, label row offset, label col offset].
let cages = [];

//This is a gridSize * gridSize array that holds the index of the cage that each cell is in.
let cagesByLocation = [];

let numSolutionsFound = 0;





function generateMagicCarpet()
{
	cages = [];
	
	cagesByLocation = [];
	
	
	
	//First, generate rectangles until we get a unique solution. We start with all 1x1 cages -- we'll make it much harder later.
	initializeGrid();
	
	
	let cagesBackup = JSON.parse(JSON.stringify(cages));
	let cagesByLocationBackup = JSON.parse(JSON.stringify(cagesByLocation));
	
	
	
	for (;;)
	{
		let expandedACage = false;
		
		//Go through the cages from smallest to largest, but in a random order for each size.
		const cageOrder = shuffleArray([...Array(cages.length).keys()]);
		
		cageOrder.sort((a, b) => cages[a][2]*cages[a][3] - cages[b][2]*cages[b][3]);
		
		
		
		for (let i = 0; i < cageOrder.length; i++)
		{
			const cageIndex = cageOrder[i];
			
			if (expandCage(cageIndex))
			{
				//Shift the rest of the cages in the cage order down so that none is out of bounds.
				for (let j = 0; j < cageOrder.length; j++)
				{
					if (cageOrder[j] >= cages.length)
					{
						cageOrder[j]--;
					}
				}
				
				if (uniqueSolution)
				{
					numSolutionsFound = solvePuzzle();
					
					//If this is no longer a unique solution, no problem! We'll just try a different cage next time. We'll just revert to our last uniquely-solvable grid and try again.
					if (numSolutionsFound !== 1)
					{
						cages = JSON.parse(JSON.stringify(cagesBackup));
						cagesByLocation = JSON.parse(JSON.stringify(cagesByLocationBackup));
						
						numSolutionsFound = 1;
					}
					
					//Great! We just merged a cage, so we have a harder puzzle, but the solution is still unique. Now we can set a checkpoint here and keep going.
					else
					{	
						expandedACage = true;
						cagesBackup = JSON.parse(JSON.stringify(cages));
						cagesByLocationBackup = JSON.parse(JSON.stringify(cagesByLocation));
					}
				}
				
				else
				{
					expandedACage = true;
				}
			}
		}
		
		if (!expandedACage || cages.length <= gridSize)
		{
			postMessage([cages.sort((a, b) => (b[3]*gridSize + b[2]) - (a[3]*gridSize + a[2]))]);
			return;
		}
	}
}



//Makes a gridSize * gridSize grid with all 1x1 rects.
function initializeGrid()
{
	cages = new Array(gridSize * gridSize);
	
	cagesByLocation = new Array(gridSize);
	
	let index = 0;
	
	for (let i = 0; i < gridSize; i++)
	{
		cagesByLocation[i] = new Array(gridSize);
		
		for (let j = 0; j < gridSize; j++)
		{
			cages[index] = [i, j, 1, 1, 0, 0];
			cagesByLocation[i][j] = index;
			index++;
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
		currentIndex--;
		
		//Swap it with the current element.
		const temp = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temp;
	}
	
	return array;
}




function expandCage(cageIndex)
{
	const cage = cages[cageIndex];
	
	const row = cage[0];
	const col = cage[1];
	const height = cage[2];
	const width = cage[3];
	const rowOffset = cage[4];
	const colOffset = cage[5];
	
	//Cages only merge up and left.
	const directions = [];
	
	//First, let's see if we can merge up. We can't leave the boundary.
	if (row !== 0)
	{
		const neighbor = cages[cagesByLocation[row - 1][col]];
		
		//We don't care how tall this one is, but we need it to have the same starting column and width.
		
		if (neighbor[1] === col && neighbor[3] === width && neighbor[2] * neighbor[3] + width * height <= maxCageSize)
		{
			directions.push([1, 0]);
		}
	}
	
	//Now we'll see if we can move left.
	if (col !== 0)
	{
		const neighbor = cages[cagesByLocation[row][col - 1]];
		
		//We don't care how wide this one is, but we need it to have the same starting row and height.
		
		if (neighbor[0] === row && neighbor[2] === height && neighbor[2] * neighbor[3] + width * height <= maxCageSize)
		{
			directions.push([0, 1]);
		}
	}
	
	if (directions.length === 0)
	{
		return false;
	}
	
	
	
	const direction = directions[Math.floor(Math.random() * directions.length)];
	
	const neighborIndex = cagesByLocation[row - direction[0]][col - direction[1]];
	
	
	
	//There are two easy places to put the label: either we leave it where it was in the neighbor, or we leave it where it was in the merged cage.
	if (Math.random() < .5)
	{
		cages[neighborIndex][4] = cages[neighborIndex][2] * direction[0] + rowOffset;
		cages[neighborIndex][5] = cages[neighborIndex][3] * direction[1] + colOffset;
	}
	
	
	
	//This is a cute way of avoiding an if statement. If the column is the same but the row moved, then we want only the height to increase, and vice versa.
	cages[neighborIndex][2] += height * direction[0];
	cages[neighborIndex][3] += width * direction[1];
	
	
	
	//Now we need to remove any trace of the cage we were passed.
	
	cages.splice(cageIndex, 1);
	
	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			if (cagesByLocation[i][j] === cageIndex)
			{
				cagesByLocation[i][j] = neighborIndex;
			}
			
			if (cagesByLocation[i][j] > cageIndex)
			{
				cagesByLocation[i][j]--;
			}
		}
	}
	
	return true;
}



//Returns the number of solutions to the current cage layout.
function solvePuzzle()
{
	const occupiedCageLocations = new Array(gridSize);
	
	for (let i = 0; i < gridSize; i++)
	{
		occupiedCageLocations[i] = new Array(gridSize);
		
		for (let j = 0; j < gridSize; j++)
		{
			occupiedCageLocations[i][j] = false;
		}
	}
	
	for (let i = 0; i < cages.length; i++)
	{
		const row = cages[i][0] + cages[i][4];
		const col = cages[i][1] + cages[i][5];
		
		occupiedCageLocations[row][col] = true;
	}
	
	return solvePuzzleStep(0, occupiedCageLocations);
}

//Attempts to put a rectangle in all possible ways in cageIndex.
function solvePuzzleStep(cageIndex, occupiedCageLocations)
{
	if (cageIndex === cages.length)
	{
		return 1;
	}
	
	
	
	const row = cages[cageIndex][0] + cages[cageIndex][4];
	const col = cages[cageIndex][1] + cages[cageIndex][5];
	
	const size = cages[cageIndex][2] * cages[cageIndex][3];
	
	if (size === 1)
	{
		//Nothing to do here.
		return solvePuzzleStep(cageIndex + 1, occupiedCageLocations);
	}
	
	let numSolutions = 0;
	
	
	
	//First loop over sizes.
	
	const validSides = [];
	
	for (let side = 1; side <= Math.sqrt(size); side++)
	{
		if (size % side !== 0 || side > gridSize || size / side > gridSize)
		{
			continue;
		}
		
		validSides.push(side);
		
		if (size / side !== side)
		{
			validSides.push(size / side);
		}
	}
	
	
	
	validSides.forEach(side1 =>
	{
		const side2 = size / side1;
		
		//Now look at positions for the top-left square.
		
		const minRow = Math.max(row - side1 + 1, 0);
		const maxRow = Math.min(row, gridSize - side1);
		
		const minCol = Math.max(col - side2 + 1, 0);
		const maxCol = Math.min(col, gridSize - side2);
		
		for (let i = minRow; i <= maxRow; i++)
		{
			for (let j = minCol; j <= maxCol; j++)
			{
				//Now we need to see which rectangles fit. This is a hard problem, and we're just searching the entire rectangle here.
				let broken = false;
				
				for (let k = 0; k < side1; k++)
				{
					for (let l = 0; l < side2; l++)
					{
						if (occupiedCageLocations[i + k][j + l] && !(i + k === row && j + l === col))
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
					const newOccupiedCageLocations = new Array(gridSize);
					
					for (let k = 0; k < gridSize; k++)
					{
						newOccupiedCageLocations[k] = new Array(gridSize);
						
						for (let l = 0; l < gridSize; l++)
						{
							newOccupiedCageLocations[k][l] = occupiedCageLocations[k][l];
						}
					}
					
					for (let k = 0; k < side1; k++)
					{
						for (let l = 0; l < side2; l++)
						{
							newOccupiedCageLocations[i + k][j + l] = true;
						}
					}
					
					numSolutions += solvePuzzleStep(cageIndex + 1, newOccupiedCageLocations);
				}
			}
		}
	});
	
	return numSolutions;
}



onmessage = function(e)
{
	gridSize = e.data[0];
	maxCageSize = e.data[1];
	uniqueSolution = e.data[2];
	
	generateMagicCarpet();
};