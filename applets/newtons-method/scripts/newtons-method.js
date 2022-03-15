!function()
{
	"use strict";
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspect_ratio;
		
		uniform float world_center_x;
		uniform float world_center_y;
		uniform float world_size;
		
		uniform int num_roots;
		
		uniform vec2 roots[8];
		
		uniform vec3 colors[8];
		
		uniform vec2 a;
		uniform vec2 c;
		
		uniform float brightness_scale;
		
		const float threshhold = .05;
		
		
		
		//Returns z_1 * z_2.
		vec2 cmul(vec2 z_1, vec2 z_2)
		{
			return vec2(z_1.x * z_2.x - z_1.y * z_2.y, z_1.x * z_2.y + z_1.y * z_2.x);
		}
		
		
		
		//Returns 1/z.
		vec2 cinv(vec2 z)
		{
			float magnitude = z.x*z.x + z.y*z.y;
			
			return vec2(z.x / magnitude, -z.y / magnitude);
		}
		
		
		
		//Returns f(z) for a polynomial f with given roots.
		vec2 cpoly(vec2 z)
		{
			vec2 result = vec2(1.0, 0.0);
			
			for (int i = 0; i <= 8; i++)
			{
				if (i == num_roots)
				{
					return result;
				}
				
				result = cmul(result, z - roots[i]);
			}
		}
		
		
		
		//Approximates f'(z) for a polynomial f with given roots.
		vec2 cderiv(vec2 z)
		{
			return 20.0 * (cpoly(z + vec2(.025, 0.0)) - cpoly(z - vec2(.025, 0.0)));
		}
		
		
		
		void main(void)
		{
			vec2 z;
			vec2 last_z = vec2(0.0, 0.0);
			
			if (aspect_ratio >= 1.0)
			{
				z = vec2(uv.x * aspect_ratio * world_size + world_center_x, uv.y * world_size + world_center_y);
			}
			
			else
			{
				z = vec2(uv.x * world_size + world_center_x, uv.y / aspect_ratio * world_size + world_center_y);
			}
			
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				vec2 temp = cmul(cmul(cpoly(z), cinv(cderiv(z))), a) + c;
				
				last_z = z;
				
				z -= temp;
				
				
				
				for (int i = 0; i <= 8; i++)
				{
					if (i == num_roots)
					{
						break;
					}
					
					float d_0 = length(z - roots[i]);
					
					if (d_0 < threshhold)
					{
						float d_1 = length(last_z - roots[i]);
						
						float brightness_adjust = (log(threshhold) - log(d_0)) / (log(d_1) - log(d_0));
						
						float brightness = 1.0 - (float(iteration) - brightness_adjust) / brightness_scale;
						
						gl_FragColor = vec4(colors[i] * brightness, 1.0);
						
						return;
					}
				}
			}
		}
	`;



	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 500,
		canvas_height: 500,
		
		world_width: 3,
		world_height: 3,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_draggable,
		draggables_touchmove_callback: on_drag_draggable,
		
		draggables_mouseup_callback: on_release_draggable,
		draggables_touchend_callback: on_release_draggable,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio,
		
		
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas,
		
		wheel_callback: on_wheel_canvas,
		pinch_callback: on_pinch_canvas
	};
	
	let options_hidden =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 100,
		canvas_height: 100
	};
	
	
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);

	wilson.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "num_roots", "roots", "colors", "a", "c", "brightness_scale"]);
	
	
	
	let wilson_hidden = new Wilson(Page.element.querySelector("#hidden-canvas"), options_hidden);
	
	wilson_hidden.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "num_roots", "roots", "colors", "a", "c", "brightness_scale"]);
	
	
	
	let a = [1, 0];
	let c = [0, 0];
	
	let current_roots = [];
	
	let last_active_root = 0;
	
	let num_roots = 0;
	
	let aspect_ratio = 1;
	
	let num_iterations = 100;
	
	let zoom_level = 0;
	
	let past_brightness_scales = [];
	
	let resolution = 500;
	let resolution_hidden = 100;
	
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	let next_pan_velocity_x = 0;
	let next_pan_velocity_y = 0;
	let next_zoom_velocity = 0;
	
	let pan_velocity_x = 0;
	let pan_velocity_y = 0;
	let zoom_velocity = 0;
	
	const pan_friction = .96;
	const pan_velocity_start_threshhold = .0025;
	const pan_velocity_stop_threshhold = .00025;
	
	const zoom_friction = .93;
	const zoom_velocity_start_threshhold = .01;
	const zoom_velocity_stop_threshhold = .001;
	
	let last_timestamp = -1;
	
	
	
	let element = wilson.draggables.add(1, 0);
	
	element.classList.add("a-marker");
	
	element = wilson.draggables.add(0, 0);
	
	element.classList.add("c-marker");
	
	
	
	add_root();
	add_root();
	add_root();
	
	spread_roots();
	
	

	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson.change_canvas_size(resolution, resolution);
		
		window.requestAnimationFrame(draw_newtons_method);
	});
	
	
	
	let add_root_button_element = Page.element.querySelector("#add-root-button");
	
	add_root_button_element.addEventListener("click", add_root);
	
	
	
	let remove_root_button_element = Page.element.querySelector("#remove-root-button");
	
	remove_root_button_element.addEventListener("click", remove_root);
	
	
	
	let spread_roots_button_element = Page.element.querySelector("#spread-roots-button");
	
	spread_roots_button_element.addEventListener("click", spread_roots);
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("newtons-method.png");
	});
	
	
	
	let root_a_input_element = Page.element.querySelector("#root-a-input");
	let root_b_input_element = Page.element.querySelector("#root-b-input");
	
	root_a_input_element.addEventListener("input", set_root);
	root_b_input_element.addEventListener("input", set_root);
	
	
	
	let root_setter_element = Page.element.querySelector("#root-setter");
	
	
	
	//Render the inital frame.
	wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
	
	wilson.gl.uniform3fv(wilson.uniforms["colors"], [1, 0, 0,   0, 1, 0,   0, 0, 1,   0, 1, 1,   1, 0, 1,   1, 1, 0,   .5, 0, 1,   1, .5, 0]);
	
	wilson_hidden.gl.uniform3fv(wilson_hidden.uniforms["colors"], [1, 0, 0,   0, 1, 0,   0, 0, 1,   0, 1, 1,   1, 0, 1,   1, 1, 0,   .5, 0, 1,   1, .5, 0]);
	
	window.requestAnimationFrame(draw_newtons_method);
	
	
	
	Page.show();
	
	
	
	function add_root()
	{
		if (num_roots === 8)
		{
			return;
		}
		
		
		
		let x = Math.random() * 3 - 1.5;
		let y = Math.random() * 3 - 1.5;
		
		wilson.draggables.add(x, y);
		
		current_roots.push(x);
		current_roots.push(y);
		
		num_roots++;
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	function remove_root()
	{
		if (num_roots === 1)
		{
			return;
		}
		
		
		num_roots--;
		
		current_roots.pop();
		current_roots.pop();
		
		wilson.draggables.draggables[num_roots + 2].remove();
		
		wilson.draggables.draggables.pop();
		wilson.draggables.world_coordinates.pop();
		
		wilson.draggables.num_draggables--;
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	function spread_roots()
	{
		for (let i = 0; i < num_roots; i++)
		{
			if (i < num_roots / 2 || num_roots % 2 === 1)
			{
				current_roots[2 * i] = Math.cos(2 * Math.PI * 2 * i / num_roots);
				current_roots[2 * i + 1] = Math.sin(2 * Math.PI * 2 * i / num_roots);
			}
			
			else
			{
				current_roots[2 * i] = Math.cos(2 * Math.PI * (2 * i + 1) / num_roots);
				current_roots[2 * i + 1] = Math.sin(2 * Math.PI * (2 * i + 1) / num_roots);
			}
			
			wilson.draggables.world_coordinates[i + 2] = [current_roots[2 * i], current_roots[2 * i + 1]];
		}
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
	}
	
	
	
	function set_root()
	{
		if (last_active_root === 0)
		{
			a[0] = parseFloat(root_a_input_element.value || 1);
			a[1] = parseFloat(root_b_input_element.value || 0);
			
			wilson.draggables.world_coordinates[0] = [a[0], a[1]];
		}
		
		
		
		else if (last_active_root === 1)
		{
			c[0] = parseFloat(root_a_input_element.value || 0) * 10;
			c[1] = parseFloat(root_b_input_element.value || 0) * 10;
			
			wilson.draggables.world_coordinates[1] = [c[0], c[1]];
		}
		
		
		
		else
		{
			current_roots[2 * (last_active_root - 2)] = parseFloat(root_a_input_element.value || 0);
			current_roots[2 * (last_active_root - 2) + 1] = parseFloat(root_b_input_element.value || 0);
			
			wilson.draggables.world_coordinates[last_active_root - 2] = [current_roots[2 * (last_active_root - 2)], current_roots[2 * (last_active_root - 2) + 1]];
		}
		
		
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
	}
	
	
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		wilson.world_center_x -= x_delta;
		wilson.world_center_y -= y_delta;
		
		next_pan_velocity_x = -x_delta / wilson.world_width;
		next_pan_velocity_y = -y_delta / wilson.world_height;
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (Math.sqrt(next_pan_velocity_x * next_pan_velocity_x + next_pan_velocity_y * next_pan_velocity_y) >= pan_velocity_start_threshhold)
		{
			pan_velocity_x = next_pan_velocity_x;
			pan_velocity_y = next_pan_velocity_y;
		}
		
		if (Math.abs(next_zoom_velocity) >= zoom_velocity_start_threshhold)
		{
			zoom_velocity = next_zoom_velocity;
		}
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level += scroll_amount / 100;
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas();
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio >= 1)
		{
			zoom_level -= touch_distance_delta / wilson.world_width * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_width * 10;
		}
		
		else
		{
			zoom_level -= touch_distance_delta / wilson.world_height * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_height * 10;
		}
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level) * aspect_ratio, 3 * Math.pow(2, zoom_level));
			
			wilson.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson.world_height = 3 * Math.pow(2, zoom_level);
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level), 3 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson.world_width = 3 * Math.pow(2, zoom_level);
			wilson.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
	}
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		if (active_draggable === 0)
		{
			a = [x, y];
		}
		
		else if (active_draggable === 1)
		{
			c = [x, y];
		}
		
		else
		{
			current_roots[2 * (active_draggable - 2)] = x;
			current_roots[2 * (active_draggable - 2) + 1] = y;
		}
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	function on_release_draggable(active_draggable, x, y, event)
	{
		root_setter_element.style.opacity = 0;
		
		setTimeout(() =>
		{
			last_active_root = active_draggable;
			
			if (last_active_root === 0)
			{
				root_a_input_element.value = Math.round(a[0] * 1000) / 1000;
				root_b_input_element.value = Math.round(a[1] * 1000) / 1000;
			}
			
			else if (last_active_root === 1)
			{
				root_a_input_element.value = Math.round(c[0] * 1000) / 10000;
				root_b_input_element.value = Math.round(c[1] * 1000) / 10000;
			}
			
			else
			{
				root_a_input_element.value = Math.round(current_roots[2 * (last_active_root - 2)] * 1000) / 1000;
				root_b_input_element.value = Math.round(current_roots[2 * (last_active_root - 2) + 1] * 1000) / 1000;
			}
			
			root_setter_element.style.opacity = 1;
		}, Site.opacity_animation_time);
	}



	function draw_newtons_method(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], aspect_ratio);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_x"], wilson.world_center_x);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["num_roots"], num_roots);
		
		wilson_hidden.gl.uniform2fv(wilson_hidden.uniforms["roots"], current_roots);
		
		wilson_hidden.gl.uniform2fv(wilson_hidden.uniforms["a"], a);
		wilson_hidden.gl.uniform2f(wilson_hidden.uniforms["c"], c[0] / 10, c[1] / 10);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 30);
		
		wilson_hidden.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = Math.max(Math.max(pixel_data[4 * i], pixel_data[4 * i + 1]), pixel_data[4 * i + 2]);
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = Math.min(10000 / (brightnesses[Math.floor(resolution_hidden * resolution_hidden * .96)] + brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)]), 200);
		
		past_brightness_scales.push(brightness_scale);
		
		let denom = past_brightness_scales.length;
		
		if (denom > 10)
		{
			past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		wilson.gl.uniform1f(wilson.uniforms["world_center_x"], wilson.world_center_x);
		wilson.gl.uniform1f(wilson.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson.gl.uniform1i(wilson.uniforms["num_roots"], num_roots);
		
		wilson.gl.uniform2fv(wilson.uniforms["roots"], current_roots);
		
		wilson.gl.uniform2fv(wilson.uniforms["a"], a);
		wilson.gl.uniform2f(wilson.uniforms["c"], c[0] / 10, c[1] / 10);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
		wilson.render.draw_frame();
		
		
		
		if (time_elapsed >= 50)
		{
			pan_velocity_x = 0;
			pan_velocity_y = 0;
			zoom_velocity = 0;
			
			next_pan_velocity_x = 0;
			next_pan_velocity_y = 0;
			next_zoom_velocity = 0;
		}
		
		
		
		if (pan_velocity_x !== 0 || pan_velocity_y !== 0 || zoom_velocity !== 0)
		{
			wilson.world_center_x += pan_velocity_x * wilson.world_width;
			wilson.world_center_y += pan_velocity_y * wilson.world_height;
			
			
			
			pan_velocity_x *= pan_friction;
			pan_velocity_y *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x = 0;
				pan_velocity_y = 0;
			}
			
			
			
			zoom_level += zoom_velocity;
			
			zoom_canvas(fixed_point_x, fixed_point_y);
			
			zoom_velocity *= zoom_friction;
			
			if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_newtons_method);
			
			wilson.draggables.recalculate_locations();
		}
	}
	
	
	
	function change_aspect_ratio()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				
				wilson.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 3 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson.world_width = 3 * Math.pow(2, zoom_level);
				wilson.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson.change_canvas_size(resolution, resolution);
			
			wilson.world_width = 3 * Math.pow(2, zoom_level);
			wilson.world_height = 3 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_newtons_method);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()