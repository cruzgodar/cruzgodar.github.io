#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include "TinyPngOut.h"



#define GRID_SIZE 1000



void wilson_step(void);
void random_walk(int fixed_length, int starting_row, int starting_column);
void color_graph(void);

int reverse_generate_skeleton = 0;
int num_skeleton_walks = 0;

FILE* output;

int* grid;
int** connection_directions;

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

	grid = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));
	vertices_not_in_tree = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));
	vertices_in_tree = (int*) malloc(GRID_SIZE * GRID_SIZE * sizeof(int));
	connection_directions = (int**) malloc(GRID_SIZE * GRID_SIZE * sizeof(int*));

	for (i = 0; i < GRID_SIZE; i++)
    {
        for (j = 0; j < GRID_SIZE; j++)
        {
            connection_directions[GRID_SIZE * i + j] = (int*) malloc(4 * sizeof(int));

            connection_directions[GRID_SIZE * i + j][0] = 0;
            connection_directions[GRID_SIZE * i + j][1] = 0;
            connection_directions[GRID_SIZE * i + j][2] = 0;
            connection_directions[GRID_SIZE * i + j][3] = 0;
        }
    }

	srand((unsigned int) time(0));

	new_vertices = (int*) malloc(1000 * 2 * sizeof(int));

	if (GRID_SIZE > 500)
    {
        reverse_generate_skeleton = 1;
    }



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



    color_graph();



    free(grid);
    free(vertices_not_in_tree);
    free(vertices_in_tree);

    for (i = 0; i < GRID_SIZE; i++)
    {
        for (j = 0; j < GRID_SIZE; j++)
        {
            free(connection_directions[GRID_SIZE * i + j]);
        }
    }

    free(connection_directions);

    free(new_vertices);

	return 0;
}



void wilson_step(void)
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
            //If the rows are the same, the connection is left/right.
            if (new_vertices[2 * i] == new_vertices[2 * i + 2])
            {
                if (new_vertices[2 * i + 1] < new_vertices[2 * i + 3])
                {
                    connection_directions[GRID_SIZE * new_vertices[2 * i] + new_vertices[2 * i + 1]][1] = 1;
                    connection_directions[GRID_SIZE * new_vertices[2 * i + 2] + new_vertices[2 * i + 3]][3] = 1;
                }

                else
                {
                    connection_directions[GRID_SIZE * new_vertices[2 * i] + new_vertices[2 * i + 1]][3] = 1;
                    connection_directions[GRID_SIZE * new_vertices[2 * i + 2] + new_vertices[2 * i + 3]][1] = 1;
                }
            }

            else
            {
                if (new_vertices[2 * i] < new_vertices[2 * i + 2])
                {
                    connection_directions[GRID_SIZE * new_vertices[2 * i] + new_vertices[2 * i + 1]][2] = 1;
                    connection_directions[GRID_SIZE * new_vertices[2 * i + 2] + new_vertices[2 * i + 3]][0] = 1;
                }

                else
                {
                    connection_directions[GRID_SIZE * new_vertices[2 * i] + new_vertices[2 * i + 1]][0] = 1;
                    connection_directions[GRID_SIZE * new_vertices[2 * i + 2] + new_vertices[2 * i + 3]][2] = 1;
                }
            }



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



void color_graph(void)
{
    uint8_t pixels[3];
    struct TinyPngOut pngout;
    FILE* output = fopen("output.png", "wb");

    //Used for HSV to RGB calculations.
    double r, g, b, k, f, p, q, t;
    double h, s = 1.0, v = 1.0;

    int i, j;

    int current_distance;
    int max_distance;
    int found_an_active_node = 1;



    if (output == NULL || TinyPngOut_init(&pngout, 2 * GRID_SIZE + 1, 2 * GRID_SIZE + 1, output) != TINYPNGOUT_OK)
    {
        return;
    }



    //First of all, we need to explore the graph. We're going to reuse grid for this -- It'll store distance from the center, where a positive number is an already-explored vertex, 0 is an unexplored one, and -1 is an active vertex.
    //Also, we're gonna be real lazy about it since C doesn't have easy push/pop in lists like JS does. Instead, we'll just loop through the grid repeatedly. To avoid having to have a second copy of grid tho take even steps, we'll use -2 to mark a vertex for being active on the next step.
    for (i = 0; i < GRID_SIZE; i++)
    {
        for (j = 0; j < GRID_SIZE; j++)
        {
            grid[GRID_SIZE * i + j] = 0;
        }
    }

    grid[GRID_SIZE * (GRID_SIZE / 2) + GRID_SIZE / 2] = -1;



    current_distance = 0;

    while (found_an_active_node)
    {
        found_an_active_node = 0;

        current_distance++;

        //First, find all the currently active nodes and mark the things around them to activate, then deactivate them.
        for (i = 0; i < GRID_SIZE; i++)
        {
            for (j = 0; j < GRID_SIZE; j++)
            {
                if (grid[GRID_SIZE * i + j] == -1)
                {
                    found_an_active_node = 1;

                    if (connection_directions[GRID_SIZE * i + j][0] && grid[GRID_SIZE * (i - 1) + j] == 0)
                    {
                        grid[GRID_SIZE * (i - 1) + j] = -2;
                    }

                    if (connection_directions[GRID_SIZE * i + j][1] && grid[GRID_SIZE * i + (j + 1)] == 0)
                    {
                        grid[GRID_SIZE * i + (j + 1)] = -2;
                    }

                    if (connection_directions[GRID_SIZE * i + j][2] && grid[GRID_SIZE * (i + 1) + j] == 0)
                    {
                        grid[GRID_SIZE * (i + 1) + j] = -2;
                    }

                    if (connection_directions[GRID_SIZE * i + j][3] && grid[GRID_SIZE * i + (j - 1)] == 0)
                    {
                        grid[GRID_SIZE * i + (j - 1)] = -2;
                    }

                    grid[GRID_SIZE * i + j] = current_distance;
                }
            }
        }



        //Now find everything we marked to be active and make it so.
        for (i = 0; i < GRID_SIZE; i++)
        {
            for (j = 0; j < GRID_SIZE; j++)
            {
                if (grid[GRID_SIZE * i + j] == -2)
                {
                    grid[GRID_SIZE * i + j] = -1;
                }
            }
        }
    }



    //Great! Now we started at a distance of 1, which isn't quite what we want.
    for (i = 0; i < GRID_SIZE; i++)
    {
        for (j = 0; j < GRID_SIZE; j++)
        {
            grid[GRID_SIZE * i + j]--;
        }
    }

    max_distance = current_distance - 2;



    //Now we can print this thing out. Firstly, there's the top border.
    pixels[0] = 0;
    pixels[1] = 0;
    pixels[2] = 0;

    for (j = 0; j < 2 * GRID_SIZE + 1; j++)
    {
        TinyPngOut_write(&pngout, pixels, 1);
    }



    for (i = 0; i < GRID_SIZE; i++)
    {
        //Here's the left border.
        pixels[0] = 0;
        pixels[1] = 0;
        pixels[2] = 0;

        TinyPngOut_write(&pngout, pixels, 1);



        for (j = 0; j < GRID_SIZE; j++)
        {
            h = ((double) grid[GRID_SIZE * i + j] / (double) max_distance) * .857142;
            k = (int) (h * 6);
            f = h * 6 - k;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);

            switch ((int) k % 6)
            {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }

            r *= 255;
            g *= 255;
            b *= 255;

            pixels[0] = (uint8_t) r;
            pixels[1] = (uint8_t) g;
            pixels[2] = (uint8_t) b;


            //First of all, there's always going to be a connection somewhere, so we'll draw a single pixel here.
            TinyPngOut_write(&pngout, pixels, 1);

            //Now if there's a connection to the right, then we'll draw another pixel, and if not, we'll draw a black one.
            if (j != GRID_SIZE - 1)
            {
                if (connection_directions[GRID_SIZE * i + j][1])
                {
                    TinyPngOut_write(&pngout, pixels, 1);
                }

                else
                {
                    pixels[0] = 0;
                    pixels[1] = 0;
                    pixels[2] = 0;

                    TinyPngOut_write(&pngout, pixels, 1);
                }
            }
        }



        //Take care of the borders real fast.
        pixels[0] = 0;
        pixels[1] = 0;
        pixels[2] = 0;

        TinyPngOut_write(&pngout, pixels, 1);
        TinyPngOut_write(&pngout, pixels, 1);



        //Now we'll do the rows in-between. We'll only draw something if there's a downward connection.
        if (i != GRID_SIZE - 1)
        {
            for (j = 0; j < GRID_SIZE; j++)
            {
                h = ((double) grid[GRID_SIZE * i + j] / (double) max_distance) * .857142;
                k = (int) (h * 6);
                f = h * 6 - k;
                p = v * (1 - s);
                q = v * (1 - f * s);
                t = v * (1 - (1 - f) * s);

                switch ((int) k % 6)
                {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }

                r *= 255;
                g *= 255;
                b *= 255;

                pixels[0] = (uint8_t) r;
                pixels[1] = (uint8_t) g;
                pixels[2] = (uint8_t) b;



                if (connection_directions[GRID_SIZE * i + j][2])
                {
                    TinyPngOut_write(&pngout, pixels, 1);
                }

                else
                {
                    pixels[0] = 0;
                    pixels[1] = 0;
                    pixels[2] = 0;

                    TinyPngOut_write(&pngout, pixels, 1);
                }


                if (j != GRID_SIZE - 1)
                {
                    pixels[0] = 0;
                    pixels[1] = 0;
                    pixels[2] = 0;

                    TinyPngOut_write(&pngout, pixels, 1);
                }
            }
        }



        //And here's the right border.
        pixels[0] = 0;
        pixels[1] = 0;
        pixels[2] = 0;

        TinyPngOut_write(&pngout, pixels, 1);
    }

    //Finally, there's the bottom border.
    pixels[0] = 0;
    pixels[1] = 0;
    pixels[2] = 0;

    for (j = 0; j < 2 * GRID_SIZE + 1; j++)
    {
        TinyPngOut_write(&pngout, pixels, 1);
    }

    TinyPngOut_write(&pngout, NULL, 0);



    fclose(output);
}
