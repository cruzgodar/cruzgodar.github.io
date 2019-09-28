!function()
{
	let small_canvas_size = 0;
	let large_canvas_size = 0;

	let small_julia_size = 75;
	let large_julia_size = 500;

	let small_julia_iterations = 25;
	let large_julia_iterations = 50;
	let full_res_julia_iterations = 100;

	let image = [];

	let mandelbrot_position = {left: 0, top: 0};

	let persist_image = false;

	let ctx = null;



	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", draw_high_res_julia);



	//Only get the width of the Mandelbrot set has finished loading in order to get the correct value.
	small_canvas_size = document.querySelector("#julia-set").offsetWidth;
	large_canvas_size = document.querySelector("#high-res-julia-set").offsetWidth;

	window.addEventListener("resize", julia_resize);
	temporary_handlers["resize"].push(julia_resize);

	setTimeout(julia_resize, 1000);



	//As the user scrolls around the image, make tiny Julia set previews.
	if (!hasTouch())
	{
		init_listeners_no_touch();
	}

	//Handle touchscreens.
	else
	{
		init_listeners_touch();
	}





	function draw_julia_set(a, b, julia_size, num_iters, download)
	{
		image = [];
		
		for (let i = 0; i < julia_size; i++)
		{
			image[i] = [];
		}
		
		
		
		let ctx = null;
		let canvas_size = 0;
		
		
		
		if (download == false)
		{
			document.querySelector("#julia-set").setAttribute("width", julia_size);
			document.querySelector("#julia-set").setAttribute("height", julia_size);
			
			ctx = document.querySelector("#julia-set").getContext("2d");
			canvas_size = small_canvas_size;
		}
		
		else
		{
			document.querySelector("#high-res-julia-set").setAttribute("width", julia_size);
			document.querySelector("#high-res-julia-set").setAttribute("height", julia_size);
			
			ctx = document.querySelector("#high-res-julia-set").getContext("2d");
			canvas_size = large_canvas_size;
		}
		
		
		
		//Generate the brightness map.
		for (let i = 0; i < julia_size / 2; i++)
		{
			julia_row(i, a, b, julia_size, num_iters);
		}
		
		
		
		//Find the max brightness, throwing out the very top values to avoid almost-black images with a few specks of color.
		let brightness_array = image.flat().sort(function(a, b) {return a - b});
		
		//We throw out more if the image is just being scrolled around, since then it's critical that we don't have bright flashes of color.
		let max_brightness = 0;
		
		if (julia_size == small_julia_size)
		{
			max_brightness = brightness_array[Math.round(brightness_array.length * .9965) - 1];
		}
		
		else
		{
			max_brightness = brightness_array[Math.round(brightness_array.length * .9999) - 1];
		}
		
		for (let i = 0; i < julia_size; i++)
		{
			for (let j = 0; j < julia_size; j++)
			{
				image[i][j] = (image[i][j] / max_brightness) * 255;
				ctx.fillStyle = "rgb(" + 0 + "," + image[i][j] + "," + image[i][j] + ")";
				ctx.fillRect(j, i, 1, 1);
			}
		}
		
		ctx.scale(canvas_size / julia_size, canvas_size / julia_size);
		
		
		
		if (download)
		{
			prepare_download(a, b);
		}
	}



	function julia_row(i, a, b, julia_size, num_iters)
	{
		for (let j = 0; j < julia_size; j++)
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
			
			if (k == num_iters)
			{
				brightness = 0;
			}
			
			
			
			//Reflect the top half about the origin to get the bottom half.
			image[i][j] = brightness;
			image[julia_size - i - 1][julia_size - j] = brightness;
		}
	}



	function prepare_download(a, b)
	{
		try {document.querySelector("#download-button").style.opacity = 0;}
		catch(ex) {}
		
		setTimeout(function()
		{
			try {document.querySelector("#download-button").remove();}
			catch(ex) {}
			
			let image_data = document.querySelector("#high-res-julia-set").toDataURL();
			
			
			
			let filename = "";
			
			if (a != 0)
			{
				filename = document.querySelector("#a-input").value;
				
				if (b > 0)
				{
					filename += " + " + document.querySelector("#b-input").value + "i";
				}
				
				else if (b < 0)
				{
					filename += " - " + document.querySelector("#b-input").value.substr(1) + "i";
				}
			}
			
			else
			{
				if (b != 0)
				{
					filename = document.querySelector("#b-input").value + "i";
				}
				
				else
				{
					filename = "0";
				}
			}
			
			
			
			document.querySelector("#download-location").insertAdjacentHTML("afterend", `
				<div id="download-button" class="animated-opacity" style="display: flex; justify-content: center; opacity: 0; width: 70vw; margin: 0 auto">
					<a href="${image_data}" download="${filename}.png" class="real-link">
						<button class="text-button" type="button" onclick="">Download Image</button>
					</a>
				</div>
			`);
			
			document.querySelector("#download-button").style.opacity = 1;
		}, 300);
	}



	function draw_high_res_julia()
	{
		let a = parseFloat(document.querySelector("#a-input").value) || 0;
		let b = parseFloat(document.querySelector("#b-input").value) || 0;
		let dim = parseFloat(document.querySelector("#dim-input").value) || 1000;
		
		draw_julia_set(a, b, dim, full_res_julia_iterations, true);
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] == 1)
		{
			if (url_vars["theme"] == 1)
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#julia-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#high-res-julia-set").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#julia-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#high-res-julia-set").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}



	function init_listeners_no_touch()
	{
		document.querySelector("#mandelbrot-set").addEventListener("mousemove", function(e)
		{
			if (persist_image == false)
			{
				let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
				let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
				
				let a = ((mouse_x / small_canvas_size) - .5) * 3 - .75;
				let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * 3;
				
				draw_julia_set(a, b, small_julia_size, small_julia_iterations, false);
			}
		});
		
		
		
		//On a click, make a much larger image.
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			let a = ((mouse_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * 3;
			
			draw_julia_set(a, b, large_julia_size, large_julia_iterations, false);
			
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
			document.querySelector("#dim-input").value = 1000;
			
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
		
		
		
		document.querySelector("#instructions").innerHTML = `Drag along the Mandelbrot set to preview the corresponding Julia set, and release to generate a higher-resolution image. For more information on Mandelbrot and Julia sets, have a look at <a href="/blog/4/a-taste-of-chaos.html" onclick="redirect('/blog/4/a-taste-of-chaos.html')">this blog post</a>.`;
		
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
			
			let a = ((touch_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * 3;
			
			draw_julia_set(a, b, small_julia_size, small_julia_iterations, false);
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			let a = ((last_touch_x / small_canvas_size) - .5) * 3 - .75;
			let b = (((small_canvas_size - last_touch_y) / small_canvas_size) - .5) * 3;
			
			draw_julia_set(a, b, large_julia_size, large_julia_iterations, false);
			
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
			document.querySelector("#dim-input").value = 1000;
		}, false);
	}



	function julia_resize()
	{
		small_canvas_size = document.querySelector("#julia-set").offsetWidth;
		large_canvas_size = document.querySelector("#high-res-julia-set").offsetWidth;
	}
}()