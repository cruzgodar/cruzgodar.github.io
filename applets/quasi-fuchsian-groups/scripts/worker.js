"use strict";



onmessage = async function(e)
{
	canvasWidth = e.data[0];
	canvasHeight = e.data[1];
	maxDepth = e.data[2];
	maxPixelBrightness = e.data[3];
	boxSize = e.data[4];
	
	coefficients = e.data[5];
	
	await drawQuasiFuchsianGroup();
}



let canvasWidth = null;
let canvasHeight = null;
let maxDepth = null;
let maxPixelBrightness = null;
let boxSize = null;

let coefficients = [];

let brightness = [];

let x = 0;
let y = 0;



function drawQuasiFuchsianGroup()
{
	return new Promise(async function(resolve, reject)
	{
		brightness = new Array(canvasWidth * canvasHeight);
		
		for (let i = 0; i < brightness.length; i++)
		{
			brightness[i] = 0;
		}
		
		
		
		for (let i = 0; i < 4; i++)
		{
			searchStep(0, 0, i, -1, -1, 1);
		}
		
		
		
		let maxBrightness = 0;
		
		for (let i = 0; i < brightness.length; i++)
		{
			maxBrightness = Math.max(maxBrightness, brightness[i]);
		}
		
		
		
		for (let i = 0; i < brightness.length; i++)
		{
			brightness[i] = Math.pow(brightness[i] / maxBrightness, .15);
		}
		
		
		
		postMessage([brightness]);
		
		
		
		resolve();
	});
}



function searchStep(startX, startY, lastTransformationIndex, lastRow, lastCol, depth)
{
	if (depth === maxDepth)
	{
		return;
	}
	
	
	
	for (let i = 3; i < 6; i++)
	{
		x = startX;
		y = startY;
		
		let transformationIndex = (lastTransformationIndex + i) % 4;
		
		applyTransformation(transformationIndex);
		
		
		
		let row = 0;
		let col = 0;
		
		if (canvasWidth >= canvasHeight)
		{
			row = Math.floor((-y + boxSize / 2) / boxSize * canvasHeight);
			col = Math.floor((x / (canvasWidth / canvasHeight) + boxSize / 2) / boxSize * canvasWidth);
		}
		
		else
		{
			row = Math.floor((-y * (canvasWidth / canvasHeight) + boxSize / 2) / boxSize * canvasHeight);
			col = Math.floor((x + boxSize / 2) / boxSize * canvasWidth);
		}
		
		
		
		if (row >= 0 && row < canvasHeight && col >= 0 && col < canvasWidth)
		{
			if (brightness[canvasWidth * row + col] === maxPixelBrightness)
			{
				continue;
			}
			
			brightness[canvasWidth * row + col]++;
		}
		
		
		
		searchStep(x, y, transformationIndex, row, col, depth + 1);
	}
}



function applyTransformation(index)
{
	let ax = coefficients[index][0][0];
	let ay = coefficients[index][0][1];
	let bx = coefficients[index][1][0];
	let by = coefficients[index][1][1];
	let cx = coefficients[index][2][0];
	let cy = coefficients[index][2][1];
	let dx = coefficients[index][3][0];
	let dy = coefficients[index][3][1];
	
	let numX = ax*x - ay*y + bx;
	let numY = ax*y + ay*x + by;
	
	let denX = cx*x - cy*y + dx;
	let denY = cx*y + cy*x + dy;
	
	let newX = numX*denX + numY*denY;
	let newY = numY*denX - numX*denY;
	
	let magnitude = denX*denX + denY*denY;
	
	x = newX / magnitude;
	y = newY / magnitude;
	}