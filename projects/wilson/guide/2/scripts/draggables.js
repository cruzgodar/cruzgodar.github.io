!function()
{
	"use strict";
	
	
	
	let elements = Page.element.querySelectorAll("pre code");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.add("highlightable");
	}
	
	hljs.highlightAll();
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousedown_callback: on_grab,
		draggables_mousemove_callback: on_drag,
		draggables_mouseup_callback: on_release,
		
		draggables_touchstart_callback: on_grab,
		draggables_touchmove_callback: on_drag,
		draggables_touchend_callback: on_release
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	let draggable = wilson.draggables.add(0, 1);
	
	
	
	let large_resolution = 1000;
	let small_resolution = 200;
	
	let a = 0;
	let b = 1;
	
	let resolution = 200;
	let last_resolution = 0;
	
	let last_timestamp = -1;
	
	
	
	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		large_resolution = parseInt(resolution_input_element.value || 1000);
		small_resolution = Math.floor(large_resolution / 5);
	});
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set.png");
	});
	
	
	
	//Draw the initial frame.
	wilson.change_canvas_size(small_resolution, small_resolution);
	window.requestAnimationFrame(draw_julia_set);
	
	
	
	function on_grab(active_draggable, x, y, event)
	{
		wilson.change_canvas_size(small_resolution, small_resolution);
		
		a = x;
		b = y;
		resolution = small_resolution;
		
		window.requestAnimationFrame(draw_julia_set);
	}

	function on_drag(active_draggable, x, y, event)
	{
		a = x;
		b = y;
		resolution = small_resolution;
		
		window.requestAnimationFrame(draw_julia_set);
	}

	function on_release(active_draggable, x, y, event)
	{
		wilson.change_canvas_size(large_resolution, large_resolution);
		
		a = x;
		b = y;
		resolution = large_resolution;
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function generate_julia_set(a, b, resolution)
	{
		let brightnesses = new Array(resolution * resolution);
		let max_brightness = 0;
		let brightness_scale = 1.5;
		const num_iterations = 100;
		
		for (let i = 0; i < resolution; i++)
		{
			for (let j = 0; j < resolution; j++)
			{
				let world_coordinates = wilson.utils.interpolate.canvas_to_world(i, j);
				let x = world_coordinates[0];
				let y = world_coordinates[1];
				
				//This helps remove color banding.
				let brightness = Math.exp(-Math.sqrt(x*x + y*y));
				
				let k = 0;
				
				for (k = 0; k < num_iterations; k++)
				{
					//z = z^2 + c = (x^2 - y^2 + a) + (2xy + b)i
					let temp = x*x - y*y + a;
					y = 2*x*y + b;
					x = temp;
					
					brightness += Math.exp(-Math.sqrt(x*x + y*y));
					
					if (x*x + y*y > 4)
					{
						break;
					}
				}
				
				if (k === num_iterations)
				{
					//Color this pixel black.
					brightnesses[resolution * i + j] = 0;
				}
				
				else
				{
					brightnesses[resolution * i + j] = brightness;
					
					if (brightness > max_brightness)
					{
						max_brightness = brightness;
					}
				}
			}
		}
		
		//Now we need to create the actual pixel data in a Uint8ClampedArray to pass to Wilson.
		let image_data = new Uint8ClampedArray(resolution * resolution * 4);
		for (let i = 0; i < resolution * resolution; i++)
		{
			image_data[4 * i] = 0; //Red
			image_data[4 * i + 1] = brightness_scale * brightnesses[i] / max_brightness * 255; //Green
			image_data[4 * i + 2] = brightness_scale * brightnesses[i] / max_brightness * 255; //Blue
			image_data[4 * i + 3] = 255; //Alpha
		}
		
		return image_data;
	}
	
	
	
	function draw_julia_set(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0 && last_resolution === resolution)
		{
			return;
		}
		
		last_resolution = resolution;
		
		
		
		wilson.render.draw_frame(generate_julia_set(a, b, resolution));
	}
	
	
	
	Page.element.querySelector("#previous-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/1/getting-started.html");
	});
	
	Page.element.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/3/parallelizing.html");
	});
}()