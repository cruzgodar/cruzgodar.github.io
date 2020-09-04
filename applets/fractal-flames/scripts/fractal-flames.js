!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	let image = [];
	
	let num_iterations = 10000000;
	
	const variations = [variation_sinusoidal, variation_spherical, variation_swirl, variation_horseshoe, variation_polar, variation_handkerchief, variation_heart, variation_disc, variation_spiral, variation_hyperbolic, variation_diamond, variation_ex, variation_julia];
	
	const num_variations = variations.length;
	
	let variation_weights = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	
	let variation_coefficients = [];
	
	
	
	
	
	document.querySelector("#generate-button").addEventListener("click", draw_fractal_flame);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	function draw_fractal_flame()
	{
		document.querySelector("#output-canvas").setAttribute("width", grid_size);
		document.querySelector("#output-canvas").setAttribute("height", grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		grid_size = 1000;
		
		image = [];
		
		for (let i = 0; i < grid_size; i++)
		{
			image.push([]);
			
			for (let j = 0; j < grid_size; j++)
			{
				image[i].push(0);
			}
		}
		
		
		
		let variation_weight_sums = [variation_weights[0]];
		
		for (let i = 1; i < variation_weights.length; i++)
		{
			variation_weight_sums.push(variation_weight_sums[i - 1] + variation_weights[i]);
		}
		
		let total_variation_weight = variation_weight_sums[variation_weight_sums.length - 1];
		
		
		
		variation_coefficients = [];
		
		for (let i = 0; i < variations.length; i++)
		{
			variation_coefficients.push([]);
			
			for (let j = 0; j < 6; j++)
			{
				variation_coefficients[i].push(Math.random() * 2 - 1);
			}
		}
		
		
		
		let x = .5;
		let y = .5;
		let r = Math.sqrt(x*x + y*y);
		let theta = Math.atan2(y, x);
		
		
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			let rand = Math.floor(Math.random() * total_variation_weight);
			
			let variation_index = 0;
			
			while (rand > variation_weight_sums[variation_index])
			{
				variation_index++;
			}
			
			
			
			let input_x = variation_coefficients[variation_index][0] * x + variation_coefficients[variation_index][1] * y + variation_coefficients[variation_index][2];
			
			let input_y = variation_coefficients[variation_index][3] * x + variation_coefficients[variation_index][4] * y + variation_coefficients[variation_index][5];
			
			let input_r = Math.sqrt(input_x*input_x + input_y*input_y);
			let input_theta = Math.atan2(input_y, input_x);
			
			let result = variations[variation_index](input_x, input_y, input_r, input_theta);
			
			
			
			x = result[0];
			y = result[1];
			
			let row = Math.floor((1 - y) / 2 * grid_size);
			let col = Math.floor((1 + x) / 2 * grid_size);
			
			if (row >= 0 && row < grid_size && col >= 0 && col < grid_size)
			{
				image[row][col]++;
			}
		}
		
		
		
		let max_brightness = 0;
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				if (max_brightness > image[i][j])
				{
					max_brightness = image[i][j];
				}
			}
		}
		
		let img_data = ctx.getImageData(0, 0, grid_size, grid_size);
		let data = img_data.data;
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				//The index in the array of rgba values
				let index = (4 * i * grid_size) + (4 * j);
				
				let brightness = image[i][j] / max_brightness * 255;
				
				data[index] = brightness;
				data[index + 1] = brightness;
				data[index + 2] = brightness;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
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
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "fractal-flame.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()