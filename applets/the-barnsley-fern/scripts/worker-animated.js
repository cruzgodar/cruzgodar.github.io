"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	num_iterations = e.data[1];
	
	let randomization_coefficients = new Array(4);
	
	for (let i = 0; i < 4; i++)
	{
		randomization_coefficients[i] = new Array(4);
		
		for (let j = 0; j < 4; j++)
		{
			randomization_coefficients[i][j] = [20*Math.random() + 20, 20*Math.random() + 20];
		}
	}
	
	
	
	let initial_transformation_coefficients =
	[
		[0, 0, 0, .16, 0, 0],
		[.85, .04, -.04, .85, 0, 1.6],
		[.2, -.26, .23, .22, 0, 1.6],
		[-.15, .28, .26, .24, 0, .44]
	];
	
	let frame = 0;
	
	while (true)
	{
		await draw_fern();
		
		frame++;
		
		for (let i = 0; i < 4; i++)
		{
			for (let j = 0; j < 4; j++)
			{
				transformation_coefficients[i][j] = initial_transformation_coefficients[i][j] + .01 * Math.sin(frame / randomization_coefficients[i][j][0]) + .01 * Math.cos(frame / randomization_coefficients[i][j][1]);
			}
		}
	}
}



let grid_size = null;
let num_iterations = null;

let fern_graph = null;

let randomization_coefficients = [.1, .1, .1, .1, .5, .5];

let transformation_coefficients =
[
	[0, 0, 0, .16, 0, 0],
	[.85, .04, -.04, .85, 0, 1.6],
	[.2, -.26, .23, .22, 0, 1.6],
	[-.15, .28, .26, .24, 0, .44]
];
/*
[
	[0 + (Math.random() - .5) * randomization_coefficients[0], 0 + (Math.random() - .5) * randomization_coefficients[1], 0 + (Math.random() - .5) * randomization_coefficients[2], .16 + (Math.random() - .5) * randomization_coefficients[3], 0 + (Math.random() - .5) * randomization_coefficients[4], 0 + (Math.random() - .5) * randomization_coefficients[5]],
	[.85 + (Math.random() - .5) * randomization_coefficients[0], .04 + (Math.random() - .5) * randomization_coefficients[1], -.04 + (Math.random() - .5) * randomization_coefficients[2], .85 + (Math.random() - .5) * randomization_coefficients[3], 0 + (Math.random() - .5) * randomization_coefficients[4], 1.6 + (Math.random() - .5) * randomization_coefficients[5]],
	[.2 + (Math.random() - .5) * randomization_coefficients[0], -.26 + (Math.random() - .5) * randomization_coefficients[1], .23 + (Math.random() - .5) * randomization_coefficients[2], .22 + (Math.random() - .5) * randomization_coefficients[3], 0 + (Math.random() - .5) * randomization_coefficients[4], 1.6 + (Math.random() - .5) * randomization_coefficients[5]],
	[-.15 + (Math.random() - .5) * randomization_coefficients[0], .28 + (Math.random() - .5) * randomization_coefficients[1], .26 + (Math.random() - .5) * randomization_coefficients[2], .24 + (Math.random() - .5) * randomization_coefficients[3], 0 + (Math.random() - .5) * randomization_coefficients[4], .44 + (Math.random() - .5) * randomization_coefficients[5]]
];
*/

let current_x = 0;
let current_y = 0;

const min_x = -6;
const max_x = 6;
const min_y = -1;
const max_y = 11;




function draw_fern()
{
	return new Promise(function(resolve, reject)
	{
		fern_graph = new Uint8ClampedArray(grid_size * grid_size * 4);
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				fern_graph[4 * (grid_size * i + j) + 3] = 255;
			}
		}
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			/*
			if (iteration % Math.floor(num_iterations / 10) === 0)
			{
				postMessage([fern_graph]);
			}
			*/
			
			
			
			let rand = Math.random();
			
			let index = 3;
			
			if (rand < .01)
			{
				index = 0;
			}
			
			else if (rand < .86)
			{
				index = 1;
			}
			
			else if (rand < .93)
			{
				index = 2;
			}
			
			affine_transformation(index);
			
			
			
			if (current_x >= max_x || current_x <= min_x || current_y >= max_y || current_y <= min_y)
			{
				continue;
			}
			
			
			
			//This scales col to [0, 1].
			let col = (current_x - min_x) / (max_x - min_x);
			
			col = Math.floor(grid_size * col);
			
			//This scales row to [0, 1].
			let row = (current_y - min_y) / (max_y - min_y);
			
			row = Math.floor(grid_size * (1 - row));
			
			fern_graph[4 * (grid_size * row + col) + 1]++;
		}
		
		
		
		postMessage([fern_graph]);
		
		
		
		resolve();
	});
}



function affine_transformation(index)
{
	let temp = transformation_coefficients[index][0] * current_x + transformation_coefficients[index][1] * current_y + transformation_coefficients[index][4];
	
	current_y = transformation_coefficients[index][2] * current_x + transformation_coefficients[index][3] * current_y + transformation_coefficients[index][5];
	
	current_x = temp;
}