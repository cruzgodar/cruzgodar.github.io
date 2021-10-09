!function()
{
	"use strict";
	
	
	
	let image_size = 500;
	
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
		
		
		
		web_worker.postMessage([image_size]);
	}
	
	
	
	
	
	let image_size_pendulum_drawer = 2000;
	
	
	
	let options_pendulum_drawer =
	{
		renderer: "cpu",
		
		canvas_width: image_size_pendulum_drawer,
		canvas_height: image_size_pendulum_drawer
	};
	
	let wilson_pendulum_drawer = new Wilson(document.querySelector("#pendulum-drawer-canvas"), options_pendulum_drawer);
	
	let theta_1 = 3;
	let theta_2 = 3;
	let p_1 = 0;
	let p_2 = 0;
	
	let max_p = 0;
	
	let dt = .02;
	
	let last_timestamp = -1;
	
	
	
	//window.requestAnimationFrame(draw_frame_pendulum_drawer);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set-mosaic.png");
	});
	
	
	
	function draw_frame_pendulum_drawer(timestamp)
	{	
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		update_angles();
		
		
		
		wilson_pendulum_drawer.ctx.fillStyle = "rgb(0, 0, 0)";
		wilson_pendulum_drawer.ctx.fillRect(0, 0, image_size_pendulum_drawer, image_size_pendulum_drawer);
		
		
		
		wilson_pendulum_drawer.ctx.lineWidth = image_size_pendulum_drawer / 100;
		
		wilson_pendulum_drawer.ctx.strokeStyle = "rgb(127, 0, 255)";
		
		wilson_pendulum_drawer.ctx.beginPath();
		wilson_pendulum_drawer.ctx.moveTo(image_size_pendulum_drawer / 2, image_size_pendulum_drawer / 2);
		wilson_pendulum_drawer.ctx.lineTo(image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.sin(theta_1), image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.cos(theta_1));
		wilson_pendulum_drawer.ctx.stroke();
		
		wilson_pendulum_drawer.ctx.beginPath();
		wilson_pendulum_drawer.ctx.moveTo(image_size_pendulum_drawer / 2 + (image_size_pendulum_drawer / 6 - image_size_pendulum_drawer / 200) * Math.sin(theta_1), image_size_pendulum_drawer / 2 + (image_size_pendulum_drawer / 6 - image_size_pendulum_drawer / 200) * Math.cos(theta_1));
		wilson_pendulum_drawer.ctx.lineTo(image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.sin(theta_1) + image_size_pendulum_drawer / 6 * Math.sin(theta_2), image_size_pendulum_drawer / 2 + image_size_pendulum_drawer / 6 * Math.cos(theta_1) + image_size_pendulum_drawer / 6 * Math.cos(theta_2));
		wilson_pendulum_drawer.ctx.stroke();
		
		
		
		window.requestAnimationFrame(draw_frame_pendulum_drawer);
	}
	
	
	
	function update_angles()
	{
		let d_theta_1 = 6 * (2 * p_1 - 3 * Math.cos(theta_1 - theta_2) * p_2) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
		
		let d_theta_2 = 6 * (8 * p_2 - 3 * Math.cos(theta_1 - theta_2) * p_1) / (16 - 9 * Math.pow(Math.cos(theta_1 - theta_2), 2));
		
		let d_p_1 = -(d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) + 3 * Math.sin(theta_1)) / 2;
		
		let d_p_2 = (d_theta_1 * d_theta_2 * Math.sin(theta_1 - theta_2) - Math.sin(theta_2)) / 2;
		
		
		
		theta_1 += d_theta_1 * dt;
		theta_2 += d_theta_2 * dt;
		p_1 += d_p_1 * dt;
		p_2 += d_p_2 * dt;
	}
}()