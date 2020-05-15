"use strict";



onmessage = async function(e)
{
	num_vertices = e.data[0];
	grid_size = e.data[1];
	
	await draw_chaos_game();
}



let num_vertices = null;
let grid_size = null;

let image = [];

let vertices = [];

let center_row = null;
let center_col = null;

let current_row = null;
let current_col = null;

let num_pixels_at_max = 0;



function draw_chaos_game()
{
	return new Promise(function(resolve, reject)
	{
		image = [];
			
		for (let i = 0; i < grid_size; i++)
		{
			image.push([]);
			
			for (let j = 0; j < grid_size; j++)
			{
				image[i].push(0);
			}
		}
		
		
		
		//This makes the size of the black bars on the top and bottom equal.
		let middle_angle = Math.floor(num_vertices / 2) * 2 * Math.PI / num_vertices;
		
		let top_row = grid_size / 2 - grid_size / 2.5;
		let bottom_row = grid_size / 2 - grid_size / 2.5 * Math.cos(middle_angle);
		
		let total_margin = top_row + (grid_size - bottom_row);
		
		center_row = Math.floor(total_margin / 2 + grid_size / 2.5);
		center_col = Math.floor(grid_size / 2);
		
		current_row = center_row;
		current_col = center_col;
		
		
		
		vertices = [];
		
		for (let i = 0; i < num_vertices; i++)
		{
			let angle = i / num_vertices * 2 * Math.PI;
			
			let row = Math.floor(-Math.cos(angle) * grid_size / 2.5 + center_row);
			let col = Math.floor(Math.sin(angle) * grid_size / 2.5 + center_col);
			
			vertices.push([row, col]);
		}
		
		
		
		let step = 0;
		
		while (true)
		{
			if (step % (grid_size * 100) === 0)
			{
				postMessage([image]);
			}
			
			
			
			let attractor_vertex = Math.floor(Math.random() * num_vertices);
			
			current_row = Math.floor((current_row + vertices[attractor_vertex][0]) / 2);
			current_col = Math.floor((current_col + vertices[attractor_vertex][1]) / 2);
			
			image[current_row][current_col]++;
			
			if (image[current_row][current_col] === 255)
			{
				num_pixels_at_max++;
				
				if (num_pixels_at_max / (grid_size * grid_size) > .004)
				{
					break;
				}
			}
			
			else if (image[current_row][current_col] > 255)
			{
				image[current_row][current_col] = 255;
			}
			
			
			
			step++;
		}
		
		
		
		postMessage([image]);
		
		
		
		resolve();
	});
}