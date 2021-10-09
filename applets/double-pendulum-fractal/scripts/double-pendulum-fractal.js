!function()
{
	"use strict";
	
	
	
	let image_size = 500;
	
	let dt = .01;
	
	let web_worker = null;
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: image_size,
		canvas_height: image_size
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", request_double_pendulum_fractal);
	
	
	
	let hide_pendulum_drawer_canvas_button_element = document.querySelector("#hide-pendulum-drawer-canvas-button");
	
	hide_pendulum_drawer_canvas_button_element.addEventListener("click", hide_pendulum_drawer_canvas);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-double-pendulum-fractal.png");
	});
	
	
	
	function request_double_pendulum_fractal()
	{
		try {web_worker.terminate();}
		catch(ex) {}
		
		if (DEBUG)
		{
			web_worker = new Worker("/applets/double-pendulum-fractal/scripts/worker.js");
		}
		
		else
		{
			web_worker = new Worker("/applets/double-pendulum-fractal/scripts/worker.min.js");
		}
		
		Page.temporary_web_workers.push(web_worker);
		
		web_worker.onmessage = function(e)
		{
			wilson.render.draw_frame(e.data[0]);
		}
		
		
		
		web_worker.postMessage([image_size, dt]);
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
			hide_pendulum_drawer_canvas();
		}
	});
	
	
	
	function show_pendulum_drawer_canvas_preview()
	{
		wilson_pendulum_drawer.canvas.style.opacity = .5;
		
		pendulum_drawer_canvas_visible = 1;
	}
	
	function show_pendulum_drawer_canvas()
	{
		wilson_pendulum_drawer.canvas.style.opacity = 1;
		
		pendulum_drawer_canvas_visible = 2;
		
		window.requestAnimationFrame(draw_frame_pendulum_drawer);
	}
	
	function hide_pendulum_drawer_canvas()
	{
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