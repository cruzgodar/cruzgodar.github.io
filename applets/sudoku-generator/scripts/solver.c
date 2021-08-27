#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>



void EMSCRIPTEN_KEEPALIVE place_digit(uint8_t* grid, uint8_t** grid_possibilities, int row, int col, uint8_t value);
int EMSCRIPTEN_KEEPALIVE solve_puzzle_step(uint8_t* grid, uint8_t** grid_possibilities);



int grid_size = 9;



//The entry point of the solver.
int EMSCRIPTEN_KEEPALIVE solve_puzzle(uint8_t* grid, int grid_length)
{
	int num_solutions;
	
	int i, j, k;
	
	//Since pushing and popping in C isn't really a thing, we're going to store everything in here as a grid_size long list, with either 1s or 0s to represent whether a number is possible or not. [0] will correspond to 1, [1] to 2, and so on.
	uint8_t** grid_possibilities = malloc(grid_size * grid_size * sizeof(uint8_t*));
	
	
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			grid_possibilities[grid_size * i + j] = malloc(grid_size * sizeof(uint8_t));
			
			for (k = 0; k < grid_size; k++)
			{
				grid_possibilities[grid_size * i + j][k] = 1;
			}
		}
	}
	
	
	
	//Now it's time to trim some obviously false possibilities to reduce the number of things we need to check in the end. For every nonzero cell, we'll remove that possibility from its row, column, and minigrid.
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			if (grid[grid_size * i + j] != 0)
			{
				place_digit(grid, grid_possibilities, i, j, grid[grid_size * i + j]);
			}
		}
	}
	
	
	
	num_solutions = solve_puzzle_step(grid, grid_possibilities);
	
	
	
	free(grid);
	
	free(grid_possibilities);
	
	return num_solutions;
}



int EMSCRIPTEN_KEEPALIVE solve_puzzle_step(uint8_t* grid, uint8_t** grid_possibilities)
{
	int found_an_empty_cell = 0;
	
	int num_possibilities;
	
	unsigned int min_possibilities = -1;
	
	int best_cell = 0;
	
	int num_solutions = 0;
	
	int cage;
	
	
	
	uint8_t* new_grid = malloc(grid_size * grid_size * sizeof(uint8_t));
	
	uint8_t** new_grid_possibilities = malloc(grid_size * grid_size * sizeof(uint8_t*));
	
	
	
	int i, j, k, l;
	
	
	
	//First, we'll find the cell with the fewest possibilities.
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			if (grid[grid_size * i + j] == 0)
			{
				found_an_empty_cell = 1;
				
				
				
				num_possibilities = 0;
				
				for (k = 0; k < grid_size; k++)
				{
					num_possibilities += grid_possibilities[grid_size * i + j][k];
				}
				
				if (num_possibilities < min_possibilities)
				{
					min_possibilities = num_possibilities;
					
					best_cell = grid_size * i + j;
					
					//This is a pretty efficient place to put this check. If there aren't any possibilities for this cell, then something's gone wrong.
					if (num_possibilities == 0)
					{
						free(new_grid);
						free(new_grid_possibilities);
						
						return 0;
					}
				}
			}
		}
	}
	
	
	
	//If there are no more empty cells, then we've just found a solution.
	if (!found_an_empty_cell)
	{
		free(new_grid);
		free(new_grid_possibilities);
		
		return 1;
	}
	
	
	
	//Now that we're sure that there's something to check, we'll malloc new_grid_possibilities.
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			new_grid_possibilities[grid_size * i + j] = malloc(grid_size * sizeof(uint8_t));
		}
	}
	
	
	
	
	
	
	//Now that we've got our best cell, we'll go through every possibility it could have.
	for (i = 0; i < grid_size; i++)
	{
		if (grid_possibilities[best_cell][i] == 0)
		{
			continue;
		}
		
		
		
		//First of all, we need to clone grid and grid_possibilities at every step so that we have a clean slate.
		for (j = 0; j < grid_size; j++)
		{
			for (k = 0; k < grid_size; k++)
			{
				new_grid[grid_size * j + k] = grid[grid_size * j + k];
				
				for (l = 0; l < grid_size; l++)
				{
					new_grid_possibilities[grid_size * j + k][l] = grid_possibilities[grid_size * j + k][l];
				}
			}
		}
		
		
		
		//Now we'll place the digit and go deeper.
		place_digit(new_grid, new_grid_possibilities, best_cell / grid_size, best_cell % grid_size, i + 1);
		
		
		
		num_solutions += solve_puzzle_step(new_grid, new_grid_possibilities);
	}
	
	
	
	free(new_grid);
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			free(new_grid_possibilities[grid_size * i + j]);
		}
	}
	
	free(new_grid_possibilities);
	
	return num_solutions;
}



//Puts digit in position (row, col) of grid and updates grid_possibilities.
void EMSCRIPTEN_KEEPALIVE place_digit(uint8_t* grid, uint8_t** grid_possibilities, int row, int col, uint8_t value)
{
	int i, j;
	
	int minigrid_row = row / 3;
	int minigrid_col = col / 3;
	
	int index_to_zero = value - 1;
	
	
	
	//Clear this row.
	for (i = 0; i < grid_size; i++)
	{
		grid_possibilities[grid_size * row + i][index_to_zero] = 0;
	}
	
	//Now clear this column.
	for (i = 0; i < grid_size; i++)
	{
		grid_possibilities[grid_size * i + col][index_to_zero] = 0;
	}
	
	//And finally, clear the minigrid. This is just a little trickier.
	for (i = minigrid_row * 3; i < (minigrid_row + 1) * 3; i++)
	{
		for (j = minigrid_col * 3; j < (minigrid_col + 1) * 3; j++)
		{
			grid_possibilities[grid_size * i + j][index_to_zero] = 0;
		}
	}
	
	
	
	
	//Now we can place the digit and dip.
	grid[grid_size * row + col] = value;
}