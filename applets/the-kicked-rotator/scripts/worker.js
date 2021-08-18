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

let orbit_separation = null;

let image = [];

let current_row = null;
let current_col = null;

let current_p = null;
let current_theta = null;

const max_repetitions = 50;



function draw_kicked_rotator()
{
	const middle_col = Math.floor(grid_size / 2);
	
	for (let i = 1; i < grid_size / 2; i += orbit_separation + 1)
	{
		image = new Array(grid_size * grid_size);
		
		for (let j = 0; j < grid_size; j++)
		{
			for (let k = 0; k < grid_size; k++)
			{
				image[grid_size * j + k] = 0;
			}
		}
		
		
		
		let color = 6/7 * i / (grid_size / 2);
		
		
		
		//This randomness helps keep straight-line artefacts from appearing.
		let rand = Math.floor(Math.random() * (2 * orbit_separation + 1)) - orbit_separation;
		
		let upper_half_points_ratio = calculate_orbit(Math.floor(grid_size / 2 + i), middle_col + rand, color);
		
		
		
		if (upper_half_points_ratio === -1)
		{
			continue;
		}
		
		
		
		//Now that we've got our orbit, we can reflect it vertically and horizontally to get the other side -- but this is only necessary, and in fact only a good thing, if the orbit wasn't symmetric in the first place. We test for this by seeing if less than 45% of the points were above the half-way mark.
		if (upper_half_points_ratio < .45)
		{
			for (let j = 0; j < grid_size; j++)
			{
				for (let k = 0; k < grid_size; k++)
				{
					if (image[grid_size * j + k] !== 0)
					{
						image[grid_size * (grid_size - j - 1) + grid_size - k - 1] = image[grid_size * j + k];
					}
				}
			}
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
	
	if (image[grid_size * current_row + current_col] !== 0)
	{
		return -1;
	}
	
	current_p = (1 - (current_row / grid_size)) * (2 * Math.PI);
	current_theta = (current_col / grid_size) * (2 * Math.PI);
	
	
	
	//Here's the idea. We can't just terminate an orbit if the point coincides one of the places we've already been, since the rasterizing makes that happen way too often. We also don't want every orbit to go one forever though, so instead, we'll terminate an orbit if it hits enough points we've already seen in a row.
	let num_points = 0;
	
	while (true)
	{
		//Add the current point to the image.
		image[grid_size * current_row + current_col]++;
		
		num_points++;
		
		if (current_row < grid_size / 2)
		{
			num_upper_half_points++;
		}
		
		if (image[grid_size * current_row + current_col] === 300)
		{
			break;
		}
		
		
		
		current_p = current_p + K * Math.sin(current_theta);
		current_theta = current_theta + current_p;
		
		while (current_p >= 2 * Math.PI)
		{
			current_p -= 2 * Math.PI;
		}
		
		while (current_theta >= 2 * Math.PI)
		{
			current_theta -= 2 * Math.PI;
		}
		
		while (current_p < 0)
		{
			current_p += 2 * Math.PI;
		}
		
		while (current_theta < 0)
		{
			current_theta += 2 * Math.PI;
		}
		
		current_row = Math.floor((1 - (current_p / (2 * Math.PI))) * grid_size);
		current_col = Math.floor((current_theta / (2 * Math.PI)) * grid_size);
	}
	
	
	
	return num_upper_half_points / num_points;
}