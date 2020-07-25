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

let cells_on_boundary = [];
let cells_outside_flake = [];

let rho = .5;
let beta = 1.3;
let alpha = .08;
let theta = .025;
let kappa = .003;
let mu = .07;
let gamma = .00005;
let sigma = 0;

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
				
				cells_outside_flake.push([i, j]);
			}
		}
		
		let middle_row = Math.floor(grid_size / 2);
		
		add_cell_to_flake(middle_row, middle_row);
		crystal_mass[middle_row][middle_row] = 1;
		diffusive_mass[middle_row][middle_row] = 0;
		
		
		
		let step_times = [0, 0, 0, 0, 0, 0];
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			let start_time = Date.now();
			
			evaluate_diffusion_step();
			
			step_times[1] += Date.now() - start_time;
			start_time = Date.now();
			
			evaluate_freezing_step();
			
			step_times[2] += Date.now() - start_time;
			start_time = Date.now();
			
			evaluate_attachment_step();
			
			step_times[3] += Date.now() - start_time;
			start_time = Date.now();
			
			evaluate_melting_step();
			
			step_times[4] += Date.now() - start_time;
			start_time = Date.now();
			
			evaluate_noise_step();
			
			step_times[5] += Date.now() - start_time;
			start_time = Date.now();
			
			
			postMessage([crystal_mass]);
			
			if (iteration % 100 === 0)
			{
				postMessage(["log", step_times]);
			}
		}
		
		resolve();
	});
}



function add_cell_to_flake(row, col)
{
	attachment_flag[row][col] = 1;
	
	if (on_boundary[row + 1][col] === 0)
	{
		on_boundary[row + 1][col] = 1;
		cells_on_boundary.push([row + 1, col]);
	}
	
	if (on_boundary[row - 1][col] === 0)
	{
		on_boundary[row - 1][col] = 1;
		cells_on_boundary.push([row - 1, col]);
	}
	
	if (on_boundary[row][col + 1] === 0)
	{
		on_boundary[row][col + 1] = 1;
		cells_on_boundary.push([row, col + 1]);
	}
	
	if (on_boundary[row][col - 1] === 0)
	{
		on_boundary[row][col - 1] = 1;
		cells_on_boundary.push([row, col - 1]);
	}
	
	if (col % 2 === 0)
	{
		if (on_boundary[row - 1][col - 1] === 0)
		{
			on_boundary[row - 1][col - 1] = 1;
			cells_on_boundary.push([row - 1, col - 1]);
		}
		
		if (on_boundary[row - 1][col + 1] === 0)
		{
			on_boundary[row - 1][col + 1] = 1;
			cells_on_boundary.push([row - 1, col + 1]);
		}
	}
	
	else
	{
		if (on_boundary[row + 1][col - 1] === 0)
		{
			on_boundary[row + 1][col - 1] = 1;
			cells_on_boundary.push([row + 1, col - 1]);
		}
		
		if (on_boundary[row + 1][col + 1] === 0)
		{
			on_boundary[row + 1][col + 1] = 1;
			cells_on_boundary.push([row + 1, col + 1]);
		}
	}
	
	
	
	if (on_boundary[row][col] === 1)
	{
		on_boundary[row][col] = 0;
		
		for (let i = 0; i < cells_on_boundary.length; i++)
		{
			if (cells_on_boundary[i] === [row, col])
			{
				cells_on_boundary.splice(i, 1);
				break;
			}
		}
	}
	
	else
	{
		for (let i = 0; i < cells_outside_flake.length; i++)
		{
			if (cells_outside_flake[i] === [row, col])
			{
				cells_outside_flake.splice(i, 1);
				break;
			}
		}
	}
}



function evaluate_diffusion_step()
{
	//So this is the most time-intensive step, since it requires doing operations on all the non-flake cells, which is a ton. A faster and nearly as good option is to only consider cells within a certain distance of the snowflake.
	for (let i = 0; i < cells_outside_flake.length; i++)
	{
		let row = cells_outside_flake[i][0];
		let col = cells_outside_flake[i][1];
	
		if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
		{
			continue;
		}
		
	
		let neighbors = get_neighbors(row, col, true);
		
		let total_neighbor_diffusive_mass = 0;
		
		for (let j = 0; j < 7; j++)
		{
			total_neighbor_diffusive_mass += diffusive_mass[neighbors[j][0]][neighbors[j][1]];
		}
		
		new_diffusive_mass[row][col] = total_neighbor_diffusive_mass / 7;
	}
	
	
	
	for (let i = 0; i < cells_on_boundary.length; i++)
	{
		let row = cells_on_boundary[i][0];
		let col = cells_on_boundary[i][1];
	
		if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
		{
			continue;
		}
		
	
		let neighbors = get_neighbors(row, col, true);
		
		let total_neighbor_diffusive_mass = 0;
		
		for (let j = 0; j < 7; j++)
		{
			if (attachment_flag[neighbors[j][0]][neighbors[j][1]] === 1)
			{
				total_neighbor_diffusive_mass += diffusive_mass[row][col];
			}
			
			else
			{
				total_neighbor_diffusive_mass += diffusive_mass[neighbors[j][0]][neighbors[j][1]];
			}
		}
		
		new_diffusive_mass[row][col] = total_neighbor_diffusive_mass / 7;
	}
	
	
	
	update_values();
}



function evaluate_freezing_step()
{
	for (let i = 0; i < cells_on_boundary.length; i++)
	{
		let row = cells_on_boundary[i][0];
		let col = cells_on_boundary[i][1];
	
		if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
		{
			continue;
		}
		
	
		new_boundary_mass[row][col] = boundary_mass[row][col] + (1 - kappa) * diffusive_mass[row][col];
		
		new_crystal_mass[row][col] = crystal_mass[row][col] + kappa * diffusive_mass[row][col];
		
		new_diffusive_mass[row][col] = 0;
	}
	
	
	
	update_values();
}



function evaluate_attachment_step()
{
	for (let i = 0; i < cells_on_boundary.length; i++)
	{
		let row = cells_on_boundary[i][0];
		let col = cells_on_boundary[i][1];
	
		if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
		{
			continue;
		}
		
		
	
		let num_attached_neighbors = 0;
		
		let neighbors = get_neighbors(row, col, true);
		
		for (let j = 0; j < 7; j++)
		{
			if (attachment_flag[neighbors[j][0]][neighbors[j][1]] === 1)
			{
				num_attached_neighbors++;
			}
		}
		
		
		
		if (num_attached_neighbors === 1 || num_attached_neighbors === 2)
		{
			if (boundary_mass[row][col] >= beta)
			{
				new_attachment_flag[row][col] = 1;
			}
		}
		
		
		
		else if (num_attached_neighbors === 3)
		{
			if (boundary_mass[row][col] >= 1)
			{
				new_attachment_flag[row][col] = 1;
			}
			
			else if (boundary_mass[row][col] >= alpha)
			{
				let total_neighbor_diffusive_mass = 0;
				
				for (let j = 0; j < 7; j++)
				{
					total_neighbor_diffusive_mass += diffusive_mass[neighbors[j][0]][neighbors[j][1]];
				}
				
				if (total_neighbor_diffusive_mass < theta && boundary_mass[row][col] >= alpha)
				{
					new_attachment_flag[row][col] = 1;
				}
			}
		}
		
		
		
		else if (num_attached_neighbors >= 4)
		{
			new_attachment_flag[row][col] = 1;
		}
		
		
		
		if (new_attachment_flag[row][col] === 1)
		{
			new_crystal_mass[row][col] = boundary_mass[row][col] + crystal_mass[row][col];
			
			//Typo?
			new_boundary_mass[row][col] = 0;
		}
	}
	
	
	
	update_values();
}



function evaluate_melting_step()
{
	for (let i = 0; i < cells_on_boundary.length; i++)
	{
		let row = cells_on_boundary[i][0];
		let col = cells_on_boundary[i][1];
	
		if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
		{
			continue;
		}
		
	
		new_boundary_mass[row][col] = (1 - mu) * boundary_mass[row][col];
		
		new_crystal_mass[row][col] = (1 - gamma) * crystal_mass[row][col];
		
		new_diffusive_mass[row][col] = diffusive_mass[row][col] + mu * boundary_mass[row][col] + gamma * crystal_mass[row][col];
	}
	
	
	
	update_values();
}



function evaluate_noise_step()
{
	if (sigma === 0)
	{
		return;
	}
	
	for (let row = 0; row < grid_size; row++)
	{
		for (let col = 0; col < grid_size; col++)
		{
			if (row === 0 || col === 0 || row === grid_size - 1 || col === grid_size - 1)
			{
				continue;
			}
			
			
			
			if (Math.random() < .5)
			{
				new_diffusive_mass[row][col] = (1 + sigma) * diffusive_mass[row][col];
			}
			
			else
			{
				new_diffusive_mass[row][col] = (1 - sigma) * diffusive_mass[row][col];
			}
		}
	}
	
	
	
	update_values();
}



function update_values()
{
	for (let row = 0; row < grid_size; row++)
	{
		for (let col = 0; col < grid_size; col++)
		{
			if (attachment_flag[row][col] === 0 && new_attachment_flag[row][col] === 1)
			{
				add_cell_to_flake(row, col);
			}
			
			boundary_mass[row][col] = new_boundary_mass[row][col];
			crystal_mass[row][col] = new_crystal_mass[row][col];
			diffusive_mass[row][col] = new_diffusive_mass[row][col];
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