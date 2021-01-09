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
				image[i].push([0, 0, 0]);
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
			
			
			
			let new_hue = (Math.atan2(current_col - grid_size / 2, current_row - grid_size / 2) + Math.PI) / (2 * Math.PI);
			
			let new_saturation = ((current_row - grid_size / 2) * (current_row - grid_size / 2) + (current_col - grid_size / 2) * (current_col - grid_size / 2)) / (grid_size * grid_size / 13);
			
			let current_color = HSVtoRGB(new_hue, new_saturation, 1);
			
			current_color[0] /= 255;
			current_color[1] /= 255;
			current_color[2] /= 255;
			
			
			
			for (let i = 0; i < 3; i++)
			{
				image[current_row][current_col][i] += 8 * current_color[i];
				
				if (image[current_row][current_col][i] >= 255)
				{
					num_pixels_at_max++;
					
					image[current_row][current_col][i] = 255;
					
					if (num_pixels_at_max / (grid_size * grid_size) > .004)
					{
						postMessage([image]);
						
						resolve();
						
						return;
					}
				}
			}
			
			
			
			step++;
		}
		
		
		
		postMessage([image]);
		
		
		
		resolve();
	});
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