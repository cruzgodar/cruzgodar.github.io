"use strict";



onmessage = (e) =>
{
	gridSize = e.data[0];
	K = e.data[1];
	orbitSeparation = e.data[2];
	
	drawKickedRotator();
};



let gridSize = null;

let K = null;

let orbitSeparation = null;

let image = [];

let currentRow = null;
let currentCol = null;

let currentP = null;
let currentTheta = null;



function drawKickedRotator()
{
	const middleCol = Math.floor(gridSize / 2);
	
	for (let i = 1; i < gridSize / 2; i += orbitSeparation + 1)
	{
		image = new Array(gridSize * gridSize);
		
		for (let j = 0; j < gridSize; j++)
		{
			for (let k = 0; k < gridSize; k++)
			{
				image[gridSize * j + k] = 0;
			}
		}
		
		
		
		const color = 6/7 * i / (gridSize / 2);
		
		
		
		//This randomness helps keep straight-line artefacts from appearing.
		const rand = Math.floor(Math.random() * (2 * orbitSeparation + 1)) - orbitSeparation;
		
		const upperHalfPointsRatio = calculateOrbit(Math.floor(gridSize / 2 + i), middleCol + rand, color);
		
		
		
		if (upperHalfPointsRatio === -1)
		{
			continue;
		}
		
		
		
		//Now that we've got our orbit, we can reflect it vertically and horizontally to get the other side -- but this is only necessary, and in fact only a good thing, if the orbit wasn't symmetric in the first place. We test for this by seeing if less than 45% of the points were above the half-way mark.
		if (upperHalfPointsRatio < .45)
		{
			for (let j = 0; j < gridSize; j++)
			{
				for (let k = 0; k < gridSize; k++)
				{
					if (image[gridSize * j + k] !== 0)
					{
						image[gridSize * (gridSize - j - 1) + gridSize - k - 1] = image[gridSize * j + k];
					}
				}
			}
		}
		
		
		
		postMessage([image, color]);
	}
}



//Runs through an entire orbit. Returns the fraction of points that were above the halfway mark.
function calculateOrbit(startRow, startCol)
{
	let numUpperHalfPoints = 0;
	
	currentRow = startRow;
	currentCol = startCol;
	
	if (image[gridSize * currentRow + currentCol] !== 0)
	{
		return -1;
	}
	
	currentP = (1 - (currentRow / gridSize)) * (2 * Math.PI);
	currentTheta = (currentCol / gridSize) * (2 * Math.PI);
	
	
	
	//Here's the idea. We can't just terminate an orbit if the point coincides one of the places we've already been, since the rasterizing makes that happen way too often. We also don't want every orbit to go one forever though, so instead, we'll terminate an orbit if it hits enough points we've already seen in a row.
	let numPoints = 0;
	
	for (;;)
	{
		//Add the current point to the image.
		image[gridSize * currentRow + currentCol]++;
		
		numPoints++;
		
		if (currentRow < gridSize / 2)
		{
			numUpperHalfPoints++;
		}
		
		if (image[gridSize * currentRow + currentCol] === 300)
		{
			break;
		}
		
		
		
		currentP = currentP + K * Math.sin(currentTheta);
		currentTheta = currentTheta + currentP;
		
		while (currentP >= 2 * Math.PI)
		{
			currentP -= 2 * Math.PI;
		}
		
		while (currentTheta >= 2 * Math.PI)
		{
			currentTheta -= 2 * Math.PI;
		}
		
		while (currentP < 0)
		{
			currentP += 2 * Math.PI;
		}
		
		while (currentTheta < 0)
		{
			currentTheta += 2 * Math.PI;
		}
		
		currentRow = Math.floor((1 - (currentP / (2 * Math.PI))) * gridSize);
		currentCol = Math.floor((currentTheta / (2 * Math.PI)) * gridSize);
	}
	
	
	
	return numUpperHalfPoints / numPoints;
}