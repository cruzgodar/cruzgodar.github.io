#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>



void EMSCRIPTEN_KEEPALIVE place_digit(int grid_size, uint32_t* grid, uint32_t** grid_possibilities, int row, int col, uint32_t digit);
int EMSCRIPTEN_KEEPALIVE solve_puzzle_step(int grid_size, uint32_t* grid, uint32_t** grid_possibilities, uint32_t* cage_operations, uint32_t* cage_values, uint32_t* cages_by_location_flat);
int EMSCRIPTEN_KEEPALIVE check_cage(int grid_size, uint32_t* grid, int cage_index, uint32_t operation, uint32_t value, uint32_t* cages_by_location_flat);



//The entry point of the solver.
int EMSCRIPTEN_KEEPALIVE solve_puzzle(int grid_size, uint32_t* cage_operations, int cage_operations_size, uint32_t* cage_values, int cage_values_size, uint32_t* cage_lengths, int cage_lengths_size, uint32_t* cage_max_digits, int cage_max_digits_size, uint32_t* cage_sums, int cage_sums_size, uint32_t* cage_products, int cage_products_size, uint32_t* cages_by_location_flat, int cages_by_location_flat_size)
{
	int num_solutions;
	
	int i, j, k;
	
	//Our first task is to get the two main arrays set up: grid and grid_possibilities. We're going to use uint8_t whenever possible to minimize memory use. Also, since cages_by_location is already a 1D array, we're going to make these two "1D" too. Of course, grid_possibilities will need to be 2D, since each location has a list of possibilities.
	uint32_t* grid = malloc(grid_size * grid_size * sizeof(uint32_t));
	
	//Also, since pushing and popping in C isn't really a thing, we're going to store everything in here as a grid_size long list, with either 1s or 0s to represent whether a number is possibile or not. [0] will correspond to 1, [1] to 2, and so on.
	uint32_t** grid_possibilities = malloc(grid_size * grid_size * sizeof(uint32_t*));
	
	//We aren't going to use empty_cells. That can be accomplished by scanning through grid and seeing what's 0.
	
	
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			grid[grid_size * i + j] = 0;
			
			grid_possibilities[grid_size * i + j] = malloc(grid_size * sizeof(uint32_t));
			
			for (k = 0; k < grid_size; k++)
			{
				grid_possibilities[grid_size * i + j][k] = 1;
			}
		}
	}
	
	
	
	//Now it's time to trim some obviously false possibilities to reduce them number of things we need to check in the end.
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			//If this is a 1x1 cage, then we know exactly what goes here.
			if (cage_operations[cages_by_location_flat[grid_size * i + j]] == 0)
			{
				place_digit(grid_size, grid, grid_possibilities, i, j, cage_values[cages_by_location_flat[grid_size * i + j]]);
			}
			
			
			
			//If this is an addition cage, then any number in the cage can be at most the sum minus the number of cells plus 1. For example, an 8+ cage can have a max digit of 6.
			else if (cage_operations[cages_by_location_flat[grid_size * i + j]] == 1)
			{
				for (k = cage_values[cages_by_location_flat[grid_size * i + j]] - cage_lengths[cages_by_location_flat[grid_size * i + j]] + 1; k < grid_size; k++)
				{
					//Now each value of k corresponds to one less than the actual number in grid_possibilities, so if we want to remove 7 and above from the list, then we need to start at index 6.
					grid_possibilities[grid_size * i + j][k] = 0;
				}
			}
			
			
			
			//Finally, we have multiplication. Here, we just remove possibilities that don't divide the product.
			else if (cage_operations[cages_by_location_flat[grid_size * i + j]] == 2)
			{
				for (k = 1; k < grid_size; k++)
				{
					if (cage_values[cages_by_location_flat[grid_size * i + j]] % (k + 1) != 0)
					{
						grid_possibilities[grid_size * i + j][k] = 0;
					}
				}
			}
		}
	}
	
	
	
	num_solutions = solve_puzzle_step(grid_size, grid, grid_possibilities, cage_operations, cage_values, cages_by_location_flat);
	
	
	
	free(grid);
	
	free(grid_possibilities);
	
	return num_solutions;
}



int EMSCRIPTEN_KEEPALIVE solve_puzzle_step(int grid_size, uint32_t* grid, uint32_t** grid_possibilities, uint32_t* cage_operations, uint32_t* cage_values, uint32_t* cages_by_location_flat)
{
	int found_an_empty_cell = 0;
	
	int num_possibilities;
	
	unsigned int min_possibilities = -1;
	
	int best_cell = 0;
	
	int num_solutions = 0;
	
	int cage;
	
	
	
	uint32_t* new_grid = malloc(grid_size * grid_size * sizeof(uint32_t));
	
	uint32_t** new_grid_possibilities = malloc(grid_size * grid_size * sizeof(uint32_t*));
	
	
	
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
			new_grid_possibilities[grid_size * i + j] = malloc(grid_size * sizeof(uint32_t));
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
		
		
		
		//Now we'll place the digit and make sure that its cage's condition is satisfied.
		place_digit(grid_size, new_grid, new_grid_possibilities, best_cell / grid_size, best_cell % grid_size, i + 1);
		
		
		
		cage = cages_by_location_flat[best_cell];
		
		if (check_cage(grid_size, new_grid, cage, cage_operations[cage], cage_values[cage], cages_by_location_flat) == 0)
		{
			continue;
		}
		
		
		
		num_solutions += solve_puzzle_step(grid_size, new_grid, new_grid_possibilities, cage_operations, cage_values, cages_by_location_flat);
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



//Determines if a cage is satisfied.
int EMSCRIPTEN_KEEPALIVE check_cage(int grid_size, uint32_t* grid, int cage_index, uint32_t operation, uint32_t value, uint32_t* cages_by_location_flat)
{
	int num_cells_in_cage = 0;
	
	int cage_sum = 0;
	int cage_product = 1;
	int max_digit = 0;
	
	
	
	int i, j;
	
	
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			if (cages_by_location_flat[grid_size * i + j] == cage_index)
			{
				//If the cage isn't full, then this isn't something we care about yet.
				if (grid[grid_size * i + j] == 0)
				{
					return 1;
				}
				
				//Otherwise, let's collect some data.
				cage_sum += grid[grid_size * i + j];
				
				cage_product *= grid[grid_size * i + j];
				
				if (grid[grid_size * i + j] > max_digit)
				{
					max_digit = grid[grid_size * i + j];
				}
			}
		}
	}
	
	
	
	//Now all we need to do is check whatever condition we have in this cell.
	if (operation == 1)
	{
		if (cage_sum == value)
		{
			return 1;
		}
	}
	
	
	
	else if (operation == 2)
	{
		if (cage_product == value)
		{
			return 1;
		}
	}
	
	
	
	else if (operation == 3)
	{
		if (2 * max_digit - cage_sum == value)
		{
			return 1;
		}
	}
	
	
	
	else if (operation == 4)
	{
		if ((max_digit * max_digit) % cage_product == 0 && (max_digit * max_digit) / cage_product == value)
		{
			return 1;
		}
	}
	
	
	
	return 0;
}



//Puts digit in position (row, col) of grid and updates grid_possibilities.
void EMSCRIPTEN_KEEPALIVE place_digit(int grid_size, uint32_t* grid, uint32_t** grid_possibilities, int row, int col, uint32_t digit)
{
	int i;
	
	
	
	grid[grid_size * row + col] = digit;
	
	for (i = 0; i < grid_size; i++)
	{
		grid_possibilities[grid_size * i + col][digit - 1] = 0;
		grid_possibilities[grid_size * row + i][digit - 1] = 0;
	}
}