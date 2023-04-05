"use strict";

class FractalSounds extends Applet
{
	load_promise = null;
	
	wilson_hidden = null;
	wilson_line_drawer = null;
	
	julia_mode = 0;
	
	aspect_ratio = 1;
	
	num_iterations = 200;
	
	exposure = 1;
	
	zoom_level = 0;
	
	past_brightness_scales = [];
	
	resolution = 500;
	resolution_hidden = 200;
	
	need_to_clear = false;
	
	fixed_point_x = 0;
	fixed_point_y = 0;
	
	num_touches = 0;
	
	moved = 0;
	
	last_x = 0;
	last_y = 0;	
	zooming_with_mouse = false;
	
	next_pan_velocity_x = 0;
	next_pan_velocity_y = 0;
	next_zoom_velocity = 0;
	
	pan_velocity_x = 0;
	pan_velocity_y = 0;
	zoom_velocity = 0;
	
	pan_friction = .96;
	pan_velocity_start_threshhold = .0025;
	pan_velocity_stop_threshhold = .00025;
	
	zoom_friction = .93;
	zoom_velocity_start_threshhold = .01;
	zoom_velocity_stop_threshhold = .001;
	
	last_timestamp = -1;
	
	
	
	constructor(canvas, line_drawer_canvas)
	{
		super(canvas);
		
		const temp_shader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 4,
			world_height: 4,
			world_center_x: 0,
			world_center_y: 0,
			
			use_fullscreen: true,
		
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.switch_fullscreen.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		
		
		const hidden_canvas = document.createElement("canvas");
		hidden_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas);
		Page.element.appendChild(hidden_canvas);
		
		const options_hidden =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: this.resolution_hidden,
			canvas_height: this.resolution_hidden
		};
		
		this.wilson_hidden = new Wilson(hidden_canvas, options_hidden);
		
		
		
		const options_line_drawer =
		{
			renderer: "cpu",
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 4,
			world_height: 4,
			world_center_x: 0,
			world_center_y: 0,
			
			mousemove_callback: this.on_hover_canvas.bind(this),
			mousedown_callback: this.on_grab_canvas.bind(this),
			touchstart_callback: this.on_grab_canvas.bind(this),
			
			mousedrag_callback: this.on_drag_canvas.bind(this),
			touchmove_callback: this.on_drag_canvas.bind(this),
			
			mouseup_callback: this.on_release_canvas.bind(this),
			touchend_callback: this.on_release_canvas.bind(this),
			
			wheel_callback: this.on_wheel_canvas.bind(this),
			pinch_callback: this.on_pinch_canvas.bind(this),
			
			use_fullscreen: true,
		
			true_fullscreen: true,
		
			use_fullscreen_button: false
		};
		
		this.wilson_line_drawer = new Wilson(line_drawer_canvas, options_line_drawer);
		
		const elements = Page.element.querySelectorAll(".wilson-fullscreen-components-container");
		
		elements[0].style.setProperty("z-index", 200, "important");
		elements[1].style.setProperty("z-index", 300, "important");
		
		this.wilson_line_drawer.ctx.lineWidth = 40;
		
		
		
		const bound_function = this.change_aspect_ratio.bind(this);
		window.addEventListener("resize", bound_function);
		this.handlers.push([window, "resize", bound_function]);
		
		
		
		this.load_promise = new Promise(async (resolve, reject) =>
		{
			await Site.load_glsl();
			
			resolve();
		});
	}
	
	
	
	run(glsl_code, js_code, resolution, exposure, num_iterations)
	{
		this.current_fractal_function = js_code;
		
		this.resolution = resolution;
		this.exposure = exposure;
		this.num_iterations = num_iterations;
		
		const frag_shader_source = `
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
			
			const vec3 color_1 = vec3(1.0, 0.0, 0.0);
			const vec3 color_2 = vec3(1.0, .4157, 0.0);
			const vec3 color_3 = vec3(1.0, .8471, 0.0);
			const vec3 color_4 = vec3(.7333, 1.0, 0.0);
			const vec3 color_5 = vec3(.2980, 1.0, 0.0);
			const vec3 color_6 = vec3(0.0, 1.0, .1137);
			const vec3 color_7 = vec3(0.0, 1.0, .5490);
			const vec3 color_8 = vec3(0.0, 1.0, .9647);
			const vec3 color_9 = vec3(0.0, .6, 1.0);
			const vec3 color_10 = vec3(0.0, .1804, 1.0);
			const vec3 color_11 = vec3(.2471, 0.0, 1.0);
			const vec3 color_12 = vec3(.6667, 0.0, 1.0);
			const vec3 color_13 = vec3(1.0, 0.0, .8980);
			
			
			
			${Site.get_glsl_bundle(glsl_code)}
			
			
			
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
				vec2 last_z_10 = vec2(0.0, 0.0);
				vec2 last_z_11 = vec2(0.0, 0.0);
				vec2 last_z_12 = vec2(0.0, 0.0);
				vec2 last_z_13 = vec2(0.0, 0.0);
				
				float hue_1 = 0.0;
				float hue_2 = 0.0;
				float hue_3 = 0.0;
				float hue_4 = 0.0;
				float hue_5 = 0.0;
				float hue_6 = 0.0;
				float hue_7 = 0.0;
				float hue_8 = 0.0;
				float hue_9 = 0.0;
				float hue_10 = 0.0;
				float hue_11 = 0.0;
				float hue_12 = 0.0;
				float hue_13 = 0.0;
				
				
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						vec3 color = hue_1 * color_1 + hue_2 * color_2 + hue_3 * color_3 + hue_4 * color_4 + hue_5 * color_5 + hue_6 * color_6 + hue_7 * color_7 + hue_8 * color_8 + hue_9 * color_9 + hue_10 * color_10 + hue_11 * color_11 + hue_12 * color_12 + hue_13 * color_13;
						gl_FragColor = vec4(brightness / brightness_scale * exposure * normalize(color), 1.0);
						return;
					}
					
					if (length(z) >= 10.0)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					last_z_13 = last_z_12;
					last_z_12 = last_z_11;
					last_z_11 = last_z_10;
					last_z_10 = last_z_9;
					last_z_9 = last_z_8;
					last_z_8 = last_z_7;
					last_z_7 = last_z_6;
					last_z_6 = last_z_5;
					last_z_5 = last_z_4;
					last_z_4 = last_z_3;
					last_z_3 = last_z_2;
					last_z_2 = last_z_1;
					last_z_1 = z;
					z = ${glsl_code};
					
					
					
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
					hue_10 += exp(-hue_multiplier * length(z - last_z_10));
					hue_11 += exp(-hue_multiplier * length(z - last_z_11));
					hue_12 += exp(-hue_multiplier * length(z - last_z_12));
					hue_13 += exp(-hue_multiplier * length(z - last_z_13));
				}
			}
		`;

		this.wilson.render.shader_programs = [];
		this.wilson.render.load_new_shader(frag_shader_source);
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);

		this.wilson.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "exposure", "brightness_scale"], 0);
		
		
		
		this.wilson_hidden.render.shader_programs = [];
		this.wilson_hidden.render.load_new_shader(frag_shader_source);
		this.wilson_hidden.gl.useProgram(this.wilson_hidden.render.shader_programs[0]);
		
		this.wilson_hidden.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "exposure", "brightness_scale"], 0);
		
		
		this.julia_mode = 0;
		this.zoom_level = 0;
		
		this.past_brightness_scales = [];
		
		this.wilson_line_drawer.world_width = 4;
		this.wilson_line_drawer.world_height = 4;
		this.wilson_line_drawer.world_center_x = 0;
		this.wilson_line_drawer.world_center_y = 0;
		
		
		
		//Render the inital frame.
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"][0], 1);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["aspect_ratio"][0], 1);
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_grab_canvas(x, y, event)
	{
		this.pan_velocity_x = 0;
		this.pan_velocity_y = 0;
		this.zoom_velocity = 0;
		
		this.next_pan_velocity_x = 0;
		this.next_pan_velocity_y = 0;
		this.next_zoom_velocity = 0;
		
		this.wilson_line_drawer.canvas.style.opacity = 1;
		
		
		
		if (event.type === "touchstart")
		{
			this.num_touches = event.touches.length;
			
			if (this.num_touches === 1)
			{
				this.show_orbit(x, y);
				this.play_sound(x, y);
			}
		}
		
		else
		{
			this.moved = 0;
			this.show_orbit(x, y);
		}
	}
	
	
	
	on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (event.type === "mousemove" || this.num_touches >= 2)
		{
			if (this.num_touches >= 2 || Math.abs(x_delta) > 0 || Math.abs(y_delta) > 0)
			{
				this.wilson_line_drawer.ctx.clearRect(0, 0, this.resolution, this.resolution);
			}	
			
			this.wilson_line_drawer.world_center_x -= x_delta;
			this.wilson_line_drawer.world_center_y -= y_delta;
			
			this.next_pan_velocity_x = -x_delta / this.wilson.world_width;
			this.next_pan_velocity_y = -y_delta / this.wilson.world_height;
			
			this.wilson_line_drawer.world_center_x = Math.min(Math.max(this.wilson_line_drawer.world_center_x, -2), 2);
			this.wilson_line_drawer.world_center_y = Math.min(Math.max(this.wilson_line_drawer.world_center_y, -2), 2);
			
			this.moved++;
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
		
		else
		{
			this.show_orbit(x, y);
		}	
	}
	
	
	
	on_hover_canvas(x, y, x_delta, y_delta, event)
	{
		this.show_orbit(x, y);
		
		this.moved = 0;
	}
	
	
	
	on_release_canvas(x, y, event)
	{
		if (event.type === "mouseup" || this.num_touches >= 2)
		{
			if (this.next_pan_velocity_x * this.next_pan_velocity_x + this.next_pan_velocity_y * this.next_pan_velocity_y >= this.pan_velocity_start_threshhold * this.pan_velocity_start_threshhold)
			{
				this.pan_velocity_x = this.next_pan_velocity_x;
				this.pan_velocity_y = this.next_pan_velocity_y;
				
				this.moved = 10;
			}
			
			if (Math.abs(this.next_zoom_velocity) >= this.zoom_velocity_start_threshhold)
			{
				this.zoom_velocity = this.next_zoom_velocity;
				
				this.moved = 10;
			}
			
			if (this.moved < 10 && event.type === "mouseup")
			{
				this.play_sound(x, y);
			}
		}
		
		else
		{
			anime({
				targets: this.wilson_line_drawer.canvas,
				opacity: 0,
				easing: "linear",
				duration: 300
			});
		}
		
		setTimeout(() => this.num_touches = 0, 50);
		this.moved = 0;
	}
	
	
	
	show_orbit(x_0, y_0)
	{
		this.wilson_line_drawer.ctx.lineWidth = 2;
		
		this.wilson_line_drawer.canvas.style.opacity = 1;
		this.wilson_line_drawer.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson_line_drawer.ctx.clearRect(0, 0, this.resolution, this.resolution);
		
		this.wilson_line_drawer.ctx.beginPath();
		let coords = this.wilson_line_drawer.utils.interpolate.world_to_canvas(x_0, y_0);
		this.wilson_line_drawer.ctx.moveTo(coords[1], coords[0]);
		
		let x = x_0;
		let y = y_0;
		let a = x_0;
		let b = y_0;
		
		let next = this.current_fractal_function(x, y, a, b);
		
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
			
			next = this.current_fractal_function(x, y, a, b);
			
			coords = this.wilson_line_drawer.utils.interpolate.world_to_canvas(x, y);
			this.wilson_line_drawer.ctx.lineTo(coords[1], coords[0]);
		}
		
		this.wilson_line_drawer.ctx.stroke();
	}
	
	
	
	play_sound(x_0, y_0)
	{
		const audio_context = new AudioContext();
		
		const sample_rate = 44100;
		const num_frames = 44100;
		const samples_per_frame = 12;
		const num_samples = Math.floor(num_frames / samples_per_frame);
		
		let x = x_0;
		let y = y_0;
		let a = x_0;
		let b = y_0;
		
		let next = this.current_fractal_function(x, y, a, b);
		
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
			
			next = this.current_fractal_function(x, y, a, b);
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
	
	
	
	on_wheel_canvas(x, y, scroll_amount, event)
	{
		this.fixed_point_x = x;
		this.fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			this.zoom_level += scroll_amount / 100;
			
			this.zoom_level = Math.min(this.zoom_level, 1);
		}
		
		else
		{
			this.zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		this.last_x = x;
		this.last_y = y;
		this.zooming_with_mouse = true;
		
		this.zoom_canvas();
	}
	
	
	
	on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (this.julia_mode === 2)
		{
			return;
		}
		
		
		
		if (this.aspect_ratio >= 1)
		{
			this.zoom_level -= touch_distance_delta / this.wilson_line_drawer.world_width * 10;
			
			this.next_zoom_velocity = -touch_distance_delta / this.wilson_line_drawer.world_width * 10;
		}
		
		else
		{
			this.zoom_level -= touch_distance_delta / this.wilson_line_drawer.world_height * 10;
			
			this.next_zoom_velocity = -touch_distance_delta / this.wilson_line_drawer.world_height * 10;
		}
		
		this.zoom_level = Math.min(this.zoom_level, 1);
		
		this.fixed_point_x = x;
		this.fixed_point_y = y;
		
		this.zooming_with_mouse = false;
		
		this.zoom_canvas();
	}
	
	
	
	zoom_canvas()
	{
		if (this.aspect_ratio >= 1)
		{
			const new_world_center = this.wilson_line_drawer.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio, 4 * Math.pow(2, this.zoom_level));
			
			this.wilson_line_drawer.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
			this.wilson_line_drawer.world_height = 4 * Math.pow(2, this.zoom_level);
			
			this.wilson_line_drawer.world_center_x = new_world_center[0];
			this.wilson_line_drawer.world_center_y = new_world_center[1];
		}
		
		else
		{
			const new_world_center = this.wilson_line_drawer.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level), 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio);
			
			this.wilson_line_drawer.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson_line_drawer.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			
			this.wilson_line_drawer.world_center_x = this.new_world_center[0];
			this.wilson_line_drawer.world_center_y = this.new_world_center[1];
		}
		
		if (this.zooming_with_mouse)
		{
			this.show_orbit(this.last_x, this.last_y);
		}	
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}



	draw_frame(timestamp)
	{
		const time_elapsed = timestamp - this.last_timestamp;
		
		this.last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_center_x"][0], this.wilson_line_drawer.world_center_x);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_center_y"][0], this.wilson_line_drawer.world_center_y);
		
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_size"][0], Math.min(this.wilson_line_drawer.world_height, this.wilson_line_drawer.world_width) / 2);
		
		this.wilson_hidden.gl.uniform1i(this.wilson_hidden.uniforms["num_iterations"][0], this.num_iterations);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["exposure"][0], 1);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["brightness_scale"][0], 20 * (Math.abs(this.zoom_level) + 1));
		
		this.wilson_hidden.render.draw_frame();
		
		
		
		const pixel_data = this.wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(this.resolution_hidden * this.resolution_hidden);
		
		for (let i = 0; i < this.resolution_hidden * this.resolution_hidden; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = (brightnesses[Math.floor(this.resolution_hidden * this.resolution_hidden * .96)] + brightnesses[Math.floor(this.resolution_hidden * this.resolution_hidden * .98)]) / 255 * 15 * (Math.abs(this.zoom_level / 2) + 1);
		
		this.past_brightness_scales.push(brightness_scale);
		
		const denom = this.past_brightness_scales.length;
		
		if (denom > 10)
		{
			this.past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(this.past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"][0], this.aspect_ratio);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_x"][0], this.wilson_line_drawer.world_center_x);
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_y"][0], this.wilson_line_drawer.world_center_y);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_size"][0], Math.min(this.wilson_line_drawer.world_height, this.wilson_line_drawer.world_width) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["num_iterations"][0], this.num_iterations);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"][0], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightness_scale"][0], brightness_scale);
		
		this.wilson.render.draw_frame();
		
		
		
		if (time_elapsed >= 50)
		{
			this.pan_velocity_x = 0;
			this.pan_velocity_y = 0;
			this.zoom_velocity = 0;
			
			this.next_pan_velocity_x = 0;
			this.next_pan_velocity_y = 0;
			this.next_zoom_velocity = 0;
		}
		
		
		
		if (this.pan_velocity_x !== 0 || this.pan_velocity_y !== 0 || this.zoom_velocity !== 0)
		{
			this.wilson_line_drawer.world_center_x += this.pan_velocity_x * this.wilson_line_drawer.world_width;
			this.wilson_line_drawer.world_center_y += this.pan_velocity_y * this.wilson_line_drawer.world_height;
			
			this.wilson_line_drawer.world_center_x = Math.min(Math.max(this.wilson_line_drawer.world_center_x, -2), 2);
			this.wilson_line_drawer.world_center_y = Math.min(Math.max(this.wilson_line_drawer.world_center_y, -2), 2);
			
			
			
			this.pan_velocity_x *= this.pan_friction;
			this.pan_velocity_y *= this.pan_friction;
			
			if (this.pan_velocity_x * this.pan_velocity_x + this.pan_velocity_y * this.pan_velocity_y < this.pan_velocity_stop_threshhold * this.pan_velocity_stop_threshhold)
			{
				this.pan_velocity_x = 0;
				this.pan_velocity_y = 0;
			}
			
			
			
			this.zoom_level += this.zoom_velocity;
			
			this.zoom_level = Math.min(this.zoom_level, 1);
			
			this.zoom_canvas();
			
			this.zoom_velocity *= this.zoom_friction;
			
			if (Math.abs(this.zoom_velocity) < this.zoom_velocity_stop_threshhold)
			{
				this.zoom_velocity = 0;
			}
			
			
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	switch_fullscreen()
	{
		this.change_aspect_ratio();
		
		try
		{
			document.body.querySelectorAll(".wilson-applet-canvas-container").forEach(element => element.style.setProperty("background-color", "rgba(0, 0, 0, 0)", "important"));
			
			document.body.querySelector(".wilson-exit-fullscreen-button").style.setProperty("z-index", "300", "important")
		}
		
		catch(ex) {}
		
		this.wilson_line_drawer.fullscreen.switch_fullscreen();
	}
	
	
	
	change_aspect_ratio()
	{
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			this.aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (this.aspect_ratio >= 1)
			{
				this.wilson_line_drawer.change_canvas_size(this.resolution, Math.floor(this.resolution / this.aspect_ratio));
				this.wilson.change_canvas_size(this.resolution, Math.floor(this.resolution / this.aspect_ratio));
				
				this.wilson_line_drawer.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
				this.wilson_line_drawer.world_height = 4 * Math.pow(2, this.zoom_level);
			}
			
			else
			{
				this.wilson_line_drawer.change_canvas_size(Math.floor(this.resolution * this.aspect_ratio), this.resolution);
				this.wilson.change_canvas_size(Math.floor(this.resolution * this.aspect_ratio), this.resolution);
				
				this.wilson_line_drawer.world_width = 4 * Math.pow(2, this.zoom_level);
				this.wilson_line_drawer.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			}
		}
		
		else
		{
			this.aspect_ratio = 1;
			
			this.wilson_line_drawer.change_canvas_size(this.resolution, this.resolution);
			this.wilson.change_canvas_size(this.resolution, this.resolution);
			
			this.wilson_line_drawer.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson_line_drawer.world_height = 4 * Math.pow(2, this.zoom_level);
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
}