"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	num_iterations = e.data[1];
	
	await draw_fern();
}



let grid_size = null;
let num_iterations = null;

let fern_graph = [];

const transformation_coefficients =
[
	[0, 0, 0, .16, 0, 0],
	[.85, .04, -.04, .85, 0, 1.6],
	[.2, -.26, .23, .22, 0, 1.6],
	[-.15, .28, .26, .24, 0, .44]
];

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
		fern_graph = [];
			
		for (let i = 0; i < grid_size; i++)
		{
			fern_graph[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				fern_graph[i][j] = 0;
			}
		}
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			if (iteration % Math.floor(num_iterations / 10) === 0)
			{
				postMessage([fern_graph]);
			}
			
			
			
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
			
			fern_graph[row][col]++;
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