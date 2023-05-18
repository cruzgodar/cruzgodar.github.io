"use strict";

class VectorField extends Applet
{
	load_promise = null;
	
	resolution = 500;
	
	num_particles = 0;
	max_particles = 5000;
	
	aspect_ratio = 1;
	zoom_level = .6515;
	fixed_point_x = 0;
	fixed_point_y = 0;
	
	dt = .0075;
	
	lifetime = 255;
	
	last_timestamp = -1;
	
	//A long array of particles of the form [x, y, remaining lifetime].
	particles = [];
	
	free_particle_slots = [];
	
	update_texture = null;
	dim_texture = null;
	
	update_canvas = null;
	dim_canvas = null;
	wilson_update = null;
	wilson_dim = null;
	
	pan_velocity_x = 0;
	pan_velocity_y = 0;
	zoom_velocity = 0;
	
	next_pan_velocity_x = 0;
	next_pan_velocity_y = 0;
	next_zoom_velocity = 0;
	
	last_pan_velocities_x = [];
	last_pan_velocities_y = [];
	last_zoom_velocities = [];

	pan_friction = .96;
	pan_velocity_start_threshhold = .00025;
	pan_velocity_stop_threshhold = .00025;
	
	zoom_friction = .9;
	zoom_velocity_start_threshhold = .002;
	zoom_velocity_stop_threshhold = .002;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		this.update_canvas = document.createElement("canvas");
		this.update_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(this.update_canvas);
		Page.element.appendChild(this.update_canvas);
		
		this.dim_canvas = document.createElement("canvas");
		this.dim_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(this.dim_canvas);
		Page.element.appendChild(this.dim_canvas);
		
		
		
		const temp_shader = "precision highp float; varying vec2 uv; void main(void) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }";
		
		const options_update =
		{
			renderer: "gpu",
			
			shader: temp_shader,
			
			canvas_width: 100,
			canvas_height: 100,
		};
		
		this.wilson_update = new Wilson(this.update_canvas, options_update);
		
		
		
		this.wilson_update.render.create_framebuffer_texture_pair();
		
		this.wilson_update.gl.bindTexture(this.wilson_update.gl.TEXTURE_2D, this.wilson_update.render.framebuffers[0].texture);
		this.wilson_update.gl.bindFramebuffer(this.wilson_update.gl.FRAMEBUFFER, null);
		
		
		
		const frag_shader_source_dim = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			void main(void)
			{
				vec3 v = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0).xyz;
				
				gl_FragColor = vec4(v.x - 1.0 / 255.0, v.y, v.z, 1.0);
			}
		`;
		
		const frag_shader_source_pan = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform vec2 pan;
			
			void main(void)
			{
				vec2 tex_coord = (uv + vec2(1.0, 1.0)) / 2.0 - pan;
				
				if (tex_coord.x >= 0.0 && tex_coord.x < 1.0 && tex_coord.y >= 0.0 && tex_coord.y < 1.0)
				{
					vec3 v = texture2D(u_texture, tex_coord).xyz;
					
					gl_FragColor = vec4(v.x, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;
		
		const frag_shader_source_zoom = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float scale;
			uniform vec2 fixed_point;
			
			void main(void)
			{
				vec2 tex_coord = ((uv + vec2(1.0, 1.0)) / 2.0 - fixed_point) * scale + fixed_point;
				
				if (tex_coord.x >= 0.0 && tex_coord.x < 1.0 && tex_coord.y >= 0.0 && tex_coord.y < 1.0)
				{
					vec3 v = texture2D(u_texture, tex_coord).xyz;
					
					gl_FragColor = vec4(v.x / 1.06, v.y, v.z, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;
		
		const options_dim =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_dim,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
		};
		
		this.wilson_dim = new Wilson(this.dim_canvas, options_dim);
		
		
			
		this.wilson_dim.render.load_new_shader(frag_shader_source_pan);
		
		this.wilson_dim.render.init_uniforms(["pan"], 1);
		
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[0]);
		
		
		
		this.wilson_dim.render.load_new_shader(frag_shader_source_zoom);
		
		this.wilson_dim.render.init_uniforms(["scale", "fixed_point"], 2);
		
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[0]);
		
		
		
		this.wilson_dim.render.create_framebuffer_texture_pair(this.wilson_dim.gl.UNSIGNED_BYTE);
		
		this.wilson_dim.gl.bindTexture(this.wilson_dim.gl.TEXTURE_2D, this.wilson_dim.render.framebuffers[0].texture);
		this.wilson_dim.gl.bindFramebuffer(this.wilson_dim.gl.FRAMEBUFFER, null);
		
		this.dim_texture = new Uint8Array(this.resolution * this.resolution * 4);
		
		
		
		const frag_shader_source_draw = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				vec3 v = texture2D(u_texture, (vec2(1.0 + uv.x, 1.0 - uv.y)) / 2.0).xyz;
				
				gl_FragColor = vec4(hsv2rgb(vec3(v.y, v.z, v.x)), 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_draw,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 2 * Math.PI,
			world_height: 2 * Math.PI,
			world_center_x: 0,
			world_center_y: 0,
			
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
			
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.generate_new_field.bind(this),
			
			
			
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
		
		this.wilson.render.create_framebuffer_texture_pair(this.wilson.gl.UNSIGNED_BYTE);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		
		
		const bound_function = this.handle_resize_event.bind(this);
		window.addEventListener("resize", bound_function);
		this.handlers.push(window, "resize", bound_function);
		
		
		
		this.load_promise = new Promise(async (resolve, reject) =>
		{
			await Site.load_glsl();
			
			resolve();
		});
	}
	
	
	
	run(generating_code, resolution = 500, max_particles = 5000, dt = .0075, world_center_x = 0, world_center_y = 0, zoom_level = .6515)
	{
		const frag_shader_source_update_base = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float dt;
			
			
			
			${Site.get_glsl_bundle(generating_code)}
			
			
			
			//Don't know how, but this writes an honest float32 to the 32 bits of output, which JS then decodes.
			
			float shift_right(float v, float amt)
			{
				v = floor(v) + 0.5;
				return floor(v / exp2(amt));
			}
			
			float shift_left(float v, float amt)
			{
				return floor(v * exp2(amt) + 0.5);
			}
			
			float mask_last(float v, float bits)
			{
				return mod(v, shift_left(1.0, bits));
			}
			
			float extract_bits(float num, float from, float to)
			{
				from = floor(from + 0.5); to = floor(to + 0.5);
				return mask_last(shift_right(num, from), to - from);
			}
			
			vec4 encode_float(float val)
			{
				if (val == 0.0) return vec4(0, 0, 0, 0);
				float sign = val > 0.0 ? 0.0 : 1.0;
				val = abs(val);
				float exponent = floor(log2(val));
				float biased_exponent = exponent + 127.0;
				float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;
				float t = biased_exponent / 2.0;
				float last_bit_of_biased_exponent = fract(t) * 2.0;
				float remaining_bits_of_biased_exponent = floor(t);
				float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;
				float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;
				float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;
				float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0; 
				return vec4(byte4, byte3, byte2, byte1);
			}
			
			
			
			void main(void)
			{
				vec4 sample = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0);
				
				if (int(sample.z) == 0)
				{
					return;
				}
				
				vec2 v = sample.xy;
				
				float x = v.x;
				float y = v.y;
		`;
		
		const frag_shader_source_update_x = `
				${frag_shader_source_update_base}
				
				vec2 d = vec2${generating_code};
				
				gl_FragColor = encode_float(dt * d.x + x);
			}
		`;
		
		const frag_shader_source_update_y = `
				${frag_shader_source_update_base}
				
				vec2 d = vec2${generating_code};
				
				gl_FragColor = encode_float(dt * d.y + y);
			}
		`;
		
		const frag_shader_source_update_h = `
				${frag_shader_source_update_base}
				
				vec2 d = vec2${generating_code};
				
				gl_FragColor = encode_float((atan(d.y, d.x) + 3.14159265) / 6.28318531);
			}
		`;
		
		const frag_shader_source_update_s = `
				${frag_shader_source_update_base}
				
				vec2 d = vec2${generating_code};
				
				gl_FragColor = encode_float(1.0 - exp(-1.2 * (d.x * d.x + d.y * d.y)));
			}
		`;
		
		const frag_shader_source_update_s_2 = `
				${frag_shader_source_update_base}
				
				vec2 d = vec2${generating_code};
				
				gl_FragColor = encode_float(1.0 - exp(-1.2 * .9 * (d.x * d.x + d.y * d.y)));
			}
		`;
		
		this.wilson_update.render.shader_programs = [];
		
		this.wilson_update.render.load_new_shader(frag_shader_source_update_x);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_y);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_h);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_s);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_s_2);
		
		this.wilson_update.render.init_uniforms(["dt"], 0);
		this.wilson_update.render.init_uniforms(["dt"], 1);
		this.wilson_update.render.init_uniforms(["dt"], 2);
		this.wilson_update.render.init_uniforms(["dt"], 3);
		this.wilson_update.render.init_uniforms(["dt"], 4);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[0]);
		this.wilson_update.gl.uniform1f(this.wilson_update.uniforms["dt"][0], this.dt);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[1]);
		this.wilson_update.gl.uniform1f(this.wilson_update.uniforms["dt"][1], this.dt);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[2]);
		this.wilson_update.gl.uniform1f(this.wilson_update.uniforms["dt"][2], this.dt);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[3]);
		this.wilson_update.gl.uniform1f(this.wilson_update.uniforms["dt"][3], this.dt);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[4]);
		this.wilson_update.gl.uniform1f(this.wilson_update.uniforms["dt"][4], this.dt);
		
		this.generate_new_field(resolution, max_particles, dt, world_center_x, world_center_y, zoom_level);
	}
	
	
	
	
	generate_new_field(resolution = this.resolution, max_particles = this.max_particles, dt = this.dt, world_center_x = this.wilson.world_center_x, world_center_y = this.wilson.world_center_y, zoom_level = this.zoom_level)
	{
		this.resolution = resolution;
		this.max_particles = max_particles;
		this.dt = dt;
		
		this.wilson.world_center_x = world_center_x;
		this.wilson.world_center_y = world_center_y;
		this.zoom_level = zoom_level;
		
		this.num_particles = 0;
		
		const update_resolution = Math.ceil(Math.sqrt(max_particles));
		this.wilson_update.change_canvas_size(update_resolution, update_resolution);
		
		this.change_aspect_ratio();
		
		
		
		this.particles = new Array(this.max_particles);
		this.free_particle_slots = new Array(this.max_particles);
		
		for (let i = 0; i < this.max_particles; i++)
		{
			//x, y, lifetime, hue, saturation
			this.particles[i] = [0, 0, 0];
			this.free_particle_slots[i] = i;
		}
		
		
		
		this.update_texture = new Float32Array(this.wilson_update.canvas_width * this.wilson_update.canvas_height * 4);
		
		for (let i = 0; i < this.wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < this.wilson_update.canvas_width; j++)
			{
				const index = this.wilson_update.canvas_width * i + j;
				
				this.update_texture[4 * index] = 0.0;
				this.update_texture[4 * index + 1] = 0.0;
				this.update_texture[4 * index + 2] = 0.0;
				this.update_texture[4 * index + 3] = 0.0;
			}
		}
		
		
		
		this.dim_texture = new Uint8Array(this.wilson.canvas_width * this.wilson.canvas_height * 4);
		
		for (let i = 0; i < this.wilson.canvas_height; i++)
		{
			for (let j = 0; j < this.wilson.canvas_width; j++)
			{
				const index = this.wilson.canvas_width * i + j;
				
				this.dim_texture[4 * index] = 0;
				this.dim_texture[4 * index + 1] = 0;
				this.dim_texture[4 * index + 2] = 0;
			}
		}
		
		
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	resume()
	{
		this.animation_paused = false;
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	draw_frame(timestamp)
	{
		//Wrapping everything in a try block and eating the occasional error is pretty gross, but it's actually a decent solution: everything is fine unless the user resizes the window faster than the screen refresh rate, meaning we access out of bounds in the middle of this function. We can fix that by just restarting whenever it happens.
		try
		{
			const time_elapsed = timestamp - this.last_timestamp;
			
			this.last_timestamp = timestamp;
			
			if (time_elapsed === 0)
			{
				return;
			}
			
			
			
			//If there's not enough particles, we add what's missing, capped at 1% of the total particle count.
			if (this.num_particles < this.max_particles)
			{
				//We find the first open slot we can and search from the end of the list so that we can slice more efficiently.
				const num_to_add = Math.min(Math.ceil(this.max_particles / 80), this.max_particles - this.num_particles);
				
				for (let i = this.free_particle_slots.length - num_to_add; i < this.free_particle_slots.length; i++)
				{
					this.create_particle(this.free_particle_slots[i]);
				}
				
				this.free_particle_slots.splice(this.free_particle_slots.length - num_to_add, num_to_add);
			}
			
			
			
			this.last_pan_velocities_x.push(this.next_pan_velocity_x);
			this.last_pan_velocities_y.push(this.next_pan_velocity_y);
			this.last_pan_velocities_x.shift();
			this.last_pan_velocities_y.shift();
			
			//This lets us only move the canvas when we have at least one pixel to move.
			if (this.next_pan_velocity_x !== 0 || this.next_pan_velocity_y !== 0)
			{
				let x_delta = -this.next_pan_velocity_x;
				let y_delta = -this.next_pan_velocity_y;
				
				
				
				if (Math.abs(x_delta / this.wilson.world_width * this.wilson.canvas_width) < 1)
				{
					x_delta = 0;
				}
				
				else
				{
					this.next_pan_velocity_x = 0;
				}
				
				
				
				if (Math.abs(y_delta / this.wilson.world_height * this.wilson.canvas_height) < 1)
				{
					y_delta = 0;
				}
				
				else
				{
					this.next_pan_velocity_y = 0;
				}
				
				
				
				if (x_delta !== 0 || y_delta !== 0)
				{
					this.pan_grid(x_delta, y_delta);
					
					this.wilson.world_center_y -= y_delta;
					this.wilson.world_center_x -= x_delta;
				}
			}
			
			else if (this.pan_velocity_x !== 0 || this.pan_velocity_y !== 0)
			{
				let x_delta = -this.pan_velocity_x;
				let y_delta = -this.pan_velocity_y;
				
				if (Math.abs(x_delta / this.wilson.world_width * this.wilson.canvas_width) < 1)
				{
					x_delta = 0;
				}
				
				if (Math.abs(y_delta / this.wilson.world_height * this.wilson.canvas_height) < 1)
				{
					y_delta = 0;
				}
				
				this.pan_grid(x_delta, y_delta);
				
				this.wilson.world_center_y -= y_delta;
				this.pan_velocity_y *= this.pan_friction;
				
				this.wilson.world_center_x -= x_delta;
				this.pan_velocity_x *= this.pan_friction;
				
				if (this.pan_velocity_x * this.pan_velocity_x + this.pan_velocity_y * this.pan_velocity_y < this.pan_velocity_stop_threshhold * this.pan_velocity_stop_threshhold)
				{
					this.pan_velocity_x = 0;
					this.pan_velocity_y = 0;
				}
			}
				
			
			
			this.last_zoom_velocities.push(this.next_zoom_velocity);
			this.last_zoom_velocities.shift();
			
			if (this.next_zoom_velocity !== 0)
			{
				this.zoom_canvas();
				
				this.zoom_grid(this.fixed_point_x, this.fixed_point_y, this.next_zoom_velocity);
				
				this.next_zoom_velocity = 0;
			}
				
			if (this.zoom_velocity !== 0)	
			{
				this.zoom_canvas(this.fixed_point_x, this.fixed_point_y);
				
				this.zoom_grid(this.fixed_point_x, this.fixed_point_y, this.zoom_velocity)
				
				this.zoom_level = Math.min(Math.max(this.zoom_level + this.zoom_velocity, -3), 3);
				
				this.zoom_velocity *= this.zoom_friction;
				
				if (Math.abs(this.zoom_velocity) < this.zoom_velocity_stop_threshhold)
				{
					this.zoom_velocity = 0;
				}
			}
			
			
			
			this.update_particles();
			
			this.draw_field();
			
			
			
			if (!this.animation_paused)
			{
				window.requestAnimationFrame(this.draw_frame.bind(this));
			}
		}
		
		catch(ex)
		{
			this.generate_new_field();
		}
	}
	
	
	
	create_particle(index)
	{
		this.particles[index][0] = this.wilson.world_center_x + this.wilson.world_width * (Math.random() - .5);
		
		this.particles[index][1] = this.wilson.world_center_y + this.wilson.world_height * (Math.random() - .5);
		
		this.particles[index][2] = Math.round(this.lifetime * (Math.random() * .5 + .75));
		
		this.num_particles++;
	}
	
	destroy_particle(index)
	{
		//Set the lifetime to 0 if it wasn't already.
		this.particles[index][2] = 0;
		
		this.free_particle_slots.push(index);
		
		this.num_particles--;
	}
	
	update_particles()
	{
		for (let i = 0; i < this.wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < this.wilson_update.canvas_width; j++)
			{
				const index = this.wilson_update.canvas_width * i + j;
				
				if (index < this.particles.length && this.particles[index][2])
				{
					this.update_texture[4 * index] = this.particles[index][0];
					this.update_texture[4 * index + 1] = this.particles[index][1];
					this.update_texture[4 * index + 2] = 1.0;
				}
				
				else
				{
					this.update_texture[4 * index + 2] = 0.0;
				}
			}
		}
		
		
		
		this.wilson_update.gl.texImage2D(this.wilson_update.gl.TEXTURE_2D, 0, this.wilson_update.gl.RGBA, this.wilson_update.canvas_width, this.wilson_update.canvas_height, 0, this.wilson_update.gl.RGBA, this.wilson_update.gl.FLOAT, this.update_texture);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[0]);
		this.wilson_update.render.draw_frame();
		
		const floats_x = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[1]);
		this.wilson_update.render.draw_frame();
		
		const floats_y = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[2]);
		this.wilson_update.render.draw_frame();
		
		const floats_h = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[3]);
		this.wilson_update.render.draw_frame();
		
		const floats_s = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		//Extremely hacky way to fix the saturation bug on iOS.
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[4]);
		this.wilson_update.render.draw_frame();
		
		const floats_s_2 = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		for (let i = 0; i < this.wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < this.wilson_update.canvas_width; j++)
			{
				const index = this.wilson_update.canvas_width * i + j;
				
				if (index < this.particles.length && this.particles[index][2])
				{
					this.particles[index][0] = floats_x[index];
					this.particles[index][1] = floats_y[index];
					
					const row = Math.round((.5 - (this.particles[index][1] - this.wilson.world_center_y) / this.wilson.world_height) * this.wilson.canvas_height);
					
					const col = Math.round(((this.particles[index][0] - this.wilson.world_center_x) / this.wilson.world_width + .5) * this.wilson.canvas_width);
					
					if (row >= 0 && row < this.wilson.canvas_height && col >= 0 && col < this.wilson.canvas_width)
					{
						const new_index = row * this.wilson.canvas_width + col;
						
						this.dim_texture[4 * new_index] = this.lifetime;
						this.dim_texture[4 * new_index + 1] = floats_h[index] * 255;
						this.dim_texture[4 * new_index + 2] = Math.max(floats_s[index], floats_s_2[index]) * 255;
						
						this.particles[index][2]--;
						
						if (this.particles[index][2] <= 0)
						{
							this.destroy_particle(index);
						}
					}
					
					else
					{
						this.destroy_particle(index);
					}
				}
			}
		}
	}
	
	
	
	draw_field()
	{
		this.wilson_dim.gl.texImage2D(this.wilson_dim.gl.TEXTURE_2D, 0, this.wilson_dim.gl.RGBA, this.wilson_dim.canvas_width, this.wilson_dim.canvas_height, 0, this.wilson_dim.gl.RGBA, this.wilson_dim.gl.UNSIGNED_BYTE, this.dim_texture);
		
		this.wilson_dim.render.draw_frame();
		
		this.dim_texture = this.wilson_dim.render.get_pixel_data();
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, this.dim_texture);
		
		this.wilson.render.draw_frame();
	}
	
	
	
	//Call this before changing the world parameters!
	pan_grid(x_delta, y_delta)
	{
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[1]);
		
		this.wilson_dim.gl.uniform2f(this.wilson_dim.uniforms["pan"][1], x_delta / this.wilson.world_width, -y_delta / this.wilson.world_height);
		
		this.draw_field();
		
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[0]);
	}
	
	
	
	//Call this before changing the world parameters!
	zoom_grid(fixed_point_x, fixed_point_y, zoom_delta)
	{
		if (this.zoom_level <= -3 || this.zoom_level >= 3)
		{
			return;
		}
		
		//Ex: if the scale is 2 and goes to 3, the delta is +1, so we actually want to multiply things by 2^(-1) to get the source places.
		const scale = Math.pow(2, zoom_delta);
		
		const fixed_x = (fixed_point_x - this.wilson.world_center_x) / this.wilson.world_width + .5;
		const fixed_y = (this.wilson.world_center_y - fixed_point_y) / this.wilson.world_height + .5;
		
		
		
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[2]);
		
		this.wilson_dim.gl.uniform1f(this.wilson_dim.uniforms["scale"][2], scale);
		this.wilson_dim.gl.uniform2f(this.wilson_dim.uniforms["fixed_point"][2], fixed_x, fixed_y);
		
		this.draw_field();
		
		this.wilson_dim.gl.useProgram(this.wilson_dim.render.shader_programs[0]);
		
		
		//When we zoom out, we also cull the particles a little.
		if (zoom_delta > 0)
		{
			const chance = Math.pow(2, zoom_delta * 1.5);
			
			for (let i = 0; i < this.particles.length; i++)
			{
				if (this.particles[i][2] && (i % chance >= 1))
				{
					this.destroy_particle(i);
				}
			}
		}
	}
	
	
	
	on_grab_canvas(x, y, event)
	{
		this.pan_velocity_x = 0;
		this.pan_velocity_y = 0;
		this.zoom_velocity = 0;
		
		this.last_pan_velocities_x = [0, 0, 0, 0];
		this.last_pan_velocities_y = [0, 0, 0, 0];
		this.last_zoom_velocities = [0, 0, 0, 0];
	}
	
	on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		//The += here lets us only move the canvas when we have at least one pixel to move.
		this.next_pan_velocity_x += -x_delta;
		this.next_pan_velocity_y += -y_delta;
	}
	
	on_release_canvas(x, y, event)
	{
		let max_index = 0;
		
		this.last_pan_velocities_x.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.pan_velocity_x)
			{
				this.pan_velocity_x = Math.abs(velocity);
				max_index = index;
			}
		});
		
		if (this.pan_velocity_x < this.pan_velocity_start_threshhold)
		{
			this.pan_velocity_x = 0;
		}
		
		else
		{
			this.pan_velocity_x = this.last_pan_velocities_x[max_index];
		}
		
		
		
		this.last_pan_velocities_y.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.pan_velocity_y)
			{
				this.pan_velocity_y = Math.abs(velocity);
				max_index = index;
			}	
		});
		
		if (this.pan_velocity_y < this.pan_velocity_start_threshhold)
		{
			this.pan_velocity_y = 0;
		}
		
		else
		{
			this.pan_velocity_y = this.last_pan_velocities_y[max_index];
		}
		
		
		
		this.last_zoom_velocities.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > this.zoom_velocity)
			{
				this.zoom_velocity = Math.abs(velocity);
				max_index = index;
			}	
		});
		
		if (this.zoom_velocity < this.zoom_velocity_start_threshhold)
		{
			this.zoom_velocity = 0;
		}
		
		else
		{
			this.zoom_velocity = this.last_zoom_velocities[max_index];
		}
	}
	
	
	
	on_wheel_canvas(x, y, scroll_amount, event)
	{
		this.fixed_point_x = x;
		this.fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			this.next_zoom_velocity = scroll_amount / 100;
			
			this.zoom_level = Math.min(Math.max(this.zoom_level + scroll_amount / 100, -3), 3);
		}
		
		else
		{
			this.zoom_velocity += Math.sign(scroll_amount) * .05;
		}
	}
	
	
	
	on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		let zoom_delta;
		
		if (this.aspect_ratio >= 1)
		{
			zoom_delta = touch_distance_delta / this.wilson.world_width * 10;
		}
		
		else
		{
			zoom_delta = touch_distance_delta / this.wilson.world_height * 10;
		}
		
		this.zoom_level = Math.min(Math.max(this.zoom_level - zoom_delta, -3), 3);
		this.next_zoom_velocity = -zoom_delta;
		
		this.fixed_point_x = x;
		this.fixed_point_y = y;
	}
	
	
	
	zoom_canvas()
	{
		if (this.aspect_ratio >= 1)
		{
			let new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio, 4 * Math.pow(2, this.zoom_level));
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = this.wilson.input.get_zoomed_world_center(this.fixed_point_x, this.fixed_point_y, 4 * Math.pow(2, this.zoom_level), 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio);
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			
			this.wilson.world_center_x = new_world_center[0];
			this.wilson.world_center_y = new_world_center[1];
		}
	}
	
	
	
	change_aspect_ratio()
	{
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			this.aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (this.aspect_ratio >= 1)
			{
				this.wilson.change_canvas_size(Math.ceil(this.resolution * this.aspect_ratio), this.resolution);
				this.wilson_dim.change_canvas_size(Math.ceil(this.resolution * this.aspect_ratio), this.resolution);
				
				this.wilson.world_width = 4 * Math.pow(2, this.zoom_level) * this.aspect_ratio;
				this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
			}
			
			else
			{
				this.wilson.change_canvas_size(this.resolution, Math.ceil(this.resolution / this.aspect_ratio));
				this.wilson_dim.change_canvas_size(this.resolution, Math.ceil(this.resolution / this.aspect_ratio));
				
				this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
				this.wilson.world_height = 4 * Math.pow(2, this.zoom_level) / this.aspect_ratio;
			}
		}
		
		else
		{
			this.aspect_ratio = 1;
			
			this.wilson.change_canvas_size(this.resolution, this.resolution);
			this.wilson_dim.change_canvas_size(this.resolution, this.resolution);
			
			this.wilson.world_width = 4 * Math.pow(2, this.zoom_level);
			this.wilson.world_height = 4 * Math.pow(2, this.zoom_level);
		}
	}
	
	
	
	handle_resize_event()
	{
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			this.generate_new_field();
		}
	}
}