#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>



void EMSCRIPTEN_KEEPALIVE place_digit(int grid_size, uint8_t* grid, uint8_t** grid_possibilities, int row, int col, uint8_t digit);



//The entry point of the solver.
int8_t EMSCRIPTEN_KEEPALIVE solve_puzzle(int grid_size, int8_t* cage_operations, int cage_operations_size, int8_t* cage_values, int cage_values_size, int8_t* cage_lengths, int cage_lengths_size, int8_t* cage_max_digits, int cage_max_digits_size, int8_t* cage_sums, int cage_sums_size, int8_t* cage_products, int cage_products_size, int8_t* cages_by_location_flat, int cages_by_location_flat_size)
{
	int i, j, k;
	
	//Our first task is to get the two main arrays set up: grid and grid_possibilities. We're going to use uint8_t whenever possible to minimize memory use. Also, since cages_by_location is already a 1D array, we're going to make these two "1D" too. Of course, grid_possibilities will need to be 2D, since each location has a list of possibilities.
	uint8_t* grid = malloc(grid_size * grid_size * sizeof(uint8_t));
	
	//Also, since pushing and popping in C isn't really a thing, we're going to store everything in here as a grid_size long list, with either 1s or 0s to represent whether a number is possibile or not. [0] will correspond to 1, [1] to 2, and so on.
	uint8_t** grid_possibilities = malloc(grid_size * grid_size * sizeof(uint8_t*));
	
	//We aren't going to use empty_cells. That can be accomplished by scanning through grid and seeing what's 0.
	
	
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			grid[grid_size * i + j] = 0;
			
			grid_possibilities[grid_size * i + j] = malloc(grid_size * sizeof(uint8_t));
			
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
				printf("(%i, %i): removing %i and above.\n", i, j, cage_values[cages_by_location_flat[grid_size * i + j]] - cage_lengths[cages_by_location_flat[grid_size * i + j]] + 1);
				
				for (k = cage_values[cages_by_location_flat[grid_size * i + j]] - cage_lengths[cages_by_location_flat[grid_size * i + j]] + 1; k < grid_size; k++)
				{
					//Now each value of k corresponds to one less than the actual number in grid_possibilities, so if we want to remove 7 and above from the list, then we need to start at index 6.
					grid_possibilities[grid_size * i + j][k] = 0;
				}
			}
			
			
			
			//Finally, we have multiplication. Here, we just remove posdsibilities that don't divide the product.
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
	
	
	
	for (i = 0; i < grid_size; i++)
	{
		for (j = 0; j < grid_size; j++)
		{
			for (k = 0; k < grid_size; k++)
			{
				printf("%i", grid_possibilities[grid_size * i + j][k]);
			}
			
			printf(" ");
		}
		printf("\n");
	}
	
	
	
	free(grid);
	
	free(grid_possibilities);
	
	return 0;
}



//Puts digit in position (row, col) of grid and updates grid_possibilities.
void EMSCRIPTEN_KEEPALIVE place_digit(int grid_size, uint8_t* grid, uint8_t** grid_possibilities, int row, int col, uint8_t digit)
{
	int i;
	
	
	
	grid[grid_size * row + col] = digit;
	
	for (i = 0;i < grid_size; i++)
	{
		grid_possibilities[grid_size * i + col][digit - 1] = 0;
		grid_possibilities[grid_size * row + i][digit - 1] = 0;
	}
}