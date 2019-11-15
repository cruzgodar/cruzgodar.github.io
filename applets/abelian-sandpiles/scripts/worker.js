onmessage = async function(e)
{
	grid_size = e.data[0];
	num_grains = e.data[1];
	maximum_speed = e.data[2];
	
	await draw_sandpile_graph();
	
	postMessage(["done"]);
}



let grid_size = null;
let num_grains = null;
let maximum_speed = null;

let sandpile_graph = [];
let old_sandpile_graph = [];



async function draw_sandpile_graph()
{
	sandpile_graph = [];
	old_sandpile_graph = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		sandpile_graph[i] = [];
		old_sandpile_graph[i] = [];
		
		for (let j = 0; j < grid_size; j++)
		{
			sandpile_graph[i][j] = 0;
			old_sandpile_graph[i][j] = 0;
		}
	}
	
	sandpile_graph[Math.floor(grid_size / 2)][Math.floor(grid_size / 2)] = num_grains;
	
	
	
	//Until there are no topplings, go through the entire graph.
	let step = 0;
	
	let some_topplings_this_run = true;
	
	while (some_topplings_this_run)
	{
		some_topplings_this_run = false;
		
		
		
		//We don't topple or change the color of the edge vertices.
		for (let i = 1; i < grid_size - 1; i++)
		{
			for (let j = 1; j < grid_size - 1; j++)
			{
				if (sandpile_graph[i][j] >= 4)
				{
					sandpile_graph[i][j] -= 4;
					
					sandpile_graph[i - 1][j]++;
					sandpile_graph[i][j + 1]++;
					sandpile_graph[i + 1][j]++;
					sandpile_graph[i][j - 1]++;
					
					some_topplings_this_run = true;
				}
			}
		}
		
		
		
		if (step % (Math.floor(num_grains / 100)) == 0)
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
		
		
		
		step++;
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
		
		for (let i = 1; i < grid_size - 1; i++)
		{
			for (let j = 1; j < grid_size - 1; j++)
			{
				if (sandpile_graph[i][j] > max_pile_size)
				{
					max_pile_size = sandpile_graph[i][j];
				}
			}
		}
		
		
		
		for (let i = 1; i < grid_size - 1; i++)
		{
			for (let j = 1; j < grid_size - 1; j++)
			{
				if (sandpile_graph[i][j] != old_sandpile_graph[i][j])
				{
					let brightness = sandpile_graph[i][j] / max_pile_size * 255;
					
					if (sandpile_graph[i][j] == 0)
					{
						postMessage([j, i, `rgb(0, 0, 0)`]);
					}
					
					else if (sandpile_graph[i][j] == 1)
					{
						postMessage([j, i, `rgb(0, 127, 255)`]);
					}
					
					else if (sandpile_graph[i][j] == 2)
					{
						postMessage([j, i, `rgb(92, 0, 255)`]);
					}
					
					else if (sandpile_graph[i][j] == 3)
					{
						postMessage([j, i, `rgb(255, 255, 0)`]);
					}
					
					else
					{
						postMessage([j, i, `rgb(${brightness}, ${brightness}, ${brightness})`]);
					}
				}
			}
		}
		
		
		
		for (let i = 1; i < grid_size - 1; i++)
		{
			for (let j = 1; j < grid_size - 1; j++)
			{
				old_sandpile_graph[i][j] = sandpile_graph[i][j];
			}
		}
		
		
		
		setTimeout(resolve, 50);
	});
}