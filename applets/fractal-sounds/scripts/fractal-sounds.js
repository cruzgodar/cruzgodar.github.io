!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let wilson = null;
	let wilson_hidden = null;
	let wilson_line_drawer = null;
	
	let line_drawer_canvas_container_element = document.querySelector("#line-drawer-canvas-container");
	
	let julia_mode = 0;
	
	let aspect_ratio = 1;
	
	let num_iterations = 200;
	let starting_iterations = 200;
	
	let exposure = 1;
	
	let zoom_level = 0;
	
	let past_brightness_scales = [];
	
	let opacity_frame = 0;
	let need_to_hide = false;
	
	let resolution = 500;
	let resolution_hidden = 200;
	
	let need_to_clear = false;
	
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	let num_touches = 0;
	
	let moved = 0;
	
	let last_x = 0;
	let last_y = 0;	
	let zooming_with_mouse = false;
	
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
	
	
	
	let fractals = 
	{
		"mandelbrot": ["cmul(z, z) + c", (x, y, a, b) => [x*x - y*y + a, 2*x*y + b]],
		"sfx": ["cmul(z, dot(z, z)) - cmul(z, c*c)", (x, y, a, b) => [x*x*x + x*y*y - x*a*a + y*b*b, x*x*y - x*b*b + y*y*y - y*a*a]],
		"burning-ship": ["-vec2(z.x * z.x - z.y * z.y, 2.0 * abs(z.x * z.y)) + c", (x, y, a, b) => [-(x*x - y*y) + a, -(2 * Math.abs(x * y)) + b]]
	};
	
	let current_fractal_function = fractals["mandelbrot"][1];
	
	
	
	let options_line_drawer =
	{
		renderer: "cpu",
		
		canvas_width: resolution,
		canvas_height: resolution,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		mousemove_callback: on_hover_canvas,
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas,
		
		wheel_callback: on_wheel_canvas,
		pinch_callback: on_pinch_canvas,
		
		use_fullscreen: true,
	
		true_fullscreen: true,
	
		use_fullscreen_button: false
	};
	
	wilson_line_drawer = new Wilson(document.querySelector("#line-drawer-canvas"), options_line_drawer);
	
	document.querySelector(".wilson-fullscreen-components-container").style.setProperty("z-index", 200, "important");
	
	wilson_line_drawer.ctx.lineWidth = 2;
	
	
	
	let fractal_selector_dropdown_element = document.querySelector("#fractal-selector-dropdown");
	
	fractal_selector_dropdown_element.addEventListener("input", use_new_code);
	
	

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
		starting_iterations = parseInt(num_iterations_input_element.value || 200);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-generalized-julia-set.png");
	});
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", use_new_code);
	
	
	
	
	let canvas_location_element = document.querySelector("#canvas-location");
	
	
	
	use_new_code();
	
	
	
	function use_new_code()
	{
		let generating_code = fractals[fractal_selector_dropdown_element.value][0];
		
		current_fractal_function = fractals[fractal_selector_dropdown_element.value][1];
		
		
		
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float exposure;
			uniform int num_iterations;
			uniform float brightness_scale;
			
			const float hue_multiplier = 100.0;
			
			
			
			${COMPLEX_GLSL}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
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
				
				float brightness = exp(-max(length(z), .5));
				
				vec2 c = z;
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				vec2 last_z_1 = vec2(0.0, 0.0);
				vec2 last_z_2 = vec2(0.0, 0.0);
				vec2 last_z_3 = vec2(0.0, 0.0);
				vec2 last_z_4 = vec2(0.0, 0.0);
				vec2 last_z_5 = vec2(0.0, 0.0);
				vec2 last_z_6 = vec2(0.0, 0.0);
				vec2 last_z_7 = vec2(0.0, 0.0);
				vec2 last_z_8 = vec2(0.0, 0.0);
				vec2 last_z_9 = vec2(0.0, 0.0);
				
				float hue_1 = 0.0;
				float hue_2 = 0.0;
				float hue_3 = 0.0;
				float hue_4 = 0.0;
				float hue_5 = 0.0;
				float hue_6 = 0.0;
				float hue_7 = 0.0;
				float hue_8 = 0.0;
				float hue_9 = 0.0;
				
				vec3 color_1 = hsv2rgb(vec3(0.0, 1.0, 1.0));
				vec3 color_2 = hsv2rgb(vec3(0.1, 1.0, 1.0));
				vec3 color_3 = hsv2rgb(vec3(0.2, 1.0, 1.0));
				vec3 color_4 = hsv2rgb(vec3(0.3, 1.0, 1.0));
				vec3 color_5 = hsv2rgb(vec3(0.4, 1.0, 1.0));
				vec3 color_6 = hsv2rgb(vec3(0.5, 1.0, 1.0));
				vec3 color_7 = hsv2rgb(vec3(0.6, 1.0, 1.0));
				vec3 color_8 = hsv2rgb(vec3(0.7, 1.0, 1.0));
				vec3 color_9 = hsv2rgb(vec3(0.8, 1.0, 1.0));
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						vec3 color = hue_1 * color_1 + hue_2 * color_2 + hue_3 * color_3 + hue_4 * color_4 + hue_5 * color_5 + hue_6 * color_6 + hue_7 * color_7 + hue_8 * color_8 + hue_9 * color_9;
						gl_FragColor = vec4(brightness / brightness_scale * exposure * normalize(color), 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					
					last_z_9 = last_z_8;
					last_z_8 = last_z_7;
					last_z_7 = last_z_6;
					last_z_6 = last_z_5;
					last_z_5 = last_z_4;
					last_z_4 = last_z_3;
					last_z_3 = last_z_2;
					last_z_2 = last_z_1;
					last_z_1 = z;
					z = ${generating_code};
					
					
					
					brightness += exp(-max(length(z), .5));
					
					hue_1 += exp(-hue_multiplier * length(z - last_z_1));
					hue_2 += exp(-hue_multiplier * length(z - last_z_2));
					hue_3 += exp(-hue_multiplier * length(z - last_z_3));
					hue_4 += exp(-hue_multiplier * length(z - last_z_4));
					hue_5 += exp(-hue_multiplier * length(z - last_z_5));
					hue_6 += exp(-hue_multiplier * length(z - last_z_6));
					hue_7 += exp(-hue_multiplier * length(z - last_z_7));
					hue_8 += exp(-hue_multiplier * length(z - last_z_8));
					hue_9 += exp(-hue_multiplier * length(z - last_z_9));
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
			
			switch_fullscreen_callback: switch_fullscreen
		};
		
		let options_hidden =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: resolution_hidden,
			canvas_height: resolution_hidden
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
		
		wilson_line_drawer.world_width = 4;
		wilson_line_drawer.world_height = 4;
		wilson_line_drawer.world_center_x = 0;
		wilson_line_drawer.world_center_y = 0;
		
		
		
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
		
		opacity_frame = 0;
		need_to_hide = false;
		line_drawer_canvas_container_element.style.opacity = 1;
		
		
		
		if (event.type === "touchstart")
		{
			num_touches = event.touches.length;
			
			if (num_touches === 1)
			{
				show_orbit(x, y);
				play_sound(x, y);
			}
		}
		
		else
		{
			moved = 0;
			show_orbit(x, y);
		}
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (event.type === "mousemove" || num_touches >= 2)
		{
			if (num_touches >= 2 || Math.abs(x_delta) > 0 || Math.abs(y_delta) > 0)
			{
				wilson_line_drawer.ctx.clearRect(0, 0, resolution, resolution);
			}	
			
			wilson_line_drawer.world_center_x -= x_delta;
			wilson_line_drawer.world_center_y -= y_delta;
			
			next_pan_velocity_x = -x_delta / wilson.world_width;
			next_pan_velocity_y = -y_delta / wilson.world_height;
			
			wilson_line_drawer.world_center_x = Math.min(Math.max(wilson_line_drawer.world_center_x, -2), 2);
			wilson_line_drawer.world_center_y = Math.min(Math.max(wilson_line_drawer.world_center_y, -2), 2);
			
			moved++;
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else
		{
			show_orbit(x, y);
		}	
	}
	
	
	
	function on_hover_canvas(x, y, x_delta, y_delta, event)
	{
		show_orbit(x, y);
		
		moved = 0;
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (event.type === "mouseup" || num_touches >= 2)
		{
			if (Math.sqrt(next_pan_velocity_x * next_pan_velocity_x + next_pan_velocity_y * next_pan_velocity_y) >= pan_velocity_start_threshhold)
			{
				pan_velocity_x = next_pan_velocity_x;
				pan_velocity_y = next_pan_velocity_y;
				
				moved = 10;
			}
			
			if (Math.abs(next_zoom_velocity) >= zoom_velocity_start_threshhold)
			{
				zoom_velocity = next_zoom_velocity;
				
				moved = 10;
			}
			
			if (moved < 10 && event.type === "mouseup")
			{
				play_sound(x, y);
			}
		}
		
		else
		{
			opacity_frame = 0;
			need_to_hide = true;
			window.requestAnimationFrame(hide_orbit);
		}
		
		setTimeout(() => num_touches = 0, 50);
		moved = 0;
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function show_orbit(x_0, y_0)
	{
		line_drawer_canvas_container_element.style.opacity = 1;
		wilson_line_drawer.ctx.strokeStyle = "rgb(255, 255, 255)";
		wilson_line_drawer.ctx.clearRect(0, 0, resolution, resolution);
		
		wilson_line_drawer.ctx.beginPath();
		let coords = wilson_line_drawer.utils.interpolate.world_to_canvas(x_0, y_0);
		wilson_line_drawer.ctx.moveTo(coords[1], coords[0]);
		
		
		
		let x = x_0;
		let y = y_0;
		let a = x_0;
		let b = y_0;
		
		let next = current_fractal_function(x, y, a, b);
		
		x = 0;
		y = 0;
		
		for (let i = 0; i < 300; i++)
		{
			if (Math.abs(next[0]) > 10 || Math.abs(next[1]) > 10)
			{
				return;
			}
			
			x = next[0];
			y = next[1];
			
			next = current_fractal_function(x, y, a, b);
			
			coords = wilson_line_drawer.utils.interpolate.world_to_canvas(x, y);
			wilson_line_drawer.ctx.lineTo(coords[1], coords[0]);
		}
		
		wilson_line_drawer.ctx.stroke();
	}
	
	
	
	function hide_orbit()
	{
		opacity_frame++;
		
		let t = .5 + .5 * Math.sin(Math.PI * opacity_frame / 30 - Math.PI / 2);
		
		line_drawer_canvas_container_element.style.opacity = 1 - t;
		
		if (opacity_frame < 30 && need_to_hide)
		{
			window.requestAnimationFrame(hide_orbit);
		}
		
		else
		{
			need_to_hide = false;
		}
	}
	
	
	
	function play_sound(x_0, y_0)
	{
		let audio_context = new AudioContext();
		
		let sample_rate = 44100;
		let num_frames = 44100;
		let samples_per_frame = 12;
		let num_samples = Math.floor(num_frames / samples_per_frame);
		
		let x = x_0;
		let y = y_0;
		let a = x_0;
		let b = y_0;
		
		let next = current_fractal_function(x, y, a, b);
		
		x = 0;
		y = 0;
		
		let max_value = 0;
		
		let unscaled_left_data = new Array(num_samples);
		let unscaled_right_data = new Array(num_samples);
		
		
		
		let buffer = audio_context.createBuffer(2, num_frames, sample_rate);
		
		let left_data = buffer.getChannelData(0);
		let right_data = buffer.getChannelData(1);
		
		for (let i = 0; i < num_samples; i++)
		{
			if (Math.abs(next[0]) > 100 || Math.abs(next[1]) > 100)
			{
				return;
			}
			
			if (Math.abs(next[0]) > max_value)
			{
				max_value = Math.abs(next[0]);
			}
			
			if (Math.abs(next[1]) > max_value)
			{
				max_value = Math.abs(next[1]);
			}
			
			unscaled_left_data[i] = x;
			unscaled_right_data[i] = y;
			
			x = next[0];
			y = next[1];
			
			next = current_fractal_function(x, y, a, b);
		}
		
		
		
		for (let i = 0; i < num_samples; i++)
		{
			unscaled_left_data[i] /= max_value;
			unscaled_right_data[i] /= max_value;
		}
		
		
		
		for (let i = 0; i < num_samples - 1; i++)
		{
			for (let j = 0; j < samples_per_frame; j++)
			{
				let t = .5 + .5 * Math.sin(Math.PI * j / samples_per_frame - Math.PI / 2);
				
				left_data[samples_per_frame * i + j] = (1 - t) * (unscaled_left_data[i] / 2) + t * (unscaled_left_data[i + 1] / 2);
				right_data[samples_per_frame * i + j] = (1 - t) * (unscaled_right_data[i] / 2) + t * (unscaled_right_data[i + 1] / 2);
			}
		}
		
		
		
		let source = audio_context.createBufferSource();
		source.buffer = buffer;
		
		let audio_gain_node = audio_context.createGain();
		source.connect(audio_gain_node);
		audio_gain_node.connect(audio_context.destination);

		source.start(0);
		audio_gain_node.gain.exponentialRampToValueAtTime(.0001, num_frames / 44100);
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
		
		last_x = x;
		last_y = y;
		zooming_with_mouse = true;
		
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
			zoom_level -= touch_distance_delta / wilson_line_drawer.world_width * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson_line_drawer.world_width * 10;
		}
		
		else
		{
			zoom_level -= touch_distance_delta / wilson_line_drawer.world_height * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson_line_drawer.world_height * 10;
		}
		
		zoom_level = Math.min(zoom_level, 1);
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zooming_with_mouse = false;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson_line_drawer.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level) * aspect_ratio, 4 * Math.pow(2, zoom_level));
			
			wilson_line_drawer.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson_line_drawer.world_height = 4 * Math.pow(2, zoom_level);
			
			wilson_line_drawer.world_center_x = new_world_center[0];
			wilson_line_drawer.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson_line_drawer.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level), 4 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson_line_drawer.world_width = 4 * Math.pow(2, zoom_level);
			wilson_line_drawer.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson_line_drawer.world_center_x = new_world_center[0];
			wilson_line_drawer.world_center_y = new_world_center[1];
		}
		
		if (zooming_with_mouse)
		{
			show_orbit(last_x, last_y);
		}	
		
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
		
		
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_x"], wilson_line_drawer.world_center_x);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_y"], wilson_line_drawer.world_center_y);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_size"], Math.min(wilson_line_drawer.world_height, wilson_line_drawer.world_width) / 2);
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["num_iterations"], num_iterations);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["exposure"], 1);
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
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		
		wilson.gl.uniform1f(wilson.uniforms["world_center_x"], wilson_line_drawer.world_center_x);
		wilson.gl.uniform1f(wilson.uniforms["world_center_y"], wilson_line_drawer.world_center_y);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson_line_drawer.world_height, wilson_line_drawer.world_width) / 2);
		
		wilson.gl.uniform1i(wilson.uniforms["num_iterations"], num_iterations);
		
		wilson.gl.uniform1f(wilson.uniforms["exposure"], exposure);
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
			wilson_line_drawer.world_center_x += pan_velocity_x * wilson_line_drawer.world_width;
			wilson_line_drawer.world_center_y += pan_velocity_y * wilson_line_drawer.world_height;
			
			wilson_line_drawer.world_center_x = Math.min(Math.max(wilson_line_drawer.world_center_x, -2), 2);
			wilson_line_drawer.world_center_y = Math.min(Math.max(wilson_line_drawer.world_center_y, -2), 2);
			
			
			
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
	
	
	
	function switch_fullscreen()
	{
		change_aspect_ratio();
		
		Page.set_element_styles(".wilson-applet-canvas-container", "background-color", "rgba(0, 0, 0, 0)", true);
		
		wilson_line_drawer.fullscreen.switch_fullscreen();
	}
	
	
	
	function change_aspect_ratio()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson_line_drawer.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				wilson.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				
				wilson_line_drawer.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson_line_drawer.world_height = 4 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson_line_drawer.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson_line_drawer.world_width = 4 * Math.pow(2, zoom_level);
				wilson_line_drawer.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson_line_drawer.change_canvas_size(resolution, resolution);
			wilson.change_canvas_size(resolution, resolution);
			
			wilson_line_drawer.world_width = 4 * Math.pow(2, zoom_level);
			wilson_line_drawer.world_height = 4 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()