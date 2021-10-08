!function()
{
	"use strict";
	
	
	
	let image_size_pendulum_drawer = 2000;
	
	
	
	let options_pendulum_drawer =
	{
		renderer: "cpu",
		
		canvas_width: image_size_pendulum_drawer,
		canvas_height: image_size_pendulum_drawer
	};
	
	let wilson_pendulum_drawer = new Wilson(document.querySelector("#pendulum-drawer-canvas"), options_pendulum_drawer);
	
	//gl_FragColor = vec4(normalize(vec3(abs(state.x + state.y), abs(state.x), abs(state.y)) + .05 / length(state) * vec3(1.0, 1.0, 1.0)), 1.0);
	
	let theta_1 = 3;
	let theta_2 = 3;
	let p_1 = 0;
	let p_2 = 0;
	
	let max_p = 0;
	
	let dt = .02;
	let steps_per_update = 1;
	let gravity = 1;
	
	let last_timestamp = -1;
	
	
	
	window.requestAnimationFrame(draw_frame_pendulum_drawer);
	
	
	
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
		for (let i = 0; i < steps_per_update; i++)
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
	}
}()