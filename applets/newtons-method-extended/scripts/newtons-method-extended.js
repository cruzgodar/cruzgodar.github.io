!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let wilson = null;
	let wilson_hidden = null;
	
	
	
	let a = [1, 0];
	let c = [0, 0];
	
	let aspect_ratio = 1;
	
	let num_iterations = 100;
	
	let zoom_level = 1;
	
	let past_brightness_scales = [];
	
	let resolution = 500;
	let resolution_hidden = 100;
	
	let derivative_precision = 20;
	
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
	
	let currently_animating_parameters = false;
	let parameter_animation_frame = 0;
	
	
	
	let colors = null;
	let color_deltas = new Array(12);
	let old_colors = new Array(12);
	
	
	
	
	
	let code_input_element = document.querySelector("#code-textarea");
	
	code_input_element.value = "cmul(csin(z), csin(cmul(z, i)))";
	
	
	
	let randomize_palette_button = document.querySelector("#randomize-palette-button");
	
	randomize_palette_button.addEventListener("click", animate_palette_change);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", use_new_code);
	
	
	

	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson.change_canvas_size(resolution, resolution);
		
		window.requestAnimationFrame(draw_newtons_method);
	});
	
	
	
	let derivative_precision_input_element = document.querySelector("#derivative-precision-input");
	
	derivative_precision_input_element.addEventListener("input", () =>
	{
		derivative_precision = parseFloat(derivative_precision_input_element.value || 20);
		
		wilson.gl.uniform1f(wilson.uniforms["derivative_precision"], derivative_precision);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["derivative_precision"], derivative_precision);
		
		window.requestAnimationFrame(draw_newtons_method);
	});
	
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("newtons-method.png");
	});
	
	
	
	let canvas_location_element = document.querySelector("#canvas-location");
	
	
	
	use_new_code();
	
	
	
	function use_new_code()
	{
		let generating_code = code_input_element.value || "cmul(csin(z), csin(cmul(z, i)))";
		
		
		
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float derivative_precision;
			
			
			uniform vec3 colors[4];
			
			uniform vec2 a;
			uniform vec2 c;
			
			uniform float brightness_scale;
			
			const float threshhold = .01;
			
			
			
			${COMPLEX_GLSL}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generating_code};
			}
			
			
			
			//Approximates f'(z) for a polynomial f with given roots.
			vec2 cderiv(vec2 z)
			{
				return derivative_precision * (f(z + vec2(1.0 / (2.0*derivative_precision), 0.0)) - f(z - vec2(1.0 / (2.0*derivative_precision), 0.0)));
			}
			
			
			
			void main(void)
			{
				vec2 z;
				vec2 last_z = vec2(0.0, 0.0);
				vec2 old_z = vec2(0.0, 0.0);
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * world_size + world_center_x, uv.y * world_size + world_center_y);
				}
				
				else
				{
					z = vec2(uv.x * world_size + world_center_x, uv.y / aspect_ratio * world_size + world_center_y);
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int iteration = 0; iteration < 200; iteration++)
				{
					vec2 temp = cmul(cmul(f(z), cinv(cderiv(z))), a) + c;
					
					old_z = last_z;
					
					last_z = z;
					
					z -= temp;
					
					
					
					//If we're slowing down, it's reasonably safe to assume that we're near a root.
					
					float d_0 = length(last_z - z);
					
					if (d_0 < threshhold)
					{
						float d_1 = length(old_z - last_z);
						
						float brightness_adjust = (log(threshhold) - log(d_0)) / (log(d_1) - log(d_0));
						
						float brightness = 1.0 - (float(iteration) - brightness_adjust) / brightness_scale;
						
						//Round to a square grid so that basin colors are consistent.
						vec2 theoretical_root = floor(z / (threshhold / 3.0)) * threshhold / 3.0;
						
						float c0 = sin(theoretical_root.x * 7.239846) + cos(theoretical_root.x * 2.945387) + 2.0;
						
						float c1 = sin(theoretical_root.y * 5.918445) + cos(theoretical_root.y * .987235) + 2.0;
						
						float c2 = sin((theoretical_root.x + theoretical_root.y) * 1.023974) + cos((theoretical_root.x + theoretical_root.y) * 9.130874) + 2.0;
						
						float c3 = sin((theoretical_root.x - theoretical_root.y) * 3.258342) + cos((theoretical_root.x - theoretical_root.y) * 4.20957) + 2.0;
						
						//Pick an interpolated color between the 4 that we chose earlier.
						gl_FragColor = vec4((c0 * colors[0] + c1 * colors[1] + c2 * colors[2] + c3 * colors[3]) / (c0 + c1 + c2 + c3) * brightness, 1.0);
						
						return;
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
			
			world_width: 12,
			world_height: 12,
			world_center_x: 0,
			world_center_y: 0,
			
			
			
			use_draggables: true,
			
			draggables_mousemove_callback: on_drag_draggable,
			draggables_touchmove_callback: on_drag_draggable,
			
			
			
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
		
		
		
		try
		{
			wilson.output_canvas_container.parentNode.remove();
			wilson_hidden.output_canvas_container.parentNode.remove();
			
			canvas_location_element.insertAdjacentHTML("beforebegin", `
				<div>
					<canvas id="output-canvas" class="output-canvas"></canvas>
					<canvas id="hidden-canvas" class="hidden-canvas"></canvas>
				</div>
			`);
		}
		
		catch(ex) {}
		
		
		
		wilson = new Wilson(document.querySelector("#output-canvas"), options);

		wilson.render.init_uniforms(["aspect_ratio", "derivative_precision", "world_center_x", "world_center_y", "world_size", "colors", "a", "c", "brightness_scale"]);
		
		
		
		wilson_hidden = new Wilson(document.querySelector("#hidden-canvas"), options_hidden);
		
		wilson_hidden.render.init_uniforms(["aspect_ratio", "derivative_precision", "world_center_x", "world_center_y", "world_size", "colors", "a", "c", "brightness_scale"]);
		
		
		
		past_brightness_scales = [];
		
		zoom_level = 2;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		
		
		let element = wilson.draggables.add(1, 0);
	
		element.classList.add("a-marker");
		
		element = wilson.draggables.add(0, 0);
		
		element.classList.add("c-marker");
		
		a = [1, 0];
		c = [0, 0];
		
		
		
		colors = generate_new_palette();
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], 1);
		
		wilson.gl.uniform1f(wilson.uniforms["derivative_precision"], derivative_precision);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["derivative_precision"], derivative_precision);
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilson_hidden.gl.uniform3fv(wilson_hidden.uniforms["colors"], colors);
		
		
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	//Pick 4 colors, each with a bright, medium, and dim component. Each of these colors will be interpolated between based on the target x and y coordinates of the attractive root, forming a quadrilateral in the color plane. Since these 4 corner points are brightish but not overly so and decently saturated, this process almost always produces a pleasing palette.
	function generate_new_palette()
	{
		let new_colors = new Array(12);
		
		let hue = 0;
		
		let restrictions = [];
		
		let restriction_width = .1;
		
		
		
		for (let i = 0; i < 4; i++)
		{
			hue = Math.random() * (1 - i * 2 * restriction_width);
			
			for (let j = 0; j < i; j++)
			{
				if (hue > restrictions[j])
				{
					hue += restriction_width*2;
				}
			}
			
			restrictions[i] = hue - restriction_width;
			
			restrictions.sort();
			
			
			
			let rgb = wilson.utils.hsv_to_rgb(hue, Math.random() * .25 + .75, Math.random() * .25 + .75);
			
			new_colors[3*i] = rgb[0] / 255;
			new_colors[3*i + 1] = rgb[1] / 255;
			new_colors[3*i + 2] = rgb[2] / 255;
		}
		
		return new_colors;
	}
	
	
	
	function animate_palette_change()
	{
		if (!currently_animating_parameters)
		{
			currently_animating_parameters = true;
			
			parameter_animation_frame = 0;
			
			
			
			let new_colors = generate_new_palette();
			old_colors = [...colors];
			
			for (let i = 0; i < 12; i++)
			{
				color_deltas[i] = new_colors[i] - colors[i];
			}
			
			window.requestAnimationFrame(draw_newtons_method);
		}
	}
	
	
	
	function animate_palette_change_step()
	{
		let t = .5 * Math.sin(Math.PI * parameter_animation_frame / 30 - Math.PI / 2) + .5;
		
		for (let i = 0; i < 12; i++)
		{
			colors[i] = old_colors[i] + color_deltas[i]*t;
		}
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilson_hidden.gl.uniform3fv(wilson_hidden.uniforms["colors"], colors);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 31)
		{
			currently_animating_parameters = false;
		}
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
		
		else
		{
			c = [x, y];
		}
		
		window.requestAnimationFrame(draw_newtons_method);
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
		
		wilson.gl.uniform2fv(wilson.uniforms["a"], a);
		wilson.gl.uniform2f(wilson.uniforms["c"], c[0] / 10, c[1] / 10);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
		wilson.render.draw_frame();
		
		
		
		let need_new_frame = false;
		
		if (currently_animating_parameters)
		{
			animate_palette_change_step();
			
			need_new_frame = true;
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
			
			
			
			need_new_frame = true;
			
			wilson.draggables.recalculate_locations();
		}
		
		
		
		if (need_new_frame)
		{
			window.requestAnimationFrame(draw_newtons_method);
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