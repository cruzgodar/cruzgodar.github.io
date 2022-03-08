!function()
{
	"use strict";
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float aspect_ratio_x;
		uniform float aspect_ratio_y;
		
		uniform vec3 camera_pos;
		uniform vec3 image_plane_center_pos;
		uniform vec3 forward_vec;
		uniform vec3 right_vec;
		uniform vec3 up_vec;
		
		uniform float focal_length;
		
		uniform vec3 light_pos;
		const float light_brightness = 1.5;
		
		uniform int image_size;
		
		uniform int draw_sphere;
		
		uniform int max_iterations;
		
		
		
		const float clip_distance = 1000.0;
		uniform int max_marches;
		uniform float step_factor;
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .1;
		
		
		vec3 color;
		
		
		uniform mat3 rotation_matrix;
		
		uniform float power;
		uniform vec3 c;
		uniform float julia_proportion;
		
		
		
		float distance_estimator(vec3 pos)
		{
			vec3 z = pos;
			
			float r = length(z);
			float dr = 1.0;
			
			color = vec3(1.0, 1.0, 1.0);
			float color_scale = .5;
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (r > 16.0 || iteration >= max_iterations)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta *= power;
				
				phi *= power;
				
				z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
				z += mix(pos, c, julia_proportion);
				
				z = rotation_matrix * z;
				
				r = length(z);
				
				color = mix(color, abs(z / r), color_scale);
				
				color_scale *= .5;
			}
			
			color /= max(max(color.x, color.y), color.z);
			
			
			
			float distance_1 = .5 * log(r) * r / dr;
			float distance_2 = length(pos - c) - .05;
			
			
			
			if (distance_2 < distance_1 && draw_sphere == 1)
			{
				color = vec3(1.0, 1.0, 1.0);
				
				return distance_2;
			}
			
			
			
			return distance_1;
		}
		
		
		
		vec3 get_surface_normal(vec3 pos)
		{
			float x_step_1 = distance_estimator(pos + vec3(.000001, 0.0, 0.0));
			float y_step_1 = distance_estimator(pos + vec3(0.0, .000001, 0.0));
			float z_step_1 = distance_estimator(pos + vec3(0.0, 0.0, .000001));
			
			float x_step_2 = distance_estimator(pos - vec3(.000001, 0.0, 0.0));
			float y_step_2 = distance_estimator(pos - vec3(0.0, .000001, 0.0));
			float z_step_2 = distance_estimator(pos - vec3(0.0, 0.0, .000001));
			
			return normalize(vec3(x_step_1 - x_step_2, y_step_1 - y_step_2, z_step_1 - z_step_2));
		}
		
		
		
		vec3 compute_shading(vec3 pos, int iteration)
		{
			vec3 surface_normal = get_surface_normal(pos);
			
			vec3 light_direction = normalize(light_pos - pos);
			
			float dot_product = dot(surface_normal, light_direction);
			
			float light_intensity = light_brightness * max(dot_product, -.25 * dot_product);
			
			//The last factor adds ambient occlusion.
			color = color * light_intensity * max((1.0 - float(iteration) / float(max_marches)), 0.0);
			
			
			
			//Apply fog.
			return mix(color, fog_color, 1.0 - exp(-distance(pos, camera_pos) * fog_scaling));
		}
		
		
		
		vec3 raymarch(vec3 start_pos)
		{
			//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9 / step_factor;
			
			vec3 final_color = fog_color;
			
			float epsilon = 0.0;
			
			float t = 0.0;
			
			float last_distance = 1000.0;
			
			//int slowed_down = 0;
			
			
			
			for (int iteration = 0; iteration < 1024; iteration++)
			{
				if (iteration == max_marches)
				{
					break;
				}
				
				
				
				vec3 pos = start_pos + t * ray_direction_vec;
				
				//This prevents overstepping, and is honestly a pretty clever fix.
				float distance = min(distance_estimator(pos), last_distance);
				last_distance = distance;
				
				//This lowers the detail far away, which makes everything run nice and fast.
				epsilon = max(.0000006, .5 * t / float(image_size));
				
				
				
				if (distance < epsilon)
				{
					final_color = compute_shading(pos, iteration);
					break;
				}
				
				//Uncomment to add aggressive understepping when close to the fractal boundary, which helps to prevent flickering but is a significant performance hit.
				/*
				else if (last_distance / distance > .9999 && slowed_down == 0)
				{
					ray_direction_vec = normalize(start_pos - camera_pos) * .125;
					
					slowed_down = 1;
				}
				
				else if (last_distance / distance <= .9999 && slowed_down == 1)
				{
					ray_direction_vec = normalize(start_pos - camera_pos) * .9;
					
					slowed_down = 0;
				}
				*/
				
				else if (t > clip_distance)
				{
					break;
				}
				
				
				
				t += distance;
			}
			
			
			
			return final_color;
		}
		
		
		
		void main(void)
		{
			//Uncomment to use 2x antialiasing.
			//vec3 final_color = (raymarch(image_plane_center_pos + right_vec * (uv.x * aspect_ratio + .5 / float(image_size)) + up_vec * (uv.y + .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x * aspect_ratio + .5 / float(image_size)) + up_vec * (uv.y - .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x * aspect_ratio - .5 / float(image_size)) + up_vec * (uv.y + .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x * aspect_ratio - .5 / float(image_size)) + up_vec * (uv.y - .5 / float(image_size)))) / 4.0;
			
			gl_FragColor = vec4(raymarch(image_plane_center_pos + right_vec * uv.x * aspect_ratio_x + up_vec * uv.y / aspect_ratio_y), 1.0);
		}
	`;
	
	
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 500,
		canvas_height: 500,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_resolution,
		
		
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	wilson.render.init_uniforms(["aspect_ratio_x", "aspect_ratio_y", "image_size", "camera_pos", "image_plane_center_pos", "forward_vec", "right_vec", "up_vec", "focal_length", "light_pos", "draw_sphere", "power", "c", "julia_proportion", "rotation_matrix", "max_marches", "step_factor", "max_iterations"]);
	
	
	
	
	let currently_drawing = false;
	let currently_animating_parameters = false;
	
	let currently_dragging = false;
	
	let draw_start_time = 0;
	
	let mouse_x = 0;
	let mouse_y = 0;
	
	let moving_forward_keyboard = false;
	let moving_backward_keyboard = false;
	let moving_right_keyboard = false;
	let moving_left_keyboard = false;
	
	let moving_forward_touch = false;
	let moving_backward_touch = false;
	
	let was_moving_touch = false;
	
	let moving_speed = 0;
	
	
	
	let next_move_velocity = [0, 0, 0];
	
	let move_velocity = [0, 0, 0];
	
	const move_friction = .94;
	const move_velocity_stop_threshhold = .0005;
	
	
	
	let distance_to_scene = 1;
	
	let last_timestamp = -1;
	
	
	
	let theta = 4.6601;
	let phi = 2.272;
	
	let next_theta_velocity = 0;
	let next_phi_velocity = 0;
	
	let theta_velocity = 0;
	let phi_velocity = 0;
	
	const pan_friction = .94;
	const pan_velocity_start_threshhold = .005;
	const pan_velocity_stop_threshhold = .0005;
	
	
	
	let image_size = 500;
	let image_width = 500;
	let image_height = 500;
	
	let max_iterations = 4;
	
	let max_marches = 100;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [.0828, 2.17, 1.8925];
	
	let focal_length = 2;
	
	let light_pos = [0, 0, 5];
	
	let power = 8;
	let c = [0, 0, 0];
	let c_old = [0, 0, 0];
	let c_delta = [0, 0, 0];
	
	let rotation_angle_x = 0;
	let rotation_angle_y = 0;
	let rotation_angle_z = 0;
	
	let julia_proportion = 0;
	let moving_pos = 1;
	
	let power_old = 8;
	let power_delta = 0;
	
	let julia_proportion_old = 0;
	let julia_proportion_delta = 0;
	
	let rotation_angle_x_old = 0;
	let rotation_angle_y_old = 0;
	let rotation_angle_z_old = 0;
	let rotation_angle_x_delta = 0;
	let rotation_angle_y_delta = 0;
	let rotation_angle_z_delta = 0;
	
	let parameter_animation_frame = 0;
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", change_resolution);
	
	
	
	let iterations_input_element = document.querySelector("#iterations-input");
	
	iterations_input_element.addEventListener("input", () =>
	{
		max_iterations = parseInt(iterations_input_element.value || 4);
		
		wilson.gl.uniform1i(wilson.uniforms["max_iterations"], max_iterations);
		
		window.requestAnimationFrame(draw_frame);
	});
	
	
	
	let view_distance_input_element = document.querySelector("#view-distance-input");
	
	view_distance_input_element.addEventListener("input", () =>
	{
		max_marches = Math.max(parseInt(view_distance_input_element.value || 100), 32);
		
		wilson.gl.uniform1i(wilson.uniforms["max_marches"], max_marches);
		
		window.requestAnimationFrame(draw_frame);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.gl.uniform1i(wilson.uniforms["max_marches"], 1024);
		wilson.gl.uniform1f(wilson.uniforms["step_factor"], 12);
		
		
		
		if (julia_proportion === 0)
		{	
			wilson.download_frame("the-mandelbulb.png");
		}
		
		else
		{
			wilson.download_frame("a-juliabulb.png");
		}
		
		
		
		wilson.gl.uniform1i(wilson.uniforms["max_marches"], max_marches);
		wilson.gl.uniform1f(wilson.uniforms["step_factor"], 1);
	});
	
	
	
	let rotation_angle_x_input_element = document.querySelector("#rotation-angle-x-input");
	let rotation_angle_y_input_element = document.querySelector("#rotation-angle-y-input");
	let rotation_angle_z_input_element = document.querySelector("#rotation-angle-z-input");
	
	let c_x_input_element = document.querySelector("#c-x-input");
	let c_y_input_element = document.querySelector("#c-y-input");
	let c_z_input_element = document.querySelector("#c-z-input");
	
	let power_input_element = document.querySelector("#power-input");
	
	let elements = [rotation_angle_x_input_element, rotation_angle_y_input_element, rotation_angle_z_input_element, c_x_input_element, c_y_input_element, c_z_input_element, power_input_element];
	
	for (let i = 0; i < 7; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	
	
	let randomize_rotation_button_element = document.querySelector("#randomize-rotation-button");
	
	randomize_rotation_button_element.addEventListener("click", randomize_rotation);
	
	
	
	let randomize_c_button_element = document.querySelector("#randomize-c-button");
	
	randomize_c_button_element.addEventListener("click", randomize_c);
	
	
	
	let switch_bulb_button_element = document.querySelector("#switch-bulb-button");
	
	switch_bulb_button_element.addEventListener("click", switch_bulb);
	
	
	
	let switch_movement_button_element = document.querySelector("#switch-movement-button");
	
	switch_movement_button_element.addEventListener("click", switch_movement);
	
	switch_movement_button_element.style.opacity = 0;
	
	
	
	Page.Load.TextButtons.equalize();
	
	
	
	calculate_vectors();
	
	
	
	if (image_width >= image_height)
	{
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_x"], image_width / image_height);
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_y"], 1);
	}
	
	else
	{
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_x"], 1);
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_y"], image_width / image_height);
	}
	
	wilson.gl.uniform1i(wilson.uniforms["image_size"], image_size);
	
	wilson.gl.uniform3fv(wilson.uniforms["camera_pos"], camera_pos);
	wilson.gl.uniform3fv(wilson.uniforms["image_plane_center_pos"], image_plane_center_pos);
	wilson.gl.uniform3fv(wilson.uniforms["light_pos"], light_pos);
	
	wilson.gl.uniform3fv(wilson.uniforms["forward_vec"], forward_vec);
	wilson.gl.uniform3fv(wilson.uniforms["right_vec"], right_vec);
	wilson.gl.uniform3fv(wilson.uniforms["up_vec"], up_vec);
	
	wilson.gl.uniform1f(wilson.uniforms["focal_length"], focal_length);
	
	wilson.gl.uniform1i(wilson.uniforms["draw_sphere"], 0);
	
	wilson.gl.uniform1f(wilson.uniforms["power"], 8);
	wilson.gl.uniform3fv(wilson.uniforms["c"], c);
	wilson.gl.uniform1f(wilson.uniforms["julia_proportion"], 0);
	
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	
	wilson.gl.uniform1i(wilson.uniforms["max_marches"], max_marches);
	wilson.gl.uniform1f(wilson.uniforms["step_factor"], 1);
	wilson.gl.uniform1i(wilson.uniforms["max_iterations"], max_iterations);
	
	
	
	window.requestAnimationFrame(draw_frame);
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson.render.draw_frame();
		
		
		
		let need_new_frame = false;
		
		
		
		if (currently_animating_parameters)
		{
			animate_parameter_change_step();
			
			need_new_frame = true;
		}
		
		
		
		
		
		
		
		if (moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch)
		{
			update_camera_parameters();
			
			need_new_frame = true;
		}
		
		else if (time_elapsed >= 50)
		{
			next_theta_velocity = 0;
			next_phi_velocity = 0;
			
			theta_velocity = 0;
			phi_velocity = 0;
			
			moving_forward_touch = false;
			moving_backward_touch = false;
			
			move_velocity[0] = 0;
			move_velocity[1] = 0;
			move_velocity[2] = 0;
			
			next_move_velocity[0] = 0;
			next_move_velocity[1] = 0;
			next_move_velocity[2] = 0;
		}
		
		
		
		if (theta_velocity !== 0 || phi_velocity !== 0)
		{
			theta += theta_velocity;
			phi += phi_velocity;
			
			
			
			if (theta >= 2 * Math.PI)
			{
				theta -= 2 * Math.PI;
			}
			
			else if (theta < 0)
			{
				theta += 2 * Math.PI;
			}
			
			
			
			if (phi > Math.PI - .01)
			{
				phi = Math.PI - .01;
			}
			
			else if (phi < .01)
			{
				phi = .01;
			}
			
			
			
			theta_velocity *= pan_friction;
			phi_velocity *= pan_friction;
			
			if (Math.sqrt(theta_velocity * theta_velocity + phi_velocity * phi_velocity) < pan_velocity_stop_threshhold)
			{
				theta_velocity = 0;
				phi_velocity = 0;
			}
			
			
			
			calculate_vectors();
			
			need_new_frame = true;
		}
		
		if (move_velocity[0] !== 0 || move_velocity[1] !== 0 || move_velocity[2] !== 0)
		{
			if (moving_pos)
			{	
				camera_pos[0] += move_velocity[0];
				camera_pos[1] += move_velocity[1];
				camera_pos[2] += move_velocity[2];
			}
			
			else
			{
				c[0] += move_velocity[0];
				c[1] += move_velocity[1];
				c[2] += move_velocity[2];
				
				c_x_input_element.value = Math.round((c[0]) * 1000000) / 1000000;
				c_y_input_element.value = Math.round((c[1]) * 1000000) / 1000000;
				c_z_input_element.value = Math.round((c[2]) * 1000000) / 1000000;
				
				wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			}
			
			
			
			move_velocity[0] *= move_friction;
			move_velocity[1] *= move_friction;
			move_velocity[2] *= move_friction;
			
			if (Math.sqrt(move_velocity[0] * move_velocity[0] + move_velocity[1] * move_velocity[1] + move_velocity[2] * move_velocity[2]) < move_velocity_stop_threshhold * moving_speed)
			{
				move_velocity[0] = 0;
				move_velocity[1] = 0;
				move_velocity[2] = 0;
			}
			
			
			
			calculate_vectors();
				
			need_new_frame = true;
		}
		
		
		
		if (need_new_frame)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function calculate_vectors()
	{
		//Here comes the serious math. Theta is the angle in the xy-plane and phi the angle down from the z-axis. We can use them get a normalized forward vector:
		forward_vec = [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
		
		//Now the right vector needs to be constrained to the xy-plane, since otherwise the image will appear tilted. For a vector (a, b, c), the orthogonal plane that passes through the origin is ax + by + cz = 0, so we want ax + by = 0. One solution is (b, -a), and that's the one that goes to the "right" of the forward vector (when looking down).
		right_vec = normalize([forward_vec[1], -forward_vec[0], 0]);
		
		//Finally, the upward vector is the cross product of the previous two.
		up_vec = cross_product(right_vec, forward_vec);
		
		
		
		distance_to_scene = distance_estimator(camera_pos[0], camera_pos[1], camera_pos[2]);
		
		
		
		focal_length = distance_to_scene / 2;
		
		//The factor we divide by here sets the fov.
		right_vec[0] *= focal_length / 2;
		right_vec[1] *= focal_length / 2;
		
		up_vec[0] *= focal_length / 2;
		up_vec[1] *= focal_length / 2;
		up_vec[2] *= focal_length / 2;
		
		
		
		image_plane_center_pos = [camera_pos[0] + focal_length * forward_vec[0], camera_pos[1] + focal_length * forward_vec[1], camera_pos[2] + focal_length * forward_vec[2]];
		
		
		
		wilson.gl.uniform3fv(wilson.uniforms["camera_pos"], camera_pos);
		wilson.gl.uniform3fv(wilson.uniforms["image_plane_center_pos"], image_plane_center_pos);
		
		wilson.gl.uniform3fv(wilson.uniforms["forward_vec"], forward_vec);
		wilson.gl.uniform3fv(wilson.uniforms["right_vec"], right_vec);
		wilson.gl.uniform3fv(wilson.uniforms["up_vec"], up_vec);
		
		wilson.gl.uniform1f(wilson.uniforms["focal_length"], focal_length);
	}
	
	
	
	function dot_product(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
	}
	
	
	
	function cross_product(vec1, vec2)
	{
		return [vec1[1] * vec2[2] - vec1[2] * vec2[1], vec1[2] * vec2[0] - vec1[0] * vec2[2], vec1[0] * vec2[1] - vec1[1] * vec2[0]];
	}
	
	
	
	function mat_mul(mat1, mat2)
	{
		return [
			[mat1[0][0]*mat2[0][0] + mat1[0][1]*mat2[1][0] + mat1[0][2]*mat2[2][0],
			mat1[0][0]*mat2[0][1] + mat1[0][1]*mat2[1][1] + mat1[0][2]*mat2[2][1],
			mat1[0][0]*mat2[0][2] + mat1[0][1]*mat2[1][2] + mat1[0][2]*mat2[2][2]],
			
			[mat1[1][0]*mat2[0][0] + mat1[1][1]*mat2[1][0] + mat1[1][2]*mat2[2][0],
			mat1[1][0]*mat2[0][1] + mat1[1][1]*mat2[1][1] + mat1[1][2]*mat2[2][1],
			mat1[1][0]*mat2[0][2] + mat1[1][1]*mat2[1][2] + mat1[1][2]*mat2[2][2]],
			
			[mat1[2][0]*mat2[0][0] + mat1[2][1]*mat2[1][0] + mat1[2][2]*mat2[2][0],
			mat1[2][0]*mat2[0][1] + mat1[2][1]*mat2[1][1] + mat1[2][2]*mat2[2][1],
			mat1[2][0]*mat2[0][2] + mat1[2][1]*mat2[1][2] + mat1[2][2]*mat2[2][2]]
		];
	}
	
	
	
	function normalize(vec)
	{
		let magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	function distance_estimator(x, y, z)
	{
		let mutable_z = [x, y, z];
		
		let r = 0.0;
		let dr = 1.0;
		
		for (let iteration = 0; iteration < max_iterations * 4; iteration++)
		{
			r = Math.sqrt(dot_product(mutable_z, mutable_z));
			
			if (r > 16.0)
			{
				break;
			}
			
			let theta = Math.acos(mutable_z[2] / r);
			
			let phi = Math.atan2(mutable_z[1], mutable_z[0]);
			
			dr = Math.pow(r, power - 1.0) * power * dr + 1.0;
			
			theta = theta * power;
			
			phi = phi * power;
			
			let scaled_r = Math.pow(r, power);
			
			mutable_z[0] = scaled_r * Math.sin(theta) * Math.cos(phi) + ((1 - julia_proportion) * x + julia_proportion * c[0]);
			mutable_z[1] = scaled_r * Math.sin(theta) * Math.sin(phi) + ((1 - julia_proportion) * y + julia_proportion * c[1]);
			mutable_z[2] = scaled_r * Math.cos(theta) + ((1 - julia_proportion) * z + julia_proportion * c[2]);
			
			
			
			//Apply the rotation matrix.
			
			let temp_x = mutable_z[0];
			let temp_y = mutable_z[1];
			let temp_z = mutable_z[2];
			
			let mat_z = [[Math.cos(rotation_angle_z), -Math.sin(rotation_angle_z), 0], [Math.sin(rotation_angle_z), Math.cos(rotation_angle_z), 0], [0, 0, 1]];
			let mat_y = [[Math.cos(rotation_angle_y), 0, -Math.sin(rotation_angle_y)], [0, 1, 0],[Math.sin(rotation_angle_y), 0, Math.cos(rotation_angle_y)]];
			let mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x), -Math.sin(rotation_angle_x)], [0, Math.sin(rotation_angle_x), Math.cos(rotation_angle_x)]];
			
			let mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
			
			mutable_z[0] = mat_total[0][0] * temp_x + mat_total[0][1] * temp_y + mat_total[0][2] * temp_z;
			mutable_z[1] = mat_total[1][0] * temp_x + mat_total[1][1] * temp_y + mat_total[1][2] * temp_z;
			mutable_z[2] = mat_total[2][0] * temp_x + mat_total[2][1] * temp_y + mat_total[2][2] * temp_z;
		}
		
		
		
		return 0.5 * Math.log(r) * r / dr;
	}
	
	
	
	function on_grab_canvas(x, y, event)
	{
		next_theta_velocity = 0;
		next_phi_velocity = 0;
		
		theta_velocity = 0;
		phi_velocity = 0;
		
		
		
		if (event.type === "touchstart")
		{
			if (event.touches.length === 2)
			{
				moving_forward_touch = true;
				moving_backward_touch = false;
				
				move_velocity[0] = 0;
				move_velocity[1] = 0;
				move_velocity[2] = 0;
				
				next_move_velocity[0] = 0;
				next_move_velocity[1] = 0;
				next_move_velocity[2] = 0;
				
				window.requestAnimationFrame(draw_frame);
			}
			
			else if (event.touches.length === 3)
			{
				moving_forward_touch = false;
				moving_backward_touch = true;
				
				move_velocity[0] = 0;
				move_velocity[1] = 0;
				move_velocity[2] = 0;
				
				next_move_velocity[0] = 0;
				next_move_velocity[1] = 0;
				next_move_velocity[2] = 0;
				
				window.requestAnimationFrame(draw_frame);
			}
			
			else
			{
				moving_forward_touch = false;
				moving_backward_touch = false;
			}
			
			was_moving_touch = false;
		}
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (event.type === "touchmove" && was_moving_touch)
		{
			was_moving_touch = false;
			return;
		}
		
		
		
		theta += x_delta * Math.PI / 2;
		
		next_theta_velocity = x_delta * Math.PI / 2;
		
		if (theta >= 2 * Math.PI)
		{
			theta -= 2 * Math.PI;
		}
		
		else if (theta < 0)
		{
			theta += 2 * Math.PI;
		}
		
		
		
		phi += y_delta * Math.PI / 2;
		
		next_phi_velocity = y_delta * Math.PI / 2;
		
		if (phi > Math.PI - .01)
		{
			phi = Math.PI - .01;
		}
		
		else if (phi < .01)
		{
			phi = .01;
		}
		
		
		
		calculate_vectors();
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (event.type === "touchend")
		{
			moving_forward_touch = false;
			moving_backward_touch = false;
			
			was_moving_touch = true;
			
			if (move_velocity[0] === 0 && move_velocity[1] === 0 && move_velocity[2] === 0)
			{
				move_velocity[0] = next_move_velocity[0];
				move_velocity[1] = next_move_velocity[1];
				move_velocity[2] = next_move_velocity[2];
				
				next_move_velocity[0] = 0;
				next_move_velocity[1] = 0;
				next_move_velocity[2] = 0;
			}
		}
		
		if (((event.type === "touchend" && event.touches,length === 0) || event.type === "mouseup") && (Math.sqrt(next_theta_velocity * next_theta_velocity + next_phi_velocity * next_phi_velocity) >= pan_velocity_start_threshhold))
		{
			theta_velocity = next_theta_velocity;
			phi_velocity = next_phi_velocity;
		}
	}
	
	
	
	function handle_keydown_event(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		next_move_velocity = [0, 0, 0];
		move_velocity = [0, 0, 0];
		
		
		
		//W
		if (e.keyCode === 87)
		{
			moving_forward_keyboard = true;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			moving_backward_keyboard = true;
		}
		
		//D
		if (e.keyCode === 68)
		{
			moving_right_keyboard = true;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			moving_left_keyboard = true;
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function handle_keyup_event(e)
	{
		if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
		{
			return;
		}
		
		
		
		if (move_velocity[0] === 0 && move_velocity[1] === 0 && move_velocity[2] === 0)
		{
			move_velocity[0] = next_move_velocity[0];
			move_velocity[1] = next_move_velocity[1];
			move_velocity[2] = next_move_velocity[2];
			
			next_move_velocity[0] = 0;
			next_move_velocity[1] = 0;
			next_move_velocity[2] = 0;
		}
		
		
		
		//W
		if (e.keyCode === 87)
		{
			moving_forward_keyboard = false;
		}
		
		//S
		else if (e.keyCode === 83)
		{
			moving_backward_keyboard = false;
		}
		
		//D
		if (e.keyCode === 68)
		{
			moving_right_keyboard = false;
		}
		
		//A
		else if (e.keyCode === 65)
		{
			moving_left_keyboard = false;
		}
	}
	
	
	
	document.documentElement.addEventListener("keydown", handle_keydown_event);
	Page.temporary_handlers["keydown"].push(handle_keydown_event);
	
	document.documentElement.addEventListener("keyup", handle_keyup_event);
	Page.temporary_handlers["keydown"].push(handle_keyup_event);
	
	
	
	function update_camera_parameters()
	{
		moving_speed = Math.min(Math.max(.000001, distance_to_scene / 20), .02);
		
		
		
		if (moving_pos)
		{
			let old_camera_pos = [...camera_pos];
			
			
			
			if (moving_forward_keyboard || moving_forward_touch)
			{
				camera_pos[0] += moving_speed * forward_vec[0];
				camera_pos[1] += moving_speed * forward_vec[1];
				camera_pos[2] += moving_speed * forward_vec[2];
			}
			
			else if (moving_backward_keyboard || moving_backward_touch)
			{
				camera_pos[0] -= moving_speed * forward_vec[0];
				camera_pos[1] -= moving_speed * forward_vec[1];
				camera_pos[2] -= moving_speed * forward_vec[2];
			}
			
			
			
			if (moving_right_keyboard)
			{
				camera_pos[0] += moving_speed * right_vec[0] / focal_length;
				camera_pos[1] += moving_speed * right_vec[1] / focal_length;
				camera_pos[2] += moving_speed * right_vec[2] / focal_length;
			}
			
			else if (moving_left_keyboard)
			{
				camera_pos[0] -= moving_speed * right_vec[0] / focal_length;
				camera_pos[1] -= moving_speed * right_vec[1] / focal_length;
				camera_pos[2] -= moving_speed * right_vec[2] / focal_length;
			}	
			
			
			
			next_move_velocity[0] = camera_pos[0] - old_camera_pos[0];
			next_move_velocity[1] = camera_pos[1] - old_camera_pos[1];
			next_move_velocity[2] = camera_pos[2] - old_camera_pos[2];
		}
		
		
		
		else
		{
			let old_c = [...c];
			
			if (moving_forward_keyboard || moving_forward_touch)
			{
				c[0] += .5 * moving_speed * forward_vec[0];
				c[1] += .5 * moving_speed * forward_vec[1];
				c[2] += .5 * moving_speed * forward_vec[2];
			}
			
			else if (moving_backward_keyboard || moving_backward_touch)
			{
				c[0] -= .5 * moving_speed * forward_vec[0];
				c[1] -= .5 * moving_speed * forward_vec[1];
				c[2] -= .5 * moving_speed * forward_vec[2];
			}
			
			
			
			if (moving_right_keyboard)
			{
				c[0] += .5 * moving_speed * right_vec[0] / focal_length;
				c[1] += .5 * moving_speed * right_vec[1] / focal_length;
				c[2] += .5 * moving_speed * right_vec[2] / focal_length;
			}
			
			else if (moving_left_keyboard)
			{
				c[0] -= .5 * moving_speed * right_vec[0] / focal_length;
				c[1] -= .5 * moving_speed * right_vec[1] / focal_length;
				c[2] -= .5 * moving_speed * right_vec[2] / focal_length;
			}
			
			
			
			c_x_input_element.value = Math.round((c[0]) * 1000000) / 1000000;
			c_y_input_element.value = Math.round((c[1]) * 1000000) / 1000000;
			c_z_input_element.value = Math.round((c[2]) * 1000000) / 1000000;
			
			
			
			wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			
			
			
			next_move_velocity[0] = c[0] - old_c[0];
			next_move_velocity[1] = c[1] - old_c[1];
			next_move_velocity[2] = c[2] - old_c[2];
		}
		
		
		
		calculate_vectors();
	}
	
	
	
	function change_resolution()
	{
		image_size = Math.max(100, parseInt(resolution_input_element.value || 500));
		
		
		
		if (wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * Page.Layout.aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		wilson.change_canvas_size(image_width, image_height);
		
		
		
		if (image_width >= image_height)
		{
			wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_x"], image_width / image_height);
			wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_y"], 1);
		}
		
		else
		{
			wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_x"], 1);
			wilson.gl.uniform1f(wilson.uniforms["aspect_ratio_y"], image_width / image_height);
		}
		
		wilson.gl.uniform1i(wilson.uniforms["image_size"], image_size);
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function randomize_rotation(animate_change = true)
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		rotation_angle_x_old = rotation_angle_x;
		rotation_angle_y_old = rotation_angle_y;
		rotation_angle_z_old = rotation_angle_z;
		
		rotation_angle_x_delta = Math.random()*2 - 1 - rotation_angle_x_old;
		rotation_angle_y_delta = Math.random()*2 - 1 - rotation_angle_y_old;
		rotation_angle_z_delta = Math.random()*2 - 1 - rotation_angle_z_old;
		
		rotation_angle_x_input_element.value = Math.round((rotation_angle_x_old + rotation_angle_x_delta) * 1000000) / 1000000;
		rotation_angle_y_input_element.value = Math.round((rotation_angle_y_old + rotation_angle_y_delta) * 1000000) / 1000000;
		rotation_angle_z_input_element.value = Math.round((rotation_angle_z_old + rotation_angle_z_delta) * 1000000) / 1000000;
		
		
		
		c_old[0] = c[0];
		c_old[1] = c[1];
		c_old[2] = c[2];
		
		c_delta[0] = 0;
		c_delta[1] = 0;
		c_delta[2] = 0;
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 0;
		
		power_old = power;
		power_delta = 0;
		
		
		
		if (animate_change)
		{
			animate_parameter_change();
		}
		
		else
		{
			rotation_angle_x = rotation_angle_x_old + rotation_angle_x_delta;
			rotation_angle_y = rotation_angle_y_old + rotation_angle_y_delta;
			rotation_angle_z = rotation_angle_z_old + rotation_angle_z_delta;
		}
	}
	
	
	
	function randomize_c(animate_change = true)
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		rotation_angle_x_old = rotation_angle_x;
		rotation_angle_y_old = rotation_angle_y;
		rotation_angle_z_old = rotation_angle_z;
		
		rotation_angle_x_delta = 0;
		rotation_angle_y_delta = 0;
		rotation_angle_z_delta = 0;
		
		
		
		c_old[0] = c[0];
		c_old[1] = c[1];
		c_old[2] = c[2];
		
		c_delta[0] = Math.random()*1.5 - .75 - c_old[0];
		c_delta[1] = Math.random()*1.5 - .75 - c_old[1];
		c_delta[2] = Math.random()*1.5 - .75 - c_old[2];
		
		c_x_input_element.value = Math.round((c_old[0] + c_delta[0]) * 1000000) / 1000000;
		c_y_input_element.value = Math.round((c_old[1] + c_delta[1]) * 1000000) / 1000000;
		c_z_input_element.value = Math.round((c_old[2] + c_delta[2]) * 1000000) / 1000000;
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 0;
		
		power_old = power;
		power_delta = 0;
		
		
		
		if (animate_change)
		{
			animate_parameter_change();
		}
		
		else
		{
			c[0] = c_old[0] + c_delta[0];
			c[1] = c_old[1] + c_delta[1];
			c[2] = c_old[2] + c_delta[2];
		}
	}
	
	
	
	function update_parameters()
	{
		rotation_angle_x_old = rotation_angle_x;
		rotation_angle_y_old = rotation_angle_y;
		rotation_angle_z_old = rotation_angle_z;
		
		rotation_angle_x_delta = (parseFloat(rotation_angle_x_input_element.value || 0) || 0) - rotation_angle_x_old;
		rotation_angle_y_delta = (parseFloat(rotation_angle_y_input_element.value || 0) || 0) - rotation_angle_y_old;
		rotation_angle_z_delta = (parseFloat(rotation_angle_z_input_element.value || 0) || 0) - rotation_angle_z_old;
		
		
		
		c_old[0] = c[0];
		c_old[1] = c[1];
		c_old[2] = c[2];
		
		c_delta[0] = (parseFloat(c_x_input_element.value || 0) || 0) - c_old[0];
		c_delta[1] = (parseFloat(c_y_input_element.value || 0) || 0) - c_old[1];
		c_delta[2] = (parseFloat(c_z_input_element.value || 0) || 0) - c_old[2];
		
		
		
		power_old = power;
		power_delta = (parseFloat(power_input_element.value || 0) || 0) - power_old;
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 0;
		
		
		
		animate_parameter_change();
	}
	
	
	
	function animate_parameter_change()
	{
		if (!currently_animating_parameters)
		{
			currently_animating_parameters = true;
			
			parameter_animation_frame = 0;
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function animate_parameter_change_step()
	{
		let t = .5 * Math.sin(Math.PI * parameter_animation_frame / 120 - Math.PI / 2) + .5;
		
		rotation_angle_x = rotation_angle_x_old + rotation_angle_x_delta * t;
		rotation_angle_y = rotation_angle_y_old + rotation_angle_y_delta * t;
		rotation_angle_z = rotation_angle_z_old + rotation_angle_z_delta * t;
		
		
		
		let mat_z = [[Math.cos(rotation_angle_z), -Math.sin(rotation_angle_z), 0], [Math.sin(rotation_angle_z), Math.cos(rotation_angle_z), 0], [0, 0, 1]];
		let mat_y = [[Math.cos(rotation_angle_y), 0, -Math.sin(rotation_angle_y)], [0, 1, 0],[Math.sin(rotation_angle_y), 0, Math.cos(rotation_angle_y)]];
		let mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x), -Math.sin(rotation_angle_x)], [0, Math.sin(rotation_angle_x), Math.cos(rotation_angle_x)]];
		
		let mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix"], false, [mat_total[0][0], mat_total[1][0], mat_total[2][0], mat_total[0][1], mat_total[1][1], mat_total[2][1], mat_total[0][2], mat_total[1][2], mat_total[2][2]]);
		
		
		
		c[0] = c_old[0] + c_delta[0] * t;
		c[1] = c_old[1] + c_delta[1] * t;
		c[2] = c_old[2] + c_delta[2] * t;
		
		wilson.gl.uniform3fv(wilson.uniforms["c"], c);
		
		
		
		power = power_old + power_delta * t;
		
		wilson.gl.uniform1f(wilson.uniforms["power"], power);
		
		
		
		julia_proportion = julia_proportion_old + julia_proportion_delta * t;
		
		wilson.gl.uniform1f(wilson.uniforms["julia_proportion"], julia_proportion);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 121)
		{
			currently_animating_parameters = false;
		}
	}
	
	
	
	function switch_bulb()
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		switch_bulb_button_element.style.opacity = 0;
		
		setTimeout(() =>
		{
			if (julia_proportion_old === 0)
			{
				switch_bulb_button_element.textContent = "Switch to Mandelbulb";
			}
			
			else
			{
				switch_bulb_button_element.textContent = "Switch to Juliabulb";
			}
			
			Page.Load.TextButtons.equalize();
			
			switch_bulb_button_element.style.opacity = 1;
		}, Site.opacity_animation_time);
		
		
		
		if (julia_proportion === 0)
		{
			wilson.gl.uniform3fv(wilson.uniforms["c"], c);
			
			if (!moving_pos)
			{
				wilson.gl.uniform1i(wilson.uniforms["draw_sphere"], 1);
			}
			
			setTimeout(() =>
			{
				switch_movement_button_element.style.opacity = 1;
			}, Site.opacity_animation_time);
		}
		
		else
		{
			moving_pos = true;
			
			wilson.gl.uniform1i(wilson.uniforms["draw_sphere"], 0);
			
			switch_movement_button_element.style.opacity = 0;
		}
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 1 - 2*julia_proportion_old;
		
		power_old = power;
		power_delta = 0;
		
		rotation_angle_x_old = rotation_angle_x;
		rotation_angle_y_old = rotation_angle_y;
		rotation_angle_z_old = rotation_angle_z;
		
		rotation_angle_x_delta = 0;
		rotation_angle_y_delta = 0;
		rotation_angle_z_delta = 0;
		
		c_old[0] = c[0];
		c_old[1] = c[1];
		c_old[2] = c[2];
		
		c_delta[0] = 0;
		c_delta[1] = 0;
		c_delta[2] = 0;
		
		animate_parameter_change();
	}
	
	
	
	function switch_movement()
	{
		moving_pos = !moving_pos;
		
		
		
		switch_movement_button_element.style.opacity = 0;
		
		setTimeout(() =>
		{
			if (moving_pos)
			{
				switch_movement_button_element.textContent = "Change Juliabulb";
			}
			
			else
			{
				switch_movement_button_element.textContent = "Move Camera";
			}
			
			Page.Load.TextButtons.equalize();
			
			switch_movement_button_element.style.opacity = 1;
		}, Site.opacity_animation_time);
		
		
		
		if (moving_pos)
		{
			wilson.gl.uniform1i(wilson.uniforms["draw_sphere"], 0);
		}
		
		else
		{
			wilson.gl.uniform1i(wilson.uniforms["draw_sphere"], 1);
		}
	}
}()