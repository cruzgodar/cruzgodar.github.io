!function()
{
	"use strict";
	
	
	
	let canvas_size = null;
	
	let current_roots = [];
	
	let num_iterations = 100;
	
	let ctx = document.querySelector("#newtons-method-plot").getContext("2d");
	
	
	
	const threshold = .05;
	
	let brightness_map = [];
	let closest_roots = [];
	
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
			draw_newtons_method_plot(roots, true);
		}
	});
	
	
	
	
	
	function draw_newtons_method_plot(roots, reduce_banding)
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
				
				//Here's the idea. As we bounce from place to place, everything we pass is on the same road we are, eventually, so we'll just keep track of everywhere where we've been and what those will eventually go to.
				let zs_along_for_the_ride = [];
				
				
				
				for (let iteration = 0; iteration < num_iterations; iteration++)
				{
					let temp = complex_multiply(complex_polynomial(roots, z), complex_invert(complex_derivative(roots, z)));
					
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
						if (complex_magnitude([z[0] - roots[k][0], z[1] - roots[k][1]]) <= threshold * threshold)
						{
							closest_roots[i][j] = k;
							
							brightness_map[i][j] = iteration;
							
							
							
							//Now we can go back and update all those free riders.
							for (let l = 0; l < zs_along_for_the_ride.length; l++)
							{
								brightness_map[zs_along_for_the_ride[l][0][0]][zs_along_for_the_ride[l][0][1]] = iteration - zs_along_for_the_ride[l][1];
								
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
		
		
		
		if (reduce_banding)
		{
			draw_canvas_with_smooth_edges();
		}
		
		else
		{
			draw_canvas();
		}
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
				brightness_map[i][j] = Math.sqrt(brightness_map[i][j]);
				
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
	
	
	
	function draw_canvas_with_smooth_edges()
	{
		gaussian_blur_canvas(Math.floor(canvas_size / 50));
		
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
	
	
	
	function draw_high_res_plot()
	{
		canvas_size = parseInt(document.querySelector("#dim-input").value || 1000);
		
		draw_newtons_method_plot(current_roots, true);
		
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
	
	
	
	let root_markers = [];
	
	let active_marker = -1;
	
	let root_selector_width = document.querySelector("#root-selector").offsetWidth;
	let root_selector_height = document.querySelector("#root-selector").offsetHeight;
	
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
		
		canvas_size = 100;
				
		draw_newtons_method_plot(current_roots, false);
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
				
				active_marker = i;
				
				break;
			}
		}
	}
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			canvas_size = 500;
			
			draw_newtons_method_plot(current_roots, true);
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
		
		draw_newtons_method_plot(current_roots, false);
	}
	
	
	
	//Spreads the roots in an even radius.
	function spread_roots()
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
		
		canvas_size = 500;
		
		draw_newtons_method_plot(current_roots, true);
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