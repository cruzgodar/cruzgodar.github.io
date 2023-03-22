"use strict";

class EllipticCurve extends Applet
{
	resolution = 500;
	
	g2 = -2;
	g3 = 0;
	
	last_timestamp = -1;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		const frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float step;
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			const int max_iterations = 200;
			
			
			
			float f(vec2 z)
			{
				return z.y * z.y   -   z.x * z.x * z.x   -   g2_arg * z.x   -   g3_arg;
			}
			
			
			
			void main(void)
			{
				float threshhold = 4.0 * 1000.0;
				
				vec2 z = uv * 4.0;
				
				
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int i = 0; i < max_iterations; i++)
				{
					float score = abs(f(z)) / threshhold;
					
					if (score < 1.0)
					{
						float adjacent_score = (abs(f(z + vec2(step, 0.0))) + abs(f(z - vec2(step, 0.0))) + abs(f(z + vec2(0.0, step))) + abs(f(z - vec2(0.0, step)))) / threshhold;
						
						if (adjacent_score >= 6.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							return;
						}
					}
					
					threshhold /= 1.25;
				}
			}
		`;
		
		
		
		const frag_shader_source_2 = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float texture_step;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float state = (4.0 * texture2D(u_texture, center).y +
				
					texture2D(u_texture, center + vec2(texture_step, 0.0)).y +
					texture2D(u_texture, center - vec2(texture_step, 0.0)).y +
					texture2D(u_texture, center + vec2(0.0, texture_step)).y +
					texture2D(u_texture, center - vec2(0.0, texture_step)).y +
					
					texture2D(u_texture, center + vec2(texture_step, texture_step)).y +
					texture2D(u_texture, center + vec2(texture_step, -texture_step)).y +
					texture2D(u_texture, center + vec2(-texture_step, texture_step)).y +
					texture2D(u_texture, center + vec2(-texture_step, -texture_step)).y
				) / 2.0;
				
				gl_FragColor = vec4(state, state, state, 1.0);
			}
		`;
		
		const options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			world_width: 8,
			world_height: 8,
			world_center_x: 0,
			world_center_y: 0
		};
		
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.init_uniforms(["step", "g2_arg", "g3_arg"]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"], this.wilson.world_width / this.resolution);
		
		this.wilson.render.load_new_shader(frag_shader_source_2);
		
		this.wilson.render.init_uniforms(["texture_step"]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["texture_step"], 1 / this.resolution);
		
		this.wilson.render.create_framebuffer_texture_pair();
		
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	run(g2, g3)
	{
		this.g2 = g2;
		this.g3 = g3;
		
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
		
		
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["g2_arg"], this.g2);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["g3_arg"], this.g3);
		
		this.wilson.render.draw_frame();
		
		
		
		let pixels = this.wilson.render.get_pixel_data();
		
		let endpoints = [];
		
		const width = this.resolution;
		
		let max_interpolation_distance = this.wilson.canvas_width;
		
		//If the distance is at least this small, the number of neighbors is ignored.
		const min_guaranteed_interpolation_distance = 3;
		
		//This means a 5x5 square will be searched around each endpoint...
		const isolation_search_radius = 2;
		
		//...and it will be considered isolated if there are at most 2 pixels in the square.
		const isolation_threshhold = 1;
		
		for (let i = isolation_search_radius; i < this.wilson.canvas_height - isolation_search_radius; i++)
		{
			for (let j = isolation_search_radius; j < width - isolation_search_radius; j++)
			{
				let index = width * i + j;
				
				if (pixels[4 * index] !== 0)
				{
					//This is the sum of a radius 3 square centered at this pixel. It's an endpoint if there are 
					const close_total = pixels[4 * (index - 1)] + pixels[4 * (index + 1)] + pixels[4 * (index - width)] + pixels[4 * (index + width)] + pixels[4 * (index - 1 - width)] + pixels[4 * (index + 1 - width)] + pixels[4 * (index - 1 + width)] + pixels[4 * (index + 1 + width)];
					
					if (close_total <= 255)
					{
						const far_total = pixels[4 * (index - 2 * width - 2)] + pixels[4 * (index - 2 * width - 1)] + pixels[4 * (index - 2 * width)] + pixels[4 * (index - 2 * width + 1)] + pixels[4 * (index - 2 * width + 2)]   +   pixels[4 * (index + 2 * width - 2)] + pixels[4 * (index + 2 * width - 1)] + pixels[4 * (index + 2 * width)] + pixels[4 * (index + 2 * width + 1)] + pixels[4 * (index + 2 * width + 2)]   +   pixels[4 * (index - width - 2)] + pixels[4 * (index - 2)] + pixels[4 * (index + width - 2)]   +   pixels[4 * (index - width + 2)] + pixels[4 * (index + 2)] + pixels[4 * (index + width + 2)];
						
						//This is an endpoint. Now we'll check to see if it's isolated, which means it's connected to only at most two other pixels.
						if (far_total === 0)
						{
							endpoints.push([i, j, true]);
						}
						
						else
						{
							endpoints.push([i, j, false]);
						}
					}
				}
			}
		}
		
		
		
		//Connect every endpoint to the nearest other endpoint within a given radius.
		for (let i = 0; i < endpoints.length; i++)
		{
			if (endpoints[i][0] < this.wilson.canvas_width / 20 || endpoints[i][1] < this.wilson.canvas_height / 20 || endpoints[i][0] > 19 * this.wilson.canvas_width / 20 || endpoints[i][1] > 19 * this.wilson.canvas_height / 20)
			{
				continue;
			}
			
			
			
			let num_nearby_points = 0;
			let average_nearby_distance = 0;
			
			let min_open_j = -1;
			let min_open_distance = max_interpolation_distance;
			
			if (!(endpoints[i][2]))
			{
				min_open_distance = max_interpolation_distance / 20;
			}
			
			
			
			for (let j = 0; j < endpoints.length; j++)
			{
				if (j === i)
				{
					continue;
				}
				
					
				
				const distance = Math.sqrt((endpoints[i][0] - endpoints[j][0])*(endpoints[i][0] - endpoints[j][0]) + (endpoints[i][1] - endpoints[j][1])*(endpoints[i][1] - endpoints[j][1]));
				
				if (distance < min_open_distance && distance >= 2)
				{
					//Only connect here if there are no white points in that general direction. General direction here means a 3x3 square centered at the shifted coordinate that doesn't intersect the endpoint itself.
					let row_movement = (endpoints[j][0] - endpoints[i][0]) / distance * 1.414214;
					let col_movement = (endpoints[j][1] - endpoints[i][1]) / distance * 1.414214;
					
					row_movement = Math.sign(row_movement) * Math.floor(Math.abs(row_movement));
					col_movement = Math.sign(col_movement) * Math.floor(Math.abs(col_movement));
					
					
					
					let test = 0;
					
					if (row_movement === 0)
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement + 1) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement - 1) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
					}
					
					else if (col_movement === 0)
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement + 1);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement - 1);
						test += pixels[4 * index];
					}
					
					else
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0]) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1]);
						test += pixels[4 * index];
					}
					
					
					
					if (test === 0)
					{
						min_open_j = j;
						min_open_distance = distance;
					}
				}
			}
			
			if (min_open_j !== -1)
			{
				//Interpolate between the two points.
				for (let k = 1; k < 2 * min_open_distance; k++)
				{
					const t = k / (2 * min_open_distance);
					
					const row = Math.round((1 - t) * endpoints[i][0] + t * endpoints[min_open_j][0]);
					const col = Math.round((1 - t) * endpoints[i][1] + t * endpoints[min_open_j][1]);
					
					const index = width * row + col;
					
					pixels[4 * index] = 0;
					pixels[4 * index + 1] = 255;
					pixels[4 * index + 2] = 0;
				}
			}
		}
		
		
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.UNSIGNED_BYTE, pixels);
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[1]);
		
		this.wilson.render.draw_frame(pixels);
	}
	
	
	
	change_resolution(resolution)
	{
		this.resolution = resolution;
		
		this.wilson.change_canvas_size(this.resolution, this.resolution);
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[0]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["step"], this.wilson.world_width / this.resolution);
		
		this.wilson.gl.useProgram(this.wilson.render.shader_programs[1]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["texture_step"], 1 / this.resolution);
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
}