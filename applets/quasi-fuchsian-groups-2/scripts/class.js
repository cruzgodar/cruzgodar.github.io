"use strict";

class QuasiFuchsianGroup extends Applet
{
	resolution = 2000;
	
	computations_per_frame = 25;
	
	max_brightness = 1;
	max_depth = 20;
	
	particles = [];
	
	last_timestamp = -1;
	
	update_resolution = 81;
	
	update_texture = null;
	
	update_canvas = null;
	wilson_update = null;
	
	draw_texture = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		this.update_canvas = document.createElement("canvas");
		this.update_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(this.update_canvas);
		Page.element.appendChild(this.update_canvas);
		
		
		
		const update_shader_base = `
			precision highp float;
			precision highp int;
			
			varying vec2 uv;
			
			uniform vec2 start_z;
			uniform int last_m;
			
			const float resolution = 81.0;
			
			uniform mat2 m0a;
			uniform mat2 m0b;
			
			uniform mat2 m1a;
			uniform mat2 m1b;
			
			uniform mat2 m2a;
			uniform mat2 m2b;
			
			uniform mat2 m3a;
			uniform mat2 m3b;
			
			
			
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
			
			
			
			vec2 cmul(vec2 z, vec2 w)
			{
				return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
			}
			
			vec2 cdiv(vec2 z, vec2 w)
			{
				float len_w = w.x * w.x + w.y * w.y;
				
				if (len_w == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / len_w;
			}
			
			void m0(inout mat2 a, inout mat2 b)
			{
				mat2 temp = m0a * a - m0b * b;
				b = m0a * b + m0b * a;
				a = temp;
			}
			
			void m1(inout mat2 a, inout mat2 b)
			{
				mat2 temp = m1a * a - m1b * b;
				b = m1a * b + m1b * a;
				a = temp;
			}
			
			void m2(inout mat2 a, inout mat2 b)
			{
				mat2 temp = m2a * a - m2b * b;
				b = m2a * b + m2b * a;
				a = temp;
			}
			
			void m3(inout mat2 a, inout mat2 b)
			{
				mat2 temp = m3a * a - m3b * b;
				b = m3a * b + m3b * a;
				a = temp;
			}
			
			
			
			void main(void)
			{
				vec2 location = (uv + vec2(1.0, 1.0)) / 2.0 * resolution;
				
				vec2 z = start_z;
				int m = last_m;
				
				int m_string[10];
				
				mat2 a = mat2(1.0, 0.0, 0.0, 1.0);
				mat2 b = mat2(0.0, 0.0, 0.0, 0.0);
				
				m_string[0] = int(mod(floor(location.x / 27.0), 3.0));
				m_string[1] = int(mod(floor(location.x / 9.0), 3.0));
				m_string[2] = int(mod(floor(location.x / 3.0), 3.0));
				m_string[3] = int(mod(floor(location.x), 3.0));
				
				m_string[4] = int(mod(floor(location.y / 27.0), 3.0));
				m_string[5] = int(mod(floor(location.y / 9.0), 3.0));
				m_string[6] = int(mod(floor(location.y / 3.0), 3.0));
				m_string[7] = int(mod(floor(location.y), 3.0));
				
				
				
				for (int i = 0; i < 8; i++)
				{
					m = int(mod(float(m) + float(m_string[i]) + 1.0, 4.0));
					
					if (m == 0)
					{
						m0(a, b);
					}
					
					else if (m == 1)
					{
						m1(a, b);
					}
					
					else if (m == 2)
					{
						m2(a, b);
					}
					
					else
					{
						m3(a, b);
					}
				}
				
				vec2 num = cmul(vec2(a[0][0], b[0][0]), z) + vec2(a[1][0], b[1][0]);
				vec2 den = cmul(vec2(a[0][1], b[0][1]), z) + vec2(a[1][1], b[1][1]);
				
				if (den.x * den.x + den.y * den.y < .01)
				{
					gl_FragColor = encode_float(-10.0);
					
					return;
				}
				
				z = cdiv(num, den);
		`;
		
		const update_shader_x = `
			${update_shader_base}
			
				gl_FragColor = encode_float(z.x);
			}
		`;
		
		const update_shader_y = `
			${update_shader_base}
			
				gl_FragColor = encode_float(z.y);
			}
		`;
		
		const update_shader_m = `
			precision highp float;
			precision highp int;
			
			varying vec2 uv;
			
			uniform int last_m;
			
			const float resolution = 81.0;
			
			void main(void)
			{
				vec2 location = (uv + vec2(1.0, 1.0)) / 2.0 * resolution;
				
				int m = last_m;
				
				int m_string[8];
				
				m_string[0] = int(mod(floor(location.x / 27.0), 3.0));
				m_string[1] = int(mod(floor(location.x / 9.0), 3.0));
				m_string[2] = int(mod(floor(location.x / 3.0), 3.0));
				m_string[3] = int(mod(floor(location.x), 3.0));
				
				m_string[4] = int(mod(floor(location.y / 27.0), 3.0));
				m_string[5] = int(mod(floor(location.y / 9.0), 3.0));
				m_string[6] = int(mod(floor(location.y / 3.0), 3.0));
				m_string[7] = int(mod(floor(location.y), 3.0));
				
				
				
				for (int i = 0; i < 8; i++)
				{
					m = int(mod(float(m) + float(m_string[i]) + 1.0, 4.0));
				}
				
				gl_FragColor = vec4(float(m) / 4.0, 0.0, 0.0, 0.0);
			}
		`;
		
		const options_update =
		{
			renderer: "gpu",
			
			shader: update_shader_x,
			
			canvas_width: this.update_resolution,
			canvas_height: this.update_resolution,
		};
		
		this.wilson_update = new Wilson(this.update_canvas, options_update);
		
		this.wilson_update.render.init_uniforms(["start_z", "last_m", "m0a", "m0b", "m1a", "m1b", "m2a", "m2b", "m3a", "m3b"], 0);
		
		
		
		this.wilson_update.render.load_new_shader(update_shader_y);
		
		this.wilson_update.render.init_uniforms(["start_z", "last_m", "m0a", "m0b", "m1a", "m1b", "m2a", "m2b", "m3a", "m3b"], 1);
		
		
		
		this.wilson_update.render.load_new_shader(update_shader_m);
		
		this.wilson_update.render.init_uniforms(["last_m"], 2);
		
		
		
		const draw_shader = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			const float max_brightness = 1.0;
			
			const float step = 1.0 / 2000.0;
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float state = texture2D(u_texture, center).x;
				
				float state_around = texture2D(u_texture, center + vec2(step, 0.0)).x +
				texture2D(u_texture, center + vec2(-step, 0.0)).x +
				texture2D(u_texture, center + vec2(0.0, step)).x +
				texture2D(u_texture, center + vec2(0.0, -step)).x +
				
				texture2D(u_texture, center + vec2(step, step)).x +
				texture2D(u_texture, center + vec2(step, -step)).x +
				texture2D(u_texture, center + vec2(-step, step)).x +
				texture2D(u_texture, center + vec2(-step, -step)).x;
				
				if (state_around <= 1.0 / 255.0)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					
					return;
				}
				
				gl_FragColor = vec4(hsv2rgb(vec3(atan(uv.y, uv.x) / 6.28318530718, 1.0, state)) * 255.0 / max_brightness, 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: draw_shader,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 4,
			world_height: 4,
			
			use_draggables: true,
			
			draggables_mousedown_callback: this.bake_coefficients.bind(this),
			draggables_touchstart_callback: this.bake_coefficients.bind(this),
			
			draggables_mousemove_callback: this.bake_coefficients.bind(this),
			draggables_touchmove_callback: this.bake_coefficients.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.create_framebuffer_texture_pair(this.wilson.gl.UNSIGNED_BYTE);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		
		
		this.wilson.draggables.add(0, 0);
		this.wilson.draggables.add(0, 0);
		
		
		
		if (!Site.scripts_loaded["complexjs"])
		{
			Site.load_script("/scripts/complex.min.js")
			
			.then(() =>
			{
				Site.scripts_loaded["complexjs"] = true;
				
				this.run();
			})
			
			.catch((error) =>
			{
				console.error("Could not load ComplexJS");
			});
		}
		
		else
		{
			this.run();
		}
	}
	
	
	
	run(resolution = 500, computations_per_frame = 30)
	{
		this.resolution = resolution;
		
		this.computations_per_frame = computations_per_frame;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		this.draw_texture = new Uint8Array(this.resolution * this.resolution * 4);
		
		this.bake_coefficients();
		
		
		
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
		
		
		
		for (let iteration = 0; iteration < this.computations_per_frame; iteration++)
		{
			if (this.particles.length === 0)
			{
				return;
			}
			
			
			
			const particle_index = this.particles.length - 1;//Math.floor(Math.random() * this.particles.length);
			
			
			this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[0]);
			
			this.wilson_update.gl.uniform2fv(this.wilson_update.uniforms["start_z"][0], this.particles[particle_index][0]);
			this.wilson_update.gl.uniform1i(this.wilson_update.uniforms["last_m"][0], this.particles[particle_index][1]);
			
			this.wilson_update.render.draw_frame();
			
			const floats_x = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
			
			
			
			this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[1]);
			
			this.wilson_update.gl.uniform2fv(this.wilson_update.uniforms["start_z"][1], this.particles[particle_index][0]);
			this.wilson_update.gl.uniform1i(this.wilson_update.uniforms["last_m"][1], this.particles[particle_index][1]);
			
			this.wilson_update.render.draw_frame();
			
			const floats_y = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
			
			
			
			this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[2]);
			
			this.wilson_update.gl.uniform1i(this.wilson_update.uniforms["last_m"][2], this.particles[particle_index][1]);
			
			this.wilson_update.render.draw_frame();
			
			const last_m = this.wilson_update.render.get_pixel_data();
			
			
			
			for (let i = 0; i < floats_x.length; i++)
			{
				const coordinates = this.wilson.utils.interpolate.world_to_canvas(floats_x[i], floats_y[i]);
				
				if (coordinates[0] >= 0 && coordinates[0] < this.resolution && coordinates[1] >= 0 && coordinates[1] < this.resolution)
				{
					const index = 4 * (this.resolution * coordinates[0] + coordinates[1]);
					
					if (this.draw_texture[index] < this.max_brightness)
					{
						if (this.particles[particle_index][2] >= 5)
						{
							this.draw_texture[index]++;
						}
						
						//Add this point to the queue for further processing.
						if (this.particles[particle_index][2] < this.max_depth)
						{
							this.particles.push([[floats_x[i], floats_y[i]], last_m[i], this.particles[particle_index][2] + 1]);
						}
					}
				}
			}
			
			this.particles.splice(particle_index, 1);
		}
		
		
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.resolution, this.resolution, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, this.draw_texture);
		
		this.wilson.render.draw_frame();
		
		if (!this.animation_paused)
		{
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	bake_coefficients()
	{
		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			const index = 4 * i;
			
			this.draw_texture[index] = 0;
			this.draw_texture[index + 1] = 0;
			this.draw_texture[index + 2] = 0;
			this.draw_texture[index + 3] = 255;
		}
		
		this.particles = [[[0, 0], 0, 0]];
		
		
		
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		let ta = new Complex(this.wilson.draggables.world_coordinates[0][0] / 4 + 2, this.wilson.draggables.world_coordinates[0][1]);
		let tb = new Complex(this.wilson.draggables.world_coordinates[1][0] / 4 + 2, this.wilson.draggables.world_coordinates[1][1]);
		
		/*
			let ta = new Complex(wilson.draggables.world_coordinates[0][0], wilson.draggables.world_coordinates[0][1]);
			let tb = new Complex(wilson.draggables.world_coordinates[1][0], wilson.draggables.world_coordinates[1][1]);
		*/
		
		let b = new Complex([0, 0]);
		b = ta.mul(tb);
		
		let c = new Complex([0, 0]);
		c = ta.mul(ta).add(tb.mul(tb));
		
		let tab = new Complex([0, 0]);
		
		if (b.mul(b).sub(c.mul(4)).arg() > 0)
		{
			tab = b.sub(b.mul(b).sub(c.mul(4)).sqrt()).div(2);
		}
		
		else
		{
			tab = b.add(b.mul(b).sub(c.mul(4)).sqrt()).div(2);
		}
		
		let z0 = new Complex([0, 0]);
		z0 = tab.sub(2).mul(tb).div(tb.mul(tab).sub(ta.mul(2)).add(tab.mul(new Complex([0, 2]))));
		
		let temp = new Complex([0, 0]);
		
		
		
		let coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]]];
		
		temp = ta.div(2);
		
		coefficients[0][0][0] = temp.re;
		coefficients[0][0][1] = temp.im;
		coefficients[0][3][0] = temp.re;
		coefficients[0][3][1] = temp.im;
		
		temp = ta.mul(tab).sub(tb.mul(2)).add(new Complex([0, 4])).div(tab.mul(2).add(4).mul(z0));
		
		coefficients[0][1][0] = temp.re;
		coefficients[0][1][1] = temp.im;
		
		temp = ta.mul(tab).sub(tb.mul(2)).sub(new Complex([0, 4])).mul(z0).div(tab.mul(2).sub(4));
		
		coefficients[0][2][0] = temp.re;
		coefficients[0][2][1] = temp.im;
		
		
		
		temp = tb.sub(new Complex([0, 2])).div(2);
		
		coefficients[1][0][0] = temp.re;
		coefficients[1][0][1] = temp.im;
		
		temp = tb.div(2);
		
		coefficients[1][1][0] = temp.re;
		coefficients[1][1][1] = temp.im;
		coefficients[1][2][0] = temp.re;
		coefficients[1][2][1] = temp.im;
		
		temp = tb.add(new Complex([0, 2])).div(2);
		
		coefficients[1][3][0] = temp.re;
		coefficients[1][3][1] = temp.im;
		
		
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			let ax = coefficients[i][0][0];
			let ay = coefficients[i][0][1];
			let bx = coefficients[i][1][0];
			let by = coefficients[i][1][1];
			let cx = coefficients[i][2][0];
			let cy = coefficients[i][2][1];
			let dx = coefficients[i][3][0];
			let dy = coefficients[i][3][1];
			
			coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
		
		
		
		for (let i = 0; i < 2; i++)
		{
			this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[i]);
			
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m0a"][i], false, [coefficients[0][0][0], coefficients[0][2][0], coefficients[0][1][0], coefficients[0][3][0]]);
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m0b"][i], false, [coefficients[0][0][1], coefficients[0][2][1], coefficients[0][1][1], coefficients[0][3][1]]);
			
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m1a"][i], false, [coefficients[1][0][0], coefficients[1][2][0], coefficients[1][1][0], coefficients[1][3][0]]);
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m1b"][i], false, [coefficients[1][0][1], coefficients[1][2][1], coefficients[1][1][1], coefficients[1][3][1]]);
			
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m2a"][i], false, [coefficients[2][0][0], coefficients[2][2][0], coefficients[2][1][0], coefficients[2][3][0]]);
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m2b"][i], false, [coefficients[2][0][1], coefficients[2][2][1], coefficients[2][1][1], coefficients[2][3][1]]);
			
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m3a"][i], false, [coefficients[3][0][0], coefficients[3][2][0], coefficients[3][1][0], coefficients[3][3][0]]);
			this.wilson_update.gl.uniformMatrix2fv(this.wilson_update.uniforms["m3b"][i], false, [coefficients[3][0][1], coefficients[3][2][1], coefficients[3][1][1], coefficients[3][3][1]]);
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
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
}