"use strict";



let numVertices = null;
let gridSize = null;

let image = [];

let vertices = [];

let centerRow = null;
let centerCol = null;

let currentRow = null;
let currentCol = null;

let numPixelsAtMax = 0;



function drawChaosGame()
{
	image = new Uint8ClampedArray(gridSize * gridSize * 4);

	for (let i = 0; i < gridSize; i++)
	{
		for (let j = 0; j < gridSize; j++)
		{
			image[4 * (gridSize * i + j)] = 0;
			image[4 * (gridSize * i + j) + 1] = 0;
			image[4 * (gridSize * i + j) + 2] = 0;

			image[4 * (gridSize * i + j) + 3] = 255;
		}
	}



	// This makes the size of the black bars on the top and bottom equal.
	const middleAngle = Math.floor(numVertices / 2) * 2 * Math.PI / numVertices;

	const topRow = gridSize / 2 - gridSize / 2.5;
	const bottomRow = gridSize / 2 - gridSize / 2.5 * Math.cos(middleAngle);

	const totalMargin = topRow + (gridSize - bottomRow);

	centerRow = Math.floor(totalMargin / 2 + gridSize / 2.5);
	centerCol = Math.floor(gridSize / 2);

	currentRow = centerRow;
	currentCol = centerCol;



	vertices = [];

	for (let i = 0; i < numVertices; i++)
	{
		const angle = i / numVertices * 2 * Math.PI;

		const row = Math.floor(-Math.cos(angle) * gridSize / 2.5 + centerRow);
		const col = Math.floor(Math.sin(angle) * gridSize / 2.5 + centerCol);

		vertices.push([row, col]);
	}



	let step = 0;

	for (;;)
	{
		if (step % (gridSize * 100) === 0)
		{
			postMessage([image]);
		}



		const attractorVertex = Math.floor(Math.random() * numVertices);

		currentRow = Math.floor((currentRow + vertices[attractorVertex][0]) / 2);
		currentCol = Math.floor((currentCol + vertices[attractorVertex][1]) / 2);



		const newHue = (
			Math.atan2(currentCol - gridSize / 2, currentRow - gridSize / 2) + Math.PI
		) / (2 * Math.PI);

		const newSaturation = (
			(currentRow - gridSize / 2)
				* (currentRow - gridSize / 2)
			+ (currentCol - gridSize / 2)
				* (currentCol - gridSize / 2)
		) / (gridSize * gridSize / 13);

		const currentColor = HSVtoRGB(newHue, newSaturation, 1);

		currentColor[0] /= 255;
		currentColor[1] /= 255;
		currentColor[2] /= 255;



		for (let i = 0; i < 3; i++)
		{
			image[4 * (gridSize * currentRow + currentCol) + i] += 8 * currentColor[i];

			if (image[4 * (gridSize * currentRow + currentCol) + i] >= 255)
			{
				numPixelsAtMax++;

				image[4 * (gridSize * currentRow + currentCol) + i] = 255;

				if (numPixelsAtMax / (gridSize * gridSize) > .004)
				{
					postMessage([image]);

					return;
				}
			}
		}



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
	numVertices = e.data[0];
	gridSize = e.data[1];

	drawChaosGame();
};