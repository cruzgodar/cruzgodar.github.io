"use strict";



let gridSize = null;
let numNodes = null;
let maximumSpeed = null;

const initialTemperature = 500;
let temperature = null;

let coolingFactor = null;

let nodes = [];

let currentPath = [];



async function drawAnnealingGraph()
{
	nodes = [];
	currentPath = [];
	temperature = initialTemperature;
	let iteration = 0;


	//First, create a bunch of random nodes and draw them.
	for (let i = 0; i < numNodes; i++)
	{
		nodes[i] = [Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)];

		postMessage([0, nodes[i][1], nodes[i][0], 4, "rgb(255, 0, 0)"]);
	}



	//Now pick a random starting path and draw it.
	for (let i = 0; i < numNodes; i++)
	{
		currentPath[i] = i;
	}



	for (let i = 0; i < numNodes - 1; i++)
	{
		postMessage([
			1,
			nodes[i][1],
			nodes[i][0],
			nodes[i + 1][1],
			nodes[i + 1][0],
			"rgb(255, 0, 0)"
		]);
	}

	postMessage([
		1,
		nodes[numNodes - 1][1],
		nodes[numNodes - 1][0],
		nodes[0][1],
		nodes[0][0],
		"rgb(255, 0, 0)"
	]);



	//Now repeatedly suggest a new transposition and potentially use it.
	while (temperature > .001)
	{
		//Pick two random different nodes and suggest flipping them in the path.
		const transposition = [];

		transposition[0] = Math.floor(Math.random() * numNodes);

		transposition[1] = Math.floor(Math.random() * (numNodes - 1));

		if (transposition[1] >= transposition[0])
		{
			transposition[1]++;
		}



		//We don't need to recalculate the entire distance.
		//If the transposition is (36), for example, then conjugating by it makes
		//2 connect to 6 and 6 connect to 4, and then it also makes 5 connect to 3 and 3 to 7.
		//These four are the only difference, though.
		let distanceDifference = 0;

		//First, we're going to splice transposition[1] into where transposition[0] is.
		let previousIndex = transposition[0] - 1;
		let nextIndex = transposition[0] + 1;

		if (previousIndex === -1)
		{
			previousIndex = numNodes - 1;
		}

		if (nextIndex === numNodes)
		{
			nextIndex = 0;
		}



		distanceDifference -= euclideanDistance(
			currentPath[previousIndex],
			currentPath[transposition[0]]
		);

		distanceDifference += euclideanDistance(
			currentPath[previousIndex],
			currentPath[transposition[1]]
		);

		distanceDifference -= euclideanDistance(
			currentPath[transposition[0]],
			currentPath[nextIndex]
		);

		distanceDifference += euclideanDistance(
			currentPath[transposition[1]],
			currentPath[nextIndex]
		);



		//Now we'll do the same thing with transposition[1].
		previousIndex = transposition[1] - 1;
		nextIndex = transposition[1] + 1;

		if (previousIndex === -1)
		{
			previousIndex = numNodes - 1;
		}

		if (nextIndex === numNodes)
		{
			nextIndex = 0;
		}


		distanceDifference -= euclideanDistance(
			currentPath[previousIndex],
			currentPath[transposition[1]]
		);

		distanceDifference += euclideanDistance(
			currentPath[previousIndex],
			currentPath[transposition[0]]
		);

		distanceDifference -= euclideanDistance(
			currentPath[transposition[1]],
			currentPath[nextIndex]
		);

		distanceDifference += euclideanDistance(
			currentPath[transposition[0]],
			currentPath[nextIndex]
		);



		//If we picked two adjacent nodes to swap, though,
		//we'll be accidentally adding 0 twice. We'll make up for that here.
		if (
			Math.abs(transposition[0] - transposition[1]) === 1
			|| Math.abs(transposition[0] - transposition[1]) === numNodes - 1
		)
		{
			distanceDifference += 2 * euclideanDistance(
				currentPath[transposition[0]],
				currentPath[transposition[1]]
			);
		}



		//Now we need to find the probability of actually using this new path.
		//This function makes it so that we always take a new path if it's shorter,
		//but if it's longer, we have less and less of a chance
		//as the temperature goes down to take it.
		let exponent = (-1 / temperature) * distanceDifference;

		if (exponent > 1000)
		{
			exponent = 1000;
		}

		else if (exponent < -1000)
		{
			exponent = -1000;
		}



		const moveProb = Math.min(1, Math.exp(exponent));

		if (Math.random() < moveProb)
		{
			const temp = currentPath[transposition[0]];
			currentPath[transposition[0]] = currentPath[transposition[1]];
			currentPath[transposition[1]] = temp;



			//Erase the old lines and draw new ones.
			iteration++;

			if (!maximumSpeed && iteration % (numNodes * numNodes) === 0)
			{
				await drawLines();
			}
		}

		temperature *= 1 - coolingFactor;
	}


	temperature = 0;

	drawLines();
}



function euclideanDistance(node1Index, node2Index)
{
	return Math.sqrt(
		(nodes[node1Index][1] - nodes[node2Index][1]) ** 2
		+ (nodes[node1Index][0] - nodes[node2Index][0]) ** 2
	);
}



async function drawLines()
{
	postMessage([2]);

	for (let i = 0; i < numNodes; i++)
	{
		postMessage([0, nodes[i][1], nodes[i][0], 4, `rgb(255, ${255 * (initialTemperature - temperature) / initialTemperature}, ${255 * (initialTemperature - temperature) / initialTemperature})`]);
	}

	for (let i = 0; i < numNodes - 1; i++)
	{
		postMessage([1, nodes[currentPath[i]][1], nodes[currentPath[i]][0], nodes[currentPath[i + 1]][1], nodes[currentPath[i + 1]][0], `rgb(255, ${255 * (initialTemperature - temperature) / initialTemperature}, ${255 * (initialTemperature - temperature) / initialTemperature})`]);
	}

	postMessage([1, nodes[currentPath[numNodes - 1]][1], nodes[currentPath[numNodes - 1]][0], nodes[currentPath[0]][1], nodes[currentPath[0]][0], `rgb(255, ${255 * (initialTemperature - temperature) / initialTemperature}, ${255 * (initialTemperature - temperature) / initialTemperature})`]);

	await new Promise(resolve => setTimeout(resolve, 50));
}



onmessage = async function(e)
{
	gridSize = e.data[0];
	numNodes = e.data[1];
	maximumSpeed = e.data[2];

	coolingFactor = 1 / (numNodes * numNodes * numNodes);

	await drawAnnealingGraph();
};