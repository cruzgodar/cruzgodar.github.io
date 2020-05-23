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

	let ctx = null;
	
	let web_worker = null;



	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", draw_high_res_julia);
	
	let elements = document.querySelectorAll("#a-input, #b-input, #dim-input");
	
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
		for (let i = 0; i < julia_size / 2; i++)
		{
			julia_row(i, a, b, julia_size, num_iters);
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = 0;
		
		if (julia_size === small_julia_size)
		{
			max_brightness_history.push(brightness_array[Math.round(brightness_array.length * .999) - 1]);
			
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
			max_brightness = brightness_array[Math.round(brightness_array.length * .9999) - 1];
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
				
				data[index] = 0;
				data[index + 1] = brightness;
				data[index + 2] = brightness;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
	}



	function julia_row(i, a, b, julia_size, num_iters)
	{
		for (let j = 0; j < julia_size + 1; j++)
		{
			let x = ((j - julia_size/2) / julia_size) * 4;
			let y = (-(i - julia_size/2) / julia_size) * 4;
			
			let brightness = Math.exp(-Math.sqrt(x*x + y*y));
			
			let k = 0;
			
			for (k = 0; k < num_iters; k++)
			{
				let temp_x = x*x - y*y + a;
				let temp_y = 2*x*y + b;
				
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
			
			
			
			//Reflect the top half about the origin to get the bottom half.
			image[i][j] = brightness;
			image[julia_size - i - 1][julia_size - j] = brightness;
		}
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
			web_worker = new Worker("/applets/julia-set-explorer/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/julia-set-explorer/scripts/worker.min.js");
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
						
						data[index] = 0;
						data[index + 1] = brightness;
						data[index + 2] = brightness;
						data[index + 3] = 255; //No transparency.
					}
				}
				
				ctx.putImageData(img_data, 0, 0);
				
				prepare_download();
				
				
				
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
		
		
		
		web_worker.postMessage([a, b, dim, full_res_julia_iterations]);
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
		
		
		
		if (currently_touch_device)
		{
			document.querySelector("#instructions").innerHTML = "Drag along the Mandelbrot set to preview the corresponding Julia set, and release to generate a higher-resolution image.";
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
				
				let a = ((mouse_x / small_canvas_size) - .5) * 3 - .75;
				let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * 3;
				
				draw_julia_set(a, b, small_julia_size, small_julia_iterations);
			}
		});
		
		
		
		//On a click, make a much larger image.
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			let a = ((mouse_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * 3;
			
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
			
			let a = ((touch_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * 3;
			
			draw_julia_set(a, b, small_julia_size, small_julia_iterations);
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			let a = ((last_touch_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - last_touch_y) / small_canvas_size) - .5) * 3;
			
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