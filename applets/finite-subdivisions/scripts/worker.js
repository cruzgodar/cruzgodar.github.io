"use strict";



onmessage = (e) =>
{
	numVertices = e.data[0];
	numIterations = e.data[1];
	gridSize = e.data[2];
	maximumSpeed = e.data[3];
	
	drawFiniteSubdivisions();
};



let numVertices = null;
let numIterations = null;
let gridSize = null;
let maximumSpeed = null;

let polygons = [];





async function drawFiniteSubdivisions()
{
	polygons = [[]];
	
	
	
	//This makes the size of the black bars on the top and bottom equal.
	let middleAngle = Math.floor(numVertices / 2) * 2 * Math.PI / numVertices;
	
	let topRow = gridSize / 2 - gridSize / 2.5;
	let bottomRow = gridSize / 2 - gridSize / 2.5 * Math.cos(middleAngle);
	
	let totalMargin = topRow + (gridSize - bottomRow);
	
	let centerRow = Math.floor(totalMargin / 2 + gridSize / 2.5);
	let centerCol = Math.floor(gridSize / 2);
	
	for (let i = 0; i < numVertices; i++)
	{
		let angle = i / numVertices * 2 * Math.PI;
		
		let row = Math.floor(-Math.cos(angle) * gridSize / 2.5 + centerRow);
		let col = Math.floor(Math.sin(angle) * gridSize / 2.5 + centerCol);
		
		polygons[0].push([row, col]);
	}
	
	
	
	await drawOuterPolygon();
	
	
	
	for (let i = 0; i < numIterations; i++)
	{
		await drawLines(calculateLines());
	}
}



async function drawOuterPolygon()
{
	if (!maximumSpeed)
	{
		for (let i = 0; i < 120; i++)
		{
			//Draw 1/120 of each line.
			for (let j = 0; j < numVertices; j++)
			{
				let rgb = HSVtoRGB((2 * j + 1) / (2 * numVertices), 1, 1);
				
				let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				
				postMessage([polygons[0][j][0], polygons[0][j][1], polygons[0][j][0] + ((i + 1) / 120) * (polygons[0][(j + 1) % numVertices][0] - polygons[0][j][0]), polygons[0][j][1] + ((i + 1) / 120) * (polygons[0][(j + 1) % numVertices][1] - polygons[0][j][1]), color]);
			}
			
			await new Promise(resolve => setTimeout(resolve, 8));
		}
	}
	
	else
	{
		for (let j = 0; j < numVertices; j++)
		{
			let rgb = HSVtoRGB((2 * j + 1) / (2 * numVertices), 1, 1);
			
			let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			postMessage([polygons[0][j][0], polygons[0][j][1], polygons[0][(j + 1) % numVertices][0], polygons[0][(j + 1) % numVertices][1], color]);
		}
	}
}



function calculateLines()
{
	let newLines = [];
	
	let newPolygons = [];
	
	for (let i = 0; i < polygons.length; i++)
	{
		let barycenterRow = 0;
		let barycenterCol = 0;
		
		for (let j = 0; j < polygons[i].length; j++)
		{
			barycenterRow += polygons[i][j][0];
			barycenterCol += polygons[i][j][1];
		}
		
		barycenterRow /= polygons[i].length;
		barycenterCol /= polygons[i].length;
		
		for (let j = 0; j < polygons[i].length; j++)
		{
			newLines.push([polygons[i][j], [barycenterRow, barycenterCol]]);
			
			newPolygons.push([[barycenterRow, barycenterCol], polygons[i][j], polygons[i][(j + 1) % polygons[i].length]]);
		}
	}
	
	polygons = newPolygons;
	
	return newLines;
}



async function drawLines(newLines)
{
	if (maximumSpeed === false)
	{
		for (let i = 0; i < 120; i++)
		{
			//Draw 1/120 of each line.
			for (let j = 0; j < newLines.length; j++)
			{
				let rgb = HSVtoRGB(j / (newLines.length - 1), 1, 1);
				
				let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				
				postMessage([newLines[j][0][0], newLines[j][0][1], newLines[j][0][0] + ((i + 1) / 120) * (newLines[j][1][0] - newLines[j][0][0]) + 1, newLines[j][0][1] + ((i + 1) / 120) * (newLines[j][1][1] - newLines[j][0][1]), color]);
			}
			
			await new Promise(resolve => setTimeout(resolve, 8));
		}
	}
	
	
	else
	{
		for (let j = 0; j < newLines.length; j++)
		{
			let rgb = HSVtoRGB(j / (newLines.length - 1), 1, 1);
			
			let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
			
			postMessage([newLines[j][0][0], newLines[j][0][1], newLines[j][1][0], newLines[j][1][1], color]);
		}
	}
}



function HSVtoRGB(h, s, v)
{
	let r, g, b, i, f, p, q, t;
	
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	
	switch (i % 6)
	{
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
    
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}