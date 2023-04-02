"use strict";

class GravnerGriffeathSnowflake extends Applet
{
	load_promise = null;
	
	resolution = 500;
	
	last_timestamp = -1;
	
	update_texture = null;
	
	update_canvas = null;
	wilson_update = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		this.update_canvas = document.createElement("canvas");
		this.update_canvas.classList.add("output-canvas");
		this.hidden_canvases.push(this.update_canvas);
		Page.element.appendChild(this.update_canvas);
		
		
		
		const frag_shader_source_update_base = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			const float rho = .5;
			const float beta = 1.3;
			const float alpha = .08;
			const float theta = .025;
			const float kappa = .003;
			const float mu = .07;
			const float gamma = .00005;
			const float sigma = 0.0;
			
			const float resolution = 500.0;
			const float step = 1.0 / 500.0;
			
			
			
			
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
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(u_texture, center);
				vec4 new_state;
				
				vec4 state_1 = texture2D(u_texture, center + vec2(step, 0.0));
				vec4 state_2 = texture2D(u_texture, center + vec2(-step, 0.0));
				vec4 state_3 = texture2D(u_texture, center + vec2(0.0, step));
				vec4 state_4 = texture2D(u_texture, center + vec2(0.0, -step));
				vec4 state_5;
				vec4 state_6;
				
				if (mod(center.x * resolution, 2.0) == 0.0)
				{
					state_5 = texture2D(u_texture, center + vec2(-step, -step));
					state_6 = texture2D(u_texture, center + vec2(-step, step));
				}
				
				else
				{
					state_5 = texture2D(u_texture, center + vec2(step, -step));
					state_6 = texture2D(u_texture, center + vec2(step, step));
				}
				
				
				
				//Figure out if we're on the boundary: if we're not in the flake but a neighbor is.
				if (state.x == 0.0 && (state_1.x == 1.0 || state_2.x == 1.0 || state_3.x == 1.0 || state_4.x == 1.0 || state_5.x == 1.0 || state_6.x == 1.0))
				{
					state.x = 0.5;
				}
				
				
				
				//The diffusion step: distribute the vapor mass. If it's on the boundary, only distribute mass from other cells not in the flake.
				if (state.x != 1.0)
				{
					float nearby_mass = state.w;
					
					
					
					if (state_1.x == 0.0)
					{
						nearby_mass += state_1.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					if (state_2.x == 0.0)
					{
						nearby_mass += state_2.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					if (state_3.x == 0.0)
					{
						nearby_mass += state_3.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					if (state_4.x == 0.0)
					{
						nearby_mass += state_4.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					if (state_5.x == 0.0)
					{
						nearby_mass += state_5.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					if (state_6.x == 0.0)
					{
						nearby_mass += state_6.w;
					}
					
					else
					{
						nearby_mass += state.w;
					}
					
					
					
					new_state.w = nearby_mass / 7.0;
				}
		`;
		
		const frag_shader_source_update_a = `
			${frag_shader_source_update_base}
			
				gl_FragColor = encode_float(1.0);
			}
		`;
		
		const frag_shader_source_update_b = `
			${frag_shader_source_update_base}
			
				gl_FragColor = encode_float(0.0);
			}
		`;
		
		const frag_shader_source_update_c = `
			${frag_shader_source_update_base}
			
				gl_FragColor = encode_float(0.0);
			}
		`;
		
		const frag_shader_source_update_d = `
			${frag_shader_source_update_base}
			
				gl_FragColor = encode_float(1.0);
			}
		`;
		
		const options_update =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_update_a,
			
			canvas_width: 100,
			canvas_height: 100,
		};
		
		this.wilson_update = new Wilson(this.update_canvas, options_update);
		
		this.wilson_update.render.load_new_shader(frag_shader_source_update_b);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_c);
		this.wilson_update.render.load_new_shader(frag_shader_source_update_d);
		
		
		
		this.wilson_update.render.create_framebuffer_texture_pair();
		
		this.wilson_update.gl.bindTexture(this.wilson_update.gl.TEXTURE_2D, this.wilson_update.render.framebuffers[0].texture);
		this.wilson_update.gl.bindFramebuffer(this.wilson_update.gl.FRAMEBUFFER, null);
		
		
		
		const frag_shader_source_draw = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			void main(void)
			{
				vec3 v = texture2D(u_texture, vec2(uv.x + 1.0, uv.y + 1.0) / 2.0).xyz;
				
				gl_FragColor = vec4(v, 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_draw,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			
			use_fullscreen: true,
			
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.create_framebuffer_texture_pair(this.wilson.gl.UNSIGNED_BYTE);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
	}
	
	
	
	run(resolution = 500)
	{
		this.resolution = resolution;
		this.update_texture = new Float32Array(this.resolution * this.resolution * 4);
		
		const middle_row = Math.floor(this.resolution / 2);
		const index = middle_row * this.resolution + middle_row;
		this.update_texture[4 * index] = 1;
		this.update_texture[4 * index + 2] = 1;
		
		
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		this.wilson_update.change_canvas_size(this.resolution, this.resolution);
		
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
		
		
		
		this.update_snowflake();
		
		this.draw_snowflake();
		
		
		
		if (!this.animation_paused)
		{
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
	
	
	
	update_snowflake()
	{
		this.wilson_update.gl.texImage2D(this.wilson_update.gl.TEXTURE_2D, 0, this.wilson_update.gl.RGBA, this.wilson_update.canvas_width, this.wilson_update.canvas_height, 0, this.wilson_update.gl.RGBA, this.wilson_update.gl.FLOAT, this.update_texture);
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[0]);
		this.wilson_update.render.draw_frame();
		
		const floats_a = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[1]);
		this.wilson_update.render.draw_frame();
		
		const floats_b = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[2]);
		this.wilson_update.render.draw_frame();
		
		const floats_c = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		this.wilson_update.gl.useProgram(this.wilson_update.render.shader_programs[3]);
		this.wilson_update.render.draw_frame();
		
		const floats_d = new Float32Array(this.wilson_update.render.get_pixel_data().buffer);
		
		
		
		for (let i = 0; i < this.wilson_update.canvas_height; i++)
		{
			for (let j = 0; j < this.wilson_update.canvas_width; j++)
			{
				const index = this.wilson_update.canvas_width * i + j;
				
				this.update_texture[4 * index] = floats_a[index];
				this.update_texture[4 * index + 1] = floats_b[index];
				this.update_texture[4 * index + 2] = floats_c[index];
				this.update_texture[4 * index + 3] = floats_d[index];
			}
		}
	}
	
	
	
	draw_snowflake()
	{
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, this.update_texture);
		
		this.wilson.render.draw_frame();
	}
}