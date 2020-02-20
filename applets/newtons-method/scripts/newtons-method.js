!function()
{
	"use strict";
	
	
	
	let canvas_size = 500;
	
	let canvas_scale_factor = null;
	
	let ctx = document.querySelector("#newtons-method-plot").getContext("2d");
	
	
	
	let polynomial = [[1, 0], [0, 0], [0, 0], [0, 0], [1, 0]];
	
	let derivative = polynomial_derivative(polynomial);

	const factorials = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
	
	const colors =
	[
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
		[255, 255, 0],
		[255, 0, 255],
		[0, 255, 255],
		[255, 255, 255]
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
		
		let final_guesses = [];
		
		let brightness_map = [];
		
		let max_brightness = 0;
		
		
		
		for (let i = 0; i < canvas_size; i++)
		{
			final_guesses[i] = [];
			
			brightness_map[i] = [];
			
			
			
			for (let j = 0; j < canvas_size; j++)
			{
				brightness_map[i][j] = 0;
				
				
				
				let x = ((j - canvas_size/2) / canvas_size) * 4;
				let y = (-(i - canvas_size/2) / canvas_size) * 4;
				
				let z = [x, y];
				
				let brightness = 1;
				
				
				
				for (let iteration = 0; iteration < 256; iteration++)
				{
					let temp = complex_multiply(complex_polynomial(polynomial, z), complex_invert(complex_polynomial(derivative, z)));
					
					z[0] = z[0] - temp[0];
					z[1] = z[1] - temp[1];
					
					brightness -= .015;
					
					if (brightness <= 0)
					{
						brightness = 0;
						
						break;
					}
					
					
					
					//This is close enough.
					if (Math.round(temp[0] * 100) === 0 && Math.round(temp[1] * 100) === 0)
					{
						brightness_map[i][j] = brightness;
						
						break;
					}
				}
				
				//We round to two decimal places to make the mode calculations work.
				z[0] = Math.round(z[0] * 100) / 100;
				z[1] = Math.round(z[1] * 100) / 100;
				
				final_guesses[i][j] = z;
			}
		}
		
		
		
		//Now we'll find the n most common guesses and assume they're the roots.
		let possible_roots = JSON.parse(JSON.stringify(final_guesses));
		
		possible_roots = possible_roots.flat();
		
		possible_roots.sort((a, b) => a[0] - b[0]);
		
		possible_roots.sort((a, b) => a[1] - b[1]);
		
		
		
		let i = 0;
		
		while (i < possible_roots.length)
		{
			let j = i;
			let num_matches = 0;
			
			while (j < possible_roots.length && possible_roots[j][0] === possible_roots[i][0] && possible_roots[j][1] === possible_roots[i][1])
			{
				num_matches++;
				j++;
			}
			
			possible_roots[i] = [possible_roots[i], num_matches];
			
			possible_roots.splice(i + 1, num_matches - 1);
			
			i++;
		}
		
		
		
		//Sort this list descending and pull off the top n entries.
		possible_roots.sort((a, b) => b[1] - a[1]);
		
		possible_roots.splice(polynomial.length - 1);
		
		
		
		for (let i = 0; i < canvas_size; i++)
		{
			for (let j = 0; j < canvas_size; j++)
			{
				let minimum_distance = Infinity;
				let closest_root = 0;
				
				//Find the root this guess is closest to.
				for (let k = 0; k < possible_roots.length; k++)
				{
					let distance = complex_magnitude([final_guesses[i][j][0] - possible_roots[k][0][0], final_guesses[i][j][1] - possible_roots[k][0][1]]);
					
					if (distance < minimum_distance)
					{
						minimum_distance = distance;
						closest_root = k;
					}
				}
				
				
				
				let r = colors[closest_root][0] * brightness_map[i][j];
				let g = colors[closest_root][1] * brightness_map[i][j];
				let b = colors[closest_root][2] * brightness_map[i][j];
				
				ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
				
				ctx.fillRect(j, i, 1, 1);
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