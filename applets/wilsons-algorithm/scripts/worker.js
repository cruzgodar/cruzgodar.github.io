"use strict";



onmessage = async function(e)
{
	gridSize = e.data[0];
	maximumSpeed = e.data[1];
	noBorders = e.data[2];
	reverseGenerateSkeleton = e.data[3];
	
	importScripts("/applets/wilsons-algorithm/scripts/random-walk.js");

	Module["onRuntimeInitialized"] = async function()
	{
		importScripts("/scripts/wasm-arrays.min.js");
		
		await drawWilsonGraph();
		
		await colorGraph();
		
		postMessage(["done"]);
	};
};



let gridSize = null;
let maximumSpeed = null;
let noBorders = null;
let reverseGenerateSkeleton = null;

let numSkeletonLines = 0;

let edgesInTree = [];
let verticesNotInTree = [];
let verticesInTree = [];

//This has 0s for the vertices not already in the tree and 1s for the ones that are. It's 1D so that it can be passed through to the C.
let grid = [];

let newVertices = [];

let currentRow = null;
let currentColumn = null;

let currentRowBaseCamp = null;
let currentColumnBaseCamp = null;
let randomWalkFromEndpointAttmepts = 0;

let lastDirection = null;

let randomWalk = wasmRandomWalk;
let numShortPathsInARow = 0;

let percentStep = 1;



function drawWilsonGraph()
{
	return new Promise(async function(resolve, reject)
	{
		edgesInTree = [];
		
		//This is a one-dimensional list of length n*n, where the vertex (i, j) is at position n*i + j.
		verticesNotInTree = [];
		
		for (let i = 0; i < gridSize; i++)
		{
			for (let j = 0; j < gridSize; j++)
			{
				verticesNotInTree[gridSize * i + j] = [i, j];
				
				grid[gridSize * i + j] = 0;
			}
		}
		
		
		
		while (verticesNotInTree.length > 0)
		{
			if (maximumSpeed)
			{
				wilsonStep();
			}
			
			else
			{
				await wilsonStep();
			}
			
			
			
			if (verticesInTree.length >= (gridSize * gridSize / 100) * percentStep)
			{
				postMessage(["progress", percentStep]);
				
				percentStep++;
			}
		}
		
		
		
		resolve();
	});
}



function wilsonStep()
{
	//We need a promise so that we can have this function actually take time to run.
	return new Promise(async function(resolve, reject)
	{
		newVertices = [];
		
		
		
		if (reverseGenerateSkeleton)
		{
			//The correct way to run Wilson's algorithm is to take a random point not on the tree and so a LERW until the tree is hit. When the tree is small and the graph is large, though, this is not feasible. The effect is that graphs above 1000x1000 are pretty much impossible. To make things faster, we'll instead use this method when the usual one takes longer than 3 seconds without response. Here, we start by drawing a relatively short line, then picking a point *on* the line and making a LERW away from that.
			
			
			
			//This is a little subtle. If we've never drawn a single line, then we start somewhere pretty close to the center. Otherwise, we don't set currentRow and currentColumn to anything, thereby leaving them as the endpoints of the previous random walk.
			
			if (verticesInTree.length === 0)
			{
				currentRow = Math.floor(Math.random() * gridSize / 5 + 2 * gridSize / 5);
				currentColumn = Math.floor(Math.random() * gridSize / 5 + 2 * gridSize / 5);
			}
			
			
			
			jsRandomWalk(100);
			
			
			
			//We don't include the last vertex, since it could connect back to the tree.
			newVertices.splice(newVertices.length - 1, 1);
			
			if (newVertices.length < 99)
			{
				//If we failed to get a long enough random walk from here, there's a chance that we're inside a cage of some sort. We might need to pick a new starting location for the next run, but we want to make sure that we're giving this place a proper chance. Therefore, we'll give it 100 attempts.
				if (randomWalkFromEndpointAttmepts < 100)
				{
					randomWalkFromEndpointAttmepts++;
					
					currentRow = currentRowBaseCamp;
					currentColumn = currentColumnBaseCamp;
				}
				
				else if (verticesInTree.length !== 0 && randomWalkFromEndpointAttmepts === 100)
				{
					randomWalkFromEndpointAttmepts = 0;
					
					let newIndex = Math.floor(Math.random() * verticesInTree.length);
					
					currentRow = verticesInTree[newIndex][0];
					currentColumn = verticesInTree[newIndex][1];	
				}
				
				
				
				resolve();
				return;
			}
			
			
			
			randomWalkFromEndpointAttmepts = 0;
			
			currentRowBaseCamp = newVertices[newVertices.length - 2][0];
			currentColumnBaseCamp = newVertices[newVertices.length - 2][1];
			
			currentRow = currentRowBaseCamp;
			currentColumn = currentColumnBaseCamp;
			
			numSkeletonLines++;
			
			//We need to stop doing this at some point.
			if (numSkeletonLines === Math.floor(gridSize / 5))
			{
				reverseGenerateSkeleton = false;
				
				postMessage(["log", "Going back to regular LERWs"]);
			}
		}
		
		
		
		else
		{
			//Pick a random vertex not in the tree.
			let newIndex = Math.floor(Math.random() * verticesNotInTree.length);
			
			currentRow = verticesNotInTree[newIndex][0];
			currentColumn = verticesNotInTree[newIndex][1];	
			
			if (edgesInTree.length === 0)
			{
				let walkLength = gridSize * 5;
				
				if (gridSize <= 100)
				{
					walkLength = gridSize;
				}
				
				else if (gridSize <= 300)
				{
					walkLength = gridSize * 3;
				}
				
				randomWalk(walkLength);
				
				postMessage(["log", "Got it in time!"]);
			}
			
			else
			{
				randomWalk();
			}
		}
		
		
		
		//Draw this walk.
		for (let i = 0; i < newVertices.length - 1; i++)
		{
			if (maximumSpeed)
			{
				drawLine(newVertices[i][0], newVertices[i][1], newVertices[i + 1][0], newVertices[i + 1][1], "rgb(255, 255, 255)", 0);
			}
			
			else
			{
				await drawLine(newVertices[i][0], newVertices[i][1], newVertices[i + 1][0], newVertices[i + 1][1], "rgb(255, 255, 255)", 300 / gridSize);
			}
		}
		
		
		
		//Now we can add all the vertices and edges.
		for (let i = 0; i < newVertices.length; i++)
		{
			grid[gridSize * newVertices[i][0] + newVertices[i][1]] = 1;
			
			
			
			let popIndex = vertexInArray(newVertices[i], verticesNotInTree);
			
			if (popIndex !== -1)
			{
				verticesNotInTree.splice(popIndex, 1);
				verticesInTree.push(newVertices[i]);
			}
			
			if (i !== newVertices.length - 1)
			{
				edgesInTree.push([newVertices[i], newVertices[i + 1]]);
			}
		}
		
		
		
		resolve();
	});
}



//Performs a loop-erased random walk. If fixedLength === true, then rather than waiting until the walk hits the tree, it will just go until the walk is a certain length. This keeps that first walk from taking a ridiculous amount of time while still making the output graph be relatively random.
function wasmRandomWalk(fixedLength = 0)
{
	let newVerticesPtr = ccallArrays("random_walk", "number", ["number", "array", "number", "number", "number"], [gridSize, grid, fixedLength, currentRow, currentColumn], {heapIn: "HEAPU32"});
	
	//The length of the array is stored as its first element.
	let numNewVertices = Module.HEAPU32[newVerticesPtr / Uint32Array.BYTES_PER_ELEMENT];
	
	for (let i = 2; i < 2 * numNewVertices; i += 2)
	{
		newVertices.push([Module.HEAPU32[newVerticesPtr / Uint32Array.BYTES_PER_ELEMENT + i], Module.HEAPU32[newVerticesPtr / Uint32Array.BYTES_PER_ELEMENT + i + 1]]);
	}
	
	Module.ccall("free_from_js", null, ["number"], [newVerticesPtr]);
	
	
	
	//Here's the idea. C is great when it can run by itself for a little while, but when there are tons and tons of calls back-and-forth, the overhead of WebAssembly starts to show itself. To that end, once we've had 10 random walks of length less than gridSize / 10, we'll switch to making the rest of the graph with js.
	if (reverseGenerateSkeleton === false && numNewVertices < gridSize / 10)
	{
		numShortPathsInARow++;
		
		if (numShortPathsInARow == 10)
		{
			randomWalk = jsRandomWalk;
			
			postMessage(["log", "Switching to JS..."]);
		}
	}
	
	else
	{
		numShortPathsInARow = 0;
	}
}



function jsRandomWalk(fixedLength = 0)
{
	newVertices = [[currentRow, currentColumn]];
	
	
	
	//Go until we hit the tree.
	while (true)
	{
		//Move either up, left, down, or right. 0 = up, 1 = left, 2 = down, and 3 = right.
		let possibleDirections = [];
		
		
		
		if (currentRow === 0 && currentColumn === 0)
		{
			possibleDirections = [1, 2];
		}
		
		else if (currentRow === gridSize - 1 && currentColumn === 0)
		{
			possibleDirections = [0, 1];
		}
		
		else if (currentRow === 0 && currentColumn === gridSize - 1)
		{
			possibleDirections = [2, 3];
		}

		else if (currentRow === gridSize - 1 && currentColumn === gridSize - 1)
		{
			possibleDirections = [0, 3];
		}



		//Edges.
		else if (currentRow === 0)
		{
			possibleDirections = [1, 2, 3];
		}
			
		else if (currentRow === gridSize - 1)
		{
			possibleDirections = [0, 1, 3];
		}

		else if (currentColumn === 0)
		{
			possibleDirections = [0, 1, 2];
		}
		
		else if (currentColumn === gridSize - 1)
		{
			possibleDirections = [0, 2, 3];
		}



		//Everything else.
		else
		{
			possibleDirections = [0, 1, 2, 3];
		}
		
		
		
		let direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
		
		
		
		if (direction === 0)
		{
			currentRow--;
		}
		
		else if (direction === 1)
		{
			currentColumn++;
		}
		
		else if (direction === 2)
		{
			currentRow++;
		}
		
		else
		{
			currentColumn--;
		}
		
		
		
		
		//If not, then we need to know when we hit our own random walk -- before we can put our new vertex into the walk, we need to see if we've already been there.
		let revertIndex = vertexInArray([currentRow, currentColumn], newVertices);
		
		if (revertIndex !== -1)
		{
			currentRow = newVertices[revertIndex][0];
			currentColumn = newVertices[revertIndex][1];
			
			newVertices = newVertices.slice(0, revertIndex + 1);
		}
		
		else
		{
			newVertices.push([currentRow, currentColumn]);
		}
		
		
		
		//If we hit the tree or reached the right length, we're done.
		if (grid[gridSize * currentRow + currentColumn] === 1)
		{
			break;
		}
		
		else if (fixedLength !== 0 && newVertices.length === fixedLength)
		{
			break;
		}
	}
}



function colorGraph()
{
	return new Promise(async function(resolve, reject)
	{
		//First, create an array whose (i, j) entry is a list of all the connection directions from vertex (i, j).
		let connectionDirections = [];
		
		for (let i = 0; i < gridSize; i++)
		{
			connectionDirections[i] = [];
			
			for (let j = 0; j < gridSize; j++)
			{
				connectionDirections[i][j] = [];
			}
		}
		
		
		
		for (let i = 0; i < edgesInTree.length; i++)
		{
			let row1 = edgesInTree[i][0][0];
			let column1 = edgesInTree[i][0][1];
			
			let row2 = edgesInTree[i][1][0];
			let column2 = edgesInTree[i][1][1];
			
			//The rows are the same, so the direction is either left or right.
			if (row1 === row2)
			{
				if (!(connectionDirections[row1][Math.min(column1, column2)].includes(1)))
				{
					connectionDirections[row1][Math.min(column1, column2)].push(1);
				}
				
				if (!(connectionDirections[row2][Math.max(column1, column2)].includes(3)))
				{
					connectionDirections[row2][Math.max(column1, column2)].push(3);
				}
			}
			
			//The columns are the same, so the direction is either up or down.
			else
			{
				if (!(connectionDirections[Math.min(row1, row2)][column1].includes(2)))
				{
					connectionDirections[Math.min(row1, row2)][column1].push(2);
				}
				
				if (!(connectionDirections[Math.max(row1, row2)][column1].includes(0)))
				{
					connectionDirections[Math.max(row1, row2)][column2].push(0);
				}
			}
		}
		
		
		
		let edgesByDistance = [];
		
		
		
		//Now start at the middle of the graph. The syntax for a path is (row, column, distance from center).
		let activePaths = [];
		
		if (gridSize % 2 === 1)
		{
			activePaths = [[Math.floor(gridSize / 2), Math.floor(gridSize / 2), 0]];
		}
		
		else
		{
			activePaths =
			[
				[Math.floor(gridSize / 2) - 1, Math.floor(gridSize / 2) - 1, 0],
				[Math.floor(gridSize / 2) - 1, Math.floor(gridSize / 2), 0],
				[Math.floor(gridSize / 2), Math.floor(gridSize / 2) - 1, 0],
				[Math.floor(gridSize / 2), Math.floor(gridSize / 2), 0]
			];
		}
		
		
		
		let distanceFromCenter = [];
		
		for (let i = 0; i < gridSize; i++)
		{
			distanceFromCenter[i] = [];
			
			for (let j = 0; j < gridSize; j++)
			{
				distanceFromCenter[i][j] = -1;
			}
		}
		
		
		
		//While there are still paths active, extend each one.
		while (activePaths.length > 0)
		{
			let numActivePaths = activePaths.length;
			
			
			
			//For every vertex connected to each active path end, make a new path, but only if we've never been there before.
			for (let i = 0; i < numActivePaths; i++)
			{
				let row = activePaths[i][0];
				let column = activePaths[i][1];
				let distance = activePaths[i][2];
				
				//Record how far away from the center we are.
				distanceFromCenter[row][column] = distance;
				
				
				
				if (connectionDirections[row][column].includes(0) && distanceFromCenter[row - 1][column] === -1)
				{
					activePaths.push([row - 1, column, distance + 1]);
					edgesByDistance.push([[row, column], [row - 1, column], distance]);
				}
				
				if (connectionDirections[row][column].includes(1) && distanceFromCenter[row][column + 1] === -1)
				{
					activePaths.push([row, column + 1, distance + 1]);
					edgesByDistance.push([[row, column], [row, column + 1], distance]);
				}
				
				if (connectionDirections[row][column].includes(2) && distanceFromCenter[row + 1][column] === -1)
				{
					activePaths.push([row + 1, column, distance + 1]);
					edgesByDistance.push([[row, column], [row + 1, column], distance]);
				}
				
				if (connectionDirections[row][column].includes(3) && distanceFromCenter[row][column - 1] === -1)
				{
					activePaths.push([row, column - 1, distance + 1]);
					edgesByDistance.push([[row, column], [row, column - 1], distance]);
				}
			}
			
			
			
			//Now remove all of the current paths.
			activePaths.splice(0, numActivePaths);
		}
		
		
		
		//Now that we finally have all the edges organized by distance, we can loop through all of them in order.
		edgesByDistance.sort((a, b) => a[2] - b[2]);
		
		//The factor of 7/6 makes the farthest color from red be colored pink rather than red again.
		let maxDistance = edgesByDistance[edgesByDistance.length - 1][2] * 7/6;
		
		
		
		//We want to draw each color at once, so we need to split up the edges into sections with constant distance.
		
		let distanceBreaks = [0];
		let currentDistance = 0;
		
		for (let i = 0; i < edgesByDistance.length; i++)
		{
			if (edgesByDistance[i][2] > currentDistance)
			{
				distanceBreaks.push(i);
				currentDistance++;
			}
		}
		
		distanceBreaks.push(edgesByDistance.length);
		
		
		
		//Now, finally, we can draw the colors.
		for (let i = 0; i < distanceBreaks.length; i++)
		{
			let j = 0;
			
			for (j = distanceBreaks[i]; j < distanceBreaks[i + 1] - 1; j++)
			{
				const rgb = HSVtoRGB(edgesByDistance[j][2] / maxDistance, 1, 1);
				
				drawLine(edgesByDistance[j][0][0], edgesByDistance[j][0][1], edgesByDistance[j][1][0], edgesByDistance[j][1][1], `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, 0);
			}
			
			
			
			//We only wait for this one.
			try
			{
				const rgb = HSVtoRGB(edgesByDistance[j][2] / maxDistance, 1, 1);
				
				await drawLine(edgesByDistance[j][0][0], edgesByDistance[j][0][1], edgesByDistance[j][1][0], edgesByDistance[j][1][1], `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, 24);
			}

			catch(ex)
			{
				break;
			}
		}
		
		
		
		resolve();
	});
}



function drawLine(row1, column1, row2, column2, color, delay)
{
	return new Promise(function(resolve, reject)
	{
		if (column1 === column2)
		{
			let x = column1;
			let y = Math.min(row1, row2);
			
			if (noBorders)
			{
				postMessage([x, y, 1, 2, color]);
			}
			
			else
			{
				postMessage([2 * x + 1, 2 * y + 1, 1, 3, color]);
			}
		}
		
		else
		{
			let x = Math.min(column1, column2);
			let y = row1;
			
			if (noBorders)
			{
				postMessage([x, y, 2, 1, color]);
			}
			
			else
			{
				postMessage([2 * x + 1, 2 * y + 1, 3, 1, color]);
			}
		}
		
		
		
		setTimeout(resolve, delay);
	});
}



function vertexInArray(element, array)
{
	for (let i = 0; i < array.length; i++)
	{
		if (array[i][0] === element[0] && array[i][1] === element[1])
		{
			return i;
		}
	}
	
	return -1;
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