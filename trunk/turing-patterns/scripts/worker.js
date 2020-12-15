"use strict";



onmessage = async function(e)
{
	image_size = e.data[0];
	
	D_a = e.data[1];
	D_b = e.data[2];
	
	alpha = e.data[3];
	beta = e.data[4];
	
	draw_turing_pattern();
}



let image_size = null;

let D_a = null;
let D_b = null;
let alpha = null;
let beta = null;

let dt = .05;
let dx = 1;

let a_concentration = [];
let b_concentration = [];

let new_a_concentration = [];
let new_b_concentration = [];





function draw_turing_pattern()
{
	dt = image_size / 10000;
	
	for (let i = 0; i < image_size; i++)
	{
		a_concentration[i] = [];
		b_concentration[i] = [];
		
		new_a_concentration[i] = [];
		new_b_concentration[i] = [];
		
		for (let j = 0; j < image_size; j++)
		{
			a_concentration[i][j] = Math.random() * .02;
			b_concentration[i][j] = Math.random() * .02;
			
			new_a_concentration[i][j] = 0;
			new_b_concentration[i][j] = 0;
		}
	}
	
	
	
	while (true)
	{
		for (let i = 0; i < image_size; i++)
		{
			let row_1 = i - 1;
			let row_2 = i + 1;
			
			if (row_1 === -1)
			{
				row_1 = image_size - 1;
			}
			
			else if (row_2 === image_size)
			{
				row_2 = 0;
			}
			
			
			
			for (let j = 0; j < image_size; j++)
			{
				let col_1 = j - 1;
				let col_2 = j + 1;
				
				if (col_1 === -1)
				{
					col_1 = image_size - 1;
				}
				
				else if (col_2 === image_size)
				{
					col_2 = 0;
				}
				
				
				
				let diffusion_term = (a_concentration[row_1][j] + a_concentration[i][col_1] + a_concentration[row_2][j] + a_concentration[i][col_2] - 4 * a_concentration[i][j]) / (2 * dx * dx);
				
				let reaction_term = alpha + a_concentration[i][j] * a_concentration[i][j] * b_concentration[i][j] - beta * a_concentration[i][j] - a_concentration[i][j];
				
				new_a_concentration[i][j] = a_concentration[i][j] + dt * (diffusion_term + reaction_term);
				
				
				
				diffusion_term = D_b / D_a * (b_concentration[row_1][j] + b_concentration[i][col_1] + b_concentration[row_2][j] + b_concentration[i][col_2] - 4 * b_concentration[i][j]) / (2 * dx * dx);
				
				reaction_term = beta * a_concentration[i][j] - a_concentration[i][j] * a_concentration[i][j] * b_concentration[i][j];
				
				new_b_concentration[i][j] = b_concentration[i][j] + dt * (diffusion_term + reaction_term);
			}
		}
		
		
		
		for (let i = 0; i < image_size; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				a_concentration[i][j] = 255 * a_concentration[i][j];
				b_concentration[i][j] = 255 * b_concentration[i][j];
			}
		}
		
		postMessage([a_concentration, b_concentration]);
		
		
		
		for (let i = 0; i < image_size; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				a_concentration[i][j] = new_a_concentration[i][j];
				b_concentration[i][j] = new_b_concentration[i][j];
			}
		}
	}
}