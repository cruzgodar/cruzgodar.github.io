"use strict";



onmessage = async function(e)
{
	num_vertices = e.data[0];
	num_iterations = e.data[1];
	grid_size = e.data[2];
	maximum_speed = e.data[3];
	
	await draw_finite_subdivisions();
}



let num_vertices = null;
let num_iterations = null;
let current_iteration = null;
let grid_size = null;
let maximum_speed = null;

let polygons = [];





function draw_finite_subdivisions()
{
	return new Promise(async function(resolve, reject)
	{
		polygons = [[]];
		
		current_iteration = 0;
		
		
		
		//This makes the size of the black bars on the top and bottom equal.
		let middle_angle = Math.floor(num_vertices / 2) * 2 * Math.PI / num_vertices;
		
		let top_row = grid_size / 2 - grid_size / 2.5;
		let bottom_row = grid_size / 2 - grid_size / 2.5 * Math.cos(middle_angle);
		
		let total_margin = top_row + (grid_size - bottom_row);
		
		let center_row = Math.floor(total_margin / 2 + grid_size / 2.5);
		let center_col = Math.floor(grid_size / 2);
		
		for (let i = 0; i < num_vertices; i++)
		{
			let angle = i / num_vertices * 2 * Math.PI;
			
			let row = Math.floor(-Math.cos(angle) * grid_size / 2.5 + center_row);
			let col = Math.floor(Math.sin(angle) * grid_size / 2.5 + center_col);
			
			polygons[0].push([row, col]);
		}
		
		
		
		await draw_outer_polygon();
		
		
		
		for (let i = 0; i < num_iterations; i++)
		{
			await draw_lines(calculate_lines());
			
			current_iteration++;
		}
		
		
		
		resolve();
	});
}



function draw_outer_polygon()
{
	return new Promise(async function(resolve, reject)
	{
		if (maximum_speed === false)
		{
			for (let i = 0; i < 120; i++)
			{
				//Draw 1/120 of each line.
				for (let j = 0; j < num_vertices; j++)
				{
					let rgb = HSVtoRGB((2 * j + 1) / (2 * num_vertices), 1, 1);
					
					let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
					
					postMessage([polygons[0][j][0], polygons[0][j][1], polygons[0][j][0] + ((i + 1) / 120) * (polygons[0][(j + 1) % num_vertices][0] - polygons[0][j][0]), polygons[0][j][1] + ((i + 1) / 120) * (polygons[0][(j + 1) % num_vertices][1] - polygons[0][j][1]), color]);
				}
				
				await sleep(8);
			}
		}
		
		
		
		else
		{
			for (let j = 0; j < num_vertices; j++)
			{
				let rgb = HSVtoRGB((2 * j + 1) / (2 * num_vertices), 1, 1);
				
				let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				
				postMessage([polygons[0][j][0], polygons[0][j][1], polygons[0][(j + 1) % num_vertices][0], polygons[0][(j + 1) % num_vertices][1], color]);
			}
		}
		
		
		
		resolve();
	});
}



function calculate_lines()
{
	let new_lines = [];
	
	let new_polygons = [];
	
	for (let i = 0; i < polygons.length; i++)
	{
		let barycenter_row = 0;
		let barycenter_col = 0;
		
		for (let j = 0; j < polygons[i].length; j++)
		{
			barycenter_row += polygons[i][j][0];
			barycenter_col += polygons[i][j][1];
		}
		
		barycenter_row /= polygons[i].length;
		barycenter_col /= polygons[i].length;
		
		for (let j = 0; j < polygons[i].length; j++)
		{
			new_lines.push([polygons[i][j], [barycenter_row, barycenter_col]]);
			
			new_polygons.push([[barycenter_row, barycenter_col], polygons[i][j], polygons[i][(j + 1) % polygons[i].length]]);
		}
	}
	
	polygons = new_polygons;
	
	return new_lines;
}



function draw_lines(new_lines)
{
	return new Promise(async function(resolve, reject)
	{
		if (maximum_speed === false)
		{
			for (let i = 0; i < 120; i++)
			{
				//Draw 1/120 of each line.
				for (let j = 0; j < new_lines.length; j++)
				{
					let rgb = HSVtoRGB(j / (new_lines.length - 1), 1, 1);
					
					let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
					
					postMessage([new_lines[j][0][0], new_lines[j][0][1], new_lines[j][0][0] + ((i + 1) / 120) * (new_lines[j][1][0] - new_lines[j][0][0]) + 1, new_lines[j][0][1] + ((i + 1) / 120) * (new_lines[j][1][1] - new_lines[j][0][1]), color]);
				}
				
				await sleep(8);
			}
		}
		
		
		else
		{
			for (let j = 0; j < new_lines.length; j++)
			{
				let rgb = HSVtoRGB(j / (new_lines.length - 1), 1, 1);
				
				let color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
				
				postMessage([new_lines[j][0][0], new_lines[j][0][1], new_lines[j][1][0], new_lines[j][1][1], color]);
			}
		}
		
		
		
		resolve();
	});
}



function sleep(ms)
{
	return new Promise(function(resolve, reject)
	{
		setTimeout(resolve, ms);
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