"use strict";

class AbelianSandpile extends Applet
{
	load_promise = null;
	
	wilson_upscale = null;
	
	num_grains = 10000;
	resolution = 500;
	
	last_timestamp = -1;
	
	computations_per_frame = 20;
	
	last_pixel_data = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const hidden_canvas = this.create_hidden_canvas();
		
		const frag_shader_source_init = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float step;
			
			uniform vec4 start_grains;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (length(center - vec2(.5, .5)) < step / 2.0)
				{
					gl_FragColor = start_grains;
					
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
			}
		`;
		
		
		
		const frag_shader_source_update = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float step;
			
			
			
			void main(void)
			{
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				vec4 state = texture2D(u_texture, center);
				float leftover = mod(floor(256.0 * state.w), 4.0) / 256.0;
				
				if (center.x <= step || center.x >= 1.0 - step || center.y <= step || center.y >= 1.0 - step)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
					return;
				}
				
				vec4 state_1 = texture2D(u_texture, center + vec2(step, 0.0));
				vec4 state_2 = texture2D(u_texture, center + vec2(-step, 0.0));
				vec4 state_3 = texture2D(u_texture, center + vec2(0.0, step));
				vec4 state_4 = texture2D(u_texture, center + vec2(0.0, -step));
				
				
				
				//The general idea: this is carrying in reverse. The largest place is supposed to be divided by four, so we start by extracting the portion that is too small for it to see and adding it to the next place down (not dividing by 256 effectively multiplies it by 256). Then what's left is divided by 4 and effectively floored.
				state_1.y += mod(floor(state_1.x * 256.0), 4.0);
				state_1.x = floor(state_1.x * 64.0) / 256.0;
				
				state_1.z += mod(floor(state_1.y * 256.0), 4.0);
				state_1.y = floor(state_1.y * 64.0) / 256.0;
				
				state_1.w += mod(floor(state_1.z * 256.0), 4.0);
				state_1.z = floor(state_1.z * 64.0) / 256.0;
				
				state_1.w = floor(state_1.w * 64.0) / 256.0;
				
				
				
				state_2.y += mod(floor(state_2.x * 256.0), 4.0);
				state_2.x = floor(state_2.x * 64.0) / 256.0;
				
				state_2.z += mod(floor(state_2.y * 256.0), 4.0);
				state_2.y = floor(state_2.y * 64.0) / 256.0;
				
				state_2.w += mod(floor(state_2.z * 256.0), 4.0);
				state_2.z = floor(state_2.z * 64.0) / 256.0;
				
				state_2.w = floor(state_2.w * 64.0) / 256.0;
				
				
				
				state_3.y += mod(floor(state_3.x * 256.0), 4.0);
				state_3.x = floor(state_3.x * 64.0) / 256.0;
				
				state_3.z += mod(floor(state_3.y * 256.0), 4.0);
				state_3.y = floor(state_3.y * 64.0) / 256.0;
				
				state_3.w += mod(floor(state_3.z * 256.0), 4.0);
				state_3.z = floor(state_3.z * 64.0) / 256.0;
				
				state_3.w = floor(state_3.w * 64.0) / 256.0;
				
				
				
				state_4.y += mod(floor(state_4.x * 256.0), 4.0);
				state_4.x = floor(state_4.x * 64.0) / 256.0;
				
				state_4.z += mod(floor(state_4.y * 256.0), 4.0);
				state_4.y = floor(state_4.y * 64.0) / 256.0;
				
				state_4.w += mod(floor(state_4.z * 256.0), 4.0);
				state_4.z = floor(state_4.z * 64.0) / 256.0;
				
				state_4.w = floor(state_4.w * 64.0) / 256.0;
				
				
				
				
				//The new state should be what used to be here, mod 4, plus the floor of 1/4 of each of the neighbors.
				vec4 new_state = vec4(0.0, 0.0, 0.0, leftover) + state_1 + state_2 + state_3 + state_4;
				
				new_state.z += floor(new_state.w) / 256.0;
				new_state.w = mod(new_state.w, 1.0);
				
				new_state.y += floor(new_state.z) / 256.0;
				new_state.z = mod(new_state.z, 1.0);
				
				new_state.x += floor(new_state.y) / 256.0;
				new_state.y = mod(new_state.y, 1.0);
				
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
				vec2 state = floor(256.0 * texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0).zw);
				
				if (state.x != 0.0)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
					return;
				}
				
				if (state.y == 1.0)
				{
					gl_FragColor = vec4(0.0, 0.25, 1.0, 1.0);
					return;
				}
				
				if (state.y == 2.0)
				{
					gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
					return;
				}
				
				if (state.y == 3.0)
				{
					gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
					return;
				}
				
				if (state.y >= 4.0)
				{
					float brightness = (state.y - 3.0) / 512.0 + .5;
					gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
					return;
				}
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_init,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution
		};
		
		this.wilson = new Wilson(hidden_canvas, options);
		
		this.wilson.render.load_new_shader(frag_shader_source_update);
		this.wilson.render.load_new_shader(frag_shader_source_draw);
		
		this.wilson.render.init_uniforms(["step", "start_grains"], 0);
		this.wilson.render.init_uniforms(["step"], 1);
		
		this.wilson.render.create_framebuffer_texture_pair();
		this.wilson.render.create_framebuffer_texture_pair();
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		
		
		const frag_shader_source_upscale = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			void main(void)
			{
				gl_FragColor = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0);
			}
		`;
		
		const options_upscale =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_upscale,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			
			
			
			use_fullscreen: true,
			
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		this.wilson_upscale = new Wilson(canvas, options_upscale);
		
		this.wilson_upscale.render.create_framebuffer_texture_pair(this.wilson_upscale.gl.UNSIGNED_BYTE);
	}
	
	
	
	run(num_grains = 10000, computations_per_frame = 25)
	{
		this.resume();
		
		this.num_grains = num_grains;
		
		this.resolution = Math.floor(Math.sqrt(this.num_grains)) + 2;
		this.resolution = this.resolution + 1 - (this.resolution % 2);
		
		this.computations_per_frame = computations_per_frame;
		
		const grains_4 = (this.num_grains % 256) / 256;
		const grains_3 = (Math.floor(this.num_grains / 256) % 256) / 256;
		const grains_2 = (Math.floor(this.num_grains / (256 * 256)) % 256) / 256;
		const grains_1 = (Math.floor(this.num_grains / (256 * 256 * 256)) % 256) / 256;
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"][0], 1 / this.resolution);
		this.wilson.gl.uniform4f(this.wilson.uniforms["start_grains"][0], grains_1, grains_2, grains_3, grains_4);
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[1]);
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"][1], 1 / this.resolution);
		
		
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, null);
		
		
		
		const output_resolution = Math.max(this.resolution, this.canvas.getBoundingClientRect().width);
		
		this.wilson_upscale.gl.bindTexture(this.wilson_upscale.gl.TEXTURE_2D, this.wilson_upscale.render.framebuffers[0].texture);
		
		this.wilson_upscale.change_canvas_size(output_resolution, output_resolution);
		
		
		
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
		
		this.wilson.gl.viewport(0, 0, this.resolution, this.resolution);
		
		for (let i = 0; i < this.computations_per_frame; i++)
		{
			this.wilson.gl.useProgram(this.wilson.render.shader_programs[1]);
			
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[1].framebuffer);
			
			this.wilson.render.draw_frame();
			
			
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[1].texture);
			this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, this.wilson.render.framebuffers[0].framebuffer);
			
			this.wilson.render.draw_frame();
			
			
			
			this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		}
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[2]);
		
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		this.wilson.render.draw_frame();
		
		
		
		const pixel_data = this.wilson.render.get_pixel_data();
		
		if (this.last_pixel_data !== null)
		{
			let found_diff = false;
			
			for (let i = 0; i < pixel_data.length; i++)
			{
				if (pixel_data[i] !== this.last_pixel_data[i])
				{
					found_diff = true;
					break;
				}
			}
			
			if (!found_diff)
			{
				return;
			}
		}
		
		this.last_pixel_data = pixel_data;
		
		
		
		this.wilson_upscale.gl.texImage2D(this.wilson_upscale.gl.TEXTURE_2D, 0, this.wilson_upscale.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson_upscale.gl.RGBA, this.wilson_upscale.gl.UNSIGNED_BYTE, pixel_data);
		
		this.wilson_upscale.gl.bindFramebuffer(this.wilson_upscale.gl.FRAMEBUFFER, null);
		
		this.wilson_upscale.render.draw_frame();
		
		
		
		if (!this.animation_paused)
		{
			window.requestAnimationFrame(this.draw_frame.bind(this));
		}
	}
}