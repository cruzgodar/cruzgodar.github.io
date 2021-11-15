!function()
{
	"use strict";
	
	
	
	let wilson = null;
	let wilson_hidden = null;
	
	let generating_code = "cadd(cpow(z, 2.0), c)";
	
	let julia_mode = 0;
	
	let aspect_ratio = 1;
	
	let num_iterations = 200;
	
	let exposure = 1;
	
	let zoom_level = 0;
	
	let past_brightness_scales = [];
	
	let a = 0;
	let b = 0;
	
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
	
	
	
	let code_input_element = document.querySelector("#code-textarea");
	
	code_input_element.value = "cadd(cpow(z, 2.0), c)";
	
	

	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson.change_canvas_size(resolution, resolution);
	});
	
	
	
	let exposure_input_element = document.querySelector("#exposure-input");
	
	exposure_input_element.addEventListener("input", () =>
	{
		exposure = parseFloat(exposure_input_element.value || 1);
	});
	
	
	
	let num_iterations_input_element = document.querySelector("#num-iterations-input");
	
	num_iterations_input_element.addEventListener("input", () =>
	{
		num_iterations = parseInt(num_iterations_input_element.value || 200);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-generalized-julia-set.png");
	});
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", use_new_code);
	
	
	
	let switch_julia_mode_button_element = document.querySelector("#switch-julia-mode-button");
	
	switch_julia_mode_button_element.addEventListener("click", () =>
	{
		switch_julia_mode_button_element.style.opacity = 0;
		
		setTimeout(() =>
		{
			if (julia_mode === 2)
			{
				switch_julia_mode_button_element.textContent = "Return to Mandelbrot Set";
			}
			
			else if (julia_mode === 0)
			{
				switch_julia_mode_button_element.textContent = "Pick Julia Set";
				
				switch_julia_mode_button_element.style.opacity = 1;
			}
		}, Site.opacity_animation_time);
		
		
		
		if (julia_mode === 0)
		{
			julia_mode = 2;
			
			a = 0;
			b = 0;
			
			pan_velocity_x = 0;
			pan_velocity_y = 0;
			zoom_velocity = 0;
			
			next_pan_velocity_x = 0;
			next_pan_velocity_y = 0;
			next_zoom_velocity = 0;
			
			past_brightness_scales = [];
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else if (julia_mode === 1)
		{
			julia_mode = 0;
			
			wilson.world_center_x = 0;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			window.requestAnimationFrame(draw_julia_set);
		}
	});
	
	
	
	let canvas_location_element = document.querySelector("#canvas-location");
	
	
	
	use_new_code();
	
	
	
	function use_new_code()
	{
		generating_code = code_input_element.value || "cadd(cpow(z, 2.0), c)";
		
		
		
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform int julia_mode;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float a;
			uniform float b;
			uniform float exposure;
			uniform int num_iterations;
			uniform float brightness_scale;
			
			
			
			${COMPLEX_GLSL}
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * world_size + world_center_x, uv.y * world_size + world_center_y);
				}
				
				else
				{
					z = vec2(uv.x * world_size + world_center_x, uv.y / aspect_ratio * world_size + world_center_y);
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (julia_mode == 0)
				{
					vec2 c = z;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generating_code};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * exposure * color, 1.0);
				}
				
				
				
				else if (julia_mode == 1)
				{
					vec2 c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generating_code};
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * exposure * color, 1.0);
				}
				
				
				
				else
				{
					vec2 c = z;
					
					bool broken = false;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generating_code};
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightness_scale * exposure * color, 1.0);
					}
					
					
					
					z = vec2(uv.x * aspect_ratio * 2.0, uv.y * 2.0);
					color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor.xyz /= 4.0;
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = ${generating_code};
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightness_scale * exposure * color, 0.0);
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
			
			world_width: 4,
			world_height: 4,
			world_center_x: 0,
			world_center_y: 0,
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: change_aspect_ratio,
			
			
			
			mousedown_callback: on_grab_canvas,
			touchstart_callback: on_grab_canvas,
			
			mousemove_callback: on_hover_canvas,
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

		wilson.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "exposure", "brightness_scale"]);
		
		
		
		wilson_hidden = new Wilson(document.querySelector("#hidden-canvas"), options_hidden);
		
		wilson_hidden.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "exposure", "brightness_scale"]);
		
		
		
		julia_mode = 0;
		zoom_level = 0;
		
		past_brightness_scales = [];
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], 1);
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		
		
		if (julia_mode === 2 && event.type === "mousedown")
		{
			julia_mode = 1;
			
			wilson.world_center_x = 0;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			switch_julia_mode_button_element.style.opacity = 1;
			
			window.requestAnimationFrame(draw_julia_set);
		}
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (julia_mode === 2 && event.type === "touchmove")
		{
			a = x;
			b = y;
		}
		
		else
		{
			wilson.world_center_x -= x_delta;
			wilson.world_center_y -= y_delta;
			
			next_pan_velocity_x = -x_delta / wilson.world_width;
			next_pan_velocity_y = -y_delta / wilson.world_height;
			
			wilson.world_center_x = Math.min(Math.max(wilson.world_center_x, -2), 2);
			wilson.world_center_y = Math.min(Math.max(wilson.world_center_y, -2), 2);
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function on_hover_canvas(x, y, x_delta, y_delta, event)
	{
		if (julia_mode === 2 && event.type === "mousemove")
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(draw_julia_set);
		}
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (julia_mode === 2 && event.type === "touchend")
		{
			julia_mode = 1;
			
			wilson.world_center_x = 0;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			switch_julia_mode_button_element.style.opacity = 1;
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else
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
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level += scroll_amount / 100;
			
			zoom_level = Math.min(zoom_level, 1);
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas();
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (julia_mode === 2)
		{
			return;
		}
		
		
		
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
		
		zoom_level = Math.min(zoom_level, 1);
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level) * aspect_ratio, 4 * Math.pow(2, zoom_level));
			
			wilson.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson.world_height = 4 * Math.pow(2, zoom_level);
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level), 4 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson.world_width = 4 * Math.pow(2, zoom_level);
			wilson.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		num_iterations = (-zoom_level * 30) + 200;
		
		window.requestAnimationFrame(draw_julia_set);
	}



	function draw_julia_set(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["julia_mode"], julia_mode);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_x"], wilson.world_center_x);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["num_iterations"], num_iterations);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["exposure"], 1);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["a"], a);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["b"], b);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 20 * (Math.abs(zoom_level) + 1));
		
		wilson_hidden.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = (brightnesses[Math.floor(resolution_hidden * resolution_hidden * .96)] + brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)]) / 255 * 15 * (Math.abs(zoom_level / 2) + 1);
		
		past_brightness_scales.push(brightness_scale);
		
		let denom = past_brightness_scales.length;
		
		if (denom > 10)
		{
			past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		wilson.gl.uniform1i(wilson.uniforms["julia_mode"], julia_mode);
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		
		wilson.gl.uniform1f(wilson.uniforms["world_center_x"], wilson.world_center_x);
		wilson.gl.uniform1f(wilson.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson.gl.uniform1i(wilson.uniforms["num_iterations"], num_iterations);
		wilson.gl.uniform1f(wilson.uniforms["exposure"], exposure);
		wilson.gl.uniform1f(wilson.uniforms["a"], a);
		wilson.gl.uniform1f(wilson.uniforms["b"], b);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
		wilson.render.draw_frame();
		
		
		
		if (pan_velocity_x !== 0 || pan_velocity_y !== 0 || zoom_velocity !== 0)
		{
			wilson.world_center_x += pan_velocity_x * wilson.world_width;
			wilson.world_center_y += pan_velocity_y * wilson.world_height;
			
			wilson.world_center_x = Math.min(Math.max(wilson.world_center_x, -2), 2);
			wilson.world_center_y = Math.min(Math.max(wilson.world_center_y, -2), 2);
			
			
			
			pan_velocity_x *= pan_friction;
			pan_velocity_y *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x = 0;
				pan_velocity_y = 0;
			}
			
			
			
			zoom_level += zoom_velocity;
			
			zoom_level = Math.min(zoom_level, 1);
			
			zoom_canvas(fixed_point_x, fixed_point_y);
			
			zoom_velocity *= zoom_friction;
			
			if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_julia_set);
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
				
				wilson.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 4 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson.world_width = 4 * Math.pow(2, zoom_level);
				wilson.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson.change_canvas_size(resolution, resolution);
			
			wilson.world_width = 4 * Math.pow(2, zoom_level);
			wilson.world_height = 4 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()