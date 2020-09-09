"use strict";



onmessage = async function(e)
{
	flame_function_weights = e.data[0];
	scaled_grid_size = e.data[1];
	num_iterations = e.data[2];
	gamma = e.data[3];
	supersampling = e.data[4];
	
	draw_fractal_flames();
}

const variations = [variation_linear, variation_sinusoidal, variation_spherical, variation_swirl, variation_horseshoe, variation_polar, variation_handkerchief, variation_heart, variation_disc, variation_spiral, variation_hyperbolic, variation_diamond, variation_ex, variation_julia];

let flame_function_weights = [];

let flame_function_coefficients = [];

let flame_function_colors = [];

let symmetry = null;

let num_iterations = null;

let gamma = null;

let grid_size = null;
let scaled_grid_size = null;

let supersampling = null;



let average_max_rgb = 1000;





function draw_fractal_flames()
{
	flame_function_colors = [];
		
	for (let i = 0; i < flame_function_weights.length; i++)
	{
		flame_function_colors.push(i / flame_function_weights.length);
	}
	
	
	
	let coefficient_to_animate = [0, 0];
	
	//First, find an interesting flame.
	while (true)
	{
		flame_function_coefficients = [];
		
		for (let i = 0; i < flame_function_weights.length; i++)
		{
			flame_function_coefficients.push([]);
			
			for (let j = 0; j < 6; j++)
			{
				flame_function_coefficients[i].push(Math.random() - .5);
			}
		}
		
		if (draw_fractal_flame(true))
		{
			break;
		}
	}
	
	
	
	while (true)
	{
		coefficient_to_animate[0] = Math.floor(Math.random() * flame_function_weights.length);
		coefficient_to_animate[1] = Math.floor(Math.random() * 6);
		
		let old_coefficient = flame_function_coefficients[coefficient_to_animate[0]][coefficient_to_animate[1]];
		let new_coefficient = old_coefficient + (Math.random() * .25 - .125);
		
		for (let step = 0; step < 50; step++)
		{
			draw_fractal_flame(false);
			
			
			
			let interpolated_step = (Math.sin(step / 50 * Math.PI - Math.PI / 2) + 1) / 2;
			
			flame_function_coefficients[coefficient_to_animate[0]][coefficient_to_animate[1]] = old_coefficient * (1 - interpolated_step) + new_coefficient * interpolated_step;
		}
	}
}



//Draws a flame. If experimental is true, it performs a series of checks to see if the flame is an interesting one.
function draw_fractal_flame(experimental)
{
	if (supersampling)
	{
		grid_size = scaled_grid_size * 3;
	}
	
	else
	{
		grid_size = scaled_grid_size;
	}
	
	
	
	let image = [];
	
	for (let i = 0; i < grid_size; i++)
	{
		image.push([]);
		
		for (let j = 0; j < grid_size; j++)
		{
			image[i].push([0, 0, 0, 0]);
		}
	}
	
	
	
	let scaled_image = [];
	
	for (let i = 0; i < scaled_grid_size; i++)
	{
		scaled_image.push([]);
		
		for (let j = 0; j < scaled_grid_size; j++)
		{
			scaled_image[i].push([0, 0, 0, 0]);
		}
	}
	
	
	
	let x = .5;
	let y = .5;
	let color = .5;
	let r = Math.sqrt(x*x + y*y);
	let theta = Math.atan2(y, x);
	
	let num_pixels_hit = 0;
	
	
	for (let iteration = 0; iteration < num_iterations; iteration++)
	{
		let flame_function_index = Math.floor(Math.random() * flame_function_weights.length);
		
		
		
		let input_x = flame_function_coefficients[flame_function_index][0] * x + flame_function_coefficients[flame_function_index][1] * y + flame_function_coefficients[flame_function_index][2];
		
		let input_y = flame_function_coefficients[flame_function_index][3] * x + flame_function_coefficients[flame_function_index][4] * y + flame_function_coefficients[flame_function_index][5];
		
		let input_r = Math.sqrt(input_x*input_x + input_y*input_y);
		let input_theta = Math.atan2(input_y, input_x);
		
		
		
		let last_x = x;
		let last_y = y;
		
		x = 0;
		y = 0;
		
		for (let i = 0; i < variations.length; i++)
		{
			if (flame_function_weights[flame_function_index][i] !== 0)
			{
				let result = variations[i](input_x, input_y, input_r, input_theta);
				
				x += flame_function_weights[flame_function_index][i] * result[0];
				y += flame_function_weights[flame_function_index][i] * result[1];
			}
		}
		
		if (experimental && Math.abs(x - last_x) < .000001 && Math.abs(y - last_y) < .000001)
		{			
			return false;
		}
		
		
		
		color = (color + flame_function_colors[flame_function_index]) / 2;
		
		
		
		if (experimental && (x > 1000 || y > 1000 || x < -1000 || y < -1000))
		{
			return false;
		}
		
		
		
		if (iteration >= 1000)
		{
			let row = Math.floor((1 - y) / 2 * grid_size);
			let col = Math.floor((1 + x) / 2 * grid_size);
			
			if (row >= 0 && row < grid_size && col >= 0 && col < grid_size)
			{
				let rgb = HSVtoRGB(color, 1, 1);
				
				image[row][col][0] += rgb[0];
				image[row][col][1] += rgb[1];
				image[row][col][2] += rgb[2];
				
				image[row][col][3]++;
				
				if (image[row][col][3] === 5)
				{
					num_pixels_hit++;
				}
			}
		}
	}
	
	
	
	if (experimental && num_pixels_hit < 3 * grid_size)
	{
		return false;
	}
	
	
	
	let max_alpha = 0;
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			image[i][j][3] = Math.log(image[i][j][3]);
			
			if (image[i][j][3] > max_alpha)
			{
				max_alpha = image[i][j][3];
			}
		}
	}
	
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			let scale_factor = image[i][j][3] / max_alpha;
			
			image[i][j][0] *= scale_factor;
			image[i][j][1] *= scale_factor;
			image[i][j][2] *= scale_factor;
		}
	}
	
	
	
	
	let max_rgb = 0;
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			if (image[i][j][0] > max_rgb)
			{
				max_rgb = image[i][j][0];
			}
			
			if (image[i][j][1] > max_rgb)
			{
				max_rgb = image[i][j][1];
			}
			
			if (image[i][j][2] > max_rgb)
			{
				max_rgb = image[i][j][2];
			}
		}
	}
	
	average_max_rgb = .9 * average_max_rgb + .1 * max_rgb;
	
	
	
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			/*
			image[i][j][0] *= 255 / max_rgb;
			image[i][j][1] *= 255 / max_rgb;
			image[i][j][2] *= 255 / max_rgb;
			*/
			
			image[i][j][0] = 255 * Math.pow(image[i][j][0] / max_rgb, 1 / gamma);
			image[i][j][1] = 255 * Math.pow(image[i][j][1] / max_rgb, 1 / gamma);
			image[i][j][2] = 255 * Math.pow(image[i][j][2] / max_rgb, 1 / gamma);
		}
	}
	
	
	
	
	if (supersampling)
	{
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				for (let k = 0; k < 4; k++)
				{
					if (image[i][j][k] > scaled_image[Math.floor(i / 3)][Math.floor(j / 3)][k])
					{
						scaled_image[Math.floor(i / 3)][Math.floor(j / 3)][k] = image[i][j][k];
					}
				}
			}
		}
	}
	
	else
	{
		scaled_image = image;
	}
	
	
	
	postMessage([scaled_image]);
	
	
	
	return true;
}



function variation_linear(x, y, r, theta)
{
	return [x, y];
}

function variation_sinusoidal(x, y, r, theta)
{
	return [Math.sin(x), Math.sin(y)];
}

function variation_spherical(x, y, r, theta)
{
	return [x / (r*r), y / (r*r)];
}

function variation_swirl(x, y, r, theta)
{
	return [r * Math.cos(theta + r), r * Math.sin(theta + r)];
}

function variation_horseshoe(x, y, r, theta)
{
	return [r * Math.cos(2*theta), r * Math.sin(2*theta)];
}

function variation_polar(x, y, r, theta)
{
	return [theta / Math.PI, r - 1];
}

function variation_handkerchief(x, y, r, theta)
{
	return [r * Math.sin(theta + r), r * Math.cos(theta - r)];
}

function variation_heart(x, y, r, theta)
{
	return [r * Math.sin(theta*r), -Math.cos(theta*r)];
}

function variation_disc(x, y, r, theta)
{
	return [theta * Math.sin(Math.PI * r) / Math.PI, theta * Math.cos(Math.PI * r) / Math.PI];
}

function variation_spiral(x, y, r, theta)
{
	return [(Math.cos(theta) + Math.sin(r)) / r, (Math.sin(theta) - Math.cos(r)) / r];
}

function variation_hyperbolic(x, y, r, theta)
{
	return [Math.sin(theta) / r, r * Math.cos(theta)];
}

function variation_diamond(x, y, r, theta)
{
	return [Math.sin(theta) * Math.cos(r), Math.cos(theta) * Math.sin(r)];
}

function variation_ex(x, y, r, theta)
{
	let cube_1 = Math.sin(theta + r);
	cube_1 *= cube_1 * cube_1;
	
	let cube_2 = Math.cos(theta - r);
	cube_2 *= cube_2 * cube_2;
	
	return [r * cube_1, r * cube_2];
}

function variation_julia(x, y, r, theta)
{
	let omega = Math.floor(Math.random() * 2) * Math.PI;
	
	return [Math.sqrt(r) * Math.cos(theta / 2 + omega), Math.sqrt(r) * Math.sin(theta / 2 + omega)];
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