"use strict";



onmessage = async function(e)
{
	gridSize = e.data[0];
	numIterations = e.data[1];
	
	await drawFern();
}



let gridSize = null;
let numIterations = null;

let fernGraph = null;

let randomizationCoefficients = [.1, .1, .1, .1, .5, .5];

let transformationCoefficients =
[
	[0, 0, 0, .16, 0, 0],
	[.85, .04, -.04, .85, 0, 1.6],
	[.2, -.26, .23, .22, 0, 1.6],
	[-.15, .28, .26, .24, 0, .44]
];

let currentX = 0;
let currentY = 0;

const minX = -6;
const maxX = 6;
const minY = -1;
const maxY = 11;




function drawFern()
{
	return new Promise(function(resolve, reject)
	{
		fernGraph = new Uint8ClampedArray(gridSize * gridSize * 4);
		
		for (let i = 0; i < gridSize; i++)
		{
			for (let j = 0; j < gridSize; j++)
			{
				fernGraph[4 * (gridSize * i + j) + 3] = 255;
			}
		}
		
		
		
		for (let iteration = 0; iteration < numIterations; iteration++)
		{
			if (iteration % Math.floor(numIterations / 10) === 0)
			{
				postMessage([fernGraph]);
			}
			
			
			
			let rand = Math.random();
			
			let index = 3;
			
			if (rand < .01)
			{
				index = 0;
			}
			
			else if (rand < .86)
			{
				index = 1;
			}
			
			else if (rand < .93)
			{
				index = 2;
			}
			
			affineTransformation(index);
			
			
			
			if (currentX >= maxX || currentX <= minX || currentY >= maxY || currentY <= minY)
			{
				continue;
			}
			
			
			
			//This scales col to [0, 1].
			let col = (currentX - minX) / (maxX - minX);
			
			col = Math.floor(gridSize * col);
			
			//This scales row to [0, 1].
			let row = (currentY - minY) / (maxY - minY);
			
			row = Math.floor(gridSize * (1 - row));
			
			fernGraph[4 * (gridSize * row + col) + 1]++;
		}
		
		
		
		postMessage([fernGraph]);
		
		
		
		resolve();
	});
}



function affineTransformation(index)
{
	let temp = transformationCoefficients[index][0] * currentX + transformationCoefficients[index][1] * currentY + transformationCoefficients[index][4];
	
	currentY = transformationCoefficients[index][2] * currentX + transformationCoefficients[index][3] * currentY + transformationCoefficients[index][5];
	
	currentX = temp;
}