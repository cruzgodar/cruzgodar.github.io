!function()
{
	"use strict";
	
	
	
	let ctx = document.querySelector("#output-canvas").getContext("2d");
	
	let canvas_width = document.querySelector("#output-canvas").offsetWidth;
	let canvas_height = document.querySelector("#output-canvas").offsetHeight;
	let canvas_size = Math.min(canvas_width, canvas_height);
	
	let currently_drawing = false;
	
	
	
	let image_size = 500;
	let image_width = 500;
	let image_height = 500;
	
	let image = [];
	
	for (let i = 0; i < image_height; i++)
	{
		image[i] = [];
		
		for (let j = 0; j < image_width; j++)
		{
			image[i][j] = 0;
		}
	}
	
	
	
	let bends = [0, 0, 0, 0];
	
	let draw_length = 20;
	
	
	let x_history = [-1, -1, -1, -1, -1, -1, -1, -1];
	let y_history = [-1, -1, -1, -1, -1, -1, -1, -1];
	
	let current_x = -1;
	let current_y = -1;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_width);
	document.querySelector("#output-canvas").setAttribute("height", image_height);
	
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fillRect(0, 0, image_width, image_height);
	
	
	
	window.addEventListener("resize", generative_drawing_resize);
	setTimeout(generative_drawing_resize, 500);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		if (canvas_is_fullscreen)
		{
			if (aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		image = [];
		
		for (let i = 0; i < image_height; i++)
		{
			image[i] = [];
			
			for (let j = 0; j < image_width; j++)
			{
				image[i][j] = 0;
			}
		}
		
		
		
		canvas_width = document.querySelector("#output-canvas").offsetWidth;
		canvas_height = document.querySelector("#output-canvas").offsetHeight;
		canvas_size = Math.min(canvas_width, canvas_height);
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, image_width, image_height);
		
		generative_drawing_resize();
	};
	
	applet_canvas_true_fullscreen = true;
	
	set_up_canvas_resizer();
	
	
	
	init_listeners();
	
	
	
	function draw_frame()
	{
		let img_data = ctx.getImageData(0, 0, image_width, image_height);
		let data = img_data.data;
		
		for (let i = 0; i < image_height; i++)
		{
			for (let j = 0; j < image_width; j++)
			{
				let index = (4 * i * image_height) + (4 * j);
				
				data[index] = image[i][j];
				data[index + 1] = image[i][j];
				data[index + 2] = image[i][j];
				data[index + 3] = 255;
			}
		}
		
		ctx.putImageData(img_data, 0, 0);
		
		
		
		draw_curve();
		
		
		
		if (currently_drawing)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function init_listeners()
	{
		document.querySelector("#output-canvas").addEventListener("mousedown", draw_start);
		document.querySelector("#output-canvas").addEventListener("touchstart", draw_start);
		
		document.querySelector("#output-canvas").addEventListener("mousemove", handle_mousemove_event);
		document.querySelector("#output-canvas").addEventListener("touchmove", handle_touchmove_event);
		
		document.querySelector("#output-canvas").addEventListener("mouseup", draw_end);
		document.querySelector("#output-canvas").addEventListener("touchend", draw_end);
	}
	
	
	
	function draw_start(e)
	{
		currently_drawing = true;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	function draw_end(e)
	{
		currently_drawing = false;
	}
	
	
	
	function handle_mousemove_event(e)
	{
		if (currently_drawing)
		{
			e.preventDefault();
			
			x_history.shift();
			y_history.shift();
			
			x_history.push(current_x);
			y_history.push(current_y);
			
			current_x = e.clientX - document.querySelector("#output-canvas").getBoundingClientRect().left;
			current_y = e.clientY - document.querySelector("#output-canvas").getBoundingClientRect().top;
		}
	}
	
	
	
	function handle_touchmove_event(e)
	{
		e.preventDefault();
		
		x_history.shift();
		y_history.shift();
		
		x_history.push(current_x);
		y_history.push(current_y);
		
		current_x = e.touches[0].clientX - document.querySelector("#output-canvas").getBoundingClientRect().left;
		current_y = e.touches[0].clientY - document.querySelector("#output-canvas").getBoundingClientRect().top;
	}
	
	
	
	function draw_curve()
	{
		if (x_history[0] === -1 || y_history[0] === -1)
		{
			return;
		}
		
		
		
		let direction_x = current_x - x_history[0];
		let direction_y = current_y - y_history[0];
		
		let magnitude = Math.sqrt(direction_x * direction_x + direction_y * direction_y);
		
		direction_x /= magnitude;
		direction_y /= magnitude;
		
		direction_x *= 1.1 * magnitude;
		direction_y *= 1.1 * magnitude;
		
		
		
		for (let i = 0; i < draw_length; i += .25)
		{
			let x = current_x + direction_x * i;
			let y = current_y + direction_y * i;
			
			let row = Math.floor((y / canvas_height) * image_height);
			let col = Math.floor((x / canvas_width) * image_width);
			
			if (row >= 0 && row < image_height && col >= 0 && col < image_width)
			{
				image[row][col] += 50;
			}
		}
	}
	
	
	
	function generative_drawing_resize()
	{
		canvas_width = document.querySelector("#output-canvas").offsetWidth;
		canvas_height = document.querySelector("#output-canvas").offsetHeight;
		canvas_size = Math.min(canvas_width, canvas_height);
	}
	
	
	
	function change_resolution()
	{
		image_size = parseInt(document.querySelector("#image-size-input").value || 500);
		
		if (image_size < 200)
		{
			image_size = 200;
		}
		
		if (image_size > 2000)
		{
			image_size = 2000;
		}
		
		
		
		if (canvas_is_fullscreen)
		{
			if (aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * aspect_ratio);
				image_height = image_size;
			}
		}
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		gl.viewport(0, 0, image_width, image_height);
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function prepare_download()
	{
		let temp = image_size;
		
		image_size = parseInt(document.querySelector("#high-res-dim-input").value || 2000);
		
		num_iterations += 50;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
		
		
		
		let link = document.createElement("a");
		
		link.download = "a-mandelbrot-zoom.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		image_size = temp;
		
		num_iterations -= 50;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
	}
}()