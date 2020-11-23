"use strict";



onmessage = async function(e)
{
	new_zoom_level = e.data[4];
	
	await draw_mandelbrot_zoom(...e.data.slice(0, 4));
}



let image = [];

let new_zoom_level = null;



function draw_mandelbrot_zoom(center_x, center_y, mandelbrot_zoom_size, num_iters)
{
	return new Promise(function(resolve, reject)
	{
		let x = 0, y = 0;
		let z = 0;
		
		image = [];
		
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{
			image[i] = [];
		}
		
		
		
		let progress_step = Math.floor(mandelbrot_zoom_size / 20);
		
		//Generate initial value map.
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{
			mandelbrot_zoom_row(i, center_x, center_y, mandelbrot_zoom_size, num_iters);
			
			if (i % progress_step === 0)
			{
				postMessage(["progress", i / progress_step * 10]);
			}
		}
		
		postMessage(["progress", 100]);
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = brightness_array[Math.round(brightness_array.length * .9999) - 1];
		
		
		
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{		
			image[i] = image[i].map(brightness => (brightness / max_brightness) * 255);
		}
		
		
		
		postMessage([image]);
		
		resolve();
	});
}



function mandelbrot_zoom_row(i, center_x, center_y, mandelbrot_zoom_size, num_iters)
{
	for (let j = 0; j < mandelbrot_zoom_size; j++)
	{	
		let x = ((j - mandelbrot_zoom_size/2) / mandelbrot_zoom_size) * new_zoom_level + center_x;
		let y = (-(i - mandelbrot_zoom_size/2) / mandelbrot_zoom_size) * new_zoom_level + center_y;
		
		let c_x = x;
		let c_y = y;
		
		let brightness = Math.exp(-Math.sqrt(x*x + y*y));
		
		let k = 0;
		
		for (k = 0; k < num_iters; k++)
		{
			let temp_x = x*x - y*y + c_x;
			let temp_y = 2*x*y + c_y;
			
			x = temp_x;
			y = temp_y;
			
			brightness += Math.exp(-Math.sqrt(x*x + y*y));
			
			if (x*x + y*y > 4)
			{
				break;
			}
		}
		
		if (k === num_iters)
		{
			brightness = 0;
		}
		
		
		
		image[i][j] = brightness;
	}
}