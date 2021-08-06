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
	
	let draggable_3 = wilson_3.draggables.add(0, 1);
	
	wilson_3.draggables.container.setAttribute("data-aos-offset", 1000000);
	wilson_3.draggables.container.setAttribute("data-aos-delay", 0);
	
	Page.Load.AOS.elements[2].push([wilson_3.draggables.container, Page.Load.AOS.elements[2][Page.Load.AOS.elements[2].length - 1][1]]);
	
	
	
	
	let large_resolution_3 = 500;
	let small_resolution_3 = 100;
	
	document.querySelector("#resolution-3-input").addEventListener("input", () =>
	{
		large_resolution_3 = parseInt(document.querySelector("#resolution-3-input").value || 500);
		small_resolution_3 = Math.floor(large_resolution_3 / 5);
	});
	
	
	
	wilson_3.change_canvas_size(small_resolution_3, small_resolution_3);
	wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, 0, 1, small_resolution_3));
	
	
	
	function on_grab_3(active_draggable, x, y, event)
	{
		wilson_3.change_canvas_size(small_resolution_3, small_resolution_3);
	}

	function on_drag_3(active_draggable, x, y, event)
	{
		wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, x, y, small_resolution_3));
	}

	function on_release_3(active_draggable, x, y, event)
	{
		wilson_3.change_canvas_size(large_resolution_3, large_resolution_3);
		wilson_3.render.draw_frame(generate_julia_set_1(wilson_3, x, y, large_resolution_3));
	}
	
	
	
	/////////////////////////////////////////
	
	
	
	let frag_shader_source_4 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * 2.0, uv.y * 2.0);
			vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
			float brightness = exp(-length(z));
			
			
			
			vec2 c = vec2(a, b);
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (iteration == 99)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
				
				if (length(z) >= 2.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
		}
	`;



	let options_4 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_4,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_4,
		
		draggables_touchmove_callback: on_drag_4
	};



	let wilson_4 = new Wilson(document.querySelector("#output-canvas-4"), options_4);

	wilson_4.render.init_uniforms(["a", "b", "brightness_scale"]);

	let draggable_4 = wilson_4.draggables.add(0, 1);
	
	Page.Load.AOS.elements[3].push([wilson_4.draggables.container, Page.Load.AOS.elements[3][Page.Load.AOS.elements[3].length - 1][1]]);
	
	
	
	let resolution_4 = 1000;

	document.querySelector("#resolution-4-input").addEventListener("input", () =>
	{
		resolution_4 = parseInt(document.querySelector("#resolution-4-input").value || 1000);
		wilson_4.change_canvas_size(resolution_4, resolution_4);
		wilson_4.render.draw_frame();
	});

	//Render the inital frame.
	wilson_4.gl.uniform1f(wilson_4.uniforms["a"], 0);
	wilson_4.gl.uniform1f(wilson_4.uniforms["b"], 1);
	wilson_4.gl.uniform1f(wilson_4.uniforms["brightness_scale"], 10);
	
	wilson_4.change_canvas_size(resolution_4, resolution_4);
	
	wilson_4.render.draw_frame();



	function on_drag_4(active_draggable, x, y, event)
	{
		wilson_4.gl.uniform1f(wilson_4.uniforms["a"], x);
		wilson_4.gl.uniform1f(wilson_4.uniforms["b"], y);
		wilson_4.gl.uniform1f(wilson_4.uniforms["brightness_scale"], 10);
		
		wilson_4.render.draw_frame();
	}
	
	
	
	/////////////////////////////////////////
	
	
	
	let options_5 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_4,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_5,
		
		draggables_touchmove_callback: on_drag_5
	};
	
	let options_hidden_5 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_4,
		
		canvas_width: 100,
		canvas_height: 100,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	
	
	let wilson_5 = new Wilson(document.querySelector("#output-canvas-5"), options_5);

	wilson_5.render.init_uniforms(["a", "b", "brightness_scale"]);

	let draggable_5 = wilson_5.draggables.add(0, 1);
	
	Page.Load.AOS.elements[4].push([wilson_5.draggables.container, Page.Load.AOS.elements[4][Page.Load.AOS.elements[4].length - 1][1]]);
	
	
	
	let wilson_hidden_5 = new Wilson(document.querySelector("#hidden-canvas-5"), options_hidden_5);
	
	wilson_hidden_5.render.init_uniforms(["a", "b", "brightness_scale"]);
	
	
	
	let a_5 = 0;
	let b_5 = 1;
	
	let resolution_5 = 1000;
	
	let resolution_hidden = 100;

	document.querySelector("#resolution-5-input").addEventListener("input", () =>
	{
		resolution_5 = parseInt(document.querySelector("#resolution-5-input").value || 1000);
		wilson_5.change_canvas_size(resolution_5, resolution_5);
		
		draw_julia_set();
	});
	
	function on_drag_5(active_draggable, x, y, event)
	{
		a_5 = x;
		b_5 = y;
		
		draw_julia_set_5();
	}
	
	//Render the first frame.
	draw_julia_set_5();



	function draw_julia_set_5()
	{
		wilson_hidden_5.gl.uniform1f(wilson_hidden_5.uniforms["a"], a_5);
		wilson_hidden_5.gl.uniform1f(wilson_hidden_5.uniforms["b"], b_5);
		wilson_hidden_5.gl.uniform1f(wilson_hidden_5.uniforms["brightness_scale"], 20);
		
		wilson_hidden_5.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden_5.render.get_pixel_data();
		
		let brightnesses = new Uint8Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = brightnesses[Math.floor(resolution_hidden * resolution_hidden * .99)] / 255 * 15;
		
		wilson_5.gl.uniform1f(wilson_5.uniforms["a"], a_5);
		wilson_5.gl.uniform1f(wilson_5.uniforms["b"], b_5);
		wilson_5.gl.uniform1f(wilson_5.uniforms["brightness_scale"], brightness_scale);
		
		wilson_5.render.draw_frame();
	}
	
	
	
	/////////////////////////////////////////
	
	
	
	function generate_julia_set_1(wilson, a, b, resolution)
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
}()