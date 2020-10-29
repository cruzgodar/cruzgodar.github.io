"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	
	await draw_brownian_tree();
}



let grid_size = null;

let margin = null;

let brownian_tree_graph = [];

let current_brightness = 255;

let progress_threshhold = 5;

let current_row = null;
let current_col = null;

//New points will start on a circle with this as its radius.
let spawn_radius = null;

const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];



function draw_brownian_tree()
{
	return new Promise(function(resolve, reject)
	{
		brownian_tree_graph = [];
			
		for (let i = 0; i < grid_size; i++)
		{
			brownian_tree_graph[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				brownian_tree_graph[i][j] = 0;
			}
		}
		
		brownian_tree_graph[Math.floor(grid_size / 2)][Math.floor(grid_size / 2)] = 1;
		
		postMessage([Math.floor(grid_size / 2), Math.floor(grid_size / 2), `rgb(255, 0, 0)`]);
		
		
		
		margin = 10;

		spawn_radius = 5;
		
		
		
		while (grid_size - 2 * spawn_radius > 2 * margin)
		{
			let angle = Math.random() * 2 * Math.PI;
			current_row = Math.floor(spawn_radius * Math.cos(angle) + grid_size / 2);
			current_col = Math.floor(spawn_radius * Math.sin(angle) + grid_size / 2);
			
			
			
			while (true)
			{
				let possible_directions = [];
				
				if (current_row > grid_size / 2 - spawn_radius)
				{
					possible_directions.push(0);
				}
				
				if (current_col < grid_size / 2 + spawn_radius)
				{
					possible_directions.push(1);
				}
				
				if (current_row < grid_size / 2 + spawn_radius)
				{
					possible_directions.push(2);
				}
				
				if (current_col > grid_size / 2 - spawn_radius)
				{
					possible_directions.push(3);
				}
				
				//postMessage(["log", current_col, current_row, possible_directions]);
				
				
				
				let direction = possible_directions[Math.floor(Math.random() * possible_directions.length)];
				
				let new_row = current_row + directions[direction][0];
				let new_col = current_col + directions[direction][1];
				
				if (brownian_tree_graph[new_row][new_col] === 1)
				{
					brownian_tree_graph[current_row][current_col] = 1;
					
					postMessage([current_col, current_row, `rgb(${current_brightness}, 0, 0)`]);
					
					
					
					if (spawn_radius * spawn_radius - (current_row - grid_size / 2) * (current_row - grid_size / 2) - (current_col - grid_size / 2) * (current_col - grid_size / 2) <= 5)
					{
						spawn_radius++;
						
						current_brightness = Math.floor(255 * (grid_size / 2 - 10 - spawn_radius) / (grid_size / 2 - 10));
						
						//We raise the progress to 2.71 to keep the speed effectively constant.
						let progress = Math.pow((255 - current_brightness) / 255, 2.71) * 100;
						
						if (progress > progress_threshhold)
						{
							postMessage(["progress", progress_threshhold]);
							
							progress_threshhold += 5;
						}
					}
					
					
					
					break;
				}
				
				current_row = new_row;
				current_col = new_col;
			}
		}
		
		
		
		postMessage(["progress", 100]);
		
		setTimeout(function()
		{
			postMessage(["done"]);
		}, 500);
		
		
		
		resolve();
	});
}