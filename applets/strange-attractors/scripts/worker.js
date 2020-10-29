"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	
	sigma = e.data[1];
	rho = e.data[2];
	beta = e.data[3];
	
	maximum_speed = e.data[4];
	
	await draw_lorenz_attractor();
}



let grid_size = null;

let sigma = null;
let rho = null;
let beta = null;

let maximum_speed = null;

let pixels = [];

const box_size = 50;
const dt = .0005;

//Since the attractor is centered at a high z-value, we need to shift the viewport.
const min_z = 0;

let steps_per_color = 5000;
let num_colors = null;

let current_x = 1;
let current_y = 1;
let current_z = 25;

let current_row = null;
let current_col = null;

let num_pixels_at_max = 0;



function draw_lorenz_attractor()
{
	return new Promise(async function(resolve, reject)
	{
		let step = 0;
		
		let color = 0;
		
		num_colors = grid_size;
		
		
		
		while (steps_per_color > 0)
		{
			if (step === steps_per_color)
			{
				postMessage([pixels, HSVtoRGB(color / num_colors / 6.5, 1, 1)]);
				
				pixels = [];
				
				color++;
				
				step = 0;
				
				steps_per_color -= 2*Math.floor(5000 / num_colors);
				
				if (!maximum_speed)
				{
					await sleep(8);
				}
			}
			
			
			
			let shifted_z = current_z - min_z - box_size / 2;
			
			current_col = Math.floor(((current_x + box_size / 2) / box_size) * grid_size);
			current_row = Math.floor((1 - (shifted_z + box_size / 2) / box_size) * grid_size);
			
			if (current_row >= 0 && current_col >= 0 && current_row < grid_size && current_col < grid_size)
			{
				pixels.push([current_row, current_col]);
			}
			
			
			
			current_x += sigma * (current_y - current_x) * dt;
			current_y += (current_x * (rho - current_z) - current_y) * dt;
			current_z += (current_x * current_y - beta * current_z) * dt;
			
			
			
			step++;
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