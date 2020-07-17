"use strict";



onmessage = async function(e)
{
	importScripts("/scripts/complex.min.js");
	
	let a = e.data[0];
	let b = e.data[1];
	let julia_size = e.data[2];
	let num_iters = e.data[3];
	
	code_string = e.data[4];
	box_size = e.data[5];
	exposure = e.data[6];
	escape_radius = e.data[7];
	
	custom_iteration_function = create_custom_iteration_function(code_string);
	
	await draw_julia_set(a, b, julia_size, num_iters);
}



let image = [];

let custom_iteration_function = null;

let code_string = "";

let box_size = 4;

let exposure = 1;

let escape_radius = 100;



function draw_julia_set(a, b, julia_size, num_iters)
{
	return new Promise(function(resolve, reject)
	{
		image = [];
		
		for (let i = 0; i < julia_size; i++)
		{
			image[i] = [];
		}
		
		
		
		let progress_step = Math.floor(julia_size / 10);
		
		//Generate the brightness map.
		for (let i = 0; i < julia_size; i++)
		{
			julia_row(i, a, b, julia_size, num_iters);
			
			if (i % progress_step === 0)
			{
				postMessage(["progress", i / progress_step * 10]);
			}
		}
		
		postMessage(["progress", 100]);
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = brightness_array[Math.round(brightness_array.length * (1 - exposure/2000)) - 1];
		
		
		
		for (let i = 0; i < julia_size; i++)
		{		
			image[i] = image[i].map(brightness => (brightness / max_brightness) * 255);
		}
		
		
		
		postMessage([image]);
		
		resolve();
	});
}



function julia_row(i, a, b, julia_size, num_iters)
{
	let c = new Complex([a, b]);
	
	for (let j = 0; j < julia_size; j++)
	{
		let x = ((j - julia_size/2) / julia_size) * box_size;
		let y = (-(i - julia_size/2) / julia_size) * box_size;
		
		let z = new Complex([x, y]);
		
		let brightness = Math.exp(-z.abs());
		
		let k = 0;
		
		for (k = 0; k < num_iters; k++)
		{
			z = custom_iteration_function(z, c);
			
			brightness += Math.exp(-z.abs());
			
			if (z.abs() > escape_radius)
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



function create_custom_iteration_function(code_string)
{
	return new Function("z", "c", `return ${code_string}`);
}