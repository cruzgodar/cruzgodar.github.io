"use strict";



onmessage = async function(e)
{
	coefficients = e.data[0];
	box_size = e.data[1];
	canvas_size = e.data[2];
	
	await draw_quasi_fuchsian_group();
	
	postMessage(["done"]);
}



let coefficients = [];
let box_size = 0;
let canvas_size = 0;

let num_points = 10000;
let max_depth = 16;
let epsilon = .0001;

let x = 0;
let y = 0;





function draw_quasi_fuchsian_group()
{
	return new Promise(async function(resolve, reject)
	{
		let paths_chosen = [];
		
		for (let i = 0; i < max_depth; i++)
		{
			paths_chosen[i] = -1;
		}
		
		
		
		let depth = 0;
		
		while (true)
		{
			if (paths_chosen[depth] === -1)
			{
				paths_chosen[depth] = 0;
				
				apply_transformation(0);
				
				
			}
			for (let iteration = 0; iteration < num_iterations; iteration++)
			{
				let last_x = x;
				let last_y = y;
				
				i
				
				
			}
			
			let col = Math.floor((x + box_size / 2) / box_size * canvas_size);
			let row = Math.floor((-y + box_size / 2) / box_size * canvas_size);
			
			postMessage([row, col]);
		}
		
		
		
		resolve();
	});
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