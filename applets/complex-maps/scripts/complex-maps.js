!function()
{
	"use strict";
	
	
	
	let options =
	{
		renderer: "hybrid",
		
		canvas_width: 500,
		canvas_height: 500,
		
		world_width: 8,
		world_height: 8,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio,
		
		
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas,
		
		wheel_callback: on_wheel_canvas,
		pinch_callback: on_pinch_canvas
	};
	
	
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	let image_data = new Uint8ClampedArray(500 * 500 * 4);
	
	
	
	let aspect_ratio = 1;
	
	let zoom_level = 1;
	
	let image_width = 500;
	let image_height = 500;
	let image_size = 500;
	
	let viewport_multiplier = 5;
	let line_separation = 1;
	
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	let next_pan_velocity_x = 0;
	let next_pan_velocity_y = 0;
	let next_zoom_velocity = 0;
	
	let pan_velocity_x = 0;
	let pan_velocity_y = 0;
	let zoom_velocity = 0;
	
	const pan_friction = .96;
	const pan_velocity_start_threshhold = .0025;
	const pan_velocity_stop_threshhold = .00025;
	
	const zoom_friction = .93;
	const zoom_velocity_start_threshhold = .01;
	const zoom_velocity_stop_threshhold = .001;
	
	let last_timestamp = -1;
	
	let currently_animating_parameters = false;
	let parameter_animation_frame = 0;
	
	
	
	let code_input_element = document.querySelector("#code-textarea");
	
	code_input_element.value = "cpow(z, 2.0)";
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	//generate_button_element.addEventListener("click", use_new_code);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-complex-map.png");
	});
	
	
	
	function animate_palette_change()
	{
		if (!currently_animating_parameters)
		{
			currently_animating_parameters = true;
			
			parameter_animation_frame = 0;
			
			
			
			let new_colors = generate_new_palette();
			old_colors = [...colors];
			
			for (let i = 0; i < 12; i++)
			{
				color_deltas[i] = new_colors[i] - colors[i];
			}
			
			window.requestAnimationFrame(draw_newtons_method);
		}
	}
	
	
	
	function animate_palette_change_step()
	{
		let t = .5 * Math.sin(Math.PI * parameter_animation_frame / 30 - Math.PI / 2) + .5;
		
		for (let i = 0; i < 12; i++)
		{
			colors[i] = old_colors[i] + color_deltas[i]*t;
		}
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilson_hidden.gl.uniform3fv(wilson_hidden.uniforms["colors"], colors);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 31)
		{
			currently_animating_parameters = false;
		}
	}
	
	
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		wilson.world_center_x -= x_delta;
		wilson.world_center_y -= y_delta;
		
		next_pan_velocity_x = -x_delta / wilson.world_width;
		next_pan_velocity_y = -y_delta / wilson.world_height;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (Math.sqrt(next_pan_velocity_x * next_pan_velocity_x + next_pan_velocity_y * next_pan_velocity_y) >= pan_velocity_start_threshhold)
		{
			pan_velocity_x = next_pan_velocity_x;
			pan_velocity_y = next_pan_velocity_y;
		}
		
		if (Math.abs(next_zoom_velocity) >= zoom_velocity_start_threshhold)
		{
			zoom_velocity = next_zoom_velocity;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level += scroll_amount / 100;
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas();
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio >= 1)
		{
			zoom_level -= touch_distance_delta / wilson.world_width * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_width * 10;
		}
		
		else
		{
			zoom_level -= touch_distance_delta / wilson.world_height * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_height * 10;
		}
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 8 * Math.pow(2, zoom_level) * aspect_ratio, 8 * Math.pow(2, zoom_level));
			
			wilson.world_width = 8 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson.world_height = 8 * Math.pow(2, zoom_level);
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 8 * Math.pow(2, zoom_level), 8 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson.world_width = 8 * Math.pow(2, zoom_level);
			wilson.world_height = 8 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	

	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		for (let i = 0; i < image_width * image_height; i++)
		{
			image_data[4 * i] = 0;
			image_data[4 * i + 1] = 0;
			image_data[4 * i + 2] = 0;
			image_data[4 * i + 3] = 255;
		}
		
		draw_lines();
		
		wilson.render.draw_frame(image_data);
		
		
		
		let need_new_frame = false;
		
		if (currently_animating_parameters)
		{
			animate_palette_change_step();
			
			need_new_frame = true;
		}
		
		
		
		if (pan_velocity_x !== 0 || pan_velocity_y !== 0 || zoom_velocity !== 0)
		{
			wilson.world_center_x += pan_velocity_x * wilson.world_width;
			wilson.world_center_y += pan_velocity_y * wilson.world_height;
			
			
			
			pan_velocity_x *= pan_friction;
			pan_velocity_y *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x = 0;
				pan_velocity_y = 0;
			}
			
			
			
			zoom_level += zoom_velocity;
			
			zoom_canvas(fixed_point_x, fixed_point_y);
			
			zoom_velocity *= zoom_friction;
			
			if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity = 0;
			}
			
			
			
			need_new_frame = true;
		}
		
		
		
		if (need_new_frame)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function draw_lines()
	{
		line_separation = Math.pow(2, Math.floor(zoom_level)) * 2;
		let faint_brightness = (1 - (zoom_level - Math.floor(zoom_level))) * 255;
		
		
		
		let min_horizontal_line = Math.floor((wilson.world_center_y - viewport_multiplier * wilson.world_height) / line_separation) * line_separation;
		let max_horizontal_line = Math.ceil((wilson.world_center_y + viewport_multiplier * wilson.world_height) / line_separation) * line_separation;
		
		let min_vertical_line = Math.floor((wilson.world_center_x - viewport_multiplier * wilson.world_width) / line_separation) * line_separation;
		let max_vertical_line = Math.ceil((wilson.world_center_x + viewport_multiplier * wilson.world_width) / line_separation) * line_separation;
		
		
		
		//Draw the faint horizontal lines.
		for (let y = min_horizontal_line; y <= max_horizontal_line; y += line_separation)
		{
			let color = [0, faint_brightness * Math.min(Math.abs((y + line_separation / 2) / 2), 1), faint_brightness * Math.max(1 - Math.abs((y + line_separation / 2) / 10), 0)];
			
			for (let x = min_vertical_line; x <= max_vertical_line; x += wilson.world_width / image_width)
			{
				let image_x = x;
				let image_y = y + line_separation / 2;
				
				if (image_x > wilson.world_center_x - wilson.world_width / 2 && image_x < wilson.world_center_x + wilson.world_width / 2 && image_y > wilson.world_center_y - wilson.world_height / 2 && image_y < wilson.world_center_y + wilson.world_height / 2)
				{
					let interpolated_coordinates = wilson.utils.interpolate.world_to_canvas(image_x, image_y);
					
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 1] = color[1];
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 2] = color[2];
				}
			}
		}
		
		
		
		//Draw the faint vertical lines.
		for (let x = min_vertical_line; x <= max_vertical_line; x += line_separation)
		{
			let color = [faint_brightness * Math.min(Math.abs((x + line_separation / 2) / 2), 1), 0, faint_brightness * Math.max(1 - Math.abs((x + line_separation / 2) / 10), 0)];
			
			for (let y = min_horizontal_line; y <= max_horizontal_line; y += wilson.world_height / image_height)
			{
				let image_x = x + line_separation / 2;
				let image_y = y;
				
				if (image_x > wilson.world_center_x - wilson.world_width / 2 && image_x < wilson.world_center_x + wilson.world_width / 2 && image_y > wilson.world_center_y - wilson.world_height / 2 && image_y < wilson.world_center_y + wilson.world_height / 2)
				{
					let interpolated_coordinates = wilson.utils.interpolate.world_to_canvas(image_x, image_y);
					
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1])] = color[0];
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 2] = color[2];
				}
			}
		}
		
		
		
		//Draw the bold horizontal lines.
		for (let y = min_horizontal_line; y <= max_horizontal_line; y += line_separation)
		{
			let color = [0, 255 * Math.min(Math.abs(y / 2), 1), 255 * Math.max(1 - Math.abs(y / 10), 0)];
			
			for (let x = min_vertical_line; x <= max_vertical_line; x += wilson.world_width / image_width)
			{
				let image_x = x;
				let image_y = y;
				
				if (image_x > wilson.world_center_x - wilson.world_width / 2 && image_x < wilson.world_center_x + wilson.world_width / 2 && image_y > wilson.world_center_y - wilson.world_height / 2 && image_y < wilson.world_center_y + wilson.world_height / 2)
				{
					let interpolated_coordinates = wilson.utils.interpolate.world_to_canvas(image_x, image_y);
					
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 1] = color[1];
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 2] = color[2];
				}
			}
		}
		
		
		
		//Draw the bold vertical lines.
		for (let x = min_vertical_line; x <= max_vertical_line; x += line_separation)
		{
			let color = [255 * Math.min(Math.abs(x / 2), 1), 0, 255 * Math.max(1 - Math.abs(x / 10), 0)];
			
			for (let y = min_horizontal_line; y <= max_horizontal_line; y += wilson.world_height / image_height)
			{
				let image_x = x;
				let image_y = y;
				
				if (image_x > wilson.world_center_x - wilson.world_width / 2 && image_x < wilson.world_center_x + wilson.world_width / 2 && image_y > wilson.world_center_y - wilson.world_height / 2 && image_y < wilson.world_center_y + wilson.world_height / 2)
				{
					let interpolated_coordinates = wilson.utils.interpolate.world_to_canvas(image_x, image_y);
					
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1])] = color[0];
					image_data[4 * (image_width * interpolated_coordinates[0] + interpolated_coordinates[1]) + 2] = color[2];
				}
			}
		}
	}
	
	
	
	function change_aspect_ratio()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / aspect_ratio);
				
				wilson.world_width = 8 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 8 * Math.pow(2, zoom_level);
			}
			
			else
			{
				image_width = Math.floor(resolution * aspect_ratio);
				image_height = image_size;
				
				wilson.world_width = 8 * Math.pow(2, zoom_level);
				wilson.world_height = 8 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			image_width = image_size;
			image_height = image_size;
			
			wilson.world_width = 8 * Math.pow(2, zoom_level);
			wilson.world_height = 8 * Math.pow(2, zoom_level);
		}
		
		wilson.change_canvas_size(image_width, image_height);
		
		window.requestAnimationFrame(draw_frame);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()