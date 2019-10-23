onmessage = function(e)
{
	grid_size = e.data[0];
	
	draw_wilson_graph(grid_size);
}



let grid_size = null;

let edges_in_tree = [];
let vertices_not_in_tree = [];

let new_vertices = [];

let current_row = null;
let current_column = null;



function draw_wilson_graph(grid_size)
{
	edges_in_tree = [];
	
	//This is a one-dimensional list of length n*n, where the vertex (i, j) is at position n*i + j.
	vertices_not_in_tree = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			vertices_not_in_tree[grid_size * i + j] = [i, j];
		}
	}
	
	
	
	//Start at a random vertex.
	let new_index = Math.floor(Math.random() * vertices_not_in_tree.length);
	
	vertices_not_in_tree.splice(new_index, 1);
	
	
	
	wilson_step(grid_size);
}



function wilson_step(grid_size)
{
	new_vertices = [];
	
	
	
	//Pick a random vertex not in the graph.
	let new_index = Math.floor(Math.random() * vertices_not_in_tree.length);
	
	new_vertices.push(vertices_not_in_tree[new_index]);
	
	
	
	//Now perform a loop-erased random walk starting from this vertex until we hit the tree.
	
	current_row = new_vertices[0][0];
	current_column = new_vertices[0][1];
	
	
	
	random_walk_step();
	
	
	
	//Once we leave that recursion, new_vertices is full of a loop-erased random walk that ends at a point on the tree. Now we can add all the vertices and edges.
	for (let i = 0; i < new_vertices.length - 1; i++)
	{
		let pop_index = vertex_in_array(new_vertices[i], vertices_not_in_tree);
		vertices_not_in_tree.splice(pop_index, 1);
		
		edges_in_tree.push([new_vertices[i], new_vertices[i + 1]]);
	}
	
	
	
	//If there are still vertices to add, then keep adding them. Otherwise, we're done.
	if (vertices_not_in_tree.length == 0)
	{
		return;
	}
	
	setTimeout(function()
	{
		wilson_step(grid_size);
	}, 8);
}



function random_walk_step()
{
	//return new Promise(function(resolve, reject)
	
		//Move either up, left, down, or right. 0 = up, 1 = left, 2 = down, and 3 = right.
			
		let possible_directions = [];
		
		
		
		if (current_row == 0 && current_column == 0)
		{
			possible_directions = [1, 2];
		}
		
		else if (current_row == grid_size - 1 && current_column == 0)
		{
			possible_directions = [0, 1];
		}
		
		else if (current_row == 0 && current_column == grid_size - 1)
		{
			possible_directions = [2, 3];
		}

		else if (current_row == grid_size - 1 && current_column == grid_size - 1)
		{
			possible_directions = [0, 3]
		}



		//Edges
		else if (current_row == 0)
		{
			possible_directions = [1, 2, 3];
		}
			
		else if (current_row == grid_size - 1)
		{
			possible_directions = [0, 1, 3];
		}

		else if (current_column == 0)
		{
			possible_directions = [0, 1, 2];
		}
		
		else if (current_column == grid_size - 1)
		{
			possible_directions = [0, 2, 3];
		}



		//Everything else
		else
		{
			possible_directions = [0, 1, 2, 3];
		}
		
		
		
		let direction = possible_directions[Math.floor(Math.random() * possible_directions.length)];
		
		
		
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
		
		
		
		
		//If not, then we need to know when we hit our own random walk -- before we can put our new vertex into the walk, we need to see if we've already been there.
		let revert_index = vertex_in_array([current_row, current_column], new_vertices);
		
		if (revert_index != -1)
		{
			//Erase this part of the walk from the graph.
			for (let i = revert_index; i < new_vertices.length - 1; i++)
			{
				draw_line(new_vertices[i][1], new_vertices[i][0], new_vertices[i + 1][1], new_vertices[i + 1][0], 0);
			}
			
			
			
			current_row = new_vertices[revert_index][0];
			current_column = new_vertices[revert_index][1];
			
			
			
			new_vertices = new_vertices.slice(0, revert_index + 1);
		}
		
		else
		{
			//Send back the parameters that should be given to ctx.fillRect.
			let index = new_vertices.length - 1;
			
			if (index >= 0)
			{
				draw_line(new_vertices[index][1], new_vertices[index][0], current_column, current_row, 1);
			}
			
			new_vertices.push([current_row, current_column]);
		}
		
		
		
		//If we hit the tree, we're done.
		if (vertex_in_array([current_row, current_column], vertices_not_in_tree) == -1)
		{
			return;
		}
		
		
		for (let i = 0; i < 50000000; i++) {}
		
		
		random_walk_step();
		
		
		/*
		setTimeout(async function()
		{
			//await random_walk_step();
			
			resolve();
		}, 5);
		
		resolve();
	}); */
}



function draw_line(x_1, y_1, x_2, y_2, color)
{
	if (x_1 == x_2)
	{
		let x = x_1;
		let y = Math.min(y_1, y_2);
		
		postMessage([2 * x + 1, 2 * y + 1, 1, 3, color]);
	}
	
	else
	{
		let x = Math.min(x_1, x_2);
		let y = y_1;
		
		postMessage([2 * x + 1, 2 * y + 1, 3, 1, color]);
	}
}



function vertex_in_array(element, array)
{
	for (let i = 0; i < array.length; i++)
	{
		if (array[i][0] == element[0] && array[i][1] == element[1])
		{
			return i;
		}
	}
	
	return -1;
}