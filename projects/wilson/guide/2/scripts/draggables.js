!function()
{
	"use strict";
	
	
	
	hljs.highlightAll();
	
	
	
	{
		let options =
		{
			renderer: "hybrid",
			
			canvas_width: 500,
			canvas_height: 500,
			
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
		
		let wilson = new Wilson(document.querySelector("#output-canvas"), options);
		
		let draggable = wilson.draggables.add(0, 1);
		
		
		
		wilson.draggables.container.setAttribute("data-aos-offset", 1000000);
		wilson.draggables.container.setAttribute("data-aos-delay", 0);
		
		Page.Load.AOS.elements[0].push([wilson.draggables.container, Page.Load.AOS.elements[0][Page.Load.AOS.elements[0].length - 1][1]]);
		
		Page.Load.AOS.show_section(0);
		
		
		
		let resolution_input_element = document.querySelector("#resolution-input");
		
		let large_resolution = 500;
		let small_resolution = 100;
		
		resolution_input_element.addEventListener("input", () =>
		{
			large_resolution = parseInt(document.querySelector("#resolution-input").value || 500);
			small_resolution = Math.floor(large_resolution / 5);
		});
		
		
		
		let download_button_element = document.querySelector("#download-button");
		
		download_button_element.addEventListener("click", () =>
		{
			wilson.download_frame("a-julia-set.png");
		});
		
		
		
		//Draw the initial frame.
		wilson.change_canvas_size(small_resolution, small_resolution);
		wilson.render.draw_frame(generate_julia_set(0, 1, small_resolution));
		
		
		
		function on_grab(active_draggable, x, y, event)
		{
			wilson.change_canvas_size(small_resolution, small_resolution);
			wilson.render.draw_frame(generate_julia_set(x, y, small_resolution));
		}

		function on_drag(active_draggable, x, y, event)
		{
			wilson.render.draw_frame(generate_julia_set(x, y, small_resolution));
		}

		function on_release(active_draggable, x, y, event)
		{
			wilson.change_canvas_size(large_resolution, large_resolution);
			wilson.render.draw_frame(generate_julia_set(x, y, large_resolution));
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
	}
	
	
	
	document.querySelector("#previous-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/1/introduction.html");
	});
	
	document.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/3/parallelizing.html");
	});
}()