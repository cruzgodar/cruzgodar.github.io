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
			
			const vec2 m0a = vec2(1.0, 0.0);
			const vec2 m0b = vec2(0.0, 0.0);
			const vec2 m0c = vec2(0.0, -2.0);
			const vec2 m0d = vec2(1.0, 0.0);
			
			const vec2 m1a = vec2(1.0, -1.0);
			const vec2 m1b = vec2(1.0, 0.0);
			const vec2 m1c = vec2(1.0, 0.0);
			const vec2 m1d = vec2(1.0, 1.0);
			
			const vec2 m2a = vec2(1.0, 0.0);
			const vec2 m2b = vec2(0.0, 0.0);
			const vec2 m2c = vec2(0.0, 2.0);
			const vec2 m2d = vec2(1.0, 0.0);
			
			const vec2 m3a = vec2(1.0, 1.0);
			const vec2 m3b = vec2(-1.0, 0.0);
			const vec2 m3c = vec2(-1.0, -2.0);
			const vec2 m3d = vec2(1.0, -1.0);
			
			
			
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
			
			void m0(inout vec2 a, inout vec2 b, inout vec2 c, inout vec2 d)
			{
				vec2 new_a = cmul(m0a, a) + cmul(m0b, c);
				vec2 new_b = cmul(m0a, b) + cmul(m0b, d);
				vec2 new_c = cmul(m0c, a) + cmul(m0d, c);
				d = cmul(m0c, b) + cmul(m0d, d);
				
				a = new_a;
				b = new_b;
				c = new_c;
			}
			
			void m1(inout vec2 a, inout vec2 b, inout vec2 c, inout vec2 d)
			{
				vec2 new_a = cmul(m1a, a) + cmul(m1b, c);
				vec2 new_b = cmul(m1a, b) + cmul(m1b, d);
				vec2 new_c = cmul(m1c, a) + cmul(m1d, c);
				d = cmul(m1c, b) + cmul(m1d, d);
				
				a = new_a;
				b = new_b;
				c = new_c;
			}
			
			void m2(inout vec2 a, inout vec2 b, inout vec2 c, inout vec2 d)
			{
				vec2 new_a = cmul(m2a, a) + cmul(m2b, c);
				vec2 new_b = cmul(m2a, b) + cmul(m2b, d);
				vec2 new_c = cmul(m2c, a) + cmul(m2d, c);
				d = cmul(m2c, b) + cmul(m2d, d);
				
				a = new_a;
				b = new_b;
				c = new_c;
			}
			
			void m3(inout vec2 a, inout vec2 b, inout vec2 c, inout vec2 d)
			{
				vec2 new_a = cmul(m3a, a) + cmul(m3b, c);
				vec2 new_b = cmul(m3a, b) + cmul(m3b, d);
				vec2 new_c = cmul(m3c, a) + cmul(m3d, c);
				d = cmul(m3c, b) + cmul(m3d, d);
				
				a = new_a;
				b = new_b;
				c = new_c;
			}
			
			
			
			void main(void)
			{
				vec2 location = (uv + vec2(1.0, 1.0)) / 2.0;
				
				vec4 state = vec4(0.0, 0.0, 0.0, 0.0);//texture2D(u_texture, location);
				
				vec2 z = state.xy;
				int m = int(state.z);
				
				location *= resolution;
				
				int m_string[10];
				
				vec2 a = vec2(1.0, 0.0);
				vec2 b = vec2(0.0, 0.0);
				vec2 c = vec2(0.0, 0.0);
				vec2 d = vec2(1.0, 0.0);
				
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
					
					if (m == 0)
					{
						m0(a, b, c, d);
					}
					
					else if (m == 1)
					{
						m1(a, b, c, d);
					}
					
					else if (m == 2)
					{
						m2(a, b, c, d);
					}
					
					else
					{
						m3(a, b, c, d);
					}
				}
				
				z = cdiv(cmul(a, z) + b, cmul(c, z) + d);
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
		
		const options_update =
		{
			renderer: "gpu",
			
			shader: update_shader_x,
			
			canvas_width: this.update_resolution,
			canvas_height: this.update_resolution,
		};
		
		this.wilson_update = new Wilson(this.update_canvas, options_update);
		
		this.wilson_update.render.load_new_shader(update_shader_y);
		
		
		
		const draw_shader = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			
			
			void main(void)
			{
				gl_FragColor = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0);
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
		
		
		
		for (let i = 0; i < floats_x.length; i++)
		{
			const coordinates = this.wilson.utils.interpolate.world_to_canvas(floats_x[i], floats_y[i]);
			
			if (coordinates[0] >= 0 && coordinates[0] < this.resolution && coordinates[1] >= 0 && coordinates[1] < this.resolution)
			{
				const index = 4 * (this.resolution * coordinates[0] + coordinates[1]);
				
				this.draw_texture[index] = 255;
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