!function()
{
	"use strict";
	
	
	
	hljs.highlightAll();
	
	
	
	let frag_shader_source_7 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspect_ratio;
		
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		
		
		
		void main(void)
		{
			vec2 z;
			
			if (aspect_ratio >= 1.0)
			{
				z = vec2(uv.x * aspect_ratio * 2.0, uv.y * 2.0);
			}
			
			else
			{
				z = vec2(uv.x * 2.0, uv.y / aspect_ratio * 2.0);
			}
			
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
				
				if (length(z) >= 10.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
		}
	`;
	
	
	
	let options_7 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_7,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_7,
		draggables_touchmove_callback: on_drag_7,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_image_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_image_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio_7
	};
	
	let options_hidden_7 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_7,
		
		canvas_width: 100,
		canvas_height: 100,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	
	
	let wilson_7 = new Wilson(document.querySelector("#output-canvas-7"), options_7);

	wilson_7.render.init_uniforms(["aspect_ratio", "a", "b", "brightness_scale"]);

	let draggable_7 = wilson_7.draggables.add(0, 1);
	
	Page.Load.AOS.elements[6].push([wilson_7.draggables.container, Page.Load.AOS.elements[6][Page.Load.AOS.elements[6].length - 1][1]]);
	
	window.addEventListener("resize", change_aspect_ratio_7);
	Page.temporary_handlers["resize"].push(change_aspect_ratio_7);
	
	
	
	let wilson_hidden_7 = new Wilson(document.querySelector("#hidden-canvas-7"), options_hidden_7);
	
	wilson_hidden_7.render.init_uniforms(["aspect_ratio", "a", "b", "brightness_scale"]);
	
	
	
	let a_7 = 0;
	let b_7 = 1;
	
	let resolution_7 = 1000;
	
	let resolution_hidden_7 = 100;

	document.querySelector("#resolution-7-input").addEventListener("input", () =>
	{
		resolution_7 = parseInt(document.querySelector("#resolution-7-input").value || 1000);
		wilson_7.change_canvas_size(resolution_7, resolution_7);
		
		draw_julia_set_7();
	});
	
	function on_drag_7(active_draggable, x, y, event)
	{
		a_7 = x;
		b_7 = y;
		
		draw_julia_set_7();
	}
	
	//Render the first frame.
	wilson_7.gl.uniform1f(wilson_7.uniforms["aspect_ratio"], 1);
	wilson_hidden_7.gl.uniform1f(wilson_hidden_7.uniforms["aspect_ratio"], 1);
	draw_julia_set_7();



	function draw_julia_set_7()
	{
		wilson_hidden_7.gl.uniform1f(wilson_hidden_7.uniforms["a"], a_7);
		wilson_hidden_7.gl.uniform1f(wilson_hidden_7.uniforms["b"], b_7);
		wilson_hidden_7.gl.uniform1f(wilson_hidden_7.uniforms["brightness_scale"], 20);
		
		wilson_hidden_7.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden_7.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden_7 * resolution_hidden_7);
		
		for (let i = 0; i < resolution_hidden_7 * resolution_hidden_7; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = brightnesses[Math.floor(resolution_hidden_7 * resolution_hidden_7 * .98)] / 255 * 18;
		
		wilson_7.gl.uniform1f(wilson_7.uniforms["a"], a_7);
		wilson_7.gl.uniform1f(wilson_7.uniforms["b"], b_7);
		wilson_7.gl.uniform1f(wilson_7.uniforms["brightness_scale"], brightness_scale);
		
		wilson_7.render.draw_frame();
	}
	
	
	
	function change_aspect_ratio_7()
	{
		if (wilson_7.fullscreen.currently_fullscreen)
		{
			let aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson_7.change_canvas_size(resolution_7, Math.floor(resolution_7 / aspect_ratio));
				
				wilson_7.world_width = 4 * aspect_ratio;
				wilson_7.world_height = 4;
			}
			
			else
			{
				wilson_7.change_canvas_size(Math.floor(resolution_7 * aspect_ratio), resolution_7);
				
				wilson_7.world_width = 4;
				wilson_7.world_height = 4 / aspect_ratio;
			}
			
			wilson_7.gl.uniform1f(wilson_7.uniforms["aspect_ratio"], aspect_ratio);
		}
		
		else
		{
			wilson_7.change_canvas_size(resolution_7, resolution_7);
			
			wilson_7.world_width = 4;
			wilson_7.world_height = 4;
			
			wilson_7.gl.uniform1f(wilson_7.uniforms["aspect_ratio"], 1);
		}
		
		draw_julia_set_7();
	}
	
	
	/*
	/////////////////////////////////////////
	
	
	
	let frag_shader_source_8 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspect_ratio;
		
		uniform float center_x;
		uniform float center_y;
		uniform float world_size;
		
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		
		
		
		void main(void)
		{
			vec2 z;
			
			if (aspect_ratio > 1.0)
			{
				z = vec2(uv.x * aspect_ratio * world_size + center_x, uv.y * world_size + center_y);
			}
			
			else
			{
				z = vec2(uv.x * world_size + center_x, uv.y / aspect_ratio * world_size + center_y);
			}
			
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
				
				if (length(z) >= 10.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
		}
	`;
	
	
	
	let options_8 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_8,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_8,
		draggables_touchmove_callback: on_drag_8,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_image_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_image_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio_8,
		
		
		
		mousedrag_callback: on_drag_canvas_8,
		touchmove_callback: on_drag_canvas_8,
		
		wheel_callback: on_wheel_canvas_8,
		pinch_callback: on_pinch_canvas_8
	};
	
	let options_hidden_8 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_8,
		
		canvas_width: 100,
		canvas_height: 100,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	
	
	let wilson_8 = new Wilson(document.querySelector("#output-canvas-8"), options_8);

	wilson_8.render.init_uniforms(["aspect_ratio", "center_x", "center_y", "world_size", "a", "b", "brightness_scale"]);

	let draggable_8 = wilson_8.draggables.add(0, 1);
	
	Page.Load.AOS.elements[7].push([wilson_8.draggables.container, Page.Load.AOS.elements[7][Page.Load.AOS.elements[7].length - 1][1]]);
	
	window.addEventListener("resize", change_aspect_ratio_8);
	Page.temporary_handlers["resize"].push(change_aspect_ratio_8);
	
	
	
	let wilson_hidden_8 = new Wilson(document.querySelector("#hidden-canvas-8"), options_hidden_8);
	
	wilson_hidden_8.render.init_uniforms(["aspect_ratio", "center_x", "center_y", "world_size", "a", "b", "brightness_scale"]);
	
	
	
	let a_8 = 0;
	let b_8 = 1;
	
	let aspect_ratio_8 = 1;
	
	let zoom_level_8 = 0;
	
	let resolution_8 = 1000;
	
	let resolution_hidden_8 = 100;
	
	

	document.querySelector("#resolution-8-input").addEventListener("input", () =>
	{
		resolution_8 = parseInt(document.querySelector("#resolution-8-input").value || 1000);
		wilson_8.change_canvas_size(resolution_8, resolution_8);
		
		draw_julia_set_8();
	});
	
	
	
	document.querySelector("#download-8-button").addEventListener("click", () =>
	{
		let download_resolution = parseInt(document.querySelector("#download-resolution-8-input").value || 2000);
		wilson_8.download_frame("a-julia-set.png", download_resolution);
	});
	
	
	
	function on_drag_8(active_draggable, x, y, event)
	{
		a_8 = x;
		b_8 = y;
		
		draw_julia_set_8();
	}
	
	
	
	//Render the first frame.
	wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], 1);
	wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], 0);
	wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], 0);
	wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], 2);
	
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["aspect_ratio"], 1);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], 0);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], 0);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], 2);
	
	draw_julia_set_8();



	function draw_julia_set_8()
	{
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["a"], a_8);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["b"], b_8);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["brightness_scale"], 20);
		
		wilson_hidden_8.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden_8.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden_8 * resolution_hidden_8);
		
		for (let i = 0; i < resolution_hidden_8 * resolution_hidden_8; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		
		
		let brightness_scale = brightnesses[Math.floor(resolution_hidden_8 * resolution_hidden_8 * .98)] / 255 * 18;
		
		wilson_8.gl.uniform1f(wilson_8.uniforms["a"], a_8);
		wilson_8.gl.uniform1f(wilson_8.uniforms["b"], b_8);
		wilson_8.gl.uniform1f(wilson_8.uniforms["brightness_scale"], brightness_scale);
		
		wilson_8.render.draw_frame();
	}
	
	
	
	function change_aspect_ratio_8()
	{
		if (wilson_8.fullscreen.currently_fullscreen)
		{
			aspect_ratio_8 = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio_8 >= 1)
			{
				wilson_8.change_canvas_size(resolution_8, Math.floor(resolution_8 / aspect_ratio_8));
				
				wilson_8.world_width = 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8;
				wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			}
			
			else
			{
				wilson_8.change_canvas_size(Math.floor(resolution_8 * aspect_ratio_8), resolution_8);
				
				wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
				wilson_8.world_height = 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8;
			}
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], aspect_ratio_8);
		}
		
		else
		{
			aspect_ratio_8 = 1;
			
			wilson_8.change_canvas_size(resolution_8, resolution_8);
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], 1);
		}
		
		draw_julia_set_8();
	}
	
	
	
	function on_drag_canvas_8(x, y, x_delta, y_delta, event)
	{
		wilson_8.world_center_x -= x_delta;
		wilson_8.world_center_y -= y_delta;
		
		wilson_8.world_center_x = Math.min(Math.max(wilson_8.world_center_x, -2), 2);
		wilson_8.world_center_y = Math.min(Math.max(wilson_8.world_center_y, -2), 2);
		
		wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
		wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
		
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
		
		draw_julia_set_8();
		
		wilson_8.draggables.recalculate_locations();
	}
	
	
	
	function on_wheel_canvas_8(x, y, scroll_amount, event)
	{
		scroll_amount = Math.min(Math.max(scroll_amount, -.5), .5);
		
		zoom_level_8 += scroll_amount;
		
		zoom_level_8 = Math.min(zoom_level_8, 1);
		
		zoom_canvas_8(x, y);
	}
	
	
	
	function on_pinch_canvas_8(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio_8 >= 1)
		{
			zoom_level_8 -= touch_distance_delta / wilson_8.world_width * 10;
		}
		
		else
		{
			zoom_level_8 -= touch_distance_delta / wilson_8.world_height * 10;
		}
		
		zoom_level_8 = Math.min(zoom_level_8, 1);
		
		zoom_canvas_8(x, y);
	}
	
	
	
	function zoom_canvas_8(fixed_point_x, fixed_point_y)
	{
		if (aspect_ratio_8 >= 1)
		{
			let new_world_center = wilson_8.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8, 4 * Math.pow(2, zoom_level_8));
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8;
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			
			wilson_8.world_center_x = new_world_center[0];
			wilson_8.world_center_y = new_world_center[1];
			
			
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], wilson_8.world_height / 2);
			
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], wilson_8.world_height / 2);
		}
		
		
		
		else
		{
			let new_world_center = wilson_8.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level_8), 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8);
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8;
			
			wilson_8.world_center_x = new_world_center[0];
			wilson_8.world_center_y = new_world_center[1];
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], wilson_8.world_width / 2);
			
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], wilson_8.world_width / 2);
		}
		
		draw_julia_set_8();
		
		wilson_8.draggables.recalculate_locations();
	}
	
	
	
	/////////////////////////////////////////
	*/
	
	
	
	let frag_shader_source_8 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspect_ratio;
		
		uniform float center_x;
		uniform float center_y;
		uniform float world_size;
		
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		
		
		
		void main(void)
		{
			vec2 z;
			
			if (aspect_ratio > 1.0)
			{
				z = vec2(uv.x * aspect_ratio * world_size + center_x, uv.y * world_size + center_y);
			}
			
			else
			{
				z = vec2(uv.x * world_size + center_x, uv.y / aspect_ratio * world_size + center_y);
			}
			
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
				
				if (length(z) >= 10.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
		}
	`;
	
	
	
	let options_8 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_8,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_8,
		draggables_touchmove_callback: on_drag_8,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_image_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_image_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio_8,
		
		
		
		mousedown_callback: on_grab_canvas_8,
		touchstart_callback: on_grab_canvas_8,
		
		mousedrag_callback: on_drag_canvas_8,
		touchmove_callback: on_drag_canvas_8,
		
		mouseup_callback: on_release_canvas_8,
		touchend_callback: on_release_canvas_8,
		
		wheel_callback: on_wheel_canvas_8,
		pinch_callback: on_pinch_canvas_8
	};
	
	let options_hidden_8 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_8,
		
		canvas_width: 100,
		canvas_height: 100,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0
	};
	
	
	
	let wilson_8 = new Wilson(document.querySelector("#output-canvas-8"), options_8);

	wilson_8.render.init_uniforms(["aspect_ratio", "center_x", "center_y", "world_size", "a", "b", "brightness_scale"]);

	let draggable_8 = wilson_8.draggables.add(0, 1);
	
	Page.Load.AOS.elements[7].push([wilson_8.draggables.container, Page.Load.AOS.elements[7][Page.Load.AOS.elements[7].length - 1][1]]);
	
	window.addEventListener("resize", change_aspect_ratio_8);
	Page.temporary_handlers["resize"].push(change_aspect_ratio_8);
	
	
	
	let wilson_hidden_8 = new Wilson(document.querySelector("#hidden-canvas-8"), options_hidden_8);
	
	wilson_hidden_8.render.init_uniforms(["aspect_ratio", "center_x", "center_y", "world_size", "a", "b", "brightness_scale"]);
	
	
	
	let a_8 = 0;
	let b_8 = 1;
	
	let aspect_ratio_8 = 1;
	
	let zoom_level_8 = 0;
	
	let resolution_8 = 1000;
	
	let resolution_hidden_8 = 100;
	
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	
	let next_velocity_x = 0;
	let next_velocity_y = 0;
	let next_velocity_zoom = 0;
	
	let velocity_x = 0;
	let velocity_y = 0;
	let velocity_zoom = 0;
	
	let last_timestamp = -1;
	
	

	document.querySelector("#resolution-8-input").addEventListener("input", () =>
	{
		resolution_8 = parseInt(document.querySelector("#resolution-8-input").value || 1000);
		wilson_8.change_canvas_size(resolution_8, resolution_8);
		
		window.requestAnimationFrame(draw_julia_set_8);
	});
	
	
	
	document.querySelector("#download-8-button").addEventListener("click", () =>
	{
		let download_resolution = parseInt(document.querySelector("#download-resolution-8-input").value || 2000);
		wilson_8.download_frame("a-julia-set.png", download_resolution);
	});
	
	
	
	function on_drag_8(active_draggable, x, y, event)
	{
		a_8 = x;
		b_8 = y;
		
		window.requestAnimationFrame(draw_julia_set_8)
	}
	
	
	
	//Render the first frame.
	wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], 1);
	wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], 0);
	wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], 0);
	wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], 2);
	
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["aspect_ratio"], 1);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], 0);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], 0);
	wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], 2);
	
	window.requestAnimationFrame(draw_julia_set_8);



	function draw_julia_set_8(timestamp)
	{
		if (last_timestamp === -1)
		{
			last_timestamp = timestamp;
		}
		
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["a"], a_8);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["b"], b_8);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["brightness_scale"], 20);
		
		wilson_hidden_8.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden_8.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden_8 * resolution_hidden_8);
		
		for (let i = 0; i < resolution_hidden_8 * resolution_hidden_8; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		
		
		let brightness_scale = brightnesses[Math.floor(resolution_hidden_8 * resolution_hidden_8 * .98)] / 255 * 18;
		
		wilson_8.gl.uniform1f(wilson_8.uniforms["a"], a_8);
		wilson_8.gl.uniform1f(wilson_8.uniforms["b"], b_8);
		wilson_8.gl.uniform1f(wilson_8.uniforms["brightness_scale"], brightness_scale);
		
		wilson_8.render.draw_frame();
		
		
		
		if (velocity_x !== 0 || velocity_y !== 0 || next_velocity_zoom !== 0)
		{
			wilson_8.world_center_x += velocity_x;
			wilson_8.world_center_y += velocity_y;
			
			wilson_8.world_center_x = Math.min(Math.max(wilson_8.world_center_x, -2), 2);
			wilson_8.world_center_y = Math.min(Math.max(wilson_8.world_center_y, -2), 2);
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
			
			
			
			velocity_x *= .96;
			velocity_y *= .96;
			
			if (Math.sqrt(velocity_x * velocity_x + velocity_y * velocity_y) < .0005 * Math.min(wilson_8.world_width, wilson_8.world_height))
			{
				velocity_x = 0;
				velocity_y = 0;
			}
			
			
			
			zoom_level_8 += velocity_zoom;
			
			zoom_level_8 = Math.min(zoom_level_8, 1);
			
			zoom_canvas_8(fixed_point_x, fixed_point_y);
			
			velocity_zoom *= .93;
			
			if (Math.abs(velocity_zoom) < .001)
			{
				velocity_zoom = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_julia_set_8);
			
			wilson_8.draggables.recalculate_locations();
		}
	}
	
	
	
	function change_aspect_ratio_8()
	{
		if (wilson_8.fullscreen.currently_fullscreen)
		{
			aspect_ratio_8 = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio_8 >= 1)
			{
				wilson_8.change_canvas_size(resolution_8, Math.floor(resolution_8 / aspect_ratio_8));
				
				wilson_8.world_width = 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8;
				wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			}
			
			else
			{
				wilson_8.change_canvas_size(Math.floor(resolution_8 * aspect_ratio_8), resolution_8);
				
				wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
				wilson_8.world_height = 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8;
			}
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], aspect_ratio_8);
		}
		
		else
		{
			aspect_ratio_8 = 1;
			
			wilson_8.change_canvas_size(resolution_8, resolution_8);
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["aspect_ratio"], 1);
		}
		
		window.requestAnimationFrame(draw_julia_set_8);
	}
	
	
	
	function on_grab_canvas_8(x, y, event)
	{
		velocity_x = 0;
		velocity_y = 0;
		velocity_zoom = 0;
		
		next_velocity_x = 0;
		next_velocity_y = 0;
		next_velocity_zoom = 0;
	}
	
	
	
	function on_drag_canvas_8(x, y, x_delta, y_delta, event)
	{
		wilson_8.world_center_x -= x_delta;
		wilson_8.world_center_y -= y_delta;
		
		next_velocity_x = -x_delta;
		next_velocity_y = -y_delta;
		
		
		
		wilson_8.world_center_x = Math.min(Math.max(wilson_8.world_center_x, -2), 2);
		wilson_8.world_center_y = Math.min(Math.max(wilson_8.world_center_y, -2), 2);
		
		wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
		wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
		
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
		wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
		
		window.requestAnimationFrame(draw_julia_set_8);
		
		wilson_8.draggables.recalculate_locations();
	}
	
	
	
	function on_release_canvas_8(x, y, event)
	{
		if (Math.sqrt(next_velocity_x * next_velocity_x + next_velocity_y * next_velocity_y) >= .005 * Math.min(wilson_8.world_width, wilson_8.world_height))
		{
			velocity_x = next_velocity_x;
			velocity_y = next_velocity_y;
		}
		
		if (Math.abs(next_velocity_zoom) >= .01)
		{
			velocity_zoom = next_velocity_zoom;
		}
		
		window.requestAnimationFrame(draw_julia_set_8);
	}
	
	
	
	function on_wheel_canvas_8(x, y, scroll_amount, event)
	{
		scroll_amount = Math.min(Math.max(scroll_amount, -.5), .5);
		
		zoom_level_8 += scroll_amount;
		
		zoom_level_8 = Math.min(zoom_level_8, 1);
		
		zoom_canvas_8(x, y);
	}
	
	
	
	function on_pinch_canvas_8(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio_8 >= 1)
		{
			zoom_level_8 -= touch_distance_delta / wilson_8.world_width * 10;
			
			next_velocity_zoom = -touch_distance_delta / wilson_8.world_width * 10;
		}
		
		else
		{
			zoom_level_8 -= touch_distance_delta / wilson_8.world_height * 10;
			
			next_velocity_zoom = -touch_distance_delta / wilson_8.world_height * 10;
		}
		
		zoom_level_8 = Math.min(zoom_level_8, 1);
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas_8(x, y);
	}
	
	
	
	function zoom_canvas_8(fixed_point_x, fixed_point_y)
	{
		if (aspect_ratio_8 >= 1)
		{
			let new_world_center = wilson_8.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8, 4 * Math.pow(2, zoom_level_8));
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8) * aspect_ratio_8;
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8);
			
			wilson_8.world_center_x = new_world_center[0];
			wilson_8.world_center_y = new_world_center[1];
			
			
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], wilson_8.world_height / 2);
			
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], wilson_8.world_height / 2);
		}
		
		
		
		else
		{
			let new_world_center = wilson_8.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level_8), 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8);
			
			wilson_8.world_width = 4 * Math.pow(2, zoom_level_8);
			wilson_8.world_height = 4 * Math.pow(2, zoom_level_8) / aspect_ratio_8;
			
			wilson_8.world_center_x = new_world_center[0];
			wilson_8.world_center_y = new_world_center[1];
			
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_8.gl.uniform1f(wilson_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_8.gl.uniform1f(wilson_8.uniforms["world_size"], wilson_8.world_width / 2);
			
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_x"], wilson_8.world_center_x);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["center_y"], wilson_8.world_center_y);
			wilson_hidden_8.gl.uniform1f(wilson_hidden_8.uniforms["world_size"], wilson_8.world_width / 2);
		}
		
		window.requestAnimationFrame(draw_julia_set_8)
		
		wilson_8.draggables.recalculate_locations();
	}
}()