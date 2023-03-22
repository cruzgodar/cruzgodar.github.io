!async function()
{
	"use strict";
	
	
	
	await Site.load_glsl();
	
	
	
	let resolution = 500;
	
	let num_particles = 0;
	let max_particles = 5000;
	
	let aspect_ratio = 1;
	let zoom_level = .6515;
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	let dt = .0075;
	
	const lifetime = 255;
	
	//A full array representing the grid -- we need this to do trails.
	let grid = [];
	
	//A long array of particles of the form [x, y, remaining lifetime].
	let particles = [];
	
	let free_particle_slots = [];
	
	let starting_process_id = Site.applet_process_id;
	
	
	
	const options_update =
	{
		renderer: "gpu",
		
		canvas_width: 100,
		canvas_height: 100,
	};
	
	const wilson_update = new Wilson(Page.element.querySelector("#update-canvas"), options_update);
	
	
	
	wilson_update.render.create_framebuffer_texture_pair();
	
	let update_texture = null;
	
	wilson_update.gl.bindTexture(wilson_update.gl.TEXTURE_2D, wilson_update.render.framebuffers[0].texture);
	wilson_update.gl.bindFramebuffer(wilson_update.gl.FRAMEBUFFER, null);
	
	
	
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
		
		canvas_width: resolution,
		canvas_height: resolution,
	};
	
	const wilson_dim = new Wilson(Page.element.querySelector("#dim-canvas"), options_dim);
	
	wilson_dim.gl.texParameteri(wilson_dim.gl.TEXTURE_2D, wilson_dim.gl.TEXTURE_MAG_FILTER, wilson_dim.gl.LINEAR);
	wilson_dim.gl.texParameteri(wilson_dim.gl.TEXTURE_2D, wilson_dim.gl.TEXTURE_MIN_FILTER, wilson_dim.gl.LINEAR);
	
	
		
	wilson_dim.render.load_new_shader(frag_shader_source_pan);
	
	wilson_dim.render.init_uniforms(["pan"], 1);
	
	wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[0]);
	
	
	
	wilson_dim.render.load_new_shader(frag_shader_source_zoom);
	
	wilson_dim.render.init_uniforms(["scale", "fixed_point"], 2);
	
	wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[0]);
	
	
	
	wilson_dim.render.create_framebuffer_texture_pair(wilson_dim.gl.UNSIGNED_BYTE);
	
	wilson_dim.gl.bindTexture(wilson_dim.gl.TEXTURE_2D, wilson_dim.render.framebuffers[0].texture);
	wilson_dim.gl.bindFramebuffer(wilson_dim.gl.FRAMEBUFFER, null);
	
	let dim_texture = new Uint8Array(resolution * resolution * 4);
	
	
	
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
		
		canvas_width: resolution,
		canvas_height: resolution,
		
		world_width: 2 * Math.PI,
		world_height: 2 * Math.PI,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: generate_new_field,
		
		
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas,
		
		wheel_callback: on_wheel_canvas,
		pinch_callback: on_pinch_canvas
	};
	
	const wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	wilson.render.create_framebuffer_texture_pair(wilson.gl.UNSIGNED_BYTE);
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
	wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
	
	
	
	const code_textarea_element = Page.element.querySelector("#code-textarea");
	
	code_textarea_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			use_new_code();
		}
	});
	
	
	
	const generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", use_new_code);
	
	
	
	const resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", generate_new_field);
	
	
	
	const max_particles_input_element = Page.element.querySelector("#max-particles-input");
	
	max_particles_input_element.addEventListener("input", generate_new_field);
	
	
	
	const speed_input_element = Page.element.querySelector("#speed-input");
	
	speed_input_element.addEventListener("input", () =>
	{
		dt = parseFloat(speed_input_element.value || 1) / 75;
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[0]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][0], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[1]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][1], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[2]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][2], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[3]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][3], dt);
	});
	
	
	
	const download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-vector-field.png");
	});
	
	
	
	const examples =
	{
		"none": "",
		"div": "(x, y)",
		"curl": "(-y, x)",
		"clockwork": "(sin(y), sin(x + PI))",
		"df": "(1.0, sin(y) / (x*x + 1.0))",
		"cross": "(sin(y / 2.5), tan(x / 2.5))"
	};
	
	const example_selector_dropdown_element = Page.element.querySelector("#example-selector-dropdown");
	
	example_selector_dropdown_element.addEventListener("input", () =>
	{
		if (example_selector_dropdown_element.value !== "none")
		{
			code_textarea_element.value = examples[example_selector_dropdown_element.value];
			
			use_new_code();
		}
	});
	
	
	
	
	use_new_code();
	
	Page.show();
	
	
	
	function use_new_code()
	{
		wilson.world_center_x = 0;
		wilson.world_center_y = 0;
		wilson.world_width = 2 * Math.PI;
		wilson.world_height = 2 * Math.PI;
		zoom_level = .6515;
		
		const generating_code = code_textarea_element.value;
		
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
		
		wilson_update.render.shader_programs = [];
		
		wilson_update.render.load_new_shader(frag_shader_source_update_x);
		wilson_update.render.load_new_shader(frag_shader_source_update_y);
		wilson_update.render.load_new_shader(frag_shader_source_update_h);
		wilson_update.render.load_new_shader(frag_shader_source_update_s);
		
		wilson_update.render.init_uniforms(["dt"], 0);
		wilson_update.render.init_uniforms(["dt"], 1);
		wilson_update.render.init_uniforms(["dt"], 2);
		wilson_update.render.init_uniforms(["dt"], 3);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[0]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][0], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[1]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][1], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[2]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][2], dt);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[3]);
		wilson_update.gl.uniform1f(wilson_update.uniforms["dt"][3], dt);
		
		generate_new_field();
	}
	
	
	
	
	function generate_new_field()
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		num_particles = 0;
		max_particles = Math.max(parseInt(max_particles_input_element.value || 3000), 100);
		
		const update_resolution = Math.ceil(Math.sqrt(max_particles));
		wilson_update.change_canvas_size(update_resolution, update_resolution);
		
		dt = parseFloat(speed_input_element.value || 1) / 100;
		
		change_aspect_ratio();
		
		
		
		particles = new Array(max_particles);
		free_particle_slots = new Array(max_particles);
		
		for (let i = 0; i < max_particles; i++)
		{
			//x, y, lifetime, hue, saturation
			particles[i] = [0, 0, 0];
			free_particle_slots[i] = i;
		}
		
		
		
		update_texture = new Float32Array(wilson_update.canvas_width * wilson_update.canvas_height * 4);
		
		for (let i = 0; i < wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < wilson_update.canvas_width; j++)
			{
				const index = wilson_update.canvas_width * i + j;
				
				update_texture[4 * index] = 0.0;
				update_texture[4 * index + 1] = 0.0;
				update_texture[4 * index + 2] = 0.0;
				update_texture[4 * index + 3] = 0.0;
			}
		}
		
		
		
		dim_texture = new Uint8Array(wilson.canvas_width * wilson.canvas_height * 4);
		
		for (let i = 0; i < wilson.canvas_height; i++)
		{
			for (let j = 0; j < wilson.canvas_width; j++)
			{
				const index = wilson.canvas_width * i + j;
				
				dim_texture[4 * index] = 0;
				dim_texture[4 * index + 1] = 0;
				dim_texture[4 * index + 2] = 0;
			}
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	let last_timestamp = -1;
	
	function draw_frame(timestamp)
	{
		//Wrapping everything in a try block and eating the occasional error is pretty gross, but it's actually a decent solution: everything is fine unless the user resizes the window faster than the screen refresh rate, meaning we access out of bounds in the middle of this function. We can fix that by just restarting whenever that happens.
		try
		{
			const time_elapsed = timestamp - last_timestamp;
			
			last_timestamp = timestamp;
			
			if (time_elapsed === 0)
			{
				return;
			}
			
			
			
			//If there's not enough particles, we add what's missing, capped at 1% of the total particle count.
			if (num_particles < max_particles)
			{
				//We find the first open slot we can and search from the end of the list so that we can slice more efficiently.
				const num_to_add = Math.min(Math.ceil(max_particles / 80), max_particles - num_particles);
				
				for (let i = free_particle_slots.length - num_to_add; i < free_particle_slots.length; i++)
				{
					create_particle(free_particle_slots[i]);
				}
				
				free_particle_slots.splice(free_particle_slots.length - num_to_add, num_to_add);
			}
			
			
			
			last_pan_velocities_x.push(next_pan_velocity_x);
			last_pan_velocities_y.push(next_pan_velocity_y);
			last_pan_velocities_x.shift();
			last_pan_velocities_y.shift();
			
			//This lets us only move the canvas when we have at least one pixel to move.
			if (next_pan_velocity_x !== 0 || next_pan_velocity_y !== 0)
			{
				let x_delta = -next_pan_velocity_x;
				let y_delta = -next_pan_velocity_y;
				
				
				
				if (Math.abs(x_delta / wilson.world_width * wilson.canvas_width) < 1)
				{
					x_delta = 0;
				}
				
				else
				{
					next_pan_velocity_x = 0;
				}
				
				
				
				if (Math.abs(y_delta / wilson.world_height * wilson.canvas_height) < 1)
				{
					y_delta = 0;
				}
				
				else
				{
					next_pan_velocity_y = 0;
				}
				
				
				
				pan_grid(x_delta, y_delta);
				
				wilson.world_center_y -= y_delta;
				wilson.world_center_x -= x_delta;
			}
			
			else if (pan_velocity_x !== 0 || pan_velocity_y !== 0)
			{
				let x_delta = -pan_velocity_x;
				let y_delta = -pan_velocity_y;
				
				if (Math.abs(x_delta / wilson.world_width * wilson.canvas_width) < 1)
				{
					x_delta = 0;
				}
				
				if (Math.abs(y_delta / wilson.world_height * wilson.canvas_height) < 1)
				{
					y_delta = 0;
				}
				
				pan_grid(x_delta, y_delta)
				
				wilson.world_center_y -= y_delta;
				pan_velocity_y *= pan_friction;
				
				wilson.world_center_x -= x_delta;
				pan_velocity_x *= pan_friction;
				
				if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
				{
					pan_velocity_x = 0;
					pan_velocity_y = 0;
				}
			}
				
			
			
			last_zoom_velocities.push(next_zoom_velocity);
			last_zoom_velocities.shift();
			
			if (next_zoom_velocity !== 0)
			{
				zoom_canvas();
				
				zoom_grid(fixed_point_x, fixed_point_y, next_zoom_velocity);
				
				next_zoom_velocity = 0;
			}
				
			if (zoom_velocity !== 0)	
			{
				zoom_canvas(fixed_point_x, fixed_point_y);
				
				zoom_grid(fixed_point_x, fixed_point_y, zoom_velocity)
				
				zoom_level = Math.min(Math.max(zoom_level + zoom_velocity, -3), 3);
				
				zoom_velocity *= zoom_friction;
				
				if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
				{
					zoom_velocity = 0;
				}
			}
			
			
			
			update_particles();
			
			draw_field();
			
			
			
			if (starting_process_id !== Site.applet_process_id)
			{
				console.log("Terminated applet process");
				
				return;
			}
			
			window.requestAnimationFrame(draw_frame);
		}
		
		catch(ex)
		{
			generate_new_field();
		}
	}
	
	
	
	function create_particle(index)
	{
		particles[index][0] = wilson.world_center_x + wilson.world_width * (Math.random() - .5);
		
		particles[index][1] = wilson.world_center_y + wilson.world_height * (Math.random() - .5);
		
		particles[index][2] = Math.round(lifetime * (Math.random() * .5 + .75));
		
		num_particles++;
	}
	
	function destroy_particle(index)
	{
		//Set the lifetime to 0 if it wasn't already.
		particles[index][2] = 0;
		
		free_particle_slots.push(index);
		
		num_particles--;
	}
	
	function update_particles()
	{
		for (let i = 0; i < wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < wilson_update.canvas_width; j++)
			{
				const index = wilson_update.canvas_width * i + j;
				
				if (index < particles.length && particles[index][2])
				{
					update_texture[4 * index] = particles[index][0];
					update_texture[4 * index + 1] = particles[index][1];
					update_texture[4 * index + 2] = 1.0;
				}
				
				else
				{
					update_texture[4 * index + 2] = 0.0;
				}
			}
		}
		
		
		
		wilson_update.gl.texImage2D(wilson_update.gl.TEXTURE_2D, 0, wilson_update.gl.RGBA, wilson_update.canvas_width, wilson_update.canvas_height, 0, wilson_update.gl.RGBA, wilson_update.gl.FLOAT, update_texture);
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[0]);
		wilson_update.render.draw_frame();
		
		const floats_x = new Float32Array(wilson_update.render.get_pixel_data().buffer);
		
		
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[1]);
		wilson_update.render.draw_frame();
		
		const floats_y = new Float32Array(wilson_update.render.get_pixel_data().buffer);
		
		
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[2]);
		wilson_update.render.draw_frame();
		
		const floats_h = new Float32Array(wilson_update.render.get_pixel_data().buffer);
		
		
		
		wilson_update.gl.useProgram(wilson_update.render.shader_programs[3]);
		wilson_update.render.draw_frame();
		
		const floats_s = new Float32Array(wilson_update.render.get_pixel_data().buffer);
		
		for (let i = 0; i < wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < wilson_update.canvas_width; j++)
			{
				const index = wilson_update.canvas_width * i + j;
				
				if (index < particles.length && particles[index][2])
				{
					particles[index][0] = floats_x[index];
					particles[index][1] = floats_y[index];
					
					const row = Math.round((.5 - (particles[index][1] - wilson.world_center_y) / wilson.world_height) * wilson.canvas_height);
					
					const col = Math.round(((particles[index][0] - wilson.world_center_x) / wilson.world_width + .5) * wilson.canvas_width);
					
					if (row >= 0 && row < wilson.canvas_height && col >= 0 && col < wilson.canvas_width)
					{
						const new_index = row * wilson.canvas_width + col;
						
						dim_texture[4 * new_index] = lifetime;
						dim_texture[4 * new_index + 1] = floats_h[index] * 255;
						dim_texture[4 * new_index + 2] = floats_s[index] * 255;
						
						particles[index][2]--;
						
						if (particles[index][2] <= 0)
						{
							destroy_particle(index);
						}
					}
					
					else
					{
						destroy_particle(index);
					}
				}
			}
		}
	}
	
	
	
	function draw_field()
	{
		wilson_dim.gl.texImage2D(wilson_dim.gl.TEXTURE_2D, 0, wilson_dim.gl.RGBA, wilson_dim.canvas_width, wilson_dim.canvas_height, 0, wilson_dim.gl.RGBA, wilson_dim.gl.UNSIGNED_BYTE, dim_texture);
		
		wilson_dim.render.draw_frame();
		
		dim_texture = wilson_dim.render.get_pixel_data();
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, dim_texture);
		
		wilson.render.draw_frame();
	}
	
	
	
	//Call this before changing the world parameters!
	function pan_grid(x_delta, y_delta)
	{
		wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[1]);
		
		wilson_dim.gl.uniform2f(wilson_dim.uniforms["pan"][1], x_delta / wilson.world_width, -y_delta / wilson.world_height);
		
		draw_field();
		
		wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[0]);
	}
	
	
	
	//Call this before changing the world parameters!
	function zoom_grid(fixed_point_x, fixed_point_y, zoom_delta)
	{
		if (zoom_level <= -3 || zoom_level >= 3)
		{
			return;
		}
		
		//Ex: if the scale is 2 and goes to 3, the delta is +1, so we actually want to multiply things by 2^(-1) to get the source places.
		const scale = Math.pow(2, zoom_delta);
		
		const fixed_x = (fixed_point_x - wilson.world_center_x) / wilson.world_width + .5;
		const fixed_y = (wilson.world_center_y - fixed_point_y) / wilson.world_height + .5;
		
		
		
		wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[2]);
		
		wilson_dim.gl.uniform1f(wilson_dim.uniforms["scale"][2], scale);
		wilson_dim.gl.uniform2f(wilson_dim.uniforms["fixed_point"][2], fixed_x, fixed_y);
		
		draw_field();
		
		wilson_dim.gl.useProgram(wilson_dim.render.shader_programs[0]);
		
		
		//When we zoom out, we also cull the particles a little.
		if (zoom_delta > 0)
		{
			const chance = Math.pow(2, zoom_delta * 1.5);
			
			for (let i = 0; i < particles.length; i++)
			{
				if (particles[i][2] && (i % chance >= 1))
				{
					destroy_particle(i);
				}
			}
		}
	}
	
	
	
	let pan_velocity_x = 0;
	let pan_velocity_y = 0;
	let zoom_velocity = 0;
	
	let next_pan_velocity_x = 0;
	let next_pan_velocity_y = 0;
	let next_zoom_velocity = 0;
	
	let last_pan_velocities_x = [];
	let last_pan_velocities_y = [];
	let last_zoom_velocities = [];

	const pan_friction = .96;
	const pan_velocity_start_threshhold = .00025;
	const pan_velocity_stop_threshhold = .00025;
	
	const zoom_friction = .9;
	const zoom_velocity_start_threshhold = .002;
	const zoom_velocity_stop_threshhold = .002;
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		last_pan_velocities_x = [0, 0, 0, 0];
		last_pan_velocities_y = [0, 0, 0, 0];
		last_zoom_velocities = [0, 0, 0, 0];
	}
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		//The += here lets us only move the canvas when we have at least one pixel to move.
		next_pan_velocity_x += -x_delta;
		next_pan_velocity_y += -y_delta;
	}
	
	function on_release_canvas(x, y, event)
	{
		let max_index = 0;
		
		last_pan_velocities_x.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > pan_velocity_x)
			{
				pan_velocity_x = Math.abs(velocity);
				max_index = index;
			}
		});
		
		if (pan_velocity_x < pan_velocity_start_threshhold)
		{
			pan_velocity_x = 0;
		}
		
		else
		{
			pan_velocity_x = last_pan_velocities_x[max_index];
		}
		
		
		
		last_pan_velocities_y.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > pan_velocity_y)
			{
				pan_velocity_y = Math.abs(velocity);
				max_index = index;
			}	
		});
		
		if (pan_velocity_y < pan_velocity_start_threshhold)
		{
			pan_velocity_y = 0;
		}
		
		else
		{
			pan_velocity_y = last_pan_velocities_y[max_index];
		}
		
		
		
		last_zoom_velocities.forEach((velocity, index) =>
		{
			if (Math.abs(velocity) > zoom_velocity)
			{
				zoom_velocity = Math.abs(velocity);
				max_index = index;
			}	
		});
		
		if (zoom_velocity < zoom_velocity_start_threshhold)
		{
			zoom_velocity = 0;
		}
		
		else
		{
			zoom_velocity = last_zoom_velocities[max_index];
		}
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			next_zoom_velocity = scroll_amount / 100;
			
			zoom_level = Math.min(Math.max(zoom_level + scroll_amount / 100, -3), 3);
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		let zoom_delta;
		
		if (aspect_ratio >= 1)
		{
			zoom_delta = touch_distance_delta / wilson.world_width * 10;
		}
		
		else
		{
			zoom_delta = touch_distance_delta / wilson.world_height * 10;
		}
		
		zoom_level = Math.min(Math.max(zoom_level - zoom_delta, -3), 3);
		next_zoom_velocity = -zoom_delta;
		
		fixed_point_x = x;
		fixed_point_y = y;
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
	}
	
	
	
	function change_aspect_ratio()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson.change_canvas_size(Math.ceil(resolution * aspect_ratio), resolution);
				wilson_dim.change_canvas_size(Math.ceil(resolution * aspect_ratio), resolution);
				
				wilson.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 4 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson.change_canvas_size(resolution, Math.ceil(resolution / aspect_ratio));
				wilson_dim.change_canvas_size(resolution, Math.ceil(resolution / aspect_ratio));
				
				wilson.world_width = 4 * Math.pow(2, zoom_level);
				wilson.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson.change_canvas_size(resolution, resolution);
			wilson_dim.change_canvas_size(resolution, resolution);
			
			wilson.world_width = 4 * Math.pow(2, zoom_level);
			wilson.world_height = 4 * Math.pow(2, zoom_level);
		}
	}
	
	
	
	function handle_resize_event()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			generate_new_field();
		}
	}
	
	window.addEventListener("resize", handle_resize_event);
	Page.temporary_handlers["resize"].push(handle_resize_event);
}()