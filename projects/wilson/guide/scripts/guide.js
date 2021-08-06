!function()
{
	"use strict";
	
	
	
	hljs.highlightAll();
	
	
	
	let options_1 =
	{
		canvas_width: 500,
		canvas_height: 500,
		
		renderer: "cpu",
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	let wilson_1 = new Wilson(document.querySelector("#output-canvas-1"), options_1);
	
	document.querySelector("#generate-1-button").addEventListener("click", () =>
	{
		let a = parseFloat(document.querySelector("#a-1-input").value || 0);
		let b = parseFloat(document.querySelector("#b-1-input").value || 1);
		let resolution = parseInt(document.querySelector("#resolution-1-input").value || 500);
		
		wilson_1.change_canvas_size(resolution, resolution);
		
		wilson_1.render.draw_frame(generate_julia_set_1(wilson_1, a, b, resolution));
	});
	
	
	
	/////////////////////////////////////////
	
	
	
	let options_2 =
	{
		canvas_width: 500,
		canvas_height: 500,
		
		renderer: "hybrid",
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	let wilson_2 = new Wilson(document.querySelector("#output-canvas-2"), options_2);
	
	document.querySelector("#generate-2-button").addEventListener("click", () =>
	{
		let a = parseFloat(document.querySelector("#a-2-input").value || 0);
		let b = parseFloat(document.querySelector("#b-2-input").value || 1);
		let resolution = parseInt(document.querySelector("#resolution-2-input").value || 500);
		
		wilson_2.change_canvas_size(resolution, resolution);
		
		wilson_2.render.draw_frame(generate_julia_set_1(wilson_2, a, b, resolution));
	});
	
	
	
	/////////////////////////////////////////
	
	
	
	let options_3 =
	{
		canvas_width: 500,
		canvas_height: 500,
		
		renderer: "hybrid",
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousedown_callback: on_grab_3,
		draggables_mousemove_callback: on_drag_3,
		draggables_mouseup_callback: on_release_3,
		
		draggables_touchstart_callback: on_grab_3,
		draggables_touchmove_callback: on_drag_3,
		draggables_touchend_callback: on_release_3
	};
	
	let wilson_3 = new Wilson(document.querySelector("#output-canvas-3"), options_3);
	
	let draggable = wilson_3.draggables.add(0, 1);
	
	
	
	
	let large_resolution = 500;
	let small_resolution = 100;
	
	document.querySelector("#resolution-3-input").addEventListener("input", () =>
	{
		large_resolution = parseInt(document.querySelector("#resolution-3-input").value || 500);
		small_resolution = Math.floor(large_resolution / 5);
	});
	
	
	
	wilson_3.change_canvas_size(small_resolution, small_resolution);
	wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, 0, 1, small_resolution));
	
	
	
	function on_grab_3(active_draggable, x, y, event)
	{
		wilson_3.change_canvas_size(small_resolution, small_resolution);
	}

	function on_drag_3(active_draggable, x, y, event)
	{
		wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, x, y, small_resolution));
	}

	function on_release_3(active_draggable, x, y, event)
	{
		wilson_3.change_canvas_size(large_resolution, large_resolution);
		wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, x, y, large_resolution));
	}
	
	
	
	/////////////////////////////////////////
	
	
	
	function generate_julia_set_1(wilson, a, b, resolution)
	{
		let brightnesses = new Array(resolution * resolution);
		let max_brightness = 0;
		let brightness_scale = 1.5;
		const num_iterations = 50;
		
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
}()