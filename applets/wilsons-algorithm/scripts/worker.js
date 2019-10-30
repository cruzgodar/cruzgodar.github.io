onmessage = async function(e)
{
	grid_size = e.data[0];
	
	await draw_wilson_graph(grid_size);
	
	await color_graph(grid_size);
}



let grid_size = null;

let edges_in_tree = [];
let vertices_not_in_tree = [];

let new_vertices = [];

let current_row = null;
let current_column = null;



function draw_wilson_graph(grid_size)
{
	return new Promise(async function(resolve, reject)
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
		
		postMessage([2 * vertices_not_in_tree[new_index][1] + 1, 2 * vertices_not_in_tree[new_index][0] + 1, 1, 1, "rgb(255, 255, 255)"]);
		
		vertices_not_in_tree.splice(new_index, 1);
		
		
		
		while (vertices_not_in_tree.length > 0)
		{
			await wilson_step(grid_size);
		}
		
		
		
		resolve();
	});
}



function wilson_step(grid_size)
{
	//We need a promise so that we can have this function actually take time to run.
	return new Promise(async function(resolve, reject)
	{
		new_vertices = [];
		
		
		
		//Pick a random vertex not in the graph.
		let new_index = Math.floor(Math.random() * vertices_not_in_tree.length);
		
		new_vertices.push(vertices_not_in_tree[new_index]);
		
		
		
		//Now perform a loop-erased random walk starting from this vertex until we hit the tree.
		current_row = new_vertices[0][0];
		current_column = new_vertices[0][1];
		
		random_walk();
		
		
		
		//Draw this walk.
		for (let i = 0; i < new_vertices.length - 1; i++)
		{
			await draw_line(new_vertices[i][0], new_vertices[i][1], new_vertices[i + 1][0], new_vertices[i + 1][1], "rgb(255, 255, 255)", 8);
		}
		
		
		
		//Once we leave that recursion, new_vertices is full of a loop-erased random walk that ends at a point on the tree. Now we can add all the vertices and edges.
		for (let i = 0; i < new_vertices.length - 1; i++)
		{
			let pop_index = vertex_in_array(new_vertices[i], vertices_not_in_tree);
			vertices_not_in_tree.splice(pop_index, 1);
			
			edges_in_tree.push([new_vertices[i], new_vertices[i + 1]]);
		}
		
		
		
		resolve();
	});
}



function random_walk()
{
	//Go until we hit the tree.
	while (vertex_in_array([current_row, current_column], vertices_not_in_tree) != -1)
	{
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
			current_row = new_vertices[revert_index][0];
			current_column = new_vertices[revert_index][1];
			
			new_vertices = new_vertices.slice(0, revert_index + 1);
		}
		
		else
		{
			new_vertices.push([current_row, current_column]);
		}
		
	}
}



function color_graph(grid_size)
{
	return new Promise(async function(resolve, reject)
	{
		//First, create an array whose (i, j) entry is a list of all the connection directions from vertex (i, j).
		let connection_directions = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			connection_directions[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				connection_directions[i][j] = [];
			}
		}
		
		
		
		for (let i = 0; i < edges_in_tree.length; i++)
		{
			let row_1 = edges_in_tree[i][0][0];
			let column_1 = edges_in_tree[i][0][1];
			
			let row_2 = edges_in_tree[i][1][0];
			let column_2 = edges_in_tree[i][1][1];
			
			
			
			//The rows are the same, so the direction is either left or right.
			if (row_1 == row_2)
			{
				if (!(connection_directions[row_1][Math.min(column_1, column_2)].includes(1)))
				{
					connection_directions[row_1][Math.min(column_1, column_2)].push(1);
				}
				
				if (!(connection_directions[row_2][Math.max(column_1, column_2)].includes(3)))
				{
					connection_directions[row_2][Math.max(column_1, column_2)].push(3);
				}
			}
			
			//The columns are the same, so the direction is either up or down.
			else
			{
				if (!(connection_directions[Math.min(row_1, row_2)][column_1].includes(2)))
				{
					connection_directions[Math.min(row_1, row_2)][column_1].push(2);
				}
				
				if (!(connection_directions[Math.max(row_1, row_2)][column_1].includes(0)))
				{
					connection_directions[Math.max(row_1, row_2)][column_2].push(0);
				}
			}
		}
		
		
		
		let edges_by_distance = [];
		
		
		
		//Now start at the middle of the graph. The syntax for a path is (row, column, distance from center).
		let active_paths = [];
		
		if (grid_size % 2 == 1)
		{
			active_paths = [[Math.floor(grid_size / 2), Math.floor(grid_size / 2), 0]];
		}
		
		else
		{
			active_paths =
			[
				[Math.floor(grid_size / 2) - 1, Math.floor(grid_size / 2) - 1, 0],
				[Math.floor(grid_size / 2) - 1, Math.floor(grid_size / 2), 0],
				[Math.floor(grid_size / 2), Math.floor(grid_size / 2) - 1, 0],
				[Math.floor(grid_size / 2), Math.floor(grid_size / 2), 0]
			];
		}
		
		
		
		let distance_from_center = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			distance_from_center[i] = [];
			
			for (let j = 0; j < grid_size; j++)
			{
				distance_from_center[i][j] = -1;
			}
		}
		
		
		
		//While there are still paths active, extend each one.
		while (active_paths.length > 0)
		{
			let num_active_paths = active_paths.length;
			
			
			
			//For every vertex connected to each active path end, make a new path, but only if we've never been there before.
			for (let i = 0; i < num_active_paths; i++)
			{
				let row = active_paths[i][0];
				let column = active_paths[i][1];
				let distance = active_paths[i][2];
				
				//Record how far away from the center we are.
				distance_from_center[row][column] = distance;
				
				
				
				if (connection_directions[row][column].includes(0) && distance_from_center[row - 1][column] == -1)
				{
					active_paths.push([row - 1, column, distance + 1]);
					edges_by_distance.push([[row, column], [row - 1, column], distance]);
				}
				
				if (connection_directions[row][column].includes(1) && distance_from_center[row][column + 1] == -1)
				{
					active_paths.push([row, column + 1, distance + 1]);
					edges_by_distance.push([[row, column], [row, column + 1], distance]);
				}
				
				if (connection_directions[row][column].includes(2) && distance_from_center[row + 1][column] == -1)
				{
					active_paths.push([row + 1, column, distance + 1]);
					edges_by_distance.push([[row, column], [row + 1, column], distance]);
				}
				
				if (connection_directions[row][column].includes(3) && distance_from_center[row][column - 1] == -1)
				{
					active_paths.push([row, column - 1, distance + 1]);
					edges_by_distance.push([[row, column], [row, column - 1], distance]);
				}
			}
			
			
			
			//Now remove all of the current paths.
			active_paths.splice(0, num_active_paths);
		}
		
		
		
		//Now that we finally have all the edges organized by distance, we can loop through all of them in order.
		edges_by_distance.sort((a, b) => a[2] - b[2]);
		
		//The factor of 7/6 makes the farthest color from red be colored pink rather than red again.
		let max_distance = edges_by_distance[edges_by_distance.length - 1][2] * 7/6;
		
		
		
		//We want to draw each color at once, so we need to split up the edges into sections with constant distance.
		
		let distance_breaks = [0];
		let current_distance = 0;
		
		for (let i = 0; i < edges_by_distance.length; i++)
		{
			if (edges_by_distance[i][2] > current_distance)
			{
				distance_breaks.push(i);
				current_distance++;
			}
		}
		
		distance_breaks.push(edges_by_distance.length);
		
		
		
		//No, I don't know why it has to go here. Don't ask.
		postMessage(["done"]);
		
		
		
		//Now, finally, we can draw the colors.
		for (let i = 0; i < distance_breaks.length; i++)
		{
			for (j = distance_breaks[i]; j < distance_breaks[i + 1] - 1; j++)
			{
				let rgb = HSVtoRGB(edges_by_distance[j][2] / max_distance, 1, 1);
				
				draw_line(edges_by_distance[j][0][0], edges_by_distance[j][0][1], edges_by_distance[j][1][0], edges_by_distance[j][1][1], `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, 0);
			}
			
			
			
			//We only wait for this one.
			let rgb = HSVtoRGB(edges_by_distance[j][2] / max_distance, 1, 1);
				
			await draw_line(edges_by_distance[j][0][0], edges_by_distance[j][0][1], edges_by_distance[j][1][0], edges_by_distance[j][1][1], `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, 24);
		}
		
		
		
		resolve();
	});
}



function draw_line(row_1, column_1, row_2, column_2, color, delay)
{
	return new Promise(function(resolve, reject)
	{
		if (column_1 == column_2)
		{
			let x = column_1;
			let y = Math.min(row_1, row_2);
			
			postMessage([2 * x + 1, 2 * y + 1, 1, 3, color]);
		}
		
		else
		{
			let x = Math.min(column_1, column_2);
			let y = row_1;
			
			postMessage([2 * x + 1, 2 * y + 1, 3, 1, color]);
		}
		
		
		
		setTimeout(resolve, delay);
	});
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



function HSVtoRGB(h, s, v)
{
	let r, g, b, i, f, p, q, t;
	
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	
	switch (i % 6)
	{
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
    
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}