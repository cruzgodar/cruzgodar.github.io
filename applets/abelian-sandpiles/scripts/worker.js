"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	num_grains = e.data[1];
	maximum_speed = e.data[2];
	
	await draw_sandpile_graph();
}



let grid_size = null;
let num_grains = null;
let maximum_speed = null;

let image = [];

let sandpile_graph = [];
let old_sandpile_graph = [];



async function draw_sandpile_graph()
{
	image = [];
	sandpile_graph = [];
	old_sandpile_graph = [];
	let additions = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		image[i] = [];
		sandpile_graph[i] = [];
		old_sandpile_graph[i] = [];
		additions[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			image[i][j] = "rgb(0, 0, 0)";
			sandpile_graph[i][j] = 0;
			old_sandpile_graph[i][j] = 0;
			additions[i][j] = 0;
		}
	}
	
	sandpile_graph[Math.floor(grid_size / 2)][Math.floor(grid_size / 2)] = num_grains;
	
	
	
	//Until there are no topplings, go through the entire graph.
	let step = 0;
	
	let some_topplings_this_run = true;
	
	while (some_topplings_this_run)
	{
		some_topplings_this_run = false;
		
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				if (sandpile_graph[i][j] >= 4)
				{
					//>>2 is the same as /4 and &3 is the same as %4.
					let num_grains_to_add = sandpile_graph[i][j] >> 2;
					sandpile_graph[i][j] &= 3;
					
					additions[i - 1][j] += num_grains_to_add;
					additions[i][j + 1] += num_grains_to_add;
					additions[i + 1][j] += num_grains_to_add;
					additions[i][j - 1] += num_grains_to_add;
					
					//The ones on the bottom are kinda tricky, since we can't just double their additions -- 3 of their 4 feeders are present, not 2. Instead, we just have to take care of that manually by adding another copy of the addition from above.
					if (i === Math.floor(grid_size / 2) - 1)
					{
						additions[i + 1][j] += num_grains_to_add;
					}
					
					some_topplings_this_run = true;
					
				}
			}
		}
		
		
		
		//Now we can add the additions to the graph. However, vertices on the edges should get twice as many grains by symmetry, and the center square should get quadruple.
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				sandpile_graph[i][j] += additions[i][j];
			}
		}
		
		
		
		//Now we can double the entries from the diagonal. Note that we *don't* double the entries on the bottom row -- we took care of that already.
		for (let i = 1; i <= grid_size / 2; i++)
		{
			sandpile_graph[i][i] += additions[i][i];
		}
		
		sandpile_graph[Math.floor(grid_size / 2)][Math.floor(grid_size / 2)] += 2 * additions[Math.floor(grid_size / 2)][Math.floor(grid_size / 2)];
		
		
		
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				additions[i][j] = 0;
			}
		}
		
		
		
		if (some_topplings_this_run === false)
		{
			break;
		}
		
		
		
		step++;
		
		if (step % Math.floor(num_grains / 500) === 0)
		{
			if (maximum_speed)
			{
				color_piles();
			}
			
			else
			{
				await color_piles();
			}
		}
	}
	
	
	
	if (maximum_speed)
	{
		color_piles();
	}
	
	else
	{
		await color_piles();
	}
}



function color_piles()
{
	return new Promise(function(resolve, reject)
	{
		//Find the maximum brightness so we can draw a nice picture.
		let max_pile_size = 0;
		
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				if (sandpile_graph[i][j] > max_pile_size)
				{
					max_pile_size = sandpile_graph[i][j];
				}
			}
		}
		
		
		
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				if (sandpile_graph[i][j] !== old_sandpile_graph[i][j])
				{
					const pile_size = sandpile_graph[i][j];
					
					const brightness = pile_size / max_pile_size * 255;
					
					if (pile_size === 0)
					{
						draw_8_fold_pixel(j, i, `rgb(0, 0, 0)`);
					}
					
					else if (pile_size === 1)
					{
						draw_8_fold_pixel(j, i, `rgb(0, 127, 255)`);
					}
					
					else if (pile_size === 2)
					{
						draw_8_fold_pixel(j, i, `rgb(92, 0, 255)`);
					}
					
					else if (pile_size === 3)
					{
						draw_8_fold_pixel(j, i, `rgb(255, 255, 0)`);
					}
					
					else
					{
						draw_8_fold_pixel(j, i, `rgb(${brightness}, ${brightness}, ${brightness})`);
					}
				}
			}
		}
		
		
		
		postMessage([image]);
		
		
		
		for (let i = 1; i <= grid_size / 2; i++)
		{
			for (let j = 1; j <= i; j++)
			{
				old_sandpile_graph[i][j] = sandpile_graph[i][j];
			}
		}
		
		
		
		setTimeout(resolve, 50);
	});
}



function draw_8_fold_pixel(x, y, color)
{
	image[x][y] = color;
	image[grid_size - 1 - x][y] = color;
	
	image[grid_size - 1 - y][x] = color;
	image[grid_size - 1 - y][grid_size - 1 - x] = color;
	
	image[grid_size - 1 - x][grid_size - 1 - y] = color;
	image[x][grid_size - 1 - y] = color;
	
	image[y][grid_size - 1 - x] = color;
	image[y][x] = color;
}