!function()
{
	"use strict";
	
	
	
	let image_size = 500;
	
	let image = null;
	
	let state = null;
	
	let dt = .01;
	
	let drawn_fractal = false;
	
	let paused = false;
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: image_size,
		canvas_height: image_size
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	let dt_input_element = document.querySelector("#dt-input");
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", () =>
	{
		drawn_fractal = false;
		
		draw_double_pendulum_fractal();
	});
	
	
	
	let hide_pendulum_drawer_canvas_button_element = document.querySelector("#hide-pendulum-drawer-canvas-button");
	
	hide_pendulum_drawer_canvas_button_element.addEventListener("click", () =>
	{
		//What the actual fuck
		hide_pendulum_drawer_canvas();
		window.requestAnimationFrame(hide_pendulum_drawer_canvas);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("the-double-pendulum-fractal.png");
	});
	
	
	
	function draw_double_pendulum_fractal()
	{
		state = new Array(image_size * image_size * 2);
		
		image = new Uint8ClampedArray(image_size * image_size * 4);
		
		image_size = parseInt(resolution_input_element.value || 500);
		
		dt = parseFloat(dt_input_element.value || .01);
		
		
		
		for (let i = 0; i < image_size / 2; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				let index = 4 * (image_size * i + j);
				
				image[index] = 0;
				image[index + 1] = 0;
				image[index + 2] = 0;
				image[index + 3] = 255;
				
				
				
				state[index] = (j / image_size - .5) * 2 * Math.PI;
				state[index + 1] = (i / image_size - .5) * 2 * Math.PI;
				state[index + 2] = 0;
				state[index + 3] = 0;
				
				
				
				let index_2 = 4 * (image_size * (image_size - i - 1) + (image_size - j - 1));
				
				image[index_2] = 0;
				image[index_2 + 1] = 0;
				image[index_2 + 2] = 0;
				image[index_2 + 3] = 255;
			}
		}
		
		
		
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
		
		
		
		for (let i = 0; i < image_size / 2; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				let index = 4 * (image_size * i + j);
				
				let d_theta_1 = 6 * (2 * state[index + 2] - 3 * Math.cos(state[index] - state[index + 1]) * state[index + 3]) / (16 - 9 * Math.pow(Math.cos(state[index] - state[index + 1]), 2));
				
				let d_theta_2 = 6 * (8 * state[index + 3] - 3 * Math.cos(state[index] - state[index + 1]) * state[index + 2]) / (16 - 9 * Math.pow(Math.cos(state[index] - state[index + 1]), 2));
				
				let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(state[index] - state[index + 1]) + 3 * Math.sin(state[index])) / 2;
				
				let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(state[index] - state[index + 1]) - Math.sin(state[index + 1])) / 2;
				
				
				
				state[index] += d_theta_1 * dt;
				state[index + 1] += d_theta_2 * dt;
				state[index + 2] += d_p_1 * dt;
				state[index + 3] += d_p_2 * dt;
				
				
				
				let x = state[index] / Math.PI;
				let y = state[index + 1] / Math.PI;
				
				let p_1 = state[index + 2] / Math.PI;
				let p_2 = state[index + 3] / Math.PI;
				
				
				let hue = Math.atan2(y, x) / Math.PI + 1;
				let saturation = Math.min((x*x + y*y) * 100, 1);
				
				let value_add = .9 * (1 - ((i / image_size - .5) * (i / image_size - .5) + (j / image_size - .5) * (j / image_size - .5)) * 4);
				
				let value = Math.min(Math.pow(p_1*p_1 + p_2*p_2, .5) + value_add, 1);
				
				let rgb = HSVtoRGB(hue, saturation, value);
				
				image[index] = rgb[0];
				image[index + 1] = rgb[1];
				image[index + 2] = rgb[2];
				
				
				
				let index_2 = 4 * (image_size * (image_size - i - 1) + (image_size - j - 1));
				
				image[index_2] = rgb[0];
				image[index_2 + 1] = rgb[1];
				image[index_2 + 2] = rgb[2];
				image[index_2 + 3] = 255;
			}
		}
		
		
		
		wilson.render.draw_frame(image);
		
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