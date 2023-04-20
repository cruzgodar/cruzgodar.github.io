"use strict";

class GeneralizedJuliaSet extends Applet
{
	load_promise = null;
	
	generating_code = "cadd(cpow(z, 2.0), c)";
	
	wilson_hidden = null;
	
	switch_julia_mode_button_element = null;
	
	julia_mode = 0;
	
	aspect_ratio = 1;
	
	num_iterations = 200;
	
	exposure = 1;
	
	zoom_level = 0;
	
	past_brightness_scales = [];
	
	a = 0;
	b = 0;
	
	resolution = 500;
	resolution_hidden = 50;
	
	fixed_point_x = 0;
	fixed_point_y = 0;
	
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
	
	
	
	constructor(canvas, generating_code, switch_julia_mode_button_element = null)
	{
		super(canvas);
		
		this.switch_julia_mode_button_element = switch_julia_mode_button_element;
		
		const hidden_canvas = document.createElement("canvas");
		hidden_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas);
		Page.element.appendChild(hidden_canvas);
		
		
		
		const temp_shader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.change_aspect_ratio.bind(this),
			
			
			
			mousedown_callback: this.on_grab_canvas.bind(this),
			touchstart_callback: this.on_grab_canvas.bind(this),
			
			mousemove_callback: this.on_hover_canvas.bind(this),
			mousedrag_callback: this.on_drag_canvas.bind(this),
			touchmove_callback: this.on_drag_canvas.bind(this),
			
			mouseup_callback: this.on_release_canvas.bind(this),
			touchend_callback: this.on_release_canvas.bind(this),
			
			wheel_callback: this.on_wheel_canvas.bind(this),
			pinch_callback: this.on_pinch_canvas.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		const options_hidden =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: this.resolution_hidden,
			canvas_height: this.resolution_hidden
		};
		
		this.wilson_hidden = new Wilson(hidden_canvas, options_hidden);
		
		
		
		const bound_function = this.change_aspect_ratio.bind(this);
		window.addEventListener("resize", bound_function);
		this.handlers.push([window, "resize", bound_function]);
		
		this.load_promise = new Promise(async (resolve, reject) =>
		{
			await Site.load_glsl();
			
			resolve();
		});
	}
	
	
	
	run(generating_code = "cpow(z, 2.0) + c", resolution = 500, exposure = 1, num_iterations = 200)
	{
		this.generating_code = generating_code;
		
		this.resolution = resolution;
		this.exposure = exposure;
		this.num_iterations = num_iterations;
		
		
		
		const frag_shader_source = `
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
			
			
			
			${Site.get_glsl_bundle(generating_code)}
			
			
			
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
						
						if (length(z) >= 1000.0)
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
		
		
		
		this.wilson.render.shader_programs = [];
		this.wilson.render.load_new_shader(frag_shader_source);
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		this.wilson.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "exposure", "num_iterations", "brightness_scale"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"], 1);
		
		this.wilson_hidden.render.shader_programs = [];
		this.wilson_hidden.render.load_new_shader(frag_shader_source);
		this.wilson_hidden.gl.useProgram(this.wilson_hidden.render.shader_programs[0]);
		this.wilson_hidden.render.init_uniforms(["julia_mode", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "exposure", "num_iterations", "brightness_scale"]);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["aspect_ratio"], 1);
		
		this.next_pan_velocity_x = 0;
		this.next_pan_velocity_y = 0;
		this.next_zoom_velocity = 0;
		
		this.pan_velocity_x = 0;
		this.pan_velocity_y = 0;
		this.zoom_velocity = 0;
		
		this.wilson.world_width = 4;
		this.wilson.world_height = 4;
		this.wilson.world_center_x = 0;
		this.wilson.world_center_y = 0;
		
		this.julia_mode = 0;
		this.zoom_level = 0;
		
		this.past_brightness_scales = [];
		
		
		
		//Render the inital frame.
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["aspect_ratio"], 1);
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	switch_julia_mode()
	{
		try
		{
			Page.Animate.change_opacity(this.switch_julia_mode_button_element, 0, Site.opacity_animation_time);
			
			setTimeout(() =>
			{
				if (this.julia_mode === 2)
				{
					this.switch_julia_mode_button_element.textContent = "Return to Mandelbrot Set";
				}
				
				else if (this.julia_mode === 0)
				{
					this.switch_julia_mode_button_element.textContent = "Pick Julia Set";
					
					Page.Animate.change_opacity(this.switch_julia_mode_button_element, 1, Site.opacity_animation_time);
				}
			}, Site.opacity_animation_time);
		}
		
		catch(ex) {}
		
		
		
		if (this.julia_mode === 0)
		{
			this.julia_mode = 2;
			
			this.a = 0;
			this.b = 0;
			
			this.pan_velocity_x = 0;
			this.pan_velocity_y = 0;
			this.zoom_velocity = 0;
			
			this.next_pan_velocity_x = 0;
			this.next_pan_velocity_y = 0;
			this.next_zoom_velocity = 0;
			
			this.past_brightness_scales = [];
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
		
		else if (this.julia_mode === 1)
		{
			this.julia_mode = 0;
			
			this.wilson.world_center_x = 0;
			this.wilson.world_center_y = 0;
			this.wilson.world_width = 4;
			this.wilson.world_height = 4;
			this.zoom_level = 0;
			
			this.past_brightness_scales = [];
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	on_grab_canvas(x, y, event)
	{
		this.pan_velocity_x = 0;
		this.pan_velocity_y = 0;
		this.zoom_velocity = 0;
		
		this.next_pan_velocity_x = 0;
		this.next_pan_velocity_y = 0;
		this.next_zoom_velocity = 0;
		
		
		
		if (this.julia_mode === 2 && event.type === "mousedown")
		{
			this.julia_mode = 1;
			
			this.wilson.world_center_x = 0;
			this.wilson.world_center_y = 0;
			this.wilson.world_width = 4;
			this.wilson.world_height = 4;
			this.zoom_level = 0;
			
			this.past_brightness_scales = [];
			
			try {Page.Animate.change_opacity(this.switch_julia_mode_button_element, 1, Site.opacity_animation_time)}
			catch(ex) {}
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (this.julia_mode === 2 && event.type === "touchmove")
		{
			this.a = x;
			this.b = y;
		}
		
		else
		{
			this.wilson.world_center_x -= x_delta;
			this.wilson.world_center_y -= y_delta;
			
			this.next_pan_velocity_x = -x_delta / this.wilson.world_width;
			this.next_pan_velocity_y = -y_delta / this.wilson.world_height;
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_hover_canvas(x, y, x_delta, y_delta, event)
	{
		if (this.julia_mode === 2 && event.type === "mousemove")
		{
			this.a = x;
			this.b = y;
			
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	on_release_canvas(x, y, event)
	{
		if (this.julia_mode === 2 && event.type === "touchend")
		{
			this.julia_mode = 1;
			
			this.wilson.world_center_x = 0;
			this.wilson.world_center_y = 0;
			this.wilson.world_width = 4;
			this.wilson.world_height = 4;
			this.zoom_level = 0;
			
			this.past_brightness_scales = [];
			
			try {Page.Animate.change_opacity(this.switch_julia_mode_button_element, 1, Site.opacity_animation_time)}
			catch(ex) {}
		}
		
		else
		{
			if (this.next_pan_velocity_x * this.next_pan_velocity_x + this.next_pan_velocity_y * this.next_pan_velocity_y >= this.pan_velocity_start_threshhold * this.pan_velocity_start_threshhold)
			{
				this.pan_velocity_x = this.next_pan_velocity_x;
				this.pan_velocity_y = this.next_pan_velocity_y;
			}
			
			if (Math.abs(this.next_zoom_velocity) >= this.zoom_velocity_start_threshhold)
			{
				this.zoom_velocity = this.next_zoom_velocity;
			}
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
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
			this.zoom_level -= touch_distance_delta / this.wilson.world_width * 10;
			
			this.next_zoom_velocity = -touch_distance_delta / this.wilson.world_width * 10;
		}
		
		else
		{
			this.zoom_level -= touch_distance_delta / this.wilson.world_height * 10;
			
			this.next_zoom_velocity = -touch_distance_delta / this.wilson.world_height * 10;
		}
		
		this.zoom_level = Math.min(this.zoom_level, 1);
		
		this.fixed_point_x = x;
		this.fixed_point_y = y;
		
		this.zoom_canvas();
	}
	
	
	
	zoom_canvas()
	{
		if (this.aspect_ratio >= 1)
		{
			const new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio, 4 * Math.pow(2, this.zoom_level));
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			const new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level), 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio);
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
		
		this.num_iterations = (-this.zoom_level * 30) + 200;
		
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
		
		
		
		this.wilson_hidden.gl.uniform1i(this.wilson_hidden.uniforms["julia_mode"], this.julia_mode);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_center_x"], this.wilson.world_center_x);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_center_y"], this.wilson.world_center_y);
		
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["world_size"], Math.min(this.wilson.world_height, this.wilson.world_width) / 2);
		
		this.wilson_hidden.gl.uniform1i(this.wilson_hidden.uniforms["num_iterations"], this.num_iterations);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["exposure"], 1);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["a"], this.a);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["b"], this.b);
		this.wilson_hidden.gl.uniform1f(this.wilson_hidden.uniforms["brightness_scale"], 20 * (Math.abs(this.zoom_level) + 1));
		
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
		
		let denom = this.past_brightness_scales.length;
		
		if (denom > 10)
		{
			this.past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(this.past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["julia_mode"], this.julia_mode);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"], this.aspect_ratio);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_x"], this.wilson.world_center_x);
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_y"], this.wilson.world_center_y);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_size"], Math.min(this.wilson.world_height, this.wilson.world_width) / 2);
		
		this.wilson.gl.uniform1i(this.wilson.uniforms["num_iterations"], this.num_iterations);
		this.wilson.gl.uniform1f(this.wilson.uniforms["exposure"], this.exposure);
		this.wilson.gl.uniform1f(this.wilson.uniforms["a"], this.a);
		this.wilson.gl.uniform1f(this.wilson.uniforms["b"], this.b);
		this.wilson.gl.uniform1f(this.wilson.uniforms["brightness_scale"], brightness_scale);
		
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
			this.wilson.world_center_x += this.pan_velocity_x * this.wilson.world_width;
			this.wilson.world_center_y += this.pan_velocity_y * this.wilson.world_height;
			
			
			
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
	
	
	
	change_aspect_ratio()
	{
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			this.aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (this.aspect_ratio >= 1)
			{
				this.wilson.change_canvas_size(this.resolution, Math.floor(this.resolution / this.aspect_ratio));
				
				this.wilson.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
				this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
			}
			
			else
			{
				this.wilson.change_canvas_size(Math.floor(this.resolution * this.aspect_ratio), this.resolution);
				
				this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
				this.wilson.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			}
		}
		
		else
		{
			this.aspect_ratio = 1;
			
			this.wilson.change_canvas_size(this.resolution, this.resolution);
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
}