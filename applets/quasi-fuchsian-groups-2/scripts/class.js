"use strict";

class QuasiFuchsianGroup extends Applet
{
	resolution = 500;
	
	coefficients = [[[1,0],[0,0],[0,-2],[1,0]],[[1,-1],[1,0],[1,0],[1,1]],[[1,0],[0,0],[0,2],[1,0]],[[1,1],[-1,0],[-1,0],[1,-1]]];
	
	last_timestamp = -1;
	
	update_resolution = 243;
	
	update_texture = null;
	
	update_canvas = null;
	wilson_update = null;
	
	draw_texture = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		this.update_canvas = document.createElement("canvas");
		this.update_canvas.classList.add("output-canvas");
		this.hidden_canvases.push(this.update_canvas);
		Page.element.appendChild(this.update_canvas);
		
		
		
		const update_shader_base = `
			precision highp float;
			precision highp int;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			const float resolution = 243.0;
			
			const mat2 m0a = mat2(1.0, 0.0, 0.0, 1.0);
			const mat2 m0b = mat2(0.0, -2.0, 0.0, 0.0);
			
			const mat2 m1a = mat2(1.0, 1.0, 1.0, 1.0);
			const mat2 m1b = mat2(-1.0, 0.0, 0.0, 1.0);
			
			const mat2 m2a = mat2(1.0, 0.0, 0.0, 1.0);
			const mat2 m2b = mat2(0.0, 2.0, 0.0, 0.0);
			
			const mat2 m3a = mat2(1.0, -1.0, -1.0, 1.0);
			const mat2 m3b = mat2(1.0, 0.0, 0.0, -1.0);
			
			
			
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
				vec2 location = (uv + vec2(1.0, 1.0)) / 2.0;
				
				vec4 state = texture2D(u_texture, location);
				
				vec2 z = state.xy;
				int m = int(state.z);
				
				location *= resolution;
				
				int m_string[10];
				
				mat2 a = mat2(1.0, 0.0, 0.0, 1.0);
				mat2 b = mat2(0.0, 0.0, 0.0, 0.0);
				
				m_string[0] = int(mod(floor(location.x / 81.0), 3.0));
				m_string[1] = int(mod(floor(location.x / 27.0), 3.0));
				m_string[2] = int(mod(floor(location.x / 9.0), 3.0));
				m_string[3] = int(mod(floor(location.x / 3.0), 3.0));
				m_string[4] = int(mod(floor(location.x), 3.0));
				
				m_string[5] = int(mod(floor(location.y / 81.0), 3.0));
				m_string[6] = int(mod(floor(location.y / 27.0), 3.0));
				m_string[7] = int(mod(floor(location.y / 9.0), 3.0));
				m_string[8] = int(mod(floor(location.y / 3.0), 3.0));
				m_string[9] = int(mod(floor(location.y), 3.0));
				
				
				
				for (int i = 0; i < 10; i++)
				{
					m = int(mod(float(m) + float(m_string[i]) + 1.0, 4.0));
					
					
		`;
		
		const update_shader_x = `
			${update_shader_base}
			
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
				
				z = cdiv(cmul(vec2(a[0][0], b[0][0]), z) + vec2(a[1][0], b[1][0]), cmul(vec2(a[0][1], b[0][1]), z) + vec2(a[1][1], b[1][1]));
				
				gl_FragColor = encode_float(z.x);
			}
		`;
		
		const update_shader_y = `
			${update_shader_base}
			
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
				
				z = cdiv(cmul(vec2(a[0][0], b[0][0]), z) + vec2(a[1][0], b[1][0]), cmul(vec2(a[0][1], b[0][1]), z) + vec2(a[1][1], b[1][1]));
				
				gl_FragColor = encode_float(z.y);
			}
		`;
		
		const update_shader_m = `
			${update_shader_base}
				}
				
				gl_FragColor = vec4(float(m) / 4.0, 0.0, 0.0, 1.0);
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
		
		this.wilson_update.render.load_new_shader(update_shader_y);
		
		this.wilson_update.render.load_new_shader(update_shader_m);
		
		
		
		const draw_shader = `
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
				float state = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0).x;
				
				gl_FragColor = vec4(hsv2rgb(vec3(atan(uv.y, uv.x) / 6.28318530718, 1.0, state)), 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: draw_shader,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 4,
			world_height: 4
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.create_framebuffer_texture_pair(this.wilson.gl.UNSIGNED_BYTE);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		
		
		this.run();
	}
	
	
	
	run(resolution = 500)
	{
		this.resolution = resolution;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		this.draw_texture = new Uint8Array(this.resolution * this.resolution * 4);
		
		for (let i = 0; i < this.resolution * this.resolution; i++)
		{
			const index = 4 * i;
			
			this.draw_texture[index] = 0;
			this.draw_texture[index + 1] = 0;
			this.draw_texture[index + 2] = 0;
			this.draw_texture[index + 3] = 255;
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
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[0]);
		
		this.wilson_update.render.draw_frame();
		
		const floats_x = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[1]);
		
		this.wilson_update.render.draw_frame();
		
		const floats_y = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[2]);
		
		this.wilson_update.render.draw_frame();
		
		const last_m = this.wilson_update.render.get_pixel_data();
		
		
		
		for (let i = 0; i < floats_x.length; i++)
		{
			const coordinates = this.wilson.utils.interpolate.world_to_canvas(floats_x[i], floats_y[i]);
			
			if (coordinates[0] >= 0 && coordinates[0] < this.resolution && coordinates[1] >= 0 && coordinates[1] < this.resolution)
			{
				const index = 4 * (this.resolution * coordinates[0] + coordinates[1]);
				
				this.draw_texture[index]++;
			}
		}
		
		
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, this.draw_texture);
		
		this.wilson.render.draw_frame();
		
		
		
		if (!this.animation_paused)
		{
			//window.requestAnimationFrame(this.draw_frame.bind(this));
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