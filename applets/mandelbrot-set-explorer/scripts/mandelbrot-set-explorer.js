!function()
{
	let small_canvas_size = document.querySelector("#mandelbrot-zoom").offsetWidth;
	let large_canvas_size = document.querySelector("#high-res-mandelbrot-zoom").offsetWidth;

	let small_mandelbrot_zoom_size = 75;
	let large_mandelbrot_zoom_size = 500;

	let small_mandelbrot_zoom_iterations = 50;
	let large_mandelbrot_zoom_iterations = 100;

	//Where the current zoom is centered.
	let anchor_x = -.75;
	let anchor_y = 0;

	//The current parameters to pass to draw_mandelbrot_zoom, used to make high res images.
	let current_center_x = 0;
	let current_center_y = 0;

	let old_zoom_level = 3;
	let new_zoom_level = .6;



	//When this is true, the zoom level and anchors and iteration amounts will be updated the next time a small zoom is generated. We can't just do it after a large zoom is created, since then the full res zoom will break.
	let queue_variable_change = false;

	//For the same reasons, we need these. (barf)
	let temp_anchor_x = 0;
	let temp_anchor_y = 0;



	let image = [];

	let persist_image = false;



	adjust_for_settings();

	draw_initial_mandelbrot_set();




	document.querySelector("#generate-button").addEventListener("click", draw_high_res_mandelbrot_zoom);

	window.addEventListener("resize", mandelbrot_zoom_resize);
	temporary_handlers["resize"].push(mandelbrot_zoom_resize);

	setTimeout(mandelbrot_zoom_resize, 1000);



	//As the user scrolls around the image, make tiny Julia set previews.
	if (!hasTouch())
	{
		init_listeners_no_touch();
	}

	else
	{
		init_listeners_touch();
	}





	function draw_mandelbrot_zoom(center_x, center_y, mandelbrot_zoom_size, num_iters, download)
	{
		let x = 0, y = 0;
		let z = 0;
		
		image = [];
		
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{
			image[i] = [];
		}
		
		
		
		if (queue_variable_change == true && download == false)
		{
			old_zoom_level /= 5;
			new_zoom_level /= 5;
			
			large_mandelbrot_zoom_iterations += 150;
			small_mandelbrot_zoom_iterations += 150;
			
			anchor_x = temp_anchor_x;
			anchor_y = temp_anchor_y;
			
			queue_variable_change = false;
		}
		
		
		
		let canvas_size = 0;
		
		if (download)
		{
			document.querySelector("#high-res-mandelbrot-zoom").setAttribute("width", mandelbrot_zoom_size);
			document.querySelector("#high-res-mandelbrot-zoom").setAttribute("height", mandelbrot_zoom_size);
			
			ctx = document.querySelector("#high-res-mandelbrot-zoom").getContext("2d");
			canvas_size = large_canvas_size;
		}
		
		else
		{
			document.querySelector("#mandelbrot-zoom").setAttribute("width", mandelbrot_zoom_size);
			document.querySelector("#mandelbrot-zoom").setAttribute("height", mandelbrot_zoom_size);
			
			ctx = document.querySelector("#mandelbrot-zoom").getContext("2d");
			canvas_size = small_canvas_size;
		}
		
		
		
		//Generate initial value map.
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{
			mandelbrot_zoom_row(i, center_x, center_y, mandelbrot_zoom_size, num_iters)
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		//We throw out more if the image is just being scrolled around, since then it's critical that we don't have bright flashes of color.
		let max_brightness = 0;
		
		if (mandelbrot_zoom_size == small_mandelbrot_zoom_size)
		{
			max_brightness = brightness_array[Math.round(brightness_array.length * .995) - 1];
		}
		
		else
		{
			max_brightness = brightness_array[Math.round(brightness_array.length * .9999) - 1];
		}
		
		for (let i = 0; i < mandelbrot_zoom_size; i++)
		{
			for (let j = 0; j < mandelbrot_zoom_size; j++)
			{
				image[i][j] = (image[i][j] / max_brightness) * 255;
				ctx.fillStyle = "rgb(" + 0 + "," + image[i][j] + "," + image[i][j] + ")";
				ctx.fillRect(j, i, 1, 1);
			}
		}
		
		ctx.scale(canvas_size / mandelbrot_zoom_size, canvas_size / mandelbrot_zoom_size);
		
		
		
		if (mandelbrot_zoom_size == large_mandelbrot_zoom_size && download == false)
		{
			//Replace the old Mandelbrot set with the new zoomed one.
			let width = document.querySelector("#mandelbrot-set").getAttribute("width");
			
			document.querySelector("#mandelbrot-set").getContext("2d").drawImage(document.querySelector("#mandelbrot-zoom"), 0, 0, width, width);
			
			queue_variable_change = true;
			
			temp_anchor_x = center_x;
			temp_anchor_y = center_y;
		}
		
		
		
		if (download)
		{
			prepare_download(center_x, center_y);
		}
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
			
			if (k == num_iters)
			{
				brightness = 0;
			}
			
			
			
			image[i][j] = brightness;
		}
	}



	function prepare_download(center_x, center_y)
	{
		try {document.querySelector("#download-button").style.opacity = 0;}
		catch(ex) {}
		
		setTimeout(function()
		{
			try {document.querySelector("#download-button").remove();}
			catch(ex) {}
			
			let image_data = document.querySelector("#high-res-mandelbrot-zoom").toDataURL();
			
			
			
			document.querySelector("#download-location").insertAdjacentHTML("afterend", `
				<div id="download-button" class="animated-opacity" style="display: flex; justify-content: center; opacity: 0; width: 70vw; margin: 0 auto">
					<a href="${image_data}" download="Mandelbrot Zoom.png" class="real-link">
						<button class="text-button" type="button" onclick="">Download Image</button>
					</a>
				</div>
			`);
			
			document.querySelector("#download-button").style.opacity = 1;
		}, 300);
	}



	function draw_high_res_mandelbrot_zoom()
	{
		let dim = parseInt(document.querySelector("#dim-input").value || 1000);
		draw_mandelbrot_zoom(current_center_x, current_center_y, dim, large_mandelbrot_zoom_iterations, true);
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] == 1)
		{
			if (url_vars["theme"] == 1)
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#mandelbrot-zoom").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#high-res-mandelbrot-zoom").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#mandelbrot-zoom").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#high-res-mandelbrot-zoom").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}



	function draw_initial_mandelbrot_set()
	{
		document.querySelector("#mandelbrot-set").setAttribute("width", small_canvas_size);
		document.querySelector("#mandelbrot-set").setAttribute("height", small_canvas_size);
		
		let ctx = document.querySelector("#mandelbrot-set").getContext("2d");
		
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
			if (persist_image == false)
			{
				let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
				let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
				
				let center_x = ((mouse_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
				let center_y = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
				
				draw_mandelbrot_zoom(center_x, center_y, small_mandelbrot_zoom_size, small_mandelbrot_zoom_iterations, false);
			}
		});
		
		
		
		//On a click, make a much larger image.
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			let center_x = ((mouse_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			let center_y = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			
			draw_mandelbrot_zoom(center_x, center_y, large_mandelbrot_zoom_size, large_mandelbrot_zoom_iterations, false);
			
			current_center_x = center_x;
			current_center_y = center_y;
			
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
		
		
		
		document.querySelector("#instructions").innerHTML = `Drag along the Mandelbrot set to view that area up close, and release to generate a higher-resolution image. For more information on Mandelbrot and Julia sets, have a look at <a href="/blog/4/a-taste-of-chaos.html" onclick="redirect('/blog/4/a-taste-of-chaos.html')">this blog post</a>.`;
		
		document.querySelector("#instructions a").addEventListener("click", function(e)
		{
			e.preventDefault();
		});
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
			
			let touch_x = e.touches[0].clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let touch_y = e.touches[0].clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			last_touch_x = touch_x;
			last_touch_y = touch_y;
			
			let center_x = ((touch_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			let center_y = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			
			draw_mandelbrot_zoom(center_x, center_y, small_mandelbrot_zoom_size, small_mandelbrot_zoom_iterations, false);
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			let center_x = ((last_touch_x / small_canvas_size) - .5) * old_zoom_level + anchor_x;
			let center_y = (((small_canvas_size - last_touch_y) / small_canvas_size) - .5) * old_zoom_level + anchor_y;
			
			draw_mandelbrot_zoom(center_x, center_y, large_mandelbrot_zoom_size, large_mandelbrot_zoom_iterations, false);
			
			current_center_x = center_x;
			current_center_y = center_y;
		}, false);
	}



	function mandelbrot_zoom_resize()
	{
		small_canvas_size = document.querySelector("#mandelbrot-zoom").offsetWidth;
		large_canvas_size = document.querySelector("#high-res-mandelbrot-zoom").offsetWidth;
	}
}()