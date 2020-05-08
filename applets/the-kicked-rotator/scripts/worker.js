"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	K = e.data[1];
	orbit_density = e.data[2];
	
	await draw_kicked_rotator();
}



let grid_size = null;

let K = null;

let orbit_density = null;

let image = [];
	
let unvisited_points = [];

let current_orbit = [];

let current_row = null;
let current_col = null;

let current_p = null;
let current_theta = null;

let max_repetitions = 50;



function draw_kicked_rotator()
{
	image = [];
	
	unvisited_points = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		image.push([]);
		
		for (let j = 0; j < grid_size; j++)
		{
			image[i].push(0);
			
			unvisited_points.push(grid_size * i + j);
		}
	}
	
	
	
	const middle_col = Math.floor(grid_size / 2);
	
	for (let i = 1; i < grid_size / 2; i += 4)
	{
		let color = 6/7 * i / (grid_size / 2);
		
		
		
		//The randomness keeps a straight line artefact from appearing down the center of the image.
		let upper_half_points_ratio = calculate_orbit(Math.floor(grid_size / 2 + i), middle_col + Math.floor(Math.random() * 5) - 2, color);
		
		postMessage([current_orbit, color]);
		
		
		
		//Now that we've got our orbit, we can reflect it vertically and horizontally to get the other side -- but this is only necessary, and in fact only a good thing, if the orbit wasn't symmetric in the first place. We test for this by seeing if less than 45% of the points were above the half-way mark.
		if (upper_half_points_ratio < .45)
		{
			for (let i = 0; i < current_orbit.length; i++)
			{
				current_orbit[i][0] = grid_size - current_orbit[i][0];
				current_orbit[i][1] = grid_size - current_orbit[i][1];
			}
			
			postMessage([current_orbit, color]);
		}
	}
}



//Runs through an entire orbit. Returns the fraction of points that were above the halfway mark.
function calculate_orbit(start_row, start_col, color)
{
	let num_upper_half_points = 0;
	
	current_orbit = [];
	
	current_row = start_row;
	current_col = start_col;
	
	if (unvisited_points.indexOf(grid_size * current_row + current_col) === -1)
	{
		return;
	}
	
	current_p = (1 - (current_row / grid_size)) * (2 * Math.PI);
	current_theta = (current_col / grid_size) * (2 * Math.PI);
	
	
	
	//Here's the idea. We can't just terminate an orbit if the point coincides one of the places we've already been, since the rasterizing makes that happen way too often. We also don't want every orbit to go one forever though, so instead, we'll terminate an orbit if it hits enough points we've already seen in a row.
	let num_repetitions = 0;
	
	
	
	while (true)
	{
		let index = unvisited_points.indexOf(grid_size * current_row + current_col);
		
		if (index !== -1)
		{
			unvisited_points.splice(index, 1);
			
			//Add the current point to the image.
			current_orbit.push([current_row, current_col]);
			
			if (current_row < grid_size / 2)
			{
				num_upper_half_points++;
			}
			
			num_repetitions = 0;
		}
		
		else
		{
			num_repetitions++;
			
			if (num_repetitions === max_repetitions)
			{
				break;
			}
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
	
	
	
	return num_upper_half_points / current_orbit.length;
}