!function()
{
	"use strict";
	
	
	
	hljs.highlightAll();
	
	
	
	{
		let options =
		{
			renderer: "cpu",
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 4,
			world_height: 4,
			world_center_x: 0,
			world_center_y: 0
		};
		
		let wilson = new Wilson(document.querySelector("#output-canvas-1"), options);
		
		
		
		let a_input_element = document.querySelector("#a-1-input");
		let b_input_element = document.querySelector("#b-1-input");
		let resolution_input_element = document.querySelector("#resolution-1-input");

		let generate_button_element = document.querySelector("#generate-1-button");

		generate_button_element.addEventListener("click", () =>
		{
			let a = parseFloat(a_input_element.value || 0);
			let b = parseFloat(b_input_element.value || 1);
			let resolution = parseInt(resolution_input_element.value || 500);
			
			wilson.change_canvas_size(resolution, resolution);
			
			window.requestAnimationFrame(() => wilson.render.draw_frame(generate_julia_set(a, b, resolution)));
		});
		
		
		
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
	
	
	
	
	{
		let options =
		{
			renderer: "hybrid",
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 4,
			world_height: 4,
			world_center_x: 0,
			world_center_y: 0
		};
		
		let wilson = new Wilson(document.querySelector("#output-canvas-2"), options);
		
		
		
		let a_input_element = document.querySelector("#a-2-input");
		let b_input_element = document.querySelector("#b-2-input");
		let resolution_input_element = document.querySelector("#resolution-2-input");

		let generate_button_element = document.querySelector("#generate-2-button");

		generate_button_element.addEventListener("click", () =>
		{
			let a = parseFloat(a_input_element.value || 0);
			let b = parseFloat(b_input_element.value || 1);
			let resolution = parseInt(resolution_input_element.value || 500);
			
			wilson.change_canvas_size(resolution, resolution);
			
			window.requestAnimationFrame(() => wilson.render.draw_frame(generate_julia_set(a, b, resolution)));
		});
		
		
		
		let download_button_element = document.querySelector("#download-2-button");
		
		download_button_element.addEventListener("click", () =>
		{
			wilson.download_frame("a-julia-set.png");
		});
		
		
		
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
	
	
	
	document.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/2/draggables.html");
	});
}()