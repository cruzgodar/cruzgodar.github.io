"use strict";



onmessage = async function(e)
{
	canvas_size = e.data[0];
	current_roots = e.data[1];
	
	await draw_newtons_method_plot(current_roots);
}



let current_roots = [];

let canvas_size = null;

const num_iterations = 100;

const threshold = .05;

let brightness_map = [];
let closest_roots = [];

const colors =
[
	[255, 0, 0],
	[0, 255, 0],
	[0, 0, 255],
	
	[0, 255, 255],
	[255, 0, 255],
	[255, 255, 0],
	
	[127, 0, 255],
	[255, 127, 0]
];



function draw_newtons_method_plot(roots)
{
	let percent_step = 5;
	let num_points_plotted = 0;
	
	
	
	for (let i = 0; i < canvas_size; i++)
	{
		closest_roots[i] = [];
		
		brightness_map[i] = [];
		
		for (let j = 0; j < canvas_size; j++)
		{
			brightness_map[i][j] = 0;
			
			closest_roots[i][j] = -1;
		}
	}
	
	
	
	for (let i = 0; i < canvas_size; i++)
	{
		for (let j = 0; j < canvas_size; j++)
		{
			//If we've already been here, no need to do it again.
			if (brightness_map[i][j] !== 0)
			{
				continue;
			}
			
			
			
			let x = ((j - canvas_size/2) / canvas_size) * 4;
			let y = (-(i - canvas_size/2) / canvas_size) * 4;
			
			let z = [x, y];
			
			let last_z = [0, 0];
			
			//Here's the idea. As we bounce from place to place, everything we pass is on the same road we are, eventually, so we'll just keep track of everywhere where we've been and what those will eventually go to.
			let zs_along_for_the_ride = [];
			
			
			
			for (let iteration = 0; iteration < num_iterations; iteration++)
			{
				let temp = complex_multiply(complex_polynomial(roots, z), complex_invert(complex_derivative(roots, z)));
				
				last_z[0] = z[0];
				last_z[1] = z[1];
				
				z[0] = z[0] - temp[0];
				z[1] = z[1] - temp[1];
				
				let reverse_j = Math.floor(((z[0] / 4) * canvas_size) + canvas_size/2);
				let reverse_i = Math.floor(-(((z[1] / 4) * canvas_size) - canvas_size/2));
				
				if (reverse_i >= 0 && reverse_i < canvas_size && reverse_j >= 0 && reverse_j < canvas_size)
				{
					zs_along_for_the_ride.push([[reverse_i, reverse_j], iteration + 1]);
				}
				
				
				
				//If we're very close a root, stop.
				let found_a_root = false;
				
				for (let k = 0; k < roots.length; k++)
				{
					let d_0 = complex_magnitude([z[0] - roots[k][0], z[1] - roots[k][1]]);
					
					if (d_0 <= threshold * threshold)
					{
						let d_1 = complex_magnitude([last_z[0] - roots[k][0], last_z[1] - roots[k][1]]);
						
						//We tweak the iteration count by a little bit to produce smooth color.
						let brightness_adjust = (Math.log(threshold) - .5 * Math.log(d_0)) / (.5 * Math.log(d_1) - .5 * Math.log(d_0));
						
						closest_roots[i][j] = k;
						
						brightness_map[i][j] = iteration - brightness_adjust;
						
						
						
						//Now we can go back and update all those free riders.
						for (let l = 0; l < zs_along_for_the_ride.length; l++)
						{
							brightness_map[zs_along_for_the_ride[l][0][0]][zs_along_for_the_ride[l][0][1]] = iteration - brightness_adjust - zs_along_for_the_ride[l][1];
							
							closest_roots[zs_along_for_the_ride[l][0][0]][zs_along_for_the_ride[l][0][1]] = k;
						}
						
						
						
						num_points_plotted += zs_along_for_the_ride.length + 1;
						
						if (num_points_plotted > percent_step * canvas_size * canvas_size / 100)
						{
							postMessage(["progress", percent_step]);
							
							percent_step += 5;
						}
						
						
						
						found_a_root = true;
						
						break;
					}
				}
				
				if (found_a_root)
				{
					break;
				}
			}
		}
	}
	
	
	
	draw_canvas();
}



function draw_canvas()
{
	let max_brightness = 0;
	let min_brightness = Infinity;
	
	
	
	//First, square root everything for a darker center and then find the max and min.
	for (let i = 0; i < canvas_size; i++)
	{
		for (let j = 0; j < canvas_size; j++)
		{
			if (brightness_map[i][j] > max_brightness)
			{
				max_brightness = brightness_map[i][j];
			}
			
			if (brightness_map[i][j] < min_brightness)
			{
				min_brightness = brightness_map[i][j];
			}
		}	
	}
	
	
	
	let image_data = [];
	
	
	
	for (let i = 0; i < canvas_size; i++)
	{
		for (let j = 0; j < canvas_size; j++)
		{
			brightness_map[i][j] -= min_brightness;
			
			brightness_map[i][j] /= (max_brightness - min_brightness);
			
			brightness_map[i][j] = 1 - brightness_map[i][j];
			
			//This gives things a nice bit of tenebrism.
			brightness_map[i][j] = Math.pow(brightness_map[i][j], 1 + current_roots.length / 4);
			
			
			
			if (!(brightness_map[i][j] >= 0) && !(brightness_map[i][j] <= 1))
			{
				brightness_map[i][j] = 1;
			}
			
			
			
			let closest_root = closest_roots[i][j];
			
			if (closest_root !== -1)
			{
				image_data.push(colors[closest_root][0] * brightness_map[i][j]);
				image_data.push(colors[closest_root][1] * brightness_map[i][j]);
				image_data.push(colors[closest_root][2] * brightness_map[i][j]);
				image_data.push(255);
			}
			
			else
			{
				image_data.push(0);
				image_data.push(0);
				image_data.push(0);
				image_data.push(255);
			}
		}
	}
	
	
	
	postMessage(["img_data", image_data]);
}



//Returns ||z||.
function complex_magnitude(z)
{
	return z[0] * z[0] + z[1] * z[1];
}

//Returns z_1 * z_2.
function complex_multiply(z_1, z_2)
{
	return [z_1[0] * z_2[0] - z_1[1] * z_2[1], z_1[0] * z_2[1] + z_1[1] * z_2[0]];
}

//Returns 1/z.
function complex_invert(z)
{
	let magnitude = complex_magnitude(z);
	
	return [1/magnitude * z[0], -1/magnitude * z[1]];
}

//Returns f(z) for a polynomial f with given roots.
function complex_polynomial(roots, z)
{
	let result = [1, 0];
	
	for (let i = 0; i < roots.length; i++)
	{
		result = complex_multiply(result, [z[0] - roots[i][0], z[1] - roots[i][1]]);
	}
	
	return result;
}

//Approximates f'(z) for a polynomial f with given roots.
function complex_derivative(roots, z)
{
	let result = complex_polynomial(roots, z);
	
	let close_by = complex_polynomial(roots, [z[0] - .001, z[1]]);
	
	result[0] -= close_by[0];
	result[1] -= close_by[1];
	
	result[0] /= .001;
	result[1] /= .001;
	
	return result;
}