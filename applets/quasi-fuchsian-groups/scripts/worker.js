"use strict";



onmessage = async function(e)
{
	canvas_width = e.data[0];
	canvas_height = e.data[1];
	max_depth = e.data[2];
	max_pixel_brightness = e.data[3];
	box_size = e.data[4];
	
	coefficients = e.data[5];
	
	await draw_quasi_fuchsian_group();
}



let canvas_width = null;
let canvas_height = null;
let max_depth = null;
let max_pixel_brightness = null;
let box_size = null;

let coefficients = [];

let brightness = [];

let x = 0;
let y = 0;



function draw_quasi_fuchsian_group()
{
	return new Promise(async function(resolve, reject)
	{
		brightness = [];
		
		for (let i = 0; i < canvas_height; i++)
		{
			brightness[i] = [];
			
			for (let j = 0; j < canvas_width; j++)
			{
				brightness[i][j] = 0;
			}
		}
		
		
		
		for (let i = 0; i < 4; i++)
		{
			search_step(0, 0, i, -1, -1, 1);
		}
		
		
		
		let brightness_sorted = brightness.flat().sort(function(a, b) {return a - b});
		
		let	max_brightness = brightness_sorted[Math.round(brightness_sorted.length * .999) - 1];
		
		for (let i = 0; i < canvas_height; i++)
		{
			for (let j = 0; j < canvas_width; j++)
			{
				brightness[i][j] = Math.min(Math.sqrt(brightness[i][j] / max_brightness), 1);
			}
		}
		
		postMessage([brightness]);
		
		
		
		resolve();
	});
}



function search_step(start_x, start_y, last_transformation_index, last_row, last_col, depth)
{
	if (depth === max_depth)
	{
		return;
	}
	
	
	
	for (let i = 3; i < 6; i++)
	{
		x = start_x;
		y = start_y;
		
		let transformation_index = (last_transformation_index + i) % 4;
		
		apply_transformation(transformation_index);
		
		
		
		let row = 0;
		let col = 0;
		
		if (canvas_width >= canvas_height)
		{
			row = Math.floor((-y + box_size / 2) / box_size * canvas_height);
			col = Math.floor((x / (canvas_width / canvas_height) + box_size / 2) / box_size * canvas_width);
		}
		
		else
		{
			row = Math.floor((-y * (canvas_width / canvas_height) + box_size / 2) / box_size * canvas_height);
			col = Math.floor((x + box_size / 2) / box_size * canvas_width);
		}
		
		
		
		if (row >= 0 && row < canvas_height && col >= 0 && col < canvas_width)
		{
			if (brightness[row][col] === max_pixel_brightness)
			{
				continue;
			}
			
			brightness[row][col]++;
		}
		
		
		
		search_step(x, y, transformation_index, row, col, depth + 1);
	}
}



function apply_transformation(index)
{
	let ax = coefficients[index][0][0];
	let ay = coefficients[index][0][1];
	let bx = coefficients[index][1][0];
	let by = coefficients[index][1][1];
	let cx = coefficients[index][2][0];
	let cy = coefficients[index][2][1];
	let dx = coefficients[index][3][0];
	let dy = coefficients[index][3][1];
	
	let num_x = ax*x - ay*y + bx;
	let num_y = ax*y + ay*x + by;
	
	let den_x = cx*x - cy*y + dx;
	let den_y = cx*y + cy*x + dy;
	
	let new_x = num_x*den_x + num_y*den_y;
	let new_y = num_y*den_x - num_x*den_y;
	
	let magnitude = den_x*den_x + den_y*den_y;
	
	x = new_x / magnitude;
	y = new_y / magnitude;
}