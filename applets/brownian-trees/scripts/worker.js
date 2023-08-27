"use strict";



let gridSize = null;

let margin = null;

let brownianTreeGraph = [];

let color = [];

let currentBrightness = 255;

let progressThreshhold = 5;

let currentRow = null;
let currentCol = null;

//New points will start on a circle with this as its radius.
let spawnRadius = null;

const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];



function drawBrownianTree()
{
	brownianTreeGraph = [];
	color = [];
		
	for (let i = 0; i < gridSize; i++)
	{
		brownianTreeGraph[i] = [];
		color[i] = [];
		
		for (let j = 0; j < gridSize; j++)
		{
			brownianTreeGraph[i][j] = 0;
			color[i][j] = [0, 0, 0];
		}
	}
	
	brownianTreeGraph[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = 1;
	color[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = [255, 255, 255];
	
	postMessage([2, Math.floor(gridSize / 2), Math.floor(gridSize / 2), "rgb(255, 255, 255)"]);
	
	
	
	margin = 10;

	spawnRadius = 5;
	
	
	
	while (gridSize - 2 * spawnRadius > 2 * margin)
	{
		const angle = Math.random() * 2 * Math.PI;
		currentRow = Math.floor(spawnRadius * Math.cos(angle) + gridSize / 2);
		currentCol = Math.floor(spawnRadius * Math.sin(angle) + gridSize / 2);
		
		
		
		for (;;)
		{
			const possibleDirections = [];
			
			if (currentRow > gridSize / 2 - spawnRadius)
			{
				possibleDirections.push(0);
			}
			
			if (currentCol < gridSize / 2 + spawnRadius)
			{
				possibleDirections.push(1);
			}
			
			if (currentRow < gridSize / 2 + spawnRadius)
			{
				possibleDirections.push(2);
			}
			
			if (currentCol > gridSize / 2 - spawnRadius)
			{
				possibleDirections.push(3);
			}
			
			
			
			const direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
			
			const newRow = currentRow + directions[direction][0];
			const newCol = currentCol + directions[direction][1];
			
			if (brownianTreeGraph[newRow][newCol] === 1)
			{
				brownianTreeGraph[currentRow][currentCol] = 1;
				
				const newHue = (
					Math.atan2(
						currentCol - Math.floor(gridSize / 2),
						Math.floor(gridSize / 2) - currentRow
					)
					+ Math.PI
				) / (2 * Math.PI);
				
				const newColor = HSVtoRGB(newHue, 1, 1);
				
				color[currentRow][currentCol] = [
					.9925 * color[newRow][newCol][0] + .0075 * newColor[0],
					.9925 * color[newRow][newCol][1] + .0075 * newColor[1],
					.9925 * color[newRow][newCol][2] + .0075 * newColor[2]
				];
				
				postMessage([
					2,
					currentCol,
					currentRow,
					`rgb(${
						currentBrightness / 255 * color[currentRow][currentCol][0]
					}, ${
						currentBrightness / 255 * color[currentRow][currentCol][1]
					}, ${
						currentBrightness / 255 * color[currentRow][currentCol][2]
					})`
				]);
				
				
				
				if ((
					spawnRadius * spawnRadius
					- (currentRow - gridSize / 2) * (currentRow - gridSize / 2)
					- (currentCol - gridSize / 2) * (currentCol - gridSize / 2)
				) <= 5)
				{
					spawnRadius++;
					
					currentBrightness = Math.floor(255 * (gridSize / 2 - 10 - spawnRadius) / (gridSize / 2 - 10));
					
					//We raise the progress to 2.71 to keep the speed effectively constant.
					const progress = Math.pow((255 - currentBrightness) / 255, 2.71) * 100;
					
					if (progress > progressThreshhold)
					{
						postMessage([0, progressThreshhold]);
						
						progressThreshhold += 5;
					}
				}
				
				
				
				break;
			}
			
			currentRow = newRow;
			currentCol = newCol;
		}
	}
	
	
	
	postMessage([0, 100]);
	
	setTimeout(() =>
	{
		postMessage([1]);
	}, 500);
}



function HSVtoRGB(h, s, v)
{
	let r, g, b;
	
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	
	switch (i % 6)
	{
		case 0:r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
    
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



onmessage = (e) =>
{
	gridSize = e.data[0];
	
	drawBrownianTree();
};