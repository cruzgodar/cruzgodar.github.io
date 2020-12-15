"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	K = e.data[1];
	orbit_separation = e.data[2];
	
	await draw_kicked_rotator();
}



let grid_size = null;

let K = null;

let a = 1;
let b = .5;
let c = 0;

let orbit_separation = null;

let image = [];

let current_row = null;
let current_col = null;

let current_x = null;
let current_y = null;



function draw_kicked_rotator()
{
	const middle_col = Math.floor(grid_size / 2);
	
	for (let i = 0; i < grid_size; i += orbit_separation + 1)
	{
		image = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			image[j] = [];
			
			for (let k = 0; k < grid_size; k++)
			{
				image[j][k] = 0;
			}
		}
		
		
		
		let color = Math.abs(6/7 * (i - (grid_size / 2)) / (grid_size / 2));
		
		
		
		//This randomness helps keep straight-line artefacts from appearing.
		let rand = Math.floor(Math.random() * (2 * orbit_separation + 1)) - orbit_separation;
		
		let upper_half_points_ratio = calculate_orbit(Math.floor(i), middle_col + rand, color);
		
		
		
		if (upper_half_points_ratio === -1)
		{
			continue;
		}
		
		
		
		postMessage([image, color]);
	}
}



//Runs through an entire orbit. Returns the fraction of points that were above the halfway mark.
function calculate_orbit(start_row, start_col, color)
{
	let num_upper_half_points = 0;
	
	current_row = start_row;
	current_col = start_col;
	
	if (image[current_row][current_col] !== 0)
	{
		return -1;
	}
	
	current_x = (current_col / grid_size - .5) * 5;
	current_y = (.5 - (current_row / grid_size)) * 5;
	
	
	
	//Here's the idea. We can't just terminate an orbit if the point coincides one of the places we've already been, since the rasterizing makes that happen way too often. We also don't want every orbit to go one forever though, so instead, we'll terminate an orbit if it hits enough points we've already seen in a row.
	let num_points = 0;
	
	while (true)
	{
		//Add the current point to the image.
		if (current_row >= 0 && current_row < grid_size && current_col >= 0 && current_col < grid_size)
		{
			image[current_row][current_col]++;
			
			num_points++;
			
			if (current_row < grid_size / 2)
			{
				num_upper_half_points++;
			}
			
			if (image[current_row][current_col] === 255)
			{
				break;
			}
		}
		
		else if (current_row < -9 * grid_size || current_row >= 10 * grid_size || current_col < -9 * grid_size || current_col >= 10 * grid_size)
		{
			return num_upper_half_points / num_points;
		}
		
		
		
		
		let temp = current_x;
		
		current_x = current_y - Math.sign(current_x) * Math.sqrt(Math.abs(b * current_x - c));
		current_y = a - temp;
		
		current_row = Math.floor((.5 - current_y / 5) * grid_size);
		current_col = Math.floor((current_x / 5 + .5) * grid_size);
	}
	
	
	
	return num_upper_half_points / num_points;
}