!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "cpu",
		
		canvas_width: 2000,
		canvas_height: 2000
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
	let image_size = 2000;
	
	let theta_1 = 3;
	let theta_2 = 0;
	let p_1 = 0;
	let p_2 = 0;
	
	let dt = .01;
	let steps_per_update = 3;
	let gravity = 1;
	
	let last_timestamp = -1;
	
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