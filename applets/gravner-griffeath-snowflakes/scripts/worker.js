"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	
	await draw_snowflake();
}



let grid_size = null;

//All of these are hexagonal grids. The idea is that every pixel borders the ones above and below it, the ones to the left and right, and either the ones above those (if the current column is even) or below them (if it's odd).
let attachment_flag = [];
let boundary_mass = [];
let crystal_mass = [];
let diffusive_mass = [];

let new_attachment_flag = [];
let new_boundary_mass = [];
let new_crystal_mass = [];
let new_diffusive_mass = [];

let on_boundary = [];

let rho = .5;
let kappa = .001;
let beta = 2.2;
let alpha = .026;
let theta = .2;
let mu = .04;
let gamma = .00001;

let num_iterations = 10000;






function draw_snowflake()
{
	return new Promise(async function(resolve, reject)
	{
		for (let i = 0; i < grid_size; i++)
		{
			attachment_flag.push([]);
			boundary_mass.push([]);
			crystal_mass.push([]);
			diffusive_mass.push([]);
			
			new_attachment_flag.push([]);
			new_boundary_mass.push([]);
			new_crystal_mass.push([]);
			new_diffusive_mass.push([]);
			
			on_boundary.push([]);

			for (let j = 0; j < grid_size; j++)
			{
				attachment_flag[i].push(0);
				boundary_mass[i].push(0);
				crystal_mass[i].push(0);
				diffusive_mass[i].push(rho);
				
				new_attachment_flag[i].push(0);
				new_boundary_mass[i].push(0);
				new_crystal_mass[i].push(0);
				new_diffusive_mass[i].push(0);
				
				on_boundary[i].push(0);
			}
		}
		
		let middle_row = Math.floor(grid_size / 2);
		
		attachment_flag[middle_row][middle_row] = 1;
		crystal_mass[middle_row][middle_row] = 1;
		diffusive_mass[middle_row][middle_row] = 0;
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			update_boundary();
			
			evaluate_diffusion_step();
			
			evaluate_freezing_step();
			
			evaluate_attachment_step();
		}
		
		
		
		resolve();
	});
}



function update_boundary()
{
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			on_boundary[i][j] = 0;
		}
	}
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (attachment_flag[i][j] === 1)
			{
				on_boundary[i + 1][j] = 1;
				on_boundary[i - 1][j] = 1;
				
				on_boundary[i][j + 1] = 1;
				on_boundary[i][j - 1] = 1;
				
				if (j % 2 === 0)
				{
					on_boundary[i - 1][j + 1] = 1;
					on_boundary[i - 1][j - 1] = 1;
				}
				
				else
				{
					on_boundary[i + 1][j + 1] = 1;
					on_boundary[i + 1][j - 1] = 1;
				}
			}
		}
	}
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (attachment_flag[i][j] === 1)
			{
				on_boundary[i][j] = 0;
			}
		}
	}
}



//Step 1: diffusion
function evaluate_diffusion_step()
{
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (i === 0 || j == 0 || i === grid_size - 1 || j === grid_size - 1)
			{
				continue;
			}
			
			
			
			if (attachment_flag[i][j] === 0 && on_boundary[i][j] === 0)
			{
				let neighbors = get_neighbors(i, j, true);
				
				let total_neighbor_diffusive_mass = 0;
				
				for (let k = 0; k < 7; k++)
				{
					total_neighbor_diffusive_mass += diffusive_mass[neighbors[k][0]][neighbors[k][1]];
				}
				
				new_diffusive_mass[i][j] = total_neighbor_diffusive_mass / 7;
			}
			
			
			
			else if (on_boundary[i][j] === 1)
			{
				let neighbors = get_neighbors(i, j, true);
				
				let total_neighbor_diffusive_mass = 0;
				
				for (let k = 0; k < 7; k++)
				{
					if (attachment_flag[neighbors[k][0]][neighbors[k][1]] === 1)
					{
						total_neighbor_diffusive_mass += diffusive_mass[i][j];
					}
					
					else
					{
						total_neighbor_diffusive_mass += diffusive_mass[neighbors[k][0]][neighbors[k][1]];
					}
				}
				
				new_diffusive_mass[i][j] = total_neighbor_diffusive_mass / 7;
			}
		}
	}
	
	
	
	update_values();
}



function evaluate_freezing_step()
{
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (i === 0 || j == 0 || i === grid_size - 1 || j === grid_size - 1)
			{
				continue;
			}
			
			
			
			if (on_boundary[i][j] === 1)
			{
				new_boundary_mass[i][j] = boundary_mass[i][j] + (1 - kappa) * diffusive_mass[i][j];
				
				new_crystal_mass[i][j] = crystal_mass[i][j] + kappa * diffusive_mass[i][j];
				
				new_diffusive_mass[i][j] = 0;
			}
		}
	}
	
	
	
	update_values();
}



function evaluate_attachment_step()
{
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (i === 0 || j == 0 || i === grid_size - 1 || j === grid_size - 1)
			{
				continue;
			}
			
			
			
			let num_attached_neighbors = 0;
			
			let neighbors = get_neighbors(i, j, true);
			
			for (let k = 0; k < 7; k++)
			{
				if (attachment_flag[neighbors[k][0]][neighbors[k][1]] === 1)
				{
					num_attached_neighbors++;
				}
			}
		}
	}
	
	
	
	update_values();
}



function update_values()
{
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			attachment_flag[i][j] = new_attachment_flag[i][j];
			boundary_mass[i][j] = new_boundary_mass[i][j];
			crystal_mass[i][j] = new_crystal_mass[i][j];
			diffusive_mass[i][j] = new_diffusive_mass[i][j];
		}
	}
}



function get_neighbors(row, col, include_self)
{
	let neighbors = [[row - 1, col], [row + 1, col], [row, col + 1], [row, col - 1]];
	
	if (col % 2 === 0)
	{
		neighbors.push([row - 1, col - 1]);
		neighbors.push([row - 1, col + 1]);
	}
	
	else
	{
		neighbors.push([row + 1, col - 1]);
		neighbors.push([row + 1, col + 1]);
	}
	
	
	
	if (include_self)
	{
		neighbors.push([row, col]);
	}
	
	
	
	return neighbors;
}