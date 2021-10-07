!function()
{
	"use strict";
	
	
	
	let image_size = 200;
	
	
	
	let options_pendulum_drawer =
	{
		renderer: "cpu",
		
		canvas_width: 2 * image_size,
		canvas_height: 2 * image_size
	};
	
	let wilson_pendulum_drawer = new Wilson(document.querySelector("#pendulum-drawer-canvas"), options_pendulum_drawer);
	
	
	
	//Shader 1: initializes the states.
	
	let frag_shader_source_hidden_1 = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform int image_size;
		
		
		
		void main(void)
		{
			vec2 int_uv = floor((uv + vec2(1.0, 1.0)) / 2.0 * float(image_size));
			
			bool parity_x = int(mod(int_uv.x, 2.0)) == 0;
			bool parity_y = int(mod(int_uv.y, 2.0)) == 0;
			
			if (parity_y)
			{
				if (parity_x)
				{
					float state = (uv.x + 1.0) / 2.0;
					
					
					
					vec4 output_color;
				
					output_color.x = floor(state * 256.0) / 256.0;
					
					
					
					state = (state - output_color.x) * 256.0;
					
					output_color.y = floor(state * 256.0) / 256.0;
					
					
					
					state = (state - output_color.y) * 256.0;
					
					output_color.z = floor(state * 256.0) / 256.0;
					
					
					
					state = (state - output_color.z) * 256.0;
					
					output_color.w = state;
					
					
				
					gl_FragColor = output_color;
					
					return;
				}
				
				
				
				float state = (uv.y + 1.0) / 2.0;
				
				
				
				vec4 output_color;
			
				output_color.x = floor(state * 256.0) / 256.0;
				
				
				
				state = (state - output_color.x) * 256.0;
				
				output_color.y = floor(state * 256.0) / 256.0;
				
				
				
				state = (state - output_color.y) * 256.0;
				
				output_color.z = floor(state * 256.0) / 256.0;
				
				
				
				state = (state - output_color.z) * 256.0;
				
				output_color.w = state;
				
				
			
				gl_FragColor = output_color;
				
				return;
			}
			
			
				
			return;
		}
	`;
	
	let options_hidden_1 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_hidden_1,
		
		canvas_width: 2 * image_size,
		canvas_height: 2 * image_size
	};
	
	let wilson_hidden_1 = new Wilson(document.querySelector("#hidden-canvas-1"), options_hidden_1);
	
	wilson_hidden_1.render.init_uniforms(["image_size"]);
	
	wilson_hidden_1.gl.uniform1i(wilson_hidden_1.uniforms["image_size"], 2 * image_size);
	
	
	
	//Shader 2: updates the states.
	
	let frag_shader_source_hidden_2 = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		uniform int image_size;
		
		//This is 1 / image_size.
		uniform float texture_step;
		
		const float dt = .01;
		
		
		
		void main(void)
		{
			vec2 int_uv = floor((uv + vec2(1.0, 1.0)) / 2.0 * float(image_size));
			vec2 texture_uv = (uv + vec2(1.0, 1.0)) / 2.0 + vec2(texture_step, texture_step) / 2.0;
			
			bool parity_x = int(mod(int_uv.x, 2.0)) == 0;
			bool parity_y = int(mod(int_uv.y, 2.0)) == 0;
			
			vec4 theta_x_data;
			vec4 theta_y_data;
			vec4 p_x_data;
			vec4 p_y_data;
			
			vec4 state;
			
			
			
			//This is a longwinded way of encoding every state as a base-256 4-digit decimal over a 2x2 group of pixels.
			
			if (parity_y)
			{
				if (parity_x)
				{
					theta_x_data = texture2D(u_texture, texture_uv);
					theta_y_data = texture2D(u_texture, texture_uv + vec2(texture_step, 0.0));
					p_x_data = texture2D(u_texture, texture_uv + vec2(0.0, texture_step));
					p_y_data = texture2D(u_texture, texture_uv + vec2(texture_step, texture_step));
					
					state = vec4(theta_x_data.x + theta_x_data.y / 256.0 + theta_x_data.z / 65536.0 + theta_x_data.w / 16777216.0, theta_y_data.x + theta_y_data.y / 256.0 + theta_y_data.z / 65536.0 + theta_y_data.w / 16777216.0, p_x_data.x + p_x_data.y / 256.0 + p_x_data.z / 65536.0 + p_x_data.w / 16777216.0, p_y_data.x + p_y_data.y / 256.0 + p_y_data.z / 65536.0 + p_y_data.w / 16777216.0);
					
					state = (state - vec4(.5, .5, .5, .5)) * 6.283;
					
					
					
					float d_state = 6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
					
					state.x += d_state * dt;
					
					state.x = mod(state.x / 6.283 + .5, 1.0);
					
					
					
					vec4 output_color;
					
					output_color.x = floor(state.x * 256.0) / 256.0;
					
					
					
					state.x = (state.x - output_color.x) * 256.0;
					
					output_color.y = floor(state.x * 256.0) / 256.0;
					
					
					
					state.x = (state.x - output_color.y) * 256.0;
					
					output_color.z = floor(state.x * 256.0) / 256.0;
					
					
					
					state.x = (state.x - output_color.z) * 256.0;
					
					output_color.w = state.x;
					
					
				
					gl_FragColor = output_color;
					
					return;
				}
				
				
				
				theta_x_data = texture2D(u_texture, texture_uv + vec2(-texture_step, 0.0));
				theta_y_data = texture2D(u_texture, texture_uv);
				p_x_data = texture2D(u_texture, texture_uv + vec2(-texture_step, texture_step));
				p_y_data = texture2D(u_texture, texture_uv + vec2(0.0, texture_step));
				
				state = vec4(theta_x_data.x + theta_x_data.y / 256.0 + theta_x_data.z / 65536.0 + theta_x_data.w / 16777216.0, theta_y_data.x + theta_y_data.y / 256.0 + theta_y_data.z / 65536.0 + theta_y_data.w / 16777216.0, p_x_data.x + p_x_data.y / 256.0 + p_x_data.z / 65536.0 + p_x_data.w / 16777216.0, p_y_data.x + p_y_data.y / 256.0 + p_y_data.z / 65536.0 + p_y_data.w / 16777216.0);
				
				state = (state - vec4(.5, .5, .5, .5)) * 6.283;
				
				
				
				float d_state = 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
				
				state.y += d_state * dt;
				
				state.y = mod(state.y / 6.283 + .5, 1.0);
				
				
				
				vec4 output_color;
				
				output_color.x = floor(state.y * 256.0) / 256.0;
				
				
				
				state.y = (state.y - output_color.x) * 256.0;
				
				output_color.y = floor(state.y * 256.0) / 256.0;
				
				
				
				state.y = (state.y - output_color.y) * 256.0;
				
				output_color.z = floor(state.y * 256.0) / 256.0;
				
				
				
				state.y = (state.y - output_color.z) * 256.0;
				
				output_color.w = state.y;
				
				
			
				gl_FragColor = output_color;
				
				return;
			}
			
			
			
			if (parity_x)
			{
				theta_x_data = texture2D(u_texture, texture_uv + vec2(0.0, -texture_step));
				theta_y_data = texture2D(u_texture, texture_uv + vec2(texture_step, -texture_step));
				p_x_data = texture2D(u_texture, texture_uv);
				p_y_data = texture2D(u_texture, texture_uv + vec2(texture_step, 0.0));
				
				state = vec4(theta_x_data.x + theta_x_data.y / 256.0 + theta_x_data.z / 65536.0 + theta_x_data.w / 16777216.0, theta_y_data.x + theta_y_data.y / 256.0 + theta_y_data.z / 65536.0 + theta_y_data.w / 16777216.0, p_x_data.x + p_x_data.y / 256.0 + p_x_data.z / 65536.0 + p_x_data.w / 16777216.0, p_y_data.x + p_y_data.y / 256.0 + p_y_data.z / 65536.0 + p_y_data.w / 16777216.0);
				
				state = (state - vec4(.5, .5, .5, .5)) * 6.283;
				
				
				
				float d_state_x = 6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
				float d_state_y = 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
				
				float d_state = -(d_state_x * d_state_y * sin(state.x - state.y) + 3.0 * sin(state.x)) / 2.0;
				
				state.z += d_state * dt;
				
				state.z = mod(state.z / 6.283 + .5, 1.0);
				
				
				
				vec4 output_color;
				
				output_color.x = floor(state.z * 256.0) / 256.0;
				
				
				
				state.z = (state.z - output_color.x) * 256.0;
				
				output_color.y = floor(state.z * 256.0) / 256.0;
				
				
				
				state.z = (state.z - output_color.y) * 256.0;
				
				output_color.z = floor(state.z * 256.0) / 256.0;
				
				
				
				state.z = (state.z - output_color.z) * 256.0;
				
				output_color.w = state.z;
				
				
			
				gl_FragColor = output_color;
				
				return;
			}
			
			
			
			theta_x_data = texture2D(u_texture, texture_uv + vec2(-texture_step, -texture_step));
			theta_y_data = texture2D(u_texture, texture_uv + vec2(0.0, -texture_step));
			p_x_data = texture2D(u_texture, texture_uv + vec2(-texture_step, 0.0));
			p_y_data = texture2D(u_texture, texture_uv);
			
			state = vec4(theta_x_data.x + theta_x_data.y / 256.0 + theta_x_data.z / 65536.0 + theta_x_data.w / 16777216.0, theta_y_data.x + theta_y_data.y / 256.0 + theta_y_data.z / 65536.0 + theta_y_data.w / 16777216.0, p_x_data.x + p_x_data.y / 256.0 + p_x_data.z / 65536.0 + p_x_data.w / 16777216.0, p_y_data.x + p_y_data.y / 256.0 + p_y_data.z / 65536.0 + p_y_data.w / 16777216.0);
			
			state = (state - vec4(.5, .5, .5, .5)) * 6.283;
			
			
			
			float d_state_x = 6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
			float d_state_y = 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
			
			float d_state = (d_state_x * d_state_y * sin(state.x - state.y) - sin(state.y)) / 2.0;
			
			state.w += d_state * dt;
			
			state.w = mod(state.w / 6.283 + .5, 1.0);
			
			
			
			vec4 output_color;
			
			output_color.x = floor(state.w * 256.0) / 256.0;
			
			
			
			state.w = (state.w - output_color.x) * 256.0;
			
			output_color.y = floor(state.w * 256.0) / 256.0;
			
			
			
			state.w = (state.w - output_color.y) * 256.0;
			
			output_color.z = floor(state.w * 256.0) / 256.0;
			
			
			
			state.w = (state.w - output_color.z) * 256.0;
			
			output_color.w = state.w;
			
			
		
			gl_FragColor = output_color;
			
			return;
		}
	`;
	
	let options_hidden_2 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_hidden_2,
		
		canvas_width: 2 * image_size,
		canvas_height: 2 * image_size
	};
	
	let wilson_hidden_2 = new Wilson(document.querySelector("#hidden-canvas-2"), options_hidden_2);
	
	wilson_hidden_2.render.init_uniforms(["image_size", "texture_step"]);
	
	wilson_hidden_2.gl.uniform1i(wilson_hidden_2.uniforms["image_size"], 2 * image_size);
	wilson_hidden_2.gl.uniform1f(wilson_hidden_2.uniforms["texture_step"], 1 / (2 * image_size));
	
	
	
	const texture_hidden = wilson_hidden_2.gl.createTexture();
	
	wilson_hidden_2.gl.bindTexture(wilson_hidden_2.gl.TEXTURE_2D, texture_hidden);
	
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_MAG_FILTER, wilson_hidden_2.gl.NEAREST);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_MIN_FILTER, wilson_hidden_2.gl.NEAREST);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_WRAP_S, wilson_hidden_2.gl.CLAMP_TO_EDGE);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_WRAP_T, wilson_hidden_2.gl.CLAMP_TO_EDGE);
	
	wilson_hidden_2.gl.disable(wilson_hidden_2.gl.DEPTH_TEST);
	
	wilson_hidden_2.gl.pixelStorei(wilson_hidden_2.gl.UNPACK_FLIP_Y_WEBGL, true);
	
	
	
	//Shader 3: reads the state texture and renders it to a canvas without modifying it.
	
	const frag_shader_source = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		uniform int image_size;
		uniform float texture_step;
		
		
		
		void main(void)
		{
			vec2 texture_uv = floor((uv + vec2(1.0, 1.0)) / 2.0 * float(image_size) / 4.0) / (float(image_size) / 4.0) + vec2(texture_step, texture_step) / 2.0;
			
			vec4 theta_x_data = texture2D(u_texture, texture_uv);
			vec4 theta_y_data = texture2D(u_texture, texture_uv + vec2(texture_step, 0.0));
			
			vec2 state = vec2(theta_x_data.x + theta_x_data.y / 256.0 + theta_x_data.z / 65536.0 + theta_x_data.w / 16777216.0, theta_y_data.x + theta_y_data.y / 256.0 + theta_y_data.z / 65536.0 + theta_y_data.w / 16777216.0);
			
			gl_FragColor = vec4(normalize(vec3(abs(state.x + state.y), abs(state.x), abs(state.y)) + .05 / length(state) * vec3(1.0, 1.0, 1.0)), 1.0);
		}
	`;
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: image_size * 2,
		canvas_height: image_size * 2
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	wilson.render.init_uniforms(["image_size", "texture_step"]);
	
	wilson.gl.uniform1i(wilson.uniforms["image_size"], 2 * image_size);
	wilson.gl.uniform1f(wilson.uniforms["texture_step"], 1 / (2 * image_size));
	
	
	
	const texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	wilson.gl.pixelStorei(wilson.gl.UNPACK_FLIP_Y_WEBGL, true);
	
	
	
	
	let theta_1 = 3;
	let theta_2 = 3;
	let p_1 = 0;
	let p_2 = 0;
	
	let max_p = 0;
	
	let dt = .01;
	let steps_per_update = 1;
	let gravity = 1;
	
	let last_timestamp = -1;
	
	
	
	wilson_hidden_1.render.draw_frame();
	
	//wilson_hidden_2.gl.texImage2D(wilson_hidden_2.gl.TEXTURE_2D, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.canvas_width, wilson_hidden_2.canvas_height, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.gl.UNSIGNED_BYTE, wilson_hidden_1.render.get_pixel_data());
	
	
	
	
	window.requestAnimationFrame(draw_frame);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set-mosaic.png");
	});
	
	
	
	function draw_frame(timestamp)
	{	
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		//wilson_hidden_2.render.draw_frame();
		
		//wilson_hidden_2.gl.texImage2D(wilson_hidden_2.gl.TEXTURE_2D, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.canvas_width, wilson_hidden_2.canvas_height, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.gl.UNSIGNED_BYTE, wilson_hidden_2.render.get_pixel_data());
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, wilson_hidden_1.render.get_pixel_data());
		
		wilson.render.draw_frame();
		
		/*
		update_angles();
		
		
		
		wilson.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson.ctx.fillRect(0, 0, image_size, image_size);
		
		
		
		wilson.ctx.lineWidth = 20;
		
		wilson.ctx.strokeStyle = "rgb(127, 0, 255)";
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(image_size / 2, image_size / 2);
		wilson.ctx.lineTo(image_size / 2 + image_size / 6 * Math.sin(theta_1), image_size / 2 + image_size / 6 * Math.cos(theta_1));
		wilson.ctx.stroke();
		
		wilson.ctx.beginPath();
		wilson.ctx.moveTo(image_size / 2 + (image_size / 6 - 10) * Math.sin(theta_1), image_size / 2 + (image_size / 6 - 10) * Math.cos(theta_1));
		wilson.ctx.lineTo(image_size / 2 + image_size / 6 * Math.sin(theta_1) + image_size / 6 * Math.sin(theta_2), image_size / 2 + image_size / 6 * Math.cos(theta_1) + image_size / 6 * Math.cos(theta_2));
		wilson.ctx.stroke();
		*/
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function update_angles()
	{
		for (let i = 0; i < steps_per_update; i++)
		{
			let d_theta_1 = 6 * (2 * p_1 - 3 * Math.cos(theta_1 - theta_2) * p_2) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
			
			let d_theta_2 = 6 * (8 * p_2 - 3 * Math.cos(theta_1 - theta_2) * p_1) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
			
			let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) + 3 * gravity * Math.sin(theta_1)) / 2;
			
			let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) - gravity * Math.sin(theta_2)) / 2;
			
			
			
			theta_1 += d_theta_1 * dt;
			theta_2 += d_theta_2 * dt;
			p_1 += d_p_1 * dt;
			p_2 += d_p_2 * dt;
		}
	}
}()