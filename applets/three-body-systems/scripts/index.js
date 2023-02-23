!function()
{
	"use strict";
	
	
	
	let image_size = 1000;
	
	let image = null;
	
	let state = null;
	
	
	
	let planet_1_x = 0;
	let planet_1_y = 1;
	
	let planet_2_x = -.866;
	let planet_2_y = -.5;
	
	let planet_3_x = .866;
	let planet_3_y = -.5;
	
	let crash_threshhold = .1;
	
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
		
		const float dt = .001;
		
		uniform vec2 planet_1;
		uniform vec2 planet_2;
		uniform vec2 planet_3;
		
		const float world_size = 15.0;
		
		const float crash_threshhold = .02;
		
		const float G = 1.0;
		
		
		
		void main(void)
		{
			vec4 state = (texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0) - vec4(.5, .5, .5, .5)) * world_size;
			
			vec4 d_state = vec4(0.0, 0.0, 0.0, 0.0);
			
			
			
			float d_x = planet_1.x - state.x;
			float d_y = planet_1.y - state.y;
			
			if (abs(d_x) > world_size / 2.0)
			{
				if (d_x < 0.0)
				{
					d_x += world_size;
				}
				
				else
				{
					d_x -= world_size;
				}
			}
			
			if (abs(d_y) > world_size / 2.0)
			{
				if (d_y < 0.0)
				{
					d_y += world_size;
				}
				
				else
				{
					d_y -= world_size;
				}
			}
			
			vec2 planet_direction = vec2(d_x, d_y);
			
			float r = length(planet_direction);
			
			if (r < crash_threshhold)
			{
				gl_FragColor = vec4(planet_1 / world_size + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			d_state.zw += planet_direction / (r*r*r);
			
			
			
			d_x = planet_2.x - state.x;
			d_y = planet_2.y - state.y;
			
			if (abs(d_x) > world_size / 2.0)
			{
				if (d_x < 0.0)
				{
					d_x += world_size;
				}
				
				else
				{
					d_x -= world_size;
				}
			}
			
			if (abs(d_y) > world_size / 2.0)
			{
				if (d_y < 0.0)
				{
					d_y += world_size;
				}
				
				else
				{
					d_y -= world_size;
				}
			}
			
			planet_direction = vec2(d_x, d_y);
			
			r = length(planet_direction);
			
			if (r < crash_threshhold)
			{
				gl_FragColor = vec4(planet_2 / world_size + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			d_state.zw += planet_direction / (r*r*r);
			
			
			
			d_x = planet_3.x - state.x;
			d_y = planet_3.y - state.y;
			
			if (abs(d_x) > world_size / 2.0)
			{
				if (d_x < 0.0)
				{
					d_x += world_size;
				}
				
				else
				{
					d_x -= world_size;
				}
			}
			
			if (abs(d_y) > world_size / 2.0)
			{
				if (d_y < 0.0)
				{
					d_y += world_size;
				}
				
				else
				{
					d_y -= world_size;
				}
			}
			
			planet_direction = vec2(d_x, d_y);
			
			r = length(planet_direction);
			
			if (r < crash_threshhold)
			{
				gl_FragColor = vec4(planet_3 / world_size + vec2(.5, .5), 0.5, 0.5);
				return;
			}
			
			d_state.zw += planet_direction / (r*r*r);
			
			
			
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
			
			float v = clamp(sqrt(state.z * state.z + state.w * state.w) + v_add, 0.0, 1.0);
			
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
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	wilson.render.load_new_shader(frag_shader_source_update);
	
	wilson.render.init_uniforms(["planet_1", "planet_2", "planet_3"]);
	
	wilson.gl.uniform2f(wilson.uniforms["planet_1"], planet_1_x, planet_1_y);
	wilson.gl.uniform2f(wilson.uniforms["planet_2"], planet_2_x, planet_2_y);
	wilson.gl.uniform2f(wilson.uniforms["planet_3"], planet_3_x, planet_3_y);
	
	
	
	wilson.render.load_new_shader(frag_shader_source_draw);
	
	wilson.render.create_framebuffer_texture_pair();
	wilson.render.create_framebuffer_texture_pair();
	
	
	
	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	
	
	let generate_button_element = Page.element.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", () =>
	{
		drawn_fractal = false;
		
		draw_three_body_problem_fractal();
	});
	
	
	
	let switch_planet_drawer_canvas_button_element = Page.element.querySelector("#switch-planet-drawer-canvas-button");
	
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
				switch_planet_drawer_canvas_button_element.textContent = "Pick Particle";
				
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
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-three-body-system.png");
	});
	
	
	
	function draw_three_body_problem_fractal()
	{
		starting_process_id = Site.applet_process_id;
		
		image_size = parseInt(resolution_input_element.value || 1000);
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.gl.useProgram(wilson.render.shader_programs[1]);
		
		
		
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
		
		wilson.gl.uniform2f(wilson.uniforms["planet_1"], planet_1_x, planet_1_y);
		wilson.gl.uniform2f(wilson.uniforms["planet_2"], planet_2_x, planet_2_y);
		wilson.gl.uniform2f(wilson.uniforms["planet_3"], planet_3_x, planet_3_y);
		
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
	
	
	
	
	
	let image_size_planet_drawer = 2000;
	
	let planet_drawer_canvas_visible = 0;
	
	
	
	let world_size = 15;
	
	
	
	let options_planet_drawer =
	{
		renderer: "cpu",
		
		world_width: world_size,
		world_height: world_size,
		
		canvas_width: image_size_planet_drawer,
		canvas_height: image_size_planet_drawer,
		
		mousemove_callback: draw_preview_planet,
		touchmove_callback: draw_preview_planet,
		
		mousedown_callback: start_planet_animation,
		touchend_callback: start_planet_animation,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag_draggable,
		draggables_touchmove_callback: on_drag_draggable
	};
	
	let wilson_planet_drawer = new Wilson(Page.element.querySelector("#planet-drawer-canvas"), options_planet_drawer);
	
	wilson_planet_drawer.draggables.add(0, 1);
	wilson_planet_drawer.draggables.add(-.866, -.5);
	wilson_planet_drawer.draggables.add(.866, -.5);
	
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
	
	
	
	Page.show();
	
	
	
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
		
		
		
		let x = sx / world_size;
		let y = sy / world_size;
		
		let z = vx / world_size;
		let w = vy / world_size;
		
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
		let d_vx = 0;
		let d_vy = 0;
		
		
		
		let d_v = get_acceleration_to_planet(planet_1_x, -planet_1_y);
		
		d_vx += d_v[0];
		d_vy += d_v[1];
		
		if (d_v[2] < crash_threshhold)
		{
			sx = planet_1_x;
			sy = -planet_1_y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		d_v = get_acceleration_to_planet(planet_2_x, -planet_2_y);
		
		d_vx += d_v[0];
		d_vy += d_v[1];
		
		if (d_v[2] < crash_threshhold)
		{
			sx = planet_2_x;
			sy = -planet_2_y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		d_v = get_acceleration_to_planet(planet_3_x, -planet_3_y);
		
		d_vx += d_v[0];
		d_vy += d_v[1];
		
		if (d_v[2] < crash_threshhold)
		{
			sx = planet_3_x;
			sy = -planet_3_y;
			vx = 0;
			vy = 0;
			
			return;
		}
		
		
		
		sx += vx * dt;
		sy += vy * dt;
		vx += d_vx * dt;
		vy += d_vy * dt;
		
		while (sx < -world_size / 2)
		{
			sx += world_size;
		}
		
		while (sx > world_size / 2)
		{
			sx -= world_size;
		}
		
		while (sy < -world_size / 2)
		{
			sy += world_size;
		}
		
		while (sy > world_size / 2)
		{
			sy -= world_size;
		}
	}
	
	
	
	function get_acceleration_to_planet(planet_x, planet_y)
	{
		let d_x = planet_x - sx;
		let d_y = planet_y - sy;
		
		let r = 0;
		
		
		
		if (Math.abs(d_x) > world_size / 2)
		{
			if (d_x < 0)
			{
				d_x += world_size;
			}
			
			else
			{
				d_x -= world_size;
			}
		}
		
		if (Math.abs(d_y) > world_size / 2)
		{
			if (d_y < 0)
			{
				d_y += world_size;
			}
			
			else
			{
				d_y -= world_size;
			}
		}
		
		
		
		r = Math.sqrt(d_x*d_x + d_y*d_y);
		
		return [d_x / (r*r*r), d_y / (r*r*r), r];
	}
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		if (active_draggable === 0)
		{
			planet_1_x = x;
			planet_1_y = y;
		}
		
		else if (active_draggable === 1)
		{
			planet_2_x = x;
			planet_2_y = y;
		}
		
		else
		{
			planet_3_x = x;
			planet_3_y = y;
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