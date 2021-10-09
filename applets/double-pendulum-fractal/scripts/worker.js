"use strict";



onmessage = function(e)
{
	image_size = e.data[0];
	dt = e.data[1];
	
	draw_double_pendulum_fractal();
}



let image_size = null;

let dt = null;


function draw_double_pendulum_fractal()
{
	let state = new Array(image_size * image_size * 2);
	
	let image = new Uint8ClampedArray(image_size * image_size * 4);
	
	
	
	for (let i = 0; i < image_size / 2; i++)
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
			
			
			
			let index_2 = 4 * (image_size * (image_size - i - 1) + (image_size - j - 1));
			
			image[index_2] = 0;
			image[index_2 + 1] = 0;
			image[index_2 + 2] = 0;
			image[index_2 + 3] = 255;
		}
	}
	
	
	
	while (true)
	{
		for (let i = 0; i < image_size / 2; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				let index = 4 * (image_size * i + j);
				
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
				
				let p_1 = state[index + 2] / Math.PI;
				let p_2 = state[index + 3] / Math.PI;
				
				
				let hue = Math.atan2(y, x) / Math.PI + 1;
				let saturation = Math.min((x*x + y*y) * 100, 1);
				
				let value_add = .9 * (1 - ((i / image_size - .5) * (i / image_size - .5) + (j / image_size - .5) * (j / image_size - .5)) * 4);
				
				let value = Math.min(Math.pow(p_1*p_1 + p_2*p_2, .5) + value_add, 1);
				
				let rgb = HSVtoRGB(hue, saturation, value);
				
				image[index] = rgb[0];
				image[index + 1] = rgb[1];
				image[index + 2] = rgb[2];
				
				
				
				let index_2 = 4 * (image_size * (image_size - i - 1) + (image_size - j - 1));
				
				image[index_2] = rgb[0];
				image[index_2 + 1] = rgb[1];
				image[index_2 + 2] = rgb[2];
				image[index_2 + 3] = 255;
			}
		}
		
		
		
		postMessage([image]);
	}
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