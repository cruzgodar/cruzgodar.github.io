#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>



uint32_t* EMSCRIPTEN_KEEPALIVE iterate_sandpile(uint32_t grid_size, uint32_t* grid, uint32_t unused_grid_length, uint32_t num_iterations);
void EMSCRIPTEN_KEEPALIVE free_from_js(uint32_t* ptr);



uint32_t* EMSCRIPTEN_KEEPALIVE iterate_sandpile(uint32_t grid_size, uint32_t* grid, uint32_t unused_grid_length, uint32_t num_iterations)
{
	int iteration, i, j;
	
	int num_grains_to_add;
	
	int some_topplings_this_run;
	
	uint32_t* new_grid = malloc(1 + grid_size * grid_size * sizeof(uint32_t));
	
	
	
	for (i = 1; i < grid_size - 1; i++)
	{
		for (j = 1; j < grid_size - 1; j++)
		{
			new_grid[1 + grid_size * i + j] = grid[1 + grid_size * i + j];
		}
	}
	
	for (i = 0; i < grid_size; i++)
	{
		new_grid[1 + grid_size * i + 0] = 0;
		new_grid[1 + grid_size * i + (grid_size - 1)] = 0;
		
		new_grid[1 + grid_size * 0 + i] = 0;
		new_grid[1 + grid_size * (grid_size - 1) + i] = 0;
	}
	
	
	
	//We don't topple or change the color of the edge vertices.
	for (iteration = 0; iteration < num_iterations; iteration++)
	{
		some_topplings_this_run = 0;
		
		for (i = 1; i < grid_size - 1; i++)
		{
			for (j = 1; j < grid_size - 1; j++)
			{
				if (new_grid[1 + grid_size * i + j] >= 4)
				{
					//>>2 is the same as /4 and &3 is the same as %4.
					num_grains_to_add = new_grid[1 + grid_size * i + j] >> 2;
					new_grid[1 + grid_size * i + j] &= 3;
					
					new_grid[1 + grid_size * (i - 1) + j] += num_grains_to_add;
					new_grid[1 + grid_size * i + (j + 1)] += num_grains_to_add;
					new_grid[1 + grid_size * (i + 1) + j] += num_grains_to_add;
					new_grid[1 + grid_size * i + (j - 1)] += num_grains_to_add;
					
					some_topplings_this_run = 1;
				}
			}
		}
		
		if (!some_topplings_this_run)
		{
			break;
		}
	}
	
	
	
	new_grid[0] = some_topplings_this_run;
	
	return new_grid;
}



void EMSCRIPTEN_KEEPALIVE free_from_js(uint32_t* ptr)
{
	free(ptr);
}