!function()
{
	"use strict";
	
	
	
	let ctx = null;
	
	let web_worker = null;
	
	let small_canvas_size = document.querySelector("#mandelbrot-zoom").offsetWidth;
	let large_canvas_size = document.querySelector("#output-canvas").offsetWidth;

	let small_mandelbrot_zoom_size = 100;
	let large_mandelbrot_zoom_size = 500;

	let small_mandelbrot_zoom_iterations = 50;
	let large_mandelbrot_zoom_iterations = 100;

	//Where the current zoom is centered.
	let anchor_x = -.75;
	let anchor_y = 0;

	//The current parameters to pass to draw_mandelbrot_zoom, used to make high res images.
	let current_center_x = 0;
	let current_center_y = 0;
	let current_mandelbrot_zoom_size = 0;
	let current_num_iterations = 0;
	
	let last_center_x = 0;
	let last_center_y = 0;
	let last_mandelbrot_zoom_size = 0;

	let old_zoom_level = 3;
	let new_zoom_level = .6;
	
	let max_brightness_history = [];



	//When this is true, the zoom level and anchors and iteration amounts will be updated the next time a small zoom is generated. We can't just do it after a large zoom is created, since then the full res zoom will break.
	let queue_variable_change = false;

	//For the same reasons, we need these. (barf)
	let temp_anchor_x = 0;
	let temp_anchor_y = 0;

	
	
	let draw_next_frame = false;
	
	let need_to_restart = true;

	let image = [];

	let persist_image = false;



	adjust_for_settings();

	draw_initial_mandelbrot_set();




	document.querySelector("#generate-button").addEventListener("click", draw_high_res_mandelbrot_zoom);
	
	document.querySelector("#dim-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_high_res_mandelbrot_zoom();
		}
	});
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	

	window.addEventListener("resize", mandelbrot_zoom_resize);
	temporary_handlers["resize"].push(mandelbrot_zoom_resize);

	setTimeout(mandelbrot_zoom_resize, 1000);



	//As the user scrolls around the image, make tiny Julia set previews.
	init_listeners_no_touch();
	init_listeners_touch();
	
	change_resolution();
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		large_canvas_size = document.querySelector("#output-canvas").offsetWidth;
	};
	
	set_up_canvas_resizer();





	function draw_mandelbrot_zoom()
	{
		if (current_center_x === last_center_x && current_center_y === last_center_y && current_mandelbrot_zoom_size === last_mandelbrot_zoom_size)
		{
			need_to_restart = true;
			
			return;
		}
		
		if (current_mandelbrot_zoom_size !== last_mandelbrot_zoom_size)
		{
			change_resolution();
		}
		
		
		
		let x = 0;
		let y = 0;
		let z = 0;
		
		
		
		if (queue_variable_change)
		{
			old_zoom_level /= 5;
			new_zoom_level /= 5;
			
			large_mandelbrot_zoom_iterations += 150;
			small_mandelbrot_zoom_iterations += 150;
			
			anchor_x = temp_anchor_x;
			anchor_y = temp_anchor_y;
			
			queue_variable_change = false;
		}
		
		
		
		//Generate initial value map.
		for (let i = 0; i < current_mandelbrot_zoom_size; i++)
		{
			mandelbrot_zoom_row(i, current_center_x, current_center_y, current_mandelbrot_zoom_size, current_num_iterations);
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		let max_brightness = 0;
		
		if (current_mandelbrot_zoom_size === small_mandelbrot_zoom_size)
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
		
		
		
		for (let i = 0; i < current_mandelbrot_zoom_size; i++)
		{		
			image[i] = image[i].map(brightness => (brightness / max_brightness) * 255);
		}
		
		
		
		//Copy this array into the canvas like an image.
		let img_data = ctx.getImageData(0, 0, current_mandelbrot_zoom_size, current_mandelbrot_zoom_size);
		let data = img_data.data;
		
		for (let i = 0; i < current_mandelbrot_zoom_size; i++)
		{
			for (let j = 0; j < current_mandelbrot_zoom_size; j++)
			{
				let brightness = image[i][j];
				
				//The index in the array of rgba values
				let index = (4 * i * current_mandelbrot_zoom_size) + (4 * j);
				
				data[index] = 0;
				data[index + 1] = brightness;
				data[index + 2] = brightness;
				data[index + 3] = 255; //No transparency.
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
		
		
		
		if (current_mandelbrot_zoom_size === large_mandelbrot_zoom_size)
		{
			//Replace the old Mandelbrot set with the new zoomed one.
			let width = document.querySelector("#mandelbrot-set").getAttribute("width");
			
			document.querySelector("#mandelbrot-set").getContext("2d", {alpha: false}).drawImage(document.querySelector("#mandelbrot-zoom"), 0, 0, width, width);
			
			queue_variable_change = true;
			
			temp_anchor_x = current_center_x;
			temp_anchor_y = current_center_y;
			
			draw_next_frame = false;
		}
		
		
		
		last_center_x = current_center_x;
		last_center_x = current_center_x;
		last_mandelbrot_zoom_size = current_mandelbrot_zoom_size;
		
		if (draw_next_frame)
		{
			draw_next_frame = false;
			
			window.requestAnimationFrame(draw_mandelbrot_zoom);
		}
		
		else
		{
			need_to_restart = true;
		}
	}
	
	
	
	function change_resolution()
	{
		image = [];
		
		for (let i = 0; i < current_mandelbrot_zoom_size; i++)
		{
			image[i] = [];
		}
		
		
		
		document.querySelector("#mandelbrot-zoom").setAttribute("width", current_mandelbrot_zoom_size);
		document.querySelector("#mandelbrot-zoom").setAttribute("height", current_mandelbrot_zoom_size);
		
		ctx = document.querySelector("#mandelbrot-zoom").getContext("2d", {alpha: false});
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



	function prepare_download()
	{
		let link = document.createElement("a");
		
		
		
		if (current_center_y < 0)
		{
			link.download = current_center_x + " - " + (-current_center_y) + "i.png";
		}
		
		else
		{
			link.download = current_center_x + " + " + current_center_y + "i.png";
		}
		
		
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function draw_high_res_mandelbrot_zoom()
	{
		let dim = parseInt(document.querySelector("#dim-input").value || 1000);
		
		document.querySelector("#output-canvas").setAttribute("width", dim);
		document.querySelector("#output-canvas").setAttribute("height", dim);
		
		ctx = document.querySelector("#output-canvas").getContext("2d", {alpha: false});
		
		
		
		document.querySelector("#progress-bar span").insertAdjacentHTML("afterend", `<span></span>`);
		document.querySelector("#progress-bar span").remove();
		
		
		
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/mandelbrot-set-explorer/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/mandelbrot-set-explorer/scripts/worker.min.js");
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
		
		
		
		web_worker.postMessage([current_center_x, current_center_y, dim, large_mandelbrot_zoom_iterations, new_zoom_level]);
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#mandelbrot-zoom").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#mandelbrot-zoom").style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		
		
		if (currently_touch_device)
		{
			document.querySelector("#instructions").innerHTML = "Drag along the Mandelbrot set to view that area up close, and release to generate a higher-resolution image.";
		}
	}



	function draw_initial_mandelbrot_set()
	{
		document.querySelector("#mandelbrot-set").setAttribute("width", small_canvas_size);
		document.querySelector("#mandelbrot-set").setAttribute("height", small_canvas_size);
		
		let ctx = document.querySelector("#mandelbrot-set").getContext("2d", {alpha: false});
		
		let img = new Image();
		img.src = "/applets/mandelbrot-set-explorer/graphics/mandelbrot-set.png";
		img.onload = function()
		{
			ctx.drawImage(img, 0, 0, small_canvas_size, small_canvas_size);
		};
	}



	function init_listeners_no_touch()
	{
		document.querySelector("#mandelbrot-set").addEventListener("mousemove", function(e)
		{
			if (persist_image === false)
			{
				let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
				let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
				
				current_center_x = ((mouse_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
				current_center_y = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
				current_mandelbrot_zoom_size = small_mandelbrot_zoom_size;
				current_num_iterations = small_mandelbrot_zoom_iterations;
				
				
				
				draw_next_frame = true;
				
				if (need_to_restart)
				{
					need_to_restart = false;
					
					window.requestAnimationFrame(draw_mandelbrot_zoom);
				}
			}
		});
		
		
		
		//On a click, make a much larger image.
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			current_center_x = ((mouse_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			current_center_y = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			current_mandelbrot_zoom_size = large_mandelbrot_zoom_size;
			current_num_iterations = large_mandelbrot_zoom_iterations;
			
			persist_image = true;
			
			
			
			draw_next_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_mandelbrot_zoom);
			}
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
			
			current_center_x = ((touch_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			current_center_y = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			current_mandelbrot_zoom_size = small_mandelbrot_zoom_size;
			current_num_iterations = small_mandelbrot_zoom_iterations;
			
			
			
			draw_next_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_mandelbrot_zoom);
			}
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			current_center_x = ((last_touch_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			current_center_y = (((small_canvas_size - last_touch_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			current_mandelbrot_zoom_size = large_mandelbrot_zoom_size;
			current_num_iterations = large_mandelbrot_zoom_iterations;
			
			
			
			draw_next_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_mandelbrot_zoom);
			}
		}, false);
	}



	function mandelbrot_zoom_resize()
	{
		small_canvas_size = document.querySelector("#mandelbrot-zoom").offsetWidth;
		large_canvas_size = document.querySelector("#output-canvas").offsetWidth;
	}
}()