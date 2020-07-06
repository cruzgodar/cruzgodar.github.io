"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	num_nodes = e.data[1];
	maximum_speed = e.data[2];
	
	cooling_factor = 1 / (num_nodes * num_nodes * num_nodes);
	
	await draw_annealing_graph();
}



let grid_size = null;
let num_nodes = null;
let maximum_speed = null;

let initial_temperature = 500;
let temperature = null;

let cooling_factor = null;

let nodes = [];

let current_path = [];
let current_distance = null;




async function draw_annealing_graph()
{
	
	nodes = [];
	current_path = [];
	current_distance = 0;
	temperature = initial_temperature;
	let iteration = 0;
	
	
	//First, create a bunch of random nodes and draw them.
	for (let i = 0; i < num_nodes; i++)
	{
		nodes[i] = [Math.floor(Math.random() * grid_size), Math.floor(Math.random() * grid_size)];
		
		postMessage(["node", nodes[i][1], nodes[i][0], 4, "rgb(255, 0, 0)"]);
	}
	
	
	
	//Now pick a random starting path and draw it.
	for (let i = 0; i < num_nodes; i++)
	{
		current_path[i] = i;
	}
	
	
	
	for (let i = 0; i < num_nodes - 1; i++)
	{
		postMessage(["line", nodes[i][1], nodes[i][0], nodes[i + 1][1], nodes[i + 1][0], "rgb(255, 0, 0)"]);
		
		current_distance += euclidean_distance(i, i + 1);
	}
	
	postMessage(["line", nodes[num_nodes - 1][1], nodes[num_nodes - 1][0], nodes[0][1], nodes[0][0], "rgb(255, 0, 0)"]);
	
	current_distance += euclidean_distance(num_nodes - 1, 0);
	
	
	
	//Now repeatedly suggest a new transposition and potentially use it.
	while (temperature > .001)
	{
		//Pick two random different nodes and suggest flipping them in the path.
		let transposition = [];
		
		transposition[0] = Math.floor(Math.random() * num_nodes);
		
		transposition[1] = Math.floor(Math.random() * (num_nodes - 1));
		
		if (transposition[1] >= transposition[0])
		{
			transposition[1]++;
		}
		
		
		
		//We don't need to recalculate the entire distance. If the transposition is (36), for example, then conjugating by it makes 2 connect to 6 and 6 connect to 4, and then it also makes 5 connect to 3 and 3 to 7. These four are the only difference, though.
		let distance_difference = 0;
		
		//First, we're going to splice transposition[1] into where transposition[0] is.
		let previous_index = transposition[0] - 1;
		let next_index = transposition[0] + 1;
		
		if (previous_index === -1)
		{
			previous_index = num_nodes - 1;
		}
		
		if (next_index === num_nodes)
		{
			next_index = 0;
		}
		
		
		
		
		distance_difference -= euclidean_distance(current_path[previous_index], current_path[transposition[0]]);
		distance_difference += euclidean_distance(current_path[previous_index], current_path[transposition[1]]);
		
		distance_difference -= euclidean_distance(current_path[transposition[0]], current_path[next_index]);
		distance_difference += euclidean_distance(current_path[transposition[1]], current_path[next_index]);
		
		
		
		//Now we'll do the same thing with transposition[1].
		previous_index = transposition[1] - 1;
		next_index = transposition[1] + 1;
		
		if (previous_index === -1)
		{
			previous_index = num_nodes - 1;
		}
		
		if (next_index === num_nodes)
		{
			next_index = 0;
		}
		
		
		distance_difference -= euclidean_distance(current_path[previous_index], current_path[transposition[1]]);
		distance_difference += euclidean_distance(current_path[previous_index], current_path[transposition[0]]);
		
		distance_difference -= euclidean_distance(current_path[transposition[1]], current_path[next_index]);
		distance_difference += euclidean_distance(current_path[transposition[0]], current_path[next_index]);
		
		
		
		//If we picked two adjacent nodes to swap, though, we'll be accidentally adding 0 twice. We'll make up for that here.
		if (Math.abs(transposition[0] - transposition[1]) === 1 || Math.abs(transposition[0] - transposition[1]) === num_nodes - 1)
		{
			distance_difference += 2*euclidean_distance(current_path[transposition[0]], current_path[transposition[1]]);
		}
		
		
		
		//Now we need to find the probability of actually using this new path. This function makes it so that we always take a new path if it's shorter, but if it's longer, we have less and less of a chance as the temperature goes down to take it.
		let exponent = (-1 / temperature) * distance_difference;
		
		if (exponent > 1000)
		{
			exponent = 1000;
		}
		
		else if (exponent < -1000)
		{
			exponent = -1000;
		}
		
		
		
		let move_prob = Math.min(1, Math.exp(exponent));
		
		if (Math.random() < move_prob)
		{
			let temp = current_path[transposition[0]];
			current_path[transposition[0]] = current_path[transposition[1]];
			current_path[transposition[1]] = temp;
			
			current_distance += distance_difference;
			
			
			
			//Erase the old lines and draw new ones.
			iteration++;
			
			if (!maximum_speed && iteration % 50 === 0)
			{
				await draw_lines();
			}
		}
		
		temperature *= 1 - cooling_factor;
	}
	
	
	temperature = 0;
	
	draw_lines();
}



function euclidean_distance(node_1_index, node_2_index)
{
	return Math.sqrt((nodes[node_1_index][1] - nodes[node_2_index][1]) * (nodes[node_1_index][1] - nodes[node_2_index][1]) + (nodes[node_1_index][0] - nodes[node_2_index][0]) * (nodes[node_1_index][0] - nodes[node_2_index][0]));
}



function draw_lines()
{
	return new Promise(function(resolve, reject)
	{
		postMessage(["clear"]);
		
		
		
		for (let i = 0; i < num_nodes; i++)
		{
			postMessage(["node", nodes[i][1], nodes[i][0], 4, `rgb(255, ${255 * (initial_temperature - temperature) / initial_temperature}, ${255 * (initial_temperature - temperature) / initial_temperature})`]);
		}
		
		
		
		for (let i = 0; i < num_nodes - 1; i++)
		{
			postMessage(["line", nodes[current_path[i]][1], nodes[current_path[i]][0], nodes[current_path[i + 1]][1], nodes[current_path[i + 1]][0], `rgb(255, ${255 * (initial_temperature - temperature) / initial_temperature}, ${255 * (initial_temperature - temperature) / initial_temperature})`]);
		}
		
		postMessage(["line", nodes[current_path[num_nodes - 1]][1], nodes[current_path[num_nodes - 1]][0], nodes[current_path[0]][1], nodes[current_path[0]][0], `rgb(255, ${255 * (initial_temperature - temperature) / initial_temperature}, ${255 * (initial_temperature - temperature) / initial_temperature})`]);
		
		
		
		setTimeout(resolve, 50);
	});
}