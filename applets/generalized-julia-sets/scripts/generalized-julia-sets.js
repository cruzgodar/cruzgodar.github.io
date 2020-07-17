!function()
{
	"use strict";
	
	
	
	let last_a = 0;
	let last_b = 0;
	
	let small_canvas_size = 0;
	let large_canvas_size = 0;

	let small_julia_size = 100;
	let large_julia_size = 500;

	let small_julia_iterations = 25;
	let large_julia_iterations = 50;
	let full_res_julia_iterations = 200;
	
	let max_brightness_history = [];

	let image = [];

	let persist_image = false;
	
	let code_string = "";
	let custom_iteration_function = null;
	
	let box_size = 4;
	
	let exposure = 5;
	
	let escape_radius = 100;

	let ctx = null;
	
	let web_worker = null;
	
	
	
	const presets = [
		["z.pow(2).add(c)", 4, 1, 100],
		["z.pow(4).add(c)", 4, 1, 100],
		["z.sin().add(c)", 10, 2, 100],
		["z.sin().mul(c)", 10, 1, 100],
		["z.mul(c).sin()", 10, 1, 100]
	];



	adjust_for_settings();
	
	
	
	if (scripts_loaded["complexjs"] === false)
	{
		load_script("/scripts/complex.min.js")
		
		.then(function()
		{
			scripts_loaded["complexjs"] = true;
		})
		
		.catch(function(error)
		{
			console.error("Could not load ComplexJS");
		});
	}



	document.querySelector("#generate-button-1").addEventListener("click", prepare_new_code);
	
	let elements = document.querySelectorAll("#code-input, #box-size-input, #exposure-input, #escape-radius-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				prepare_new_code();
			}
		});
	}
	
	
	
	document.querySelector("#generate-button-2").addEventListener("click", draw_high_res_julia);
	
	elements = document.querySelectorAll("#a-input, #b-input, #dim-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				draw_high_res_julia();
			}
		});
	}
	
	
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);



	//Only get the width of the Mandelbrot set has finished loading in order to get the correct value.
	small_canvas_size = document.querySelector("#julia-set").offsetWidth;
	large_canvas_size = document.querySelector("#output-canvas").offsetWidth;

	window.addEventListener("resize", julia_resize);
	temporary_handlers["resize"].push(julia_resize);

	setTimeout(julia_resize, 1000);



	//As the user scrolls around the image, make tiny Julia set previews.
	init_listeners_no_touch();
	init_listeners_touch();

	
	
	
	
	function prepare_new_code()
	{
		box_size = parseFloat(document.querySelector("#box-size-input").value || 4);
		
		exposure = parseFloat(document.querySelector("#exposure-input").value || 5);
		
		escape_radius = parseFloat(document.querySelector("#escape-radius-input").value || 100);
		
		code_string = document.querySelector("#code-input").value || "z.pow(2).add(c)";
		custom_iteration_function = create_custom_iteration_function(code_string);
		
		draw_mandelbrot_set(500, 50);
	}
	
	
	
	function draw_mandelbrot_set(mandelbrot_size, num_iters)
	{
		image = [];
		
		for (let i = 0; i < mandelbrot_size; i++)
		{
			image[i] = [];
		}
		
		
		
		let ctx = null;
		let canvas_size = 0;
		
		
		
		document.querySelector("#mandelbrot-set").setAttribute("width", mandelbrot_size);
		document.querySelector("#mandelbrot-set").setAttribute("height", mandelbrot_size);
		
		ctx = document.querySelector("#mandelbrot-set").getContext("2d", {alpha: false});
		
		
		
		//Generate the brightness map.
		for (let i = 0; i < mandelbrot_size; i++)
		{
			mandelbrot_row(i, mandelbrot_size, num_iters);
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = brightness_array[Math.round(brightness_array.length * (1 - exposure/200)) - 1];
		
		
		
		
		for (let i = 0; i < mandelbrot_size; i++)
		{		
			image[i] = image[i].map(brightness => (brightness / max_brightness) * 255);
		}
		
		
		
		//Copy this array into the canvas like an image.
		let img_data = ctx.getImageData(0, 0, mandelbrot_size, mandelbrot_size);
		let data = img_data.data;
		
		for (let i = 0; i < mandelbrot_size; i++)
		{
			for (let j = 0; j < mandelbrot_size; j++)
			{
				let brightness = image[i][j];
				
				//The index in the array of rgba values
				let index = (4 * i * mandelbrot_size) + (4 * j);
				
				data[index] = brightness/3;
				data[index + 1] = brightness/3;
				data[index + 2] = brightness;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
	}



	function mandelbrot_row(i, mandelbrot_size, num_iters)
	{
		for (let j = 0; j < mandelbrot_size; j++)
		{
			let x = ((j - mandelbrot_size/2) / mandelbrot_size) * box_size;
			let y = (-(i - mandelbrot_size/2) / mandelbrot_size) * box_size;
			
			let z = new Complex([x, y]);
			let c = new Complex([x, y]);
			
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
	
	
	
	function draw_julia_set(a, b, julia_size, num_iters)
	{
		image = [];
		
		for (let i = 0; i < julia_size; i++)
		{
			image[i] = [];
		}
		
		
		
		let ctx = null;
		let canvas_size = 0;
		
		
		
		document.querySelector("#julia-set").setAttribute("width", julia_size);
		document.querySelector("#julia-set").setAttribute("height", julia_size);
		
		ctx = document.querySelector("#julia-set").getContext("2d", {alpha: false});
		
		
		
		//Generate the brightness map.
		for (let i = 0; i < julia_size; i++)
		{
			julia_row(i, a, b, julia_size, num_iters);
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = 0;
		
		if (julia_size === small_julia_size)
		{
			max_brightness_history.push(brightness_array[Math.round(brightness_array.length * (1 - exposure/200)) - 1]);
			
			if (max_brightness_history.length > 10)
			{
				max_brightness_history.shift();
			}
			
			max_brightness = 0;
			
			for (let i = 0; i < max_brightness_history.length; i++)
			{
				max_brightness += max_brightness_history[i];
			}
			
			max_brightness /= max_brightness_history.length;
		}
		
		else
		{
			max_brightness = brightness_array[Math.round(brightness_array.length * (1 - exposure/2000)) - 1];
		}
		
		
		
		
		for (let i = 0; i < julia_size; i++)
		{		
			image[i] = image[i].map(brightness => (brightness / max_brightness) * 255);
		}
		
		
		
		//Copy this array into the canvas like an image.
		let img_data = ctx.getImageData(0, 0, julia_size, julia_size);
		let data = img_data.data;
		
		for (let i = 0; i < julia_size; i++)
		{
			for (let j = 0; j < julia_size; j++)
			{
				let brightness = image[i][j];
				
				//The index in the array of rgba values
				let index = (4 * i * julia_size) + (4 * j);
				
				data[index] = brightness/3;
				data[index + 1] = brightness/3;
				data[index + 2] = brightness;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
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



	function prepare_download()
	{
		let link = document.createElement("a");
		
		
		
		if (last_b < 0)
		{
			link.download = last_a + " - " + (-last_b) + "i.png";
		}
		
		else
		{
			link.download = last_a + " + " + last_b + "i.png";
		}
		
		
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function draw_high_res_julia()
	{
		let a = parseFloat(document.querySelector("#a-input").value) || 0;
		let b = parseFloat(document.querySelector("#b-input").value) || 1;
		let dim = parseFloat(document.querySelector("#dim-input").value) || 1000;
		
		document.querySelector("#output-canvas").setAttribute("width", dim);
		document.querySelector("#output-canvas").setAttribute("height", dim);
		
		ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
		
		last_a = a;
		last_b = b;
		
		
		
		document.querySelector("#progress-bar span").insertAdjacentHTML("afterend", `<span></span>`);
		document.querySelector("#progress-bar span").remove();
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/generalized-julia-sets/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/generalized-julia-sets/scripts/worker.min.js");
		}
		
		temporary_web_workers.push(web_worker);
		
		
		
		web_worker.onmessage = function(e)
		{
			if (e.data[0] === "progress")
			{
				document.querySelector("#progress-bar span").style.width = e.data[1] + "%";
				
				if (e.data[1] === 100)
				{
					setTimeout(function()
					{
						document.querySelector("#progress-bar").style.opacity = 0;
						
						setTimeout(function()
						{
							document.querySelector("#progress-bar").style.marginTop = 0;
							document.querySelector("#progress-bar").style.marginBottom = 0;
						}, 300);
					}, 600);
				}
			}
			
			
			
			else
			{
				let img_data = ctx.getImageData(0, 0, dim, dim);
				let data = img_data.data;
				
				for (let i = 0; i < dim; i++)
				{
					for (let j = 0; j < dim; j++)
					{
						let brightness = e.data[0][i][j];
						 
						//The index in the array of rgba values
						let index = (4 * i * dim) + (4 * j);
						
						data[index] = brightness/3;
						data[index + 1] = brightness/3;
						data[index + 2] = brightness;
						data[index + 3] = 255; //No transparency.
					}
				}
				
				ctx.putImageData(img_data, 0, 0);
				
				
				
				document.querySelector("#progress-bar").style.opacity = 0;
				
				setTimeout(function()
				{
					document.querySelector("#progress-bar").style.marginTop = 0;
					document.querySelector("#progress-bar").style.marginBottom = 0;
				}, 300);
			}
		}
		
		
		
		document.querySelector("#progress-bar span").style.width = 0;
		document.querySelector("#progress-bar").style.marginTop = "5vh";
		document.querySelector("#progress-bar").style.marginBottom = "5vh";
		
		setTimeout(function()
		{
			document.querySelector("#progress-bar").style.opacity = 1;
		}, 600);
		
		
		
		web_worker.postMessage([a, b, dim, full_res_julia_iterations, code_string, box_size, exposure, escape_radius]);
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#julia-set").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#julia-set").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}



	function init_listeners_no_touch()
	{
		document.querySelector("#mandelbrot-set").addEventListener("mousemove", function(e)
		{
			if (persist_image === false)
			{
				let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
				let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
				
				let a = ((mouse_x / small_canvas_size) - .5) * box_size;
				let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * box_size;
				
				draw_julia_set(a, b, small_julia_size, small_julia_iterations);
			}
		});
		
		
		
		//On a click, make a much larger image.
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			let a = ((mouse_x / small_canvas_size) - .5) * box_size;
			let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * box_size;
			
			draw_julia_set(a, b, large_julia_size, large_julia_iterations);
			
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
			
			persist_image = true;
		});
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("mouseleave", function(e)
		{
			persist_image = false;
		});
	}



	function init_listeners_touch()
	{
		let last_touch_x = 0;
		let last_touch_y = 0;
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
				
			let touch_x = e.touches[0].clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let touch_y = e.touches[0].clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			last_touch_x = touch_x;
			last_touch_y = touch_y;
			
			let a = ((touch_x / small_canvas_size) - .5) * box_size;
			let b = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * box_size;
			
			draw_julia_set(a, b, small_julia_size, small_julia_iterations);
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			let a = ((last_touch_x / small_canvas_size) - .5) * box_size;
			let b = (((small_canvas_size - last_touch_y) / small_canvas_size) - .5) * box_size;
			
			draw_julia_set(a, b, large_julia_size, large_julia_iterations);
			
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
		}, false);
	}



	function julia_resize()
	{
		small_canvas_size = document.querySelector("#julia-set").offsetWidth;
		large_canvas_size = document.querySelector("#output-canvas").offsetWidth;
	}
}()