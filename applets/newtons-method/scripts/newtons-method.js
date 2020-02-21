!function()
{
	"use strict";
	
	
	
	let canvas_size = 500;
	
	let canvas_scale_factor = null;
	
	let ctx = document.querySelector("#newtons-method-plot").getContext("2d");
	
	
	
	let polynomial = [[-1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0]];
	
	let derivative = polynomial_derivative(polynomial);
	
	let roots = [[0, 1], [-1, 0], [0, -1], [1, 0], [.707, .707], [.707, -.707], [-.707, .707], [-.707, -.707]];
	
	const threshold = .01;
	
	let brightness_map = [];
	let closest_roots = [];
	
	let max_brightness = 0;
	let min_brightness = Infinity;

	const factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
	
	const colors =
	[
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
		
		[255, 255, 0],
		[255, 0, 255],
		[0, 255, 255],
		
		[255, 255, 255],
		
		[255, 127, 0],
		[255, 0, 127],
		[127, 255, 0],
		[0, 255, 127],
		[127, 0, 255],
		[0, 127, 255]
	];
	
	
	
	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", function()
	{
		draw_newtons_method_plot();
	});
	
	document.querySelector("#dim-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			request_wilson_graph(false);
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	
	
	function draw_newtons_method_plot()
	{
		document.querySelector("#newtons-method-plot").setAttribute("width", canvas_size);
		document.querySelector("#newtons-method-plot").setAttribute("height", canvas_size);
		
		
		
		for (let i = 0; i < canvas_size; i++)
		{
			closest_roots[i] = [];
			
			brightness_map[i] = [];
			
			
			
			for (let j = 0; j < canvas_size; j++)
			{
				brightness_map[i][j] = 0;
				
				closest_roots[i][j] = -1;
				
				
				
				let x = ((j - canvas_size/2) / canvas_size) * 4;
				let y = (-(i - canvas_size/2) / canvas_size) * 4;
				
				let z = [x, y];

				
				
				
				for (let iteration = 0; iteration < 100; iteration++)
				{
					let temp = complex_multiply(complex_polynomial(polynomial, z), complex_invert(complex_polynomial(derivative, z)));
					
					z[0] = z[0] - temp[0];
					z[1] = z[1] - temp[1];
					
					
					
					//If we're very close a root, stop.
					let found_a_root = false;
					
					for (let k = 0; k < roots.length; k++)
					{
						if (complex_magnitude([z[0] - roots[k][0], z[1] - roots[k][1]]) <= threshold * threshold)
						{
							closest_roots[i][j] = k;
							
							brightness_map[i][j] = Math.sqrt(iteration);
							
							if (brightness_map[i][j] > max_brightness)
							{
								max_brightness = brightness_map[i][j];
							}
							
							if (brightness_map[i][j] < min_brightness)
							{
								min_brightness = brightness_map[i][j];
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
		
		
		
		draw_canvas_with_smooth_edges();
	}
	
	
	
	function draw_canvas()
	{
		for (let i = 0; i < canvas_size; i++)
		{
			for (let j = 0; j < canvas_size; j++)
			{
				brightness_map[i][j] -= min_brightness;
				
				brightness_map[i][j] /= (max_brightness - min_brightness);
				
				brightness_map[i][j] = 1 - brightness_map[i][j];
				
				let closest_root = closest_roots[i][j];
				
				if (closest_root !== -1)
				{
					let r = colors[closest_root][0] * brightness_map[i][j];
					let g = colors[closest_root][1] * brightness_map[i][j];
					let b = colors[closest_root][2] * brightness_map[i][j];
					
					ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
				}
				
				else
				{
					ctx.fillStyle = "rgb(0, 0, 0)";
				}
				
				ctx.fillRect(j, i, 1, 1);
			}
		}
	}
	
	
	
	function draw_canvas_with_smooth_edges()
	{
		gaussian_blur_canvas(10);
		
		gaussian_blur_canvas(5);
		
		gaussian_blur_canvas(2);
		
		draw_canvas();
	}
	
	
	
	function gaussian_blur_canvas(blur_radius)
	{
		for (let i = blur_radius; i < canvas_size - blur_radius; i++)
		{
			for (let j = blur_radius; j < canvas_size - blur_radius; j++)
			{
				let brightness_sum = 0;
				
				//Look around with radius blur_radius. If all the pixels have the same color, then we let this pixel be the average of those colors.
				let color_differs = false;
				
				for (let k = i - blur_radius; k <= i + blur_radius; k++)
				{
					for (let l = j - blur_radius; l <= j + blur_radius; l++)
					{
						if (closest_roots[k][l] !== closest_roots[i][j])
						{
							color_differs = true;
							break;
						}
						
						brightness_sum += brightness_map[k][l];
					}
					
					if (color_differs)
					{
						break;
					}
				}
				
				if (color_differs)
				{
					continue;
				}
				
				brightness_map[i][j] = brightness_sum / ((2 * blur_radius + 1) * (2 * blur_radius + 1));
			}
		}
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

	//Returns z^n.
	function complex_power(z, n)
	{
		if (n === 0)
		{
			return [1, 0];
		}
		
		
		
		let result = [0, 0];
		
		for (let k = 0; k <= n; k++)
		{
			let coefficient = factorials[n]/(factorials[k] * factorials[n - k]) * Math.pow(z[0], k) * Math.pow(z[1], n - k);
			
			switch ((n - k) % 4)
			{
				case 0:
					result[0] += coefficient;
					break;
				
				case 1:
					result[1] += coefficient;
					break;
				
				case 2:
					result[0] -= coefficient;
					break;
				
				case 3:
					result[1] -= coefficient;
					break;
			}
		}
		
		return result;
	}

	//Returns f(z) for a polynomial f.
	function complex_polynomial(f, z)
	{
		let result = [0, 0];
		
		for (let i = 0; i < f.length; i++)
		{
			if (f[i][0] !== 0 || f[i][1] !== 0)
			{
				let term = complex_multiply(f[i], complex_power(z, i));
				
				result[0] += term[0];
				result[1] += term[1];
			}
		}
		
		return result;
	}

	//Returns f' for a polynomial f.
	function polynomial_derivative(f)
	{
		let derivative = [];
		
		for (let i = 1; i < f.length; i++)
		{
			derivative.push([i * f[i][0], i * f[i][1]]);
		}
		
		return derivative;
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "wilsons-algorithm.png";
		
		link.href = document.querySelector("#grid-graph").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#grid-graph").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#grid-graph").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}
}()