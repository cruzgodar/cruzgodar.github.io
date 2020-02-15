#include <stdio.h>
#include <stdlib.h>
#include <time.h>



#define GRID_SIZE 500



void wilson_step();
void random_walk(int fixed_length, int starting_row, int starting_column);

int reverse_generate_skeleton = 1;
int num_skeleton_walks = 0;

FILE* output;

int* grid;

int* vertices_not_in_tree;
int num_vertices_not_in_tree = GRID_SIZE * GRID_SIZE;

int* vertices_in_tree;
int num_vertices_in_tree = 0;

int* new_vertices;
int num_new_vertices;
int max_new_vertices = 1000;

int percent_step = 1;


int random_walk_from_endpoint_attempts = 0;
int current_row_base_camp;
int current_column_base_camp;



int main(void)
{
	int i, j;

    output = fopen("edges.json", "w");

	grid = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));
	vertices_not_in_tree = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));
	vertices_in_tree = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));

	srand((unsigned int) time(0));

	fprintf(output, "{\n\t\"edges\":\n\t[\n");

	new_vertices = (int*) malloc(1000 * 2 * sizeof(int));



    //There's nothing in the tree yet.
	for (i = 0; i < GRID_SIZE; i++)
    {
        for (j = 0; j < GRID_SIZE; j++)
        {
            grid[GRID_SIZE * i + j] = 0;

            vertices_not_in_tree[GRID_SIZE * i + j] = GRID_SIZE * i + j;
        }
    }



    while (num_vertices_not_in_tree > 0)
    {
        wilson_step();

        if (num_vertices_in_tree >= (GRID_SIZE * GRID_SIZE / 100) * percent_step)
        {
            printf("%i%%\n", percent_step);
            fflush(stdout);

            percent_step++;
        }
    }



    fprintf(output, "\t]\n}");

    fclose(output);



    free(grid);
    free(vertices_not_in_tree);
    free(vertices_in_tree);

    free(new_vertices);

	return 0;
}



void wilson_step()
{
	int starting_vertex;
	int starting_row;
	int starting_column;

	int walk_length;

	int vertex;

	int i, j;



	//This is the basic way of doing things. We first make a walk of pretty long length, then just do regular Wilson's Algorithm to connect to it.
	if (!reverse_generate_skeleton)
    {
        //Pick a random vertex not in the tree.
        starting_vertex = vertices_not_in_tree[rand() % num_vertices_not_in_tree];

        starting_row = starting_vertex / GRID_SIZE;
        starting_column = starting_vertex % GRID_SIZE;

        //If this is the very first walk, we fix the length.
        if (num_vertices_not_in_tree == GRID_SIZE * GRID_SIZE)
        {
            //The bigger the grid, the longer the walk -- to a point.
            walk_length = GRID_SIZE * 5;

            if (GRID_SIZE <= 100)
            {
                walk_length = GRID_SIZE;
            }

            else if (GRID_SIZE <= 300)
            {
                walk_length = GRID_SIZE * 3;
            }

            random_walk(walk_length, starting_row, starting_column);
        }

        else
        {
            random_walk(0, starting_row, starting_column);
        }
    }



    //If the grid is too big, we need a different tactic.
    else
    {
        //If this is the very first line we're drawing, then we start somewhere close to the center.
        if (num_vertices_in_tree == 0)
        {
            current_row_base_camp = rand() % (GRID_SIZE / 5) + 2 * GRID_SIZE / 5;
            current_column_base_camp = rand() % (GRID_SIZE / 5) + 2 * GRID_SIZE / 5;
        }

        random_walk(100, current_row_base_camp, current_column_base_camp);

        //We don't include the last vertex, since it could connect back to the tree.
        num_new_vertices--;



        //If we failed to get a random walk of length 100, then it's likely we're in a cage of some sort, but we'll give it 100 tries just to be sure.
        if (num_new_vertices < 99)
        {
            if (random_walk_from_endpoint_attempts < 100)
            {
                random_walk_from_endpoint_attempts++;
            }

            else if (random_walk_from_endpoint_attempts == 100 && num_vertices_in_tree != 0)
            {
                random_walk_from_endpoint_attempts = 0;

                starting_vertex = vertices_in_tree[rand() % num_vertices_in_tree];
                current_row_base_camp = starting_vertex / GRID_SIZE;
                current_column_base_camp = starting_vertex % GRID_SIZE;
            }


            return;
        }



        //If the walk was successful, then we make the base camp the last thing we added, hopefully putting us far away from old stuff.
        random_walk_from_endpoint_attempts = 0;

        current_row_base_camp = new_vertices[2 * (num_new_vertices - 1)];
        current_column_base_camp = new_vertices[2 * (num_new_vertices - 1) + 1];

        num_skeleton_walks++;

        if (num_skeleton_walks == GRID_SIZE / 5)
        {
            reverse_generate_skeleton = 0;
        }
    }



    //Now that the walk is done, we need to log it. For each vertex, we add an edge to the output file, set that position in grid to 1, remove it from vertices_not_in_tree, and add it to vertices_in_tree.
	for (i = 0; i < num_new_vertices; i++)
	{
	    vertex = GRID_SIZE * new_vertices[2 * i] + new_vertices[2 * i + 1];

		grid[vertex] = 1;



	    if (i != num_new_vertices - 1)
        {
            fprintf(output, "\t\t[[%i, %i], [%i, %i]],\n", new_vertices[2 * i], new_vertices[2 * i + 1], new_vertices[2 * i + 2], new_vertices[2 * i + 3]);

            //That last vertex is already accounted for.
            vertices_in_tree[num_vertices_in_tree] = vertex;

            num_vertices_in_tree++;
        }



		for (j = 0; j < num_vertices_not_in_tree; j++)
        {
            if (vertices_not_in_tree[j] == vertex)
            {
                vertices_not_in_tree[j] = vertices_not_in_tree[num_vertices_not_in_tree - 1];

                num_vertices_not_in_tree--;

                break;
            }
        }
	}
}



void random_walk(int fixed_length, int starting_row, int starting_column)
{
	int current_row = starting_row;
	int current_column = starting_column;

	int possible_directions[4] = {0, 0, 0, 0};
	int num_possible_directions;
	int direction;
	int last_direction = -1;

	int erased_a_loop;

	int i;

	num_new_vertices = 1;


	new_vertices[0] = current_row;
	new_vertices[1] = current_column;



	//Go until we hit the tree.
	while (1)
	{
		//Move either up, left, down, or right. 0 = up, 1 = right, 2 = down, and 3 = left.

		//Corners:
		if (current_row == 0 && current_column == 0)
		{
			//Right or down.
			possible_directions[0] = 1;
			possible_directions[1] = 2;

			num_possible_directions = 2;
		}

		else if (current_row == GRID_SIZE - 1 && current_column == 0)
		{
			//Up or right.
			possible_directions[0] = 0;
			possible_directions[1] = 1;

			num_possible_directions = 2;
		}

		else if (current_row == 0 && current_column == GRID_SIZE - 1)
		{
			//Down or left.
			possible_directions[0] = 2;
			possible_directions[1] = 3;

			num_possible_directions = 2;
		}

		else if (current_row == GRID_SIZE - 1 && current_column == GRID_SIZE - 1)
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

		else if (current_row == GRID_SIZE - 1)
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

		else if (current_column == GRID_SIZE - 1)
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

			num_possible_directions = 4;
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



		//Now we can add this vertex to the list, but we need to make sure we have enough space to do so.
		if (!erased_a_loop)
		{
			if (num_new_vertices == max_new_vertices)
			{
				max_new_vertices += 1000;

				new_vertices = realloc(new_vertices, 2 * max_new_vertices * sizeof(int));
			}

			new_vertices[2 * num_new_vertices] = current_row;
			new_vertices[2 * num_new_vertices + 1] = current_column;

			num_new_vertices++;
		}



		if (grid[GRID_SIZE * current_row + current_column] == 1)
		{
			break;
		}

		else if (fixed_length != 0 && num_new_vertices == fixed_length)
		{
			break;
		}
	}
}
