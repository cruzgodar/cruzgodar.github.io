!function()
{
	"use strict";
	
	
	
	let image_size = 1000;
	
	let image = null;
	
	let state = null;
	
	let dt = .01;
	
	let drawn_fractal = false;
	
	let paused = false;
	
	
	
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
		
		const float dt = .001;
		
		const vec2 planet_1 = vec2(0.0, 1.0);
		const vec2 planet_2 = vec2(-.866, -.5);
		const vec2 planet_3 = vec2(.866, -.5);
		
		const float world_size = 5.0;
		
		const float crash_threshhold = .02;
		
		const float G = 1.0;
		
		
		
		void main(void)
		{
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * world_size;
			
			float r_1 = length(planet_1 - state.xy);
			
			float r_2 = length(planet_2 - state.xy);
			
			float r_3 = length(planet_3 - state.xy);
			
			
			/*
			if (state.x < -world_size / 2.0 || state.x > world_size / 2.0 || state.y < -world_size / 2.0 || state.y > world_size / 2.0)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
				return;
			}
			*/
			
			if (r_1 < crash_threshhold)
			{
				gl_FragColor = vec4(planet_1, 0.0, 0.0);
				return;
			}
			
			if (r_2 < crash_threshhold)
			{
				gl_FragColor = vec4(planet_2, 0.0, 0.0);
				return;
			}
			
			if (r_3 < crash_threshhold)
			{
				gl_FragColor = vec4(planet_3, 0.0, 0.0);
				return;
			}
			
			
			
			vec4 d_state;
			
			d_state.zw = G * ((planet_1 - state.xy) / (r_1 * r_1 * r_1) + (planet_2 - state.xy) / (r_2 * r_2 * r_2) + (planet_3 - state.xy) / (r_3 * r_3 * r_3));
			
			d_state.xy = state.zw;
			
			state = ((dt * d_state + state) / world_size) + vec4(.5, .5, .5, .5);
			
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
			
			float h = atan(state.y, state.x) / (2.0 * 3.14159265258) + .5;
			
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
		
		draw_three_body_problem_fractal();
	});
	
	
	
	let switch_planet_drawer_canvas_button_element = document.querySelector("#switch-planet-drawer-canvas-button");
	
	switch_planet_drawer_canvas_button_element.style.transition = "filter .125s ease-in-out, opacity .25s ease-in-out";
	
	switch_planet_drawer_canvas_button_element.addEventListener("click", () =>
	{
		if (paused)
		{
			//What the actual fuck
			hide_planet_drawer_canvas();
			window.requestAnimationFrame(hide_planet_drawer_canvas);
			
			
			
			switch_planet_drawer_canvas_button_element.style.opacity = 0;
			
			setTimeout(() =>
			{
				switch_planet_drawer_canvas_button_element.textContent = "Move Planets";
				
				switch_planet_drawer_canvas_button_element.style.opacity = 1;
			}, 250);
		}
		
		else
		{
			paused = true;
			
			
			
			switch_planet_drawer_canvas_button_element.style.opacity = 0;
			
			setTimeout(() =>
			{
				switch_planet_drawer_canvas_button_element.textContent = "Return to Fractal";
				
				switch_planet_drawer_canvas_button_element.style.opacity = 1;
			}, 250);
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-three-body-problem.png");
	});
	
	
	
	function draw_three_body_problem_fractal()
	{
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
		
		
		
		if (!paused)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	
	
	let image_size_planet_drawer = 2000;
	
	let planet_drawer_canvas_visible = 0;
	
	
	
	let options_planet_drawer =
	{
		renderer: "cpu",
		
		world_width: Math.PI,
		world_height: Math.PI,
		
		canvas_width: image_size_planet_drawer,
		canvas_height: image_size_planet_drawer,
		
		mousemove_callback: draw_preview_planet,
		touchmove_callback: draw_preview_planet,
		
		mousedown_callback: start_planet_animation,
		touchend_callback: start_planet_animation
	};
	
	let wilson_planet_drawer = new Wilson(document.querySelector("#planet-drawer-canvas"), options_planet_drawer);
	
	let sx = 0;
	let sy = 0;
	let vx = 0;
	let vy = 0;
	
	let frame = 0;
	
	let initial_sx = 0;
	let initial_sy = 0;
	
	let last_timestamp = -1;
	
	wilson_planet_drawer.ctx.lineWidth = image_size_planet_drawer / 100;
		
	wilson_planet_drawer.ctx.strokeStyle = "rgb(127, 0, 255)";
	
	wilson_planet_drawer.ctx.fillStyle = "rgb(0, 0, 0)";
	
	
	
	function draw_preview_planet(x, y, x_delta, y_delta, e)
	{
		if (!paused)
		{
			return;
		}
		
		if (planet_drawer_canvas_visible === 0)
		{
			show_planet_drawer_canvas_preview();
		}
		
		if (planet_drawer_canvas_visible !== 2)
		{
			sx = x;
			sy = -y;
			
			vx = 0;
			vy = 0;
			
			window.requestAnimationFrame(draw_frame_planet_drawer);
		}
	}
	
	
	
	function start_planet_animation(x, y, e)
	{
		if (planet_drawer_canvas_visible === 1)
		{
			initial_sx = sx;
			initial_sy = sy;
			
			vx = 0;
			vy = 0;
			
			frame = 0;
			
			show_planet_drawer_canvas();
		}
	}
	
	
	
	wilson_planet_drawer.draggables.container.addEventListener("mouseleave", () =>
	{
		if (planet_drawer_canvas_visible === 1 || frame < 3)
		{
			wilson_planet_drawer.canvas.style.opacity = 0;
			
			planet_drawer_canvas_visible = 0;
		}
	});
	
	
	
	function show_planet_drawer_canvas_preview()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		paused = true;
		
		wilson_planet_drawer.canvas.style.opacity = .5;
		
		planet_drawer_canvas_visible = 1;
	}
	
	function show_planet_drawer_canvas()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		wilson_planet_drawer.canvas.style.opacity = 1;
		
		planet_drawer_canvas_visible = 2;
		
		window.requestAnimationFrame(draw_frame_planet_drawer);
	}
	
	function hide_planet_drawer_canvas()
	{
		if (!drawn_fractal)
		{
			return;
		}
		
		paused = false;
		
		window.requestAnimationFrame(draw_frame);
		
		wilson_planet_drawer.canvas.style.opacity = 0;
		
		planet_drawer_canvas_visible = 0;
	}
	
	
	
	function draw_frame_planet_drawer(timestamp)
	{	
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		frame++;
		
		
		
		wilson_planet_drawer.ctx.fillStyle = "rgb(0, 0, 0)";
		
		wilson_planet_drawer.ctx.fillRect(0, 0, image_size_planet_drawer, image_size_planet_drawer);
		
		
		
		let x = sx / Math.PI;
		let y = sy / Math.PI;
		
		let z = vx / Math.PI;
		let w = vy / Math.PI;
		
		let hue = Math.atan2(y, -x) / (2 * Math.PI) + 1;
		let saturation = Math.min(Math.min((x*x + y*y) * 50, (1 - Math.max(Math.abs(x), Math.abs(y))) * 5), 1);
		
		let value_add = .9 * ((1 - initial_sx / (2 * Math.PI)) * (1 - initial_sx / (2 * Math.PI)) + (1 - initial_sy / (2 * Math.PI)) * (1 - initial_sy / (2 * Math.PI))) * 4;
		
		let value = Math.min(Math.pow(z*z + w*w, .5) + value_add, 1);
		
		let rgb = HSVtoRGB(hue, saturation, value);
		
		wilson_planet_drawer.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		
		
		
		wilson_planet_drawer.ctx.beginPath();
		wilson_planet_drawer.ctx.arc(image_size_planet_drawer * (x + .5), image_size_planet_drawer * (y + .5), 30, 0, 2 * Math.PI, false);
		wilson_planet_drawer.ctx.fill();
		
		
		
		if (planet_drawer_canvas_visible === 2)
		{
			update_parameters();
			
			window.requestAnimationFrame(draw_frame_planet_drawer);
		}
	}
	
	
	
	function update_parameters()
	{
		let planet_1_x = .5;
		let planet_1_y = 0;
		
		let planet_2_x = -.5;
		let planet_2_y = 0;
		
		let r_1 = Math.sqrt((planet_1_x - sx) * (planet_1_x - sx) + (planet_1_y - sy) * (planet_1_y - sy));
		
		let r_2 = Math.sqrt((planet_2_x - sx) * (planet_2_x - sx) + (planet_2_y - sy) * (planet_2_y - sy));
		
		let d_vx = (planet_1_x - sx) / (r_1 * r_1 * r_1) + (planet_2_x - sx) / (r_2 * r_2 * r_2);
		
		let d_vy = (planet_1_y - sy) / (r_1 * r_1 * r_1) + (planet_2_y - sy) / (r_2 * r_2 * r_2);
		
		let d_sx = vx;
		
		let d_sy = vy;
		
		
		
		sx += d_sx * dt;
		sy += d_sy * dt;
		vx += d_vx * dt;
		vy += d_vy * dt;
		
		
		
		if (sx >= Math.PI / 2)
		{
			sx -= Math.PI;
		}
		
		else if (sx < -Math.PI / 2)
		{
			sx += Math.PI;
		}
		
		if (sy >= Math.PI / 2)
		{
			sy -= Math.PI;
		}
		
		else if (sy < -Math.PI / 2)
		{
			sy += Math.PI;
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