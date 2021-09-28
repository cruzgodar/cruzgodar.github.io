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
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		
		
		void main(void)
		{
			gl_FragColor = vec4((uv + vec2(1.0, 1.0)) / 2.0, 0.0, 0.0);
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
	
	
	
	const framebuffer = 	wilson.gl.createFramebuffer();
	
	const texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, null);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, framebuffer);
	wilson.gl.framebufferTexture2D(wilson.gl.FRAMEBUFFER, wilson.gl.COLOR_ATTACHMENT0, wilson.gl.TEXTURE_2D, texture, 0);
	
	
	
	//Shader 2: updates the states and writes the new ones to a texture.
	
	const vertex_shader_source_2 = `
		attribute vec3 position;
		varying vec2 uv;

		void main(void)
		{
			gl_Position = vec4(position, 1.0);

			//Interpolate quad coordinates in the fragment shader.
			uv = position.xy;
		}
	`;
	
	const frag_shader_source_2 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		const float dt = .01;
		
		/*
			let d_theta_1 = 6 * (2 * p_1 - 3 * Math.cos(theta_1 - theta_2) * p_2) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
			
			let d_theta_2 = 6 * (8 * p_2 - 3 * Math.cos(theta_1 - theta_2) * p_1) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
			
			let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) + 3 * gravity * Math.sin(theta_1)) / 2;
			
			let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) - gravity * Math.sin(theta_2)) / 2;
		*/
		
		void main(void)
		{
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - .5 * vec4(1.0, 1.0, 1.0, 1.0)) * 3.14;
			
			//vec4 d_state = vec4(6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / (16.0 - 9.0 * pow(cos(state.x - state.y), 2.0)), 0.0, 0.0, 0.0);
			
			
			gl_FragColor = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0);
		}
	`;
	
	
	
	let vertex_shader_2 = load_shader(wilson.gl, wilson.gl.VERTEX_SHADER, vertex_shader_source_2);
	
	let frag_shader_2 = load_shader(wilson.gl, wilson.gl.FRAGMENT_SHADER, frag_shader_source_2);
	
	let shader_program_2 = wilson.gl.createProgram();
	
	wilson.gl.attachShader(shader_program_2, vertex_shader_2);
	wilson.gl.attachShader(shader_program_2, frag_shader_2);
	
	wilson.gl.linkProgram(shader_program_2);
	wilson.gl.useProgram(shader_program_2);
	
	let position_buffer_2 = wilson.gl.createBuffer();
	
	wilson.gl.bindBuffer(wilson.gl.ARRAY_BUFFER, position_buffer_2);
	
	const quad = [-1, -1, 0,   -1, 1, 0,   1, -1, 0,   1, 1, 0];
	wilson.gl.bufferData(wilson.gl.ARRAY_BUFFER, new Float32Array(quad), wilson.gl.STATIC_DRAW);
	
	shader_program_2.position_attribute = wilson.gl.getAttribLocation(shader_program_2, "position");
	
	wilson.gl.enableVertexAttribArray(shader_program_2.position_attribute);
	
	wilson.gl.vertexAttribPointer(shader_program_2.position_attribute, 3, wilson.gl.FLOAT, false, 0, 0);
	
	wilson.gl.viewport(0, 0, wilson.canvas_width, wilson.canvas_height);
	
	
	
	//Shader 3: reads the state texture and renders it to a canvas without modifying it.
	
	const vertex_shader_source_3 = `
		attribute vec3 position;
		varying vec2 uv;

		void main(void)
		{
			gl_Position = vec4(position, 1.0);

			//Interpolate quad coordinates in the fragment shader.
			uv = position.xy;
		}
	`;
	
	const frag_shader_source_3 = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		
		
		void main(void)
		{
			vec2 state = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0).xy - vec2(.5, .5);
			
			gl_FragColor = vec4(normalize(vec3(abs(state.x + state.y), abs(state.x), abs(state.y)) + .05 / length(state) * vec3(1.0, 1.0, 1.0)), 1.0);
		}
	`;
	
	
	
	let vertex_shader_3 = load_shader(wilson.gl, wilson.gl.VERTEX_SHADER, vertex_shader_source_3);
	
	let frag_shader_3 = load_shader(wilson.gl, wilson.gl.FRAGMENT_SHADER, frag_shader_source_3);
	
	let shader_program_3 = wilson.gl.createProgram();
	
	wilson.gl.attachShader(shader_program_3, vertex_shader_3);
	wilson.gl.attachShader(shader_program_3, frag_shader_3);
	
	wilson.gl.linkProgram(shader_program_3);
	wilson.gl.useProgram(shader_program_3);
	
	let position_buffer_3 = wilson.gl.createBuffer();
	
	wilson.gl.bindBuffer(wilson.gl.ARRAY_BUFFER, position_buffer_3);
	
	wilson.gl.bufferData(wilson.gl.ARRAY_BUFFER, new Float32Array(quad), wilson.gl.STATIC_DRAW);
	
	shader_program_3.position_attribute = wilson.gl.getAttribLocation(shader_program_3, "position");
	
	wilson.gl.enableVertexAttribArray(shader_program_3.position_attribute);
	
	wilson.gl.vertexAttribPointer(shader_program_3.position_attribute, 3, wilson.gl.FLOAT, false, 0, 0);
	
	wilson.gl.viewport(0, 0, wilson.canvas_width, wilson.canvas_height);
	
	
	
	function load_shader(gl, type, source)
	{
		let shader = gl.createShader(type);
		
		gl.shaderSource(shader, source);
		
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			console.error(`Couldn't load shader: ${gl.getProgramInfoLog(shaderProgram)}`);
			gl.deleteShader(shader);
		}
		
		return shader;
	}
	
	
	
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
	
	
	
	wilson.gl.useProgram(wilson.render.shader_program);
	
	wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, framebuffer);
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.render.draw_frame();
	
	
	
	
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
		
		
		
		wilson.gl.useProgram(shader_program_2);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, framebuffer);
		
		wilson.render.draw_frame();
		
		
		
		wilson.gl.useProgram(shader_program_3);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
		
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
			
			if (Math.abs(p_1) > max_p)
			{
				max_p = Math.abs(p_1);
				
				console.log(max_p);
			}
			
			if (Math.abs(p_2) > max_p)
			{
				max_p = Math.abs(p_2);
				
				console.log(max_p);
			}
		}
	}
}()