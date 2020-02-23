!function()
{
	"use strict";
	
	
	
	let canvas_size = null;
	
	let current_roots = [];
	
	let num_iterations = 100;
	
	let ctx = document.querySelector("#newtons-method-plot").getContext("2d");
	
	
	
	let root_markers = [];
	
	let active_marker = -1;
	
	let root_selector_width = document.querySelector("#root-selector").offsetWidth;
	let root_selector_height = document.querySelector("#root-selector").offsetHeight;
	
	
	
	const threshold = .05;
	
	let brightness_map = [];
	let closest_roots = [];
	
	//We keep a rolling average of 10 of these to smooth out the low-res frames.
	let recent_max_brightnesses = [];
	
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
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	

	document.querySelector("#add-marker-button").addEventListener("click", add_marker);
	document.querySelector("#spread-markers-button").addEventListener("click", spread_roots);
	document.querySelector("#generate-high-res-plot-button").addEventListener("click", draw_high_res_plot);
	
	document.querySelector("#dim-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_high_res_plot();
		}
	});
	
	
	
	
	
	function draw_newtons_method_plot(roots)
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
		
		
		
		if (canvas_size === 100)
		{
			recent_max_brightnesses.push(max_brightness);
			
			if (recent_max_brightnesses.length > 10)
			{
				recent_max_brightnesses.shift();
			}
			
			let sum = 0;
			
			for (let i = 0; i < recent_max_brightnesses.length; i++)
			{
				sum += recent_max_brightnesses[i];
			}
			
			max_brightness = sum / recent_max_brightnesses.length;
		}
		
		
		
		//Copy this array into the canvas like an image.
		let img_data = ctx.getImageData(0, 0, canvas_size, canvas_size);
		let data = img_data.data;
		
		
		
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
				
				
				
				//The index in the array of rgba values.
				let index = (4 * i * canvas_size) + (4 * j);
				
				let closest_root = closest_roots[i][j];
				
				if (closest_root !== -1)
				{
					data[index] = colors[closest_root][0] * brightness_map[i][j];
					data[index + 1] = colors[closest_root][1] * brightness_map[i][j];
					data[index + 2] = colors[closest_root][2] * brightness_map[i][j];
					data[index + 3] = 255; //No transparency.
				}
				
				else
				{
					data[index] = 0;
					data[index + 1] = 0;
					data[index + 2] = 0;
					data[index + 3] = 255; //No transparency.
				}
			}
		}
		
		
		
		ctx.putImageData(img_data, 0, 0);
	}
	
	
	
	function draw_high_res_plot()
	{
		canvas_size = parseInt(document.querySelector("#dim-input").value || 1000);
		
		draw_newtons_method_plot(current_roots);
		
		prepare_download();
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
	
	
	
	function init_listeners()
	{
		document.documentElement.addEventListener("touchstart", drag_start, false);
		document.documentElement.addEventListener("touchmove", drag_move, false);
		document.documentElement.addEventListener("touchend", drag_end, false);

		document.documentElement.addEventListener("mousedown", drag_start, false);
		document.documentElement.addEventListener("mousemove", drag_move, false);
		document.documentElement.addEventListener("mouseup", drag_end, false);
		
		
		temporary_handlers["touchstart"].push(drag_start);
		temporary_handlers["touchmove"].push(drag_move);
		temporary_handlers["touchend"].push(drag_end);
		
		temporary_handlers["mousedown"].push(drag_start);
		temporary_handlers["mousemove"].push(drag_move);
		temporary_handlers["mouseup"].push(drag_end);
	}
	
	
	
	function add_marker()
	{
		if (current_roots.length === colors.length)
		{
			return;
		}
		
		
		
		let element = document.createElement("div");
		element.classList.add("root-marker");
		element.id = `root-marker-${root_markers.length}`;
		element.style.transform = `translate3d(${root_selector_width / 2 - 24}px, ${root_selector_height / 2 - 24}px, 0)`;
		
		document.querySelector("#root-selector").appendChild(element);
		
		root_markers.push(element);
		
		current_roots.push([0, 0]);
		
		recent_max_brightnesses = [];
		
		canvas_size = 100;
				
		draw_newtons_method_plot(current_roots);
	}
	
	
	
	function drag_start(e)
	{
		active_marker = -1;
		
		//Figure out which marker, if any, this is referencing.
		for (let i = 0; i < root_markers.length; i++)
		{
			if (e.target.id === `root-marker-${i}`)
			{
				e.preventDefault();
				
				recent_max_brightnesses = [];
				
				active_marker = i;
				
				break;
			}
		}
	}
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			document.body.style.WebkitUserSelect = "";
			
			canvas_size = 500;
			
			draw_newtons_method_plot(current_roots);
		}
		
		active_marker = -1;
	}
	
	function drag_move(e)
	{
		if (active_marker === -1)
		{
			return;
		}
		
		
		
		let row = null;
		let col = null;
		
		let rect = document.querySelector("#root-selector").getBoundingClientRect();
		
		if (e.type === "touchmove")
		{
			row = e.touches[0].clientY - rect.top;
			col = e.touches[0].clientX - rect.left;
		}
		
		else
		{
			row = e.clientY - rect.top;
			col = e.clientX - rect.left;
		}
		
		
		
		if (row < 24)
		{
			row = 24;
		}
		
		if (row > root_selector_height - 24)
		{
			row = root_selector_height - 24;
		}
		
		if (col < 24)
		{
			col = 24;
		}
		
		if (col > root_selector_width - 24)
		{
			col = root_selector_width - 24;
		}
		
		
		
		root_markers[active_marker].style.transform = `translate3d(${col - 24}px, ${row - 24}px, 0)`;
		
		let x = ((col - root_selector_width/2) / root_selector_width) * 4;
		let y = (-(row - root_selector_height/2) / root_selector_height) * 4;
		
		current_roots[active_marker][0] = x;
		current_roots[active_marker][1] = y;
		
		canvas_size = 100;
		
		draw_newtons_method_plot(current_roots);
	}
	
	
	
	//Spreads the roots in an even radius.
	function spread_roots(high_res = true)
	{
		for (let i = 0; i < current_roots.length; i++)
		{
			if (i < current_roots.length / 2 || current_roots.length % 2 === 1)
			{
				current_roots[i][0] = Math.cos(2 * Math.PI * 2 * i / current_roots.length);
				current_roots[i][1] = Math.sin(2 * Math.PI * 2 * i / current_roots.length);
			}
			
			else
			{
				current_roots[i][0] = Math.cos(2 * Math.PI * (2 * i + 1) / current_roots.length);
				current_roots[i][1] = Math.sin(2 * Math.PI * (2 * i + 1) / current_roots.length);
			}
			
			
			
			let row = Math.floor(root_selector_height * (1 - (current_roots[i][1] / 4 + .5)));
			let col = Math.floor(root_selector_width * (current_roots[i][0] / 4 + .5));
			
			root_markers[i].style.transform = `translate3d(${col - 24}px, ${row - 24}px, 0)`;
		}
		
		if (high_res)
		{
			canvas_size = 500;
		}
		
		else
		{
			canvas_size = 100;
		}
		
		draw_newtons_method_plot(current_roots);
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "newtons-method.png";
		
		link.href = document.querySelector("#newtons-method-plot").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#newtons-method-plot").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#newtons-method-plot").style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		if (!hasTouch())
		{
			add_style(`
				.root-marker:hover
				{
					background-color: rgb(127, 127, 127);	
				}
			`, true);
		}
	}
}()