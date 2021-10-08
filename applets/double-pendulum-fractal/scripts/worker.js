"use strict";



onmessage = function(e)
{
	image_size = e.data[0];
	
	draw_double_pendulum_fractal();
}



let image_size = null;

let dt = .01;


function draw_double_pendulum_fractal()
{
	let state = new Array(image_size * image_size * 4);
	
	let image = new Uint8ClampedArray(image_size * image_size * 4);
	
	
	
	for (let i = 0; i < image_size; i++)
	{
		for (let j = 0; j < image_size; j++)
		{
			let index = 4 * (image_size * i + j);
			
			image[index] = 0;
			image[index + 1] = 0;
			image[index + 2] = 0;
			image[index + 3] = 255;
			
			state[index] = (j / image_size - .5) * 2 * Math.PI;
			state[index + 1] = (i / image_size - .5) * 2 * Math.PI;
			state[index + 2] = 0;
			state[index + 3] = 0;
		}
	}
	
	
	
	while (true)
	{
		for (let i = 0; i < image_size; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				let index = 4 * (image_size * i + j);
				
				//gl_FragColor = vec4(normalize(vec3(abs(state.x + state.y), abs(state.x), abs(state.y)) + .05 / length(state) * vec3(1.0, 1.0, 1.0)), 1.0);
				
				let d_theta_1 = 6 * (2 * state[index + 2] - 3 * Math.cos(state[index] - state[index + 1]) * state[index + 3]) / (16 - 9 * Math.pow(Math.cos(state[index] - state[index + 1]), 2));
				
				let d_theta_2 = 6 * (8 * state[index + 3] - 3 * Math.cos(state[index] - state[index + 1]) * state[index + 2]) / (16 - 9 * Math.pow(Math.cos(state[index] - state[index + 1]), 2));
				
				let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(state[index] - state[index + 1]) + 3 * Math.sin(state[index])) / 2;
				
				let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(state[index] - state[index + 1]) - Math.sin(state[index + 1])) / 2;
				
				
				
				state[index] += d_theta_1 * dt;
				state[index + 1] += d_theta_2 * dt;
				state[index + 2] += d_p_1 * dt;
				state[index + 3] += d_p_2 * dt;
				
				
				
				let x = state[index] / Math.PI;
				let y = state[index + 1] / Math.PI;
				
				let white_add = .05 / (Math.sqrt(x*x + y*y) + .01);
				
				let r = Math.abs(x + y) + white_add;
				let g = Math.abs(x) + white_add;
				let b = Math.abs(y) + white_add;
				
				//Normalize.
				let magnitude = Math.sqrt(r*r + g*g + b*b);
				
				image[index] = r / magnitude * 255;
				image[index + 1] = g / magnitude * 255;
				image[index + 2] = b / magnitude * 255;
			}
		}
		
		
		
		postMessage([image]);
	}
}