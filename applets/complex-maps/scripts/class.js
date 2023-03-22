"use strict";

class ComplexMap extends Applet
{
	load_promise = null;
	
	generating_code = "";
	uniform_code = "";
	
	aspect_ratio = 1;
	
	zoom_level = -.585;
	
	past_brightness_scales = [];
	
	resolution = 500;
	
	black_point = 1;
	white_point = 1;
	
	fixed_point_x = 0;
	fixed_point_y = 0;
	
	draggable_callback = null;
	
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
	
	add_indicator_draggable = false;
	use_selector_mode = false;
	
	total_benchmark_time = 0;
	benchmarks_left = 0;
	benchmark_cycles = 10;
	benchmark_resolution = 4000;
	
	
	
	constructor(canvas, generating_code, uniform_code = "", world_center_x = 0, world_center_y = 0, zoom_level = -.585, add_indicator_draggable = false, draggable_callback = null, selector_mode = false)
	{
		super(canvas);
		
		const temp_shader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			use_draggables: true,
			
			draggables_mousemove_callback: this.on_drag_draggable.bind(this),
			draggables_touchmove_callback: this.on_drag_draggable.bind(this),
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.change_aspect_ratio.bind(this),
			
			
			
			mousedown_callback: this.on_grab_canvas.bind(this),
			touchstart_callback: this.on_grab_canvas.bind(this),
			
			mousedrag_callback: this.on_drag_canvas.bind(this),
			touchmove_callback: this.on_drag_canvas.bind(this),
			
			mouseup_callback: this.on_release_canvas.bind(this),
			touchend_callback: this.on_release_canvas.bind(this),
			
			wheel_callback: this.on_wheel_canvas.bind(this),
			pinch_callback: this.on_pinch_canvas.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		const bound_function = this.change_aspect_ratio.bind(this);
		window.addEventListener("resize", bound_function);
		this.handlers.push([window, "resize", bound_function]);
		
		this.load_promise = new Promise(async (resolve, reject) =>
		{
			await Site.load_glsl();
			
			this.run(generating_code, uniform_code, world_center_x, world_center_y, zoom_level, add_indicator_draggable, draggable_callback, selector_mode);
			
			resolve();
		});
	}
		
		
		
	run(generating_code, uniform_code = "", world_center_x = 0, world_center_y = 0, zoom_level = -.585, add_indicator_draggable = false, draggable_callback = null, selector_mode = false)
	{
		this.generating_code = generating_code;
		this.uniform_code = uniform_code;
		
		this.zoom_level = zoom_level;
		
		this.wilson.world_width = 3 * Math.pow(2, this.zoom_level);
		this.wilson.world_height = this.wilson.world_width;
		
		this.wilson.world_center_x = world_center_x;
		this.wilson.world_center_y = world_center_y;
		
		this.add_indicator_draggable = add_indicator_draggable;
		this.draggable_callback = draggable_callback;
		
		let selector_mode_string = "";
		
		if (selector_mode)
		{
			selector_mode_string = `
				image_z.x += 127.0;
				image_z.y += 127.0;
				
				float whole_1 = floor(image_z.x);
				float whole_2 = floor(image_z.y);
				
				float fract_1 = (image_z.x - whole_1);
				float fract_2 = (image_z.y - whole_2);
				
				gl_FragColor = vec4(whole_1 / 256.0, fract_1, whole_2 / 256.0, fract_2);
				
				return;
			`;
		}
		
		
		
		const frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float black_point;
			uniform float white_point;
			
			uniform vec2 draggable_arg;
			
			${uniform_code}
			
			
			
			${Site.get_glsl_bundle(generating_code)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generating_code};
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
				
				
				
				vec2 image_z = f(z);
				
				
				
				${selector_mode_string}
				
				
				
				float modulus = length(image_z);
				
				float h = atan(image_z.y, image_z.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / white_point / white_point)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * black_point * black_point)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;
		
		this.wilson.render.shader_programs = [];
		this.wilson.render.load_new_shader(frag_shader_source);
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		this.wilson.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "draggable_arg"]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"], 1);
		
		
		
		this.next_pan_velocity_x = 0;
		this.next_pan_velocity_y = 0;
		this.next_zoom_velocity = 0;
		
		this.pan_velocity_x = 0;
		this.pan_velocity_y = 0;
		this.zoom_velocity = 0;
		
		
		
		const need_draggable = add_indicator_draggable || (generating_code.indexOf("draggable_arg") !== -1);
		
		if (need_draggable && this.wilson.draggables.num_draggables === 0)
		{
			this.wilson.draggables.add(.5, .5, !add_indicator_draggable);
			
			this.wilson.gl.uniform2f(this.wilson.uniforms["draggable_arg"], .5, .5);
		}
		
		else if (!need_draggable && this.wilson.draggables.num_draggables !== 0)
		{
			this.wilson.draggables.num_draggables--;
			
			this.wilson.draggables.draggables[0].remove();
			
			this.wilson.draggables = [];
		}
		
		
		
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
		
		
		
		if (this.use_selector_mode)
		{
			this.run(this.generating_code, this.uniform_code, this.wilson.world_center_x, this.wilson.world_center_y, this.zoom_level, this.force_add_draggable, true);
			
			const timeout_id = setTimeout(() =>
			{
				this.wilson.render.draw_frame();
				
				const coordinates = this.wilson.utils.interpolate.world_to_canvas(x, y);
				
				let pixel = new Uint8Array(4);
				
				this.wilson.gl.readPixels(coordinates[1], this.wilson.canvas_height - coordinates[0], 1, 1, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, pixel);
				
				const z_x = (pixel[0] - 127) + pixel[1] / 256;
				const z_y = (pixel[2] - 127) + pixel[3] / 256;
				
				
				
				let plus_1 = "+";
				
				if (y < 0)
				{
					plus_1 = "-";
				}
				
				let plus_2 = "+";
				
				if (z_y < 0)
				{
					plus_2 = "-";
				}
				
				console.log(`${x} ${plus_1} ${Math.abs(y)}i |---> ${z_x} ${plus_2} ${Math.abs(z_y)}i`);
				
				this.run(this.generating_code, this.uniform_code, this.wilson.world_center_x, this.wilson.world_center_y, this.zoom_level, this.force_add_draggable, false);
				
				this.use_selector_mode = false;
			}, 20);
			
			this.timeout_ids.push(timeout_id);
		}
	}
	
	
	
	on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		this.wilson.world_center_x -= x_delta;
		this.wilson.world_center_y -= y_delta;
		
		this.next_pan_velocity_x = -x_delta / this.wilson.world_width;
		this.next_pan_velocity_y = -y_delta / this.wilson.world_height;
		
		try {this.wilson.draggables.recalculate_locations();}
		catch(ex) {}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_release_canvas(x, y, event)
	{
		if (Math.sqrt(this.next_pan_velocity_x * this.next_pan_velocity_x + this.next_pan_velocity_y * this.next_pan_velocity_y) >= this.pan_velocity_start_threshhold)
		{
			this.pan_velocity_x = this.next_pan_velocity_x;
			this.pan_velocity_y = this.next_pan_velocity_y;
		}
		
		if (Math.abs(this.next_zoom_velocity) >= this.zoom_velocity_start_threshhold)
		{
			this.zoom_velocity = this.next_zoom_velocity;
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
		}
		
		else
		{
			this.zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		this.zoom_canvas();
	}
	
	
	
	on_pinch_canvas(x, y, touch_distance_delta, event)
	{
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
		
		this.fixed_point_x = x;
		this.fixed_point_y = y;
		
		this.zoom_canvas();
	}
	
	
	
	zoom_canvas()
	{
		if (this.aspect_ratio >= 1)
		{
			const new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 3 * Math.pow(2, this.zoom_level) * this.aspect_ratio, 3 * Math.pow(2, this.zoom_level));
			
			this.wilson.world_width = 3 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
			this.wilson.world_height = 3 * Math.pow(2, this.zoom_level);
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			const new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 3 * Math.pow(2, this.zoom_level), 3 * Math.pow(2, this.zoom_level) / this.aspect_ratio);
			
			this.wilson.world_width = 3 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 3 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
		
		try {this.wilson.draggables.recalculate_locations();}
		catch(ex) {}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_drag_draggable(active_draggable, x, y, event)
	{
		try {this.draggable_callback(active_draggable, x, y, event)}
		catch(ex) {}
		
		this.wilson.gl.uniform2f(this.wilson.uniforms["draggable_arg"], x, y);
		
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
		
		
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["aspect_ratio"], this.aspect_ratio);
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_x"], this.wilson.world_center_x);
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_center_y"], this.wilson.world_center_y);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["world_size"], Math.min(this.wilson.world_height, this.wilson.world_width) / 2);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["black_point"], this.black_point);
		this.wilson.gl.uniform1f(this.wilson.uniforms["white_point"], this.white_point);
		
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
			
			if (Math.sqrt(this.pan_velocity_x * this.pan_velocity_x + this.pan_velocity_y * this.pan_velocity_y) < this.pan_velocity_stop_threshhold)
			{
				this.pan_velocity_x = 0;
				this.pan_velocity_y = 0;
			}
			
			
			
			this.zoom_level += this.zoom_velocity;
			
			this.zoom_canvas(this.fixed_point_x, this.fixed_point_y);
			
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
				
				this.wilson.world_width = 3 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
				this.wilson.world_height = 3 * Math.pow(2, this.zoom_level);
			}
			
			else
			{
				this.wilson.change_canvas_size(Math.floor(this.resolution * this.aspect_ratio), this.resolution);
				
				this.wilson.world_width = 3 * Math.pow(2, this.zoom_level);
				this.wilson.world_height = 3 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			}
		}
		
		else
		{
			this.aspect_ratio = 1;
			
			this.wilson.change_canvas_size(this.resolution, this.resolution);
			
			this.wilson.world_width = 3 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 3 * Math.pow(2, this.zoom_level);
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	run_benchmark()
	{
		this.wilson.change_canvas_size(this.benchmark_resolution, this.benchmark_resolution);
		
		const start_time = Date.now();
		
		let pixel = new Uint8Array(4);
		
		for (let i = 0; i < this.benchmark_cycles; i++)
		{
			this.wilson.render.draw_frame();
			
			this.wilson.gl.readPixels(0, 0, 1, 1, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, pixel);
		}
		
		const average_time = (Date.now() - start_time) / this.benchmark_cycles;
				
		console.log(`Finished benchmark --- average time to draw a ${this.benchmark_resolution}x${this.benchmark_resolution} frame is ${average_time}ms`);
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.wilson.render.draw_frame();
	}
}