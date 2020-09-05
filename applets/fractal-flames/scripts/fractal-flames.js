!function()
{
	"use strict";
	
	
	
	let grid_size = null;
	let scaled_grid_size = null;
	
	let ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
	
	let web_worker = null;
	
	const variations = [variation_sinusoidal, variation_spherical, variation_swirl, variation_horseshoe, variation_polar, variation_handkerchief, variation_heart, variation_disc, variation_spiral, variation_hyperbolic, variation_diamond, variation_ex, variation_julia];
	
	
	
	document.querySelector("#generate-button").addEventListener("click", draw_fractal_flame);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function draw_fractal_flame()
	{
		scaled_grid_size = 500;
		grid_size = scaled_grid_size * 3;
		
		document.querySelector("#output-canvas").setAttribute("width", scaled_grid_size);
		document.querySelector("#output-canvas").setAttribute("height", scaled_grid_size);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, grid_size, grid_size);
		
		
		
		let num_iterations = 1000000;
		
		let gamma = 2.2;
		
		
		
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
		
		
		
		let variation_weights = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		
		for (let i = 0; i < variations.length; i++)
		{
			variation_weights[i] = Math.random();
		}
		
		
		
		let variation_weight_sums = [variation_weights[0]];
		
		for (let i = 1; i < variation_weights.length; i++)
		{
			variation_weight_sums.push(variation_weight_sums[i - 1] + variation_weights[i]);
		}
		
		let total_variation_weight = variation_weight_sums[variation_weight_sums.length - 1];
		
		
		
		let variation_coefficients = [];
		
		for (let i = 0; i < variations.length; i++)
		{
			variation_coefficients.push([]);
			
			for (let j = 0; j < 6; j++)
			{
				variation_coefficients[i].push(Math.random() - .5);
			}
		}
		
		
		
		let variation_colors = [];
		
		for (let i = 0; i < variations.length; i++)
		{
			variation_colors.push(HSVtoRGB(Math.random(), 1, Math.random() * .5 + .5));
		}
		
		
		
		let symmetry = Math.floor(Math.random() * 3) + 2;
		
		
		
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
			
			
			
			//Add symmetry.
			let rotation = Math.floor(Math.random() * symmetry);
			
			if (rotation !== 0)
			{
				let r = Math.sqrt(x*x + y*y);
				let theta = Math.atan2(y, x);
				
				x = r * Math.cos(theta + 2 * Math.PI * rotation / symmetry);
				y = r * Math.sin(theta + 2 * Math.PI * rotation / symmetry);
			}
			
			
			
			let row = Math.floor((1 - y) / 2 * grid_size);
			let col = Math.floor((1 + x) / 2 * grid_size);
			
			if (row >= 0 && row < grid_size && col >= 0 && col < grid_size)
			{
				if (variations.length - symmetry > variation_index)
				{
					image[row][col][0] = (image[row][col][0] + variation_colors[variation_index][0]) * .5;
					image[row][col][1] = (image[row][col][1] + variation_colors[variation_index][1]) * .5;
					image[row][col][2] = (image[row][col][2] + variation_colors[variation_index][2]) * .5;
				}
				
				image[row][col][3]++;
			}
		}
		
		
		
		let max_alpha = 0;
		
		for (let i = 0; i < grid_size; i++)
		{
			for (let j = 0; j < grid_size; j++)
			{
				image[i][j][3] = Math.pow(image[i][j][3], 1/gamma);
				
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
				for (let k = 0; k < 4; k++)
				{
					scaled_image[Math.floor(i / 3)][Math.floor(j / 3)][k] += image[i][j][k] / 9;
				}
			}
		}
		
		
		
		let scale_factor = Math.log(max_alpha) / max_alpha;
		
		for (let i = 0; i < scaled_grid_size; i++)
		{
			for (let j = 0; j < scaled_grid_size; j++)
			{
				scaled_image[i][j][0] *= scale_factor;
				scaled_image[i][j][1] *= scale_factor;
				scaled_image[i][j][2] *= scale_factor;
			}
		}
		
		let max_values = [0, 0, 0];
		
		for (let i = 0; i < scaled_grid_size; i++)
		{
			for (let j = 0; j < scaled_grid_size; j++)
			{
				for (let k = 0; k < 3; k++)
				{
					if (scaled_image[i][j][k] > max_values[k])
					{
						max_values[k] = scaled_image[i][j][k];
					}
				}
			}
		}
		
		for (let i = 0; i < scaled_grid_size; i++)
		{
			for (let j = 0; j < scaled_grid_size; j++)
			{
				for (let k = 0; k < 3; k++)
				{
					scaled_image[i][j][k] = scaled_image[i][j][k] / max_values[k] * 255;
				}
			}
		}
		
		
		
		let img_data = ctx.getImageData(0, 0, scaled_grid_size, scaled_grid_size);
		let data = img_data.data;
		
		for (let i = 0; i < scaled_grid_size; i++)
		{
			for (let j = 0; j < scaled_grid_size; j++)
			{
				//The index in the array of rgba values
				let index = (4 * i * scaled_grid_size) + (4 * j);
				
				data[index] = scaled_image[i][j][0];
				data[index + 1] = scaled_image[i][j][1];
				data[index + 2] = scaled_image[i][j][2];
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
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "fractal-flame.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()