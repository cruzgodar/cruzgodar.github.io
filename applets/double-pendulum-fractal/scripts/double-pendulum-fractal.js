!function()
{
	"use strict";
	
	
	
	let options_pendulum_drawer =
	{
		renderer: "cpu",
		
		canvas_width: 2000,
		canvas_height: 2000
	};
	
	let wilson_pendulum_drawer = new Wilson(document.querySelector("#pendulum-drawer-canvas"), options_pendulum_drawer);
	
	
	
	//Shader 1: initializes the states.
	
	let frag_shader_source_hidden_1 = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		
		
		void main(void)
		{
			gl_FragColor = vec4((uv + vec2(1.0, 1.0)) / 2.0, 0.0, 0.0);
		}
	`;
	
	let options_hidden_1 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_hidden_1,
		
		canvas_width: 1000,
		canvas_height: 1000
	};
	
	let wilson_hidden_1 = new Wilson(document.querySelector("#hidden-canvas-1"), options_hidden_1);
	
	
	
	//Shader 2: updates the states.
	
	let frag_shader_source_hidden_2 = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		const float dt = .01;
		
		const vec4 halves = vec4(.5, .5, .5, .5);
		const vec4 scale = 6.283 * vec4(1.0, 1.0, 2.0, 2.0);
		
		void main(void)
		{
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - halves) * scale;
			
			
			
			vec4 d_state;
			
			d_state.x = 6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
			
			d_state.y = 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0));
			
			d_state.z = -(d_state.x * d_state.y * sin(state.x - state.y) + 3.0 * sin(state.x)) / 2.0;
			
			d_state.w = (d_state.x * d_state.y * sin(state.x - state.y) - sin(state.y)) / 2.0;
			
			
			
			state += d_state * dt;
			
			gl_FragColor = mod((state / scale) + halves, 1.0);
		}
	`;
	
	let options_hidden_2 =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_hidden_2,
		
		canvas_width: 1000,
		canvas_height: 1000
	};
	
	let wilson_hidden_2 = new Wilson(document.querySelector("#hidden-canvas-2"), options_hidden_2);
	
	
	
	const texture_hidden = wilson_hidden_2.gl.createTexture();
	
	wilson_hidden_2.gl.bindTexture(wilson_hidden_2.gl.TEXTURE_2D, texture_hidden);
	
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_MAG_FILTER, wilson_hidden_2.gl.NEAREST);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_MIN_FILTER, wilson_hidden_2.gl.NEAREST);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_WRAP_S, wilson_hidden_2.gl.CLAMP_TO_EDGE);
	wilson_hidden_2.gl.texParameteri(wilson_hidden_2.gl.TEXTURE_2D, wilson_hidden_2.gl.TEXTURE_WRAP_T, wilson_hidden_2.gl.CLAMP_TO_EDGE);
	
	wilson_hidden_2.gl.disable(wilson_hidden_2.gl.DEPTH_TEST);
	
	
	
	//Shader 3: reads the state texture and renders it to a canvas without modifying it.
	
	const frag_shader_source = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		
		
		void main(void)
		{
			vec2 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0).xy - vec2(.5, .5)) * 2.0;
			
			gl_FragColor = vec4(normalize(vec3(abs(state.x + state.y), abs(state.x), abs(state.y)) + .05 / length(state) * vec3(1.0, 1.0, 1.0)), 1.0);
		}
	`;
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 1000,
		canvas_height: 1000
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	const texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	
	
	
	let image_size = 2000;
	
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
	
	wilson_hidden_2.gl.texImage2D(wilson_hidden_2.gl.TEXTURE_2D, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.canvas_width, wilson_hidden_2.canvas_height, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.gl.UNSIGNED_BYTE, wilson_hidden_1.render.get_pixel_data());
	
	
	
	
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
		
		
		wilson_hidden_2.render.draw_frame();
		
		wilson_hidden_2.gl.texImage2D(wilson_hidden_2.gl.TEXTURE_2D, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.canvas_width, wilson_hidden_2.canvas_height, 0, wilson_hidden_2.gl.RGBA, wilson_hidden_2.gl.UNSIGNED_BYTE, wilson_hidden_2.render.get_pixel_data());
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, wilson_hidden_2.render.get_pixel_data());
		
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