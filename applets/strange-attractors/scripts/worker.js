"use strict";



let gridSize = null;

let sigma = null;
let rho = null;
let beta = null;

let maximumSpeed = null;

let pixels = [];

const boxSize = 50;
const dt = .0005;

//Since the attractor is centered at a high z-value, we need to shift the viewport.
const minZ = 0;

let stepsPerColor = 5000;
let numColors = null;

let currentX = 1;
let currentY = 1;
let currentZ = 25;

let currentRow = null;
let currentCol = null;



async function drawLorenzAttractor()
{
	let step = 0;
	
	let color = 0;
	
	numColors = gridSize;
	
	
	
	while (stepsPerColor > 0)
	{
		if (step === stepsPerColor)
		{
			postMessage([pixels, HSVtoRGB(color / numColors / 6.5, 1, 1)]);
			
			pixels = [];
			
			color++;
			
			step = 0;
			
			stepsPerColor -= 2*Math.floor(5000 / numColors);
			
			if (!maximumSpeed)
			{
				await new Promise(resolve => setTimeout(resolve, 8));
			}
		}
		
		
		
		const shiftedZ = currentZ - minZ - boxSize / 2;
		
		currentCol = Math.floor(((currentX + boxSize / 2) / boxSize) * gridSize);
		currentRow = Math.floor((1 - (shiftedZ + boxSize / 2) / boxSize) * gridSize);
		
		if (currentRow >= 0 && currentCol >= 0 && currentRow < gridSize && currentCol < gridSize)
		{
			pixels.push([currentRow, currentCol]);
		}
		
		
		
		currentX += sigma * (currentY - currentX) * dt;
		currentY += (currentX * (rho - currentZ) - currentY) * dt;
		currentZ += (currentX * currentY - beta * currentZ) * dt;
		
		
		
		step++;
	}
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
	
	sigma = e.data[1];
	rho = e.data[2];
	beta = e.data[3];
	
	maximumSpeed = e.data[4];
	
	drawLorenzAttractor();
};