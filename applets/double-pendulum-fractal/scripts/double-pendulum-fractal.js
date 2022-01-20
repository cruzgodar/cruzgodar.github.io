!function()
{
	"use strict";
	
	
	
	let image_size = 1000;
	
	let image = null;
	
	let state = null;
	
	let dt = .01;
	
	let drawn_fractal = false;
	
	let paused = false;
	
	let starting_process_id = null;
	
	
	
	let frag_shader_source_init = `
		precision highp float;
		
		varying vec2 uv;
		
		
		
		void main(void)
		{
			gl_FragColor = vec4((uv + vec2(1.0, 1.0)) / 2.0, 0.5, 0.5);
			
			return;
		}
	`;
	
	
	
	let frag_shader_source_update = `
		precision highp float;
		precision highp sampler2D;
		
		varying vec2 uv;
		
		uniform sampler2D u_texture;
		
		const float dt = .01;
		
		
		
		void main(void)
		{
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * (3.14159265358 * 2.0);
			
			float denom = 16.0 - 9.0 * cos(state.x - state.y) * cos(state.x - state.y);
			
			vec4 d_state = vec4(6.0 * (2.0 * state.z - 3.0 * cos(state.x - state.y) * state.w) / denom, 6.0 * (8.0 * state.w - 3.0 * cos(state.x - state.y) * state.z) / denom, 0.0, 0.0);
			
			d_state.z = -(d_state.x * d_state.y * sin(state.x - state.y) + 3.0 * sin(state.x)) / 2.0;
			
			d_state.w = (d_state.x * d_state.y * sin(state.x - state.y) - sin(state.y)) / 2.0;
			
			
			
			state = ((dt * d_state + state) / (3.14159265358 * 2.0)) + vec4(.5, .5, .5, .5);
			
			state.xy = fract(state.xy);
			
			gl_FragColor = state;
		}
	`;
	
	
	
	let frag_shader_source_draw = `
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
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5));
			
			float h = atan(state.y, state.x) / 3.14159265258 + 1.0;
			
			float s = min((state.x * state.x + state.y * state.y) * 100.0, 1.0);
			
			float v_add = .9 * (1.0 - 4.0 * ((uv.x * uv.x) / 4.0 + (uv.y * uv.y) / 4.0));
			
			float v = min(sqrt(state.z * state.z + state.w * state.w) + v_add, 1.0);
			
			vec3 rgb = hsv2rgb(vec3(h, s, v));
			
			gl_FragColor = vec4(rgb, 1.0);
		}
	`;
	
	
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source_init,
		
		canvas_width: image_size,
		canvas_height: image_size,
		
		
		
		
		use_fullscreen: true,
		
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	wilson.render.load_new_shader(frag_shader_source_update);
	wilson.render.load_new_shader(frag_shader_source_draw);
	
	wilson.render.create_framebuffer_texture_pair();
	wilson.render.create_framebuffer_texture_pair();
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", () =>
	{
		drawn_fractal = false;
		
		draw_double_pendulum_fractal();
	});
	
	
	
	let switch_pendulum_drawer_canvas_button_element = document.querySelector("#switch-pendulum-drawer-canvas-button");
	
	switch_pendulum_drawer_canvas_button_element.style.transition = "filter .125s ease-in-out, opacity .25s ease-in-out";
	
	switch_pendulum_drawer_canvas_button_element.addEventListener("click", () =>
	{
		if (paused)
		{
			//What the actual fuck
			hide_pendulum_drawer_canvas();
			window.requestAnimationFrame(hide_pendulum_drawer_canvas);
			
			
			
			switch_pendulum_drawer_canvas_button_element.style.opacity = 0;
			
			setTimeout(() =>
			{
				switch_pendulum_drawer_canvas_button_element.textContent = "Pick Pendulum";
				
				switch_pendulum_drawer_canvas_button_element.style.opacity = 1;
			}, 250);
		}
		
		else
		{
			paused = true;
			
			
			
			switch_pendulum_drawer_canvas_button_element.style.opacity = 0;
			
			setTimeout(() =>
			{
				switch_pendulum_drawer_canvas_button_element.textContent = "Return to Fractal";
				
				switch_pendulum_drawer_canvas_button_element.style.opacity = 1;
			}, 250);
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-double-pendulum-fractal.png");
	});
	
	
	
	function draw_double_pendulum_fractal()
	{
		starting_process_id = Site.applet_process_id;
		
		image_size = parseInt(resolution_input_element.value || 1000);
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.FLOAT, null);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[1].texture);
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, wilson.canvas_width, wilson.canvas_height, 0, wilson.gl.RGBA, wilson.gl.FLOAT, null);
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[0]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[0].framebuffer);
		
		wilson.render.draw_frame();
	
	
		
		window.requestAnimationFrame(draw_frame);
		
		
		
		drawn_fractal = true;
	}
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[1]);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[1].framebuffer);
		
		wilson.render.draw_frame();
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[2]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[1].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
		
		wilson.render.draw_frame();
		
		
		
		//At this point, we've gone Init --> F1 --> T1 --> Update --> F2 --> T2 --> Draw. T2 is still bound, which is correct, but we cannot be bound to F2, so we bind to F1.
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[1]);
		
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, wilson.render.framebuffers[0].framebuffer);
		
		wilson.render.draw_frame();
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[2]);
		
		wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, wilson.render.framebuffers[0].texture);
		wilson.gl.bindFramebuffer(wilson.gl.FRAMEBUFFER, null);
		
		wilson.render.draw_frame();
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		if (!paused)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	
	
	let image_size_pendulum_drawer = 2000;
	
	let pendulum_drawer_canvas_visible = 0;
	
	
	
	let options_pendulum_drawer =
	{
		renderer: "cpu",
		
		canvas_width: image_size_pendulum_drawer,
		canvas_height: image_size_pendulum_drawer,
		
		mousemove_callback: draw_preview_pendulum,
		touchmove_callback: draw_preview_pendulum,
		
		mousedown_callback: start_pendulum_animation,
		touchend_callback: start_pendulum_animation
	};
	
	let wilson_pendulum_drawer = new Wilson(document.querySelector("#pendulum-drawer-canvas"), options_pendulum_drawer);
	
	let theta_1 = 0;
	let theta_2 = 0;
	let p_1 = 0;
	let p_2 = 0;
	
	let frame = 0;
	
	let initial_theta_1 = 0;
	let initial_theta_2 = 0;
	
	let last_timestamp = -1;
	
	wilson_pendulum_drawer.ctx.lineWidth = image_size_pendulum_drawer / 100;
		
	wilson_pendulum_drawer.ctx.strokeStyle = "rgb(127, 0, 255)";
	
	wilson_pendulum_drawer.ctx.fillStyle = "rgb(0, 0, 0)";
	
	
	
	function draw_preview_pendulum(x, y, x_delta, y_delta, e)
	{
		if (!paused)
		{
			return;
		}
		
		if (pendulum_drawer_canvas_visible === 0)
		{
			show_pendulum_drawer_canvas_preview();
		}
		
		if (pendulum_drawer_canvas_visible !== 2)
		{
			theta_1 = x * Math.PI;
			theta_2 = y * Math.PI;
			
			p_1 = 0;
			p_2 = 0;
			
			window.requestAnimationFrame(draw_frame_pendulum_drawer);
		}
	}
	
	
	
	function start_pendulum_animation(x, y, e)
	{
		if (pendulum_drawer_canvas_visible === 1)
		{
			initial_theta_1 = theta_1;
			initial_theta_2 = theta_2;
			
			p_1 = 0;
			p_2 = 0;
			
			frame = 0;
			
			show_pendulum_drawer_canvas();
		}
	}
	
	
	
	wilson_pendulum_drawer.draggables.container.addEventListener("mouseleave", () =>
	{
		if (pendulum_drawer_canvas_visible === 1 || frame < 3)
		{
			wilson_pendulum_drawer.canvas.style.opacity = 0;
			
			pendulum_drawer_canvas_visible = 0;
		}
	});
	
	
	
	function show_pendulum_drawer_canvas_preview()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		paused = true;
		
		wilson_pendulum_drawer.canvas.style.opacity = .5;
		
		pendulum_drawer_canvas_visible = 1;
	}
	
	function show_pendulum_drawer_canvas()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		wilson_pendulum_drawer.canvas.style.opacity = 1;
		
		pendulum_drawer_canvas_visible = 2;
		
		window.requestAnimationFrame(draw_frame_pendulum_drawer);
	}
	
	function hide_pendulum_drawer_canvas()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		paused = false;
		
		window.requestAnimationFrame(draw_frame);
		
		wilson_pendulum_drawer.canvas.style.opacity = 0;
		
		pendulum_drawer_canvas_visible = 0;
	}
	
	
	
	function draw_frame_pendulum_drawer(timestamp)
	{	
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		frame++;
		
		
		
		wilson_pendulum_drawer.ctx.fillRect(0, 0, image_size_pendulum_drawer, image_size_pendulum_drawer);
		
		
		
		let x = theta_1 / Math.PI;
		let y = theta_2 / Math.PI;
		
		let z = p_1 / Math.PI;
		let w = p_2 / Math.PI;
		
		let hue = Math.atan2(y, x) / Math.PI + 1;
		let saturation = Math.min(Math.min((x*x + y*y) * 50, (1 - Math.max(Math.abs(x), Math.abs(y))) * 5), 1);
		
		let value_add = .9 * ((1 - initial_theta_1 / (2 * Math.PI)) * (1 - initial_theta_1 / (2 * Math.PI)) + (1 - initial_theta_2 / (2 * Math.PI)) * (1 - initial_theta_2 / (2 * Math.PI))) * 4;
		
		let value = Math.min(Math.pow(z*z + w*w, .5) + value_add, 1);
		
		let rgb = HSVtoRGB(hue, saturation, value);
		
		wilson_pendulum_drawer.ctx.strokeStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		wilson_pendulum_drawer.ctx.beginPath();
		wilson_pendulum_drawer.ctx.moveTo(image_size_pendulum_drawer / 2, image_size_pendulum_drawer / 2);
		wilson_pendulum_drawer.ctx.lineTo(image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.sin(theta_1), image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.cos(theta_1));
		wilson_pendulum_drawer.ctx.stroke();
		
		wilson_pendulum_drawer.ctx.beginPath();
		wilson_pendulum_drawer.ctx.moveTo(image_size_pendulum_drawer / 2 + (image_size_pendulum_drawer / 6 - image_size_pendulum_drawer / 200) * Math.sin(theta_1), image_size_pendulum_drawer / 2 + (image_size_pendulum_drawer / 6 - image_size_pendulum_drawer / 200) * Math.cos(theta_1));
		wilson_pendulum_drawer.ctx.lineTo(image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.sin(theta_1) + image_size_pendulum_drawer / 6 * Math.sin(theta_2), image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.cos(theta_1) + image_size_pendulum_drawer / 6 * Math.cos(theta_2));
		wilson_pendulum_drawer.ctx.stroke();
		
		
		
		if (pendulum_drawer_canvas_visible === 2)
		{
			update_angles();
			
			window.requestAnimationFrame(draw_frame_pendulum_drawer);
		}
	}
	
	
	
	function update_angles()
	{
		let d_theta_1 = 6 * (2 * p_1 - 3 * Math.cos(theta_1 - theta_2) * p_2) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
		
		let d_theta_2 = 6 * (8 * p_2 - 3 * Math.cos(theta_1 - theta_2) * p_1) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
		
		let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) + 3 * Math.sin(theta_1)) / 2;
		
		let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) - Math.sin(theta_2)) / 2;
		
		
		
		theta_1 += d_theta_1 * dt * 2.5;
		theta_2 += d_theta_2 * dt * 2.5;
		p_1 += d_p_1 * dt * 2.5;
		p_2 += d_p_2 * dt * 2.5;
		
		
		
		if (theta_1 >= Math.PI)
		{
			theta_1 -= 2*Math.PI;
		}
		
		else if (theta_1 < -Math.PI)
		{
			theta_1 += 2*Math.PI;
		}
		
		if (theta_2 >= Math.PI)
		{
			theta_2 -= 2*Math.PI;
		}
		
		else if (theta_2 < -Math.PI)
		{
			theta_2 += 2*Math.PI;
		}
	}
	
	
	
	function HSVtoRGB(h, s, v)
	{
		let r, g, b, i, f, p, q, t;
		
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		
		switch (i % 6)
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
	    
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
}()