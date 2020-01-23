#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <emscripten/emscripten.h>



void EMSCRIPTEN_KEEPALIVE random_walk(int grid_size, uint32_t* grid, int fixed_length, int starting_row, int starting_column);



//Generates a loop-erased random walk that starts at a random point and connects to the graph. If fixed length is not -1, then it will make a walk until that length is reached.
void EMSCRIPTEN_KEEPALIVE random_walk(int grid_size, uint32_t* grid, int fixed_length, int starting_row, int starting_column)
{
	int current_row = starting_row;
	int current_column = starting_column;
	
	int possible_directions[4] = {0, 0, 0, 0};
	int num_possible_directions;
	int direction;
	int last_direction = -1;
	
	int* new_vertices = malloc(2 * grid_size * sizeof(int));
	int num_new_vertices = 1;
	
	//The maximum number of vertices the list can currently hold. We can always realloc this later.
	int max_new_vertices = grid_size;
	
	int erased_a_loop;
	
	int i;
	
	
	
	new_vertices[0] = current_row;
	new_vertices[1] = current_column;
	
	
	
	srand((unsigned int) time(0));
	
	
	
	//Go until we hit the tree.
	while (1)
	{
		if (grid[current_row][current_column]) == 1)
		{
			break;
		}
		
		else if (fixed_length != -1 && num_new_vertices == fixed_length)
		{
			break;
		}
		
		
		
		//Move either up, left, down, or right. 0 = up, 1 = right, 2 = down, and 3 = left.
		
		//Corners:
		if (current_row == 0 && current_column == 0)
		{
			//Right or down.
			possible_directions[0] = 1;
			possible_directions[1] = 2;
			
			num_possible_directions = 2;
		}
		
		else if (current_row == grid_size - 1 && current_column == 0)
		{
			//Up or right.
			possible_directions[0] = 0;
			possible_directions[1] = 1;
			
			num_possible_directions = 2;
		}
		
		else if (current_row == 0 && current_column == grid_size - 1)
		{
			//Down or left.
			possible_directions[0] = 2;
			possible_directions[1] = 3;
			
			num_possible_directions = 2;
		}

		else if (current_row == grid_size - 1 && current_column == grid_size - 1)
		{
			//Up or left.
			possible_directions[0] = 0;
			possible_directions[1] = 3;
			
			num_possible_directions = 2;
		}



		//Edges:
		else if (current_row == 0)
		{
			//Right, down, or left.
			possible_directions[0] = 1;
			possible_directions[1] = 2;
			possible_directions[2] = 3;
			
			num_possible_directions = 3;
		}
			
		else if (current_row == grid_size - 1)
		{
			//Up, right, or left.
			possible_directions[0] = 0;
			possible_directions[1] = 1;
			possible_directions[2] = 3;
			
			num_possible_directions = 3;
		}

		else if (current_column == 0)
		{
			//Up, right, or down.
			possible_directions[0] = 0;
			possible_directions[1] = 1;
			possible_directions[2] = 2;
			
			num_possible_directions = 3;
		}
		
		else if (current_column == grid_size - 1)
		{
			//Up, down, or left.
			possible_directions[0] = 0;
			possible_directions[1] = 2;
			possible_directions[2] = 3;
			
			num_possible_directions = 3;
		}



		//Everything else:
		else
		{
			possible_directions[0] = 0;
			possible_directions[1] = 1;
			possible_directions[2] = 2;
			possible_directions[3] = 3;
			
			num_possible_directions = 3;
		}
		
		
		
		//We don't want to go exactly backwards -- there will never be a case where removing that option causes the program to halt.
		
		for (i = 0; i < num_possible_directions; i++)
		{
			if (possible_directions[i] == last_direction)
			{
				//This list is unordered, so this is fine.
				possible_directions[i] = possible_directions[num_possible_directions - 1];
				num_possible_directions--;
				break;
			}
		}
		
		//Pick a random direction from the possible ones and take it.
		direction = possible_directions[rand() % num_possible_directions];
		last_direction = direction;
		
		
		
		if (direction == 0)
		{
			current_row--;
		}
		
		else if (direction == 1)
		{
			current_column++;
		}
		
		else if (direction == 2)
		{
			current_row++;
		}
		
		else
		{
			current_column--;
		}
		
		
		
		
		//This is the loop-erasure part: before we can put our new vertex into the walk, we need to see if we've already been there.
		erased_a_loop = 0;
		
		for (i = 0; i < num_new_vertices; i++)
		{
			if (new_vertices[2*i] == current_row && new_vertices[2*i + 1] == current_column)
			{
				current_row = new_vertices[2*i];
				current_column = new_vertices[2*i + 1];
				
				num_new_vertices = i + 1;
				
				erased_a_loop = 1;
				
				break;
			}
		}
		
		if (!erased_a_loop)
		{
			new_vertices[2 * num_new_vertices] = current_row;
			new_vertices[2 * num_new_vertices + 1] = current_column;
			
			num_new_vertices++;
		}
	}
	
	
	
	for (i = 0; i < num_new_vertices; i++)
	{
		printf("%i %i\n", new_vertices[2*i], new_vertices[2*i + 1]);
	}
	
	
	
	free(new_vertices);
}