"use strict";



onmessage = async function(e)
{
	grid_size = e.data[0];
	num_grains = e.data[1];
	maximum_speed = e.data[2];
	
	importScripts("/applets/abelian-sandpiles/scripts/iterate.js");

	Module["onRuntimeInitialized"] = async function()
	{
		importScripts("/scripts/wasm-arrays.min.js");
		
		await draw_sandpile_graph();
	};
}



let grid_size = null;
let num_grains = null;
let maximum_speed = null;

let sandpile_graph = [];
let old_sandpile_graph = [];



async function draw_sandpile_graph()
{
	sandpile_graph = [0];
	old_sandpile_graph = [0];
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			sandpile_graph[1 + grid_size * i + j] = 0;
			old_sandpile_graph[1 + grid_size * i + j] = 0;
		}
	}
	
	sandpile_graph[1 + grid_size * Math.floor(grid_size / 2) + Math.floor(grid_size / 2)] = num_grains;
	
	
	
	//Until there are no topplings, go through the entire graph.
	let step = 0;
	
	let some_topplings_this_run = 1;
	
	while (some_topplings_this_run)
	{
		let grid_ptr = ccallArrays("iterate_sandpile", "number", ["number", "array", "number"], [grid_size, sandpile_graph, Math.floor(num_grains / 500)], {heapIn: "HEAPU32"});
		
		//Whether this run toppled anything is stored as its first element.
		some_topplings_this_run = Module.HEAPU32[grid_ptr / Uint32Array.BYTES_PER_ELEMENT]
		
		for (let i = 1; i < grid_size * grid_size + 1; i++)
		{
			sandpile_graph[i] = Module.HEAPU32[grid_ptr / Uint32Array.BYTES_PER_ELEMENT + i];
		}
		
		Module.ccall("free_from_js", null, ["number"], [grid_ptr]);
		
		
		
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
				if (sandpile_graph[1 + grid_size * i + j] > max_pile_size)
				{
					max_pile_size = sandpile_graph[1 + grid_size * i + j]
				}
			}
		}
		
		
		
		for (let i = 1; i < grid_size - 1; i++)
		{
			for (let j = 1; j < grid_size - 1; j++)
			{
				if (sandpile_graph[1 + grid_size * i + j] !== old_sandpile_graph[1 + grid_size * i + j])
				{
					let pile_size = sandpile_graph[1 + grid_size * i + j];
					
					let brightness = pile_size / max_pile_size * 255;
					
					if (pile_size === 0)
					{
						postMessage([j, i, `rgb(0, 0, 0)`]);
					}
					
					else if (pile_size === 1)
					{
						postMessage([j, i, `rgb(0, 127, 255)`]);
					}
					
					else if (pile_size === 2)
					{
						postMessage([j, i, `rgb(92, 0, 255)`]);
					}
					
					else if (pile_size === 3)
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
				old_sandpile_graph[1 + grid_size * i + j] = sandpile_graph[1 + grid_size * i + j];
			}
		}
		
		
		
		setTimeout(resolve, 50);
	});
}