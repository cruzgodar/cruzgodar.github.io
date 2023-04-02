"use strict";

class GravnerGriffeathSnowflake extends Applet
{
	load_promise = null;
	
	resolution = 500;
	
	last_timestamp = -1;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		
		
		const frag_shader_source_init = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			const float rho = .5;
			
			const float resolution = 500.0;
			const float step = 1.0 / 500.0;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < step)
				{
					gl_FragColor = vec4(1.0, 0.0, 0.0, rho);
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
			}
		`;
		
		
		
		const frag_shader_source_diffuse = `
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
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(u_texture, center);
				vec4 new_state = state;
				
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
					//state.x = 0.5;
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
				
				gl_FragColor = new_state;
			}
		`;
		
		
		
		const frag_shader_source_freeze = `
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
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(u_texture, center);
				vec4 new_state = state;
				
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
					//The freezing step: add mass on the boundary.
					new_state.y = state.y + (1.0 - kappa) * state.w;
					new_state.z = state.z + kappa * state.w;
					new_state.w = 0.0;
				}
				
				gl_FragColor = new_state;
			}
		`;
		
		
		
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
			
			shader: frag_shader_source_init,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			
			use_fullscreen: true,
			
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.load_new_shader(frag_shader_source_diffuse);
		this.wilson.render.load_new_shader(frag_shader_source_freeze);
		this.wilson.render.load_new_shader(frag_shader_source_draw);
		
		this.wilson.render.create_framebuffer_texture_pair();
		this.wilson.render.create_framebuffer_texture_pair();
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
	}
	
	
	
	run(resolution = 500)
	{
		this.resolution = resolution;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
		
		this.wilson.render.draw_frame();
		
		
		
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
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[1]);
		
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[1].framebuffer);
		
		this.wilson.render.draw_frame();
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[2]);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
		
		this.wilson.render.draw_frame();
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[3]);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		this.wilson.render.draw_frame();
		
		
		
		if (!this.animation_paused)
		{
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
}