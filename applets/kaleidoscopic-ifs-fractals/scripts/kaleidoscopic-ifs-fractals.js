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
		const float light_brightness = 2.0;
		
		uniform int image_size;
		
		
		
		const float clip_distance = 1000.0;
		const int max_marches = 32;
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .2;
		const int max_iterations = 24;
		
		
		vec3 color;
		
		const vec3 color_1 = vec3(1.0, 0.0, 0.0);
		const vec3 color_2 = vec3(0.0, 1.0, 0.0);
		const vec3 color_3 = vec3(0.0, 0.0, 1.0);
		const vec3 color_4 = vec3(1.0, 1.0, 0.0);
		
		
		
		uniform vec3 scale_center;
		
		uniform int num_ns;
		
		uniform vec3 n1;
		uniform vec3 n2;
		uniform vec3 n3;
		uniform vec3 n4;
		
		
		
		const float scale = 2.0;
		
		
		
		uniform mat3 rotation_matrix_1;
		uniform mat3 rotation_matrix_2;
		
		
		
		float distance_estimator(vec3 pos)
		{
			vec3 mutable_pos = pos;
			
			color = vec3(1.0, 1.0, 1.0);
			float color_scale = .5;
			
			
			
			//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
			for (int iteration = 0; iteration < max_iterations; iteration++)
			{
				//Fold space over on itself so that we can reference only the top vertex.
				float t1 = dot(mutable_pos, n1);
				
				if (t1 < 0.0)
				{
					mutable_pos -= 2.0 * t1 * n1;
					
					color = mix(color, color_1, color_scale);
				}
				
				float t2 = dot(mutable_pos, n2);
				
				if (t2 < 0.0)
				{
					mutable_pos -= 2.0 * t2 * n2;
					
					color = mix(color, color_2, color_scale);
				}
				
				float t3 = dot(mutable_pos, n3);
				
				if (t3 < 0.0)
				{
					mutable_pos -= 2.0 * t3 * n3;
					
					color = mix(color, color_3, color_scale);
				}
				
				if (num_ns >= 4)
				{
					float t4 = dot(mutable_pos, n4);
					
					if (t4 < 0.0)
					{
						mutable_pos -= 2.0 * t4 * n4;
						
						color = mix(color, color_4, color_scale);
					}
				}
				
				
				
				mutable_pos = rotation_matrix_1 * mutable_pos;
				
				
				
				//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
				mutable_pos = scale * mutable_pos - (scale - 1.0) * scale_center;
				
				
				
				mutable_pos = rotation_matrix_2 * mutable_pos;
				
				
				
				color_scale *= .5;
			}
			
			
			
			return length(mutable_pos) * pow(1.0/scale, float(max_iterations));
		}
		
		
		
		vec3 get_surface_normal(vec3 pos)
		{
			float base = distance_estimator(pos);
			
			float x_step = distance_estimator(pos + vec3(.000001, 0.0, 0.0));
			float y_step = distance_estimator(pos + vec3(0.0, .000001, 0.0));
			float z_step = distance_estimator(pos + vec3(0.0, 0.0, .000001));
			
			return normalize(vec3(x_step - base, y_step - base, z_step - base));
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
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9;
			
			vec3 final_color = fog_color;
			
			float epsilon = .0000001;
			
			float t = 0.0;
			
			
			
			for (int iteration = 0; iteration < max_marches; iteration++)
			{
				vec3 pos = start_pos + t * ray_direction_vec;
				
				float distance = distance_estimator(pos);
				
				//This lowers the detail far away, which makes everything run nice and fast.
				if (distance / float(image_size) * 3.0 > epsilon)
				{
					epsilon = distance / float(image_size) * 3.0;
				}
				
				
				
				if (distance < epsilon)
				{
					final_color = compute_shading(pos, iteration);
					break;
				}
				
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
				
			vec3 final_color = raymarch(image_plane_center_pos + right_vec * uv.x * aspect_ratio_x + up_vec * uv.y / aspect_ratio_y);
			
			gl_FragColor = vec4(final_color.xyz, 1.0);
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
	
	wilson.render.init_uniforms(["aspect_ratio_x", "aspect_ratio_y", "image_size", "camera_pos", "image_plane_center_pos", "forward_vec", "right_vec", "up_vec", "focal_length", "light_pos", "scale_center", "n1", "n2", "n3", "n4", "num_ns", "rotation_matrix_1", "rotation_matrix_2"]);
	
	
	
	
	
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
	
	
	
	let theta = 3.2954;
	let phi = 1.9657;
	
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
	
	let num_sierpinski_iterations = 24;
	
	const scale = 2.0;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [2.1089, .41345, .95325];
	
	let polyhedron_index = 0;
	
	let focal_length = 2;
	
	let light_pos = [[0, 0, 5], [5, 5, 5], [0, 0, 5]];
	
	let n1 = [[-.577350, 0, .816496],  [1, 0, 0], [.707107, 0, .707107]];
	let n2 = [[.288675, -.5, .816496], [0, 1, 0], [0, .707107, .707107]];
	let n3 = [[.288675, .5, .816496],  [0, 0, 1], [-.707107, 0, .707107]];
	let n4 = [[],                      [],        [0, -.707107, .707107]];
	
	let num_ns = [3, 3, 4];
	
	let scale_center = [[0, 0, 1], [.577350, .577350, .577350], [0, 0, 1]];
	
	let rotation_angle_x_1 = 0;
	let rotation_angle_y_1 = 0;
	let rotation_angle_z_1 = 0;
	let rotation_angle_x_2 = 0;
	let rotation_angle_y_2 = 0;
	let rotation_angle_z_2 = 0;
	
	let rotation_angle_x_1_old = 0;
	let rotation_angle_y_1_old = 0;
	let rotation_angle_z_1_old = 0;
	let rotation_angle_x_2_old = 0;
	let rotation_angle_y_2_old = 0;
	let rotation_angle_z_2_old = 0;
	
	let rotation_angle_x_1_delta = 0;
	let rotation_angle_y_1_delta = 0;
	let rotation_angle_z_1_delta = 0;
	let rotation_angle_x_2_delta = 0;
	let rotation_angle_y_2_delta = 0;
	let rotation_angle_z_2_delta = 0;
	
	let parameter_animation_frame = 0;
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", change_resolution);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-kaleidoscopic-ifs-fractal.png");
	});
	
	
	
	let tetrahedron_radio_button_element = document.querySelector("#tetrahedron-radio-button");
	let cube_radio_button_element = document.querySelector("#cube-radio-button");
	let octahedron_radio_button_element = document.querySelector("#octahedron-radio-button");
	
	tetrahedron_radio_button_element.checked = true;
	
	tetrahedron_radio_button_element.addEventListener("input", () =>
	{
		if (polyhedron_index !== 0)
		{
			change_polyhedron(0);
		}
	});
	
	cube_radio_button_element.addEventListener("input", () =>
	{
		if (polyhedron_index !== 1)
		{
			change_polyhedron(1);
		}
	});
	
	octahedron_radio_button_element.addEventListener("input", () =>
	{
		if (polyhedron_index !== 2)
		{
			change_polyhedron(2);
		}
	});
	
	
	
	let rotation_angle_x_1_input_element = document.querySelector("#rotation-angle-x-1-input");
	let rotation_angle_y_1_input_element = document.querySelector("#rotation-angle-y-1-input");
	let rotation_angle_z_1_input_element = document.querySelector("#rotation-angle-z-1-input");
	
	let rotation_angle_x_2_input_element = document.querySelector("#rotation-angle-x-2-input");
	let rotation_angle_y_2_input_element = document.querySelector("#rotation-angle-y-2-input");
	let rotation_angle_z_2_input_element = document.querySelector("#rotation-angle-z-2-input");
	
	let elements = [rotation_angle_x_1_input_element, rotation_angle_y_1_input_element, rotation_angle_z_1_input_element, rotation_angle_x_2_input_element, rotation_angle_y_2_input_element, rotation_angle_z_2_input_element];
	
	for (let i = 0; i < 6; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	
	
	let randomize_parameters_button_element = document.querySelector("#randomize-parameters-button");
	
	randomize_parameters_button_element.addEventListener("click", randomize_parameters);
	
	
	
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
	wilson.gl.uniform3fv(wilson.uniforms["light_pos"], light_pos[polyhedron_index]);
	wilson.gl.uniform3fv(wilson.uniforms["scale_center"], scale_center[polyhedron_index]);
	
	wilson.gl.uniform3fv(wilson.uniforms["forward_vec"], forward_vec);
	wilson.gl.uniform3fv(wilson.uniforms["right_vec"], right_vec);
	wilson.gl.uniform3fv(wilson.uniforms["up_vec"], up_vec);
	
	wilson.gl.uniform1f(wilson.uniforms["focal_length"], focal_length);
	
	wilson.gl.uniform3fv(wilson.uniforms["n1"], n1[polyhedron_index]);
	wilson.gl.uniform3fv(wilson.uniforms["n2"], n2[polyhedron_index]);
	wilson.gl.uniform3fv(wilson.uniforms["n3"], n3[polyhedron_index]);
	wilson.gl.uniform3fv(wilson.uniforms["n4"], n4[polyhedron_index]);
	
	wilson.gl.uniform1i(wilson.uniforms["num_ns"], num_ns[polyhedron_index]);
	
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix_1"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix_2"], false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
	
	
	
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
		
		
		
		if (time_elapsed >= 50)
		{
			next_theta_velocity = 0;
			next_phi_velocity = 0;
			
			theta_velocity = 0;
			phi_velocity = 0;
			
			moving_forward_touch = true;
			moving_backward_touch = false;
			
			move_velocity[0] = 0;
			move_velocity[1] = 0;
			move_velocity[2] = 0;
			
			next_move_velocity[0] = 0;
			next_move_velocity[1] = 0;
			next_move_velocity[2] = 0;
		}
		
		
		
		if (moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch)
		{
			update_camera_parameters();
			
			need_new_frame = true;
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
			camera_pos[0] += move_velocity[0];
			camera_pos[1] += move_velocity[1];
			camera_pos[2] += move_velocity[2];
			
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
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < num_sierpinski_iterations; iteration++)
		{
			//Fold space over on itself so that we can reference only the top vertex.
			let t1 = dot_product([x, y, z], n1[polyhedron_index]);
			
			if (t1 < 0)
			{
				x -= 2 * t1 * n1[polyhedron_index][0];
				y -= 2 * t1 * n1[polyhedron_index][1];
				z -= 2 * t1 * n1[polyhedron_index][2];
			}
			
			let t2 = dot_product([x, y, z], n2[polyhedron_index]);
			
			if (t2 < 0)
			{
				x -= 2 * t2 * n2[polyhedron_index][0];
				y -= 2 * t2 * n2[polyhedron_index][1];
				z -= 2 * t2 * n2[polyhedron_index][2];
			}
			
			let t3 = dot_product([x, y, z], n3[polyhedron_index]);
			
			if (t3 < 0)
			{
				x -= 2 * t3 * n3[polyhedron_index][0];
				y -= 2 * t3 * n3[polyhedron_index][1];
				z -= 2 * t3 * n3[polyhedron_index][2];
			}
			
			if (num_ns[polyhedron_index] >= 4)
			{
				let t4 = dot_product([x, y, z], n4[polyhedron_index]);
				
				if (t4 < 0)
				{
					x -= 2 * t4 * n4[polyhedron_index][0];
					y -= 2 * t4 * n4[polyhedron_index][1];
					z -= 2 * t4 * n4[polyhedron_index][2];
				}
			}
			
			
			
			//Apply the first rotation matrix.
			
			let temp_x = x;
			let temp_y = y;
			let temp_z = z;
			
			let mat_z = [[Math.cos(rotation_angle_z_1), -Math.sin(rotation_angle_z_1), 0], [Math.sin(rotation_angle_z_1), Math.cos(rotation_angle_z_1), 0], [0, 0, 1]];
			let mat_y = [[Math.cos(rotation_angle_y_1), 0, -Math.sin(rotation_angle_y_1)], [0, 1, 0],[Math.sin(rotation_angle_y_1), 0, Math.cos(rotation_angle_y_1)]];
			let mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x_1), -Math.sin(rotation_angle_x_1)], [0, Math.sin(rotation_angle_x_1), Math.cos(rotation_angle_x_1)]];
			
			let mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
			
			x = mat_total[0][0] * temp_x + mat_total[0][1] * temp_y + mat_total[0][2] * temp_z;
			y = mat_total[1][0] * temp_x + mat_total[1][1] * temp_y + mat_total[1][2] * temp_z;
			z = mat_total[2][0] * temp_x + mat_total[2][1] * temp_y + mat_total[2][2] * temp_z;
			
			
			
			//This one takes a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			x = scale * x - (scale - 1) * scale_center[polyhedron_index][0];
			y = scale * y - (scale - 1) * scale_center[polyhedron_index][1];
			z = scale * z - (scale - 1) * scale_center[polyhedron_index][2];
			
			
			
			//Apply the second rotation matrix.
			
			temp_x = x;
			temp_y = y;
			temp_z = z;
			
			mat_z = [[Math.cos(rotation_angle_z_2), -Math.sin(rotation_angle_z_2), 0], [Math.sin(rotation_angle_z_2), Math.cos(rotation_angle_z_2), 0], [0, 0, 1]];
			mat_y = [[Math.cos(rotation_angle_y_2), 0, -Math.sin(rotation_angle_y_2)], [0, 1, 0],[Math.sin(rotation_angle_y_2), 0, Math.cos(rotation_angle_y_2)]];
			mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x_2), -Math.sin(rotation_angle_x_2)], [0, Math.sin(rotation_angle_x_2), Math.cos(rotation_angle_x_2)]];
			
			mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
			
			x = mat_total[0][0] * temp_x + mat_total[0][1] * temp_y + mat_total[0][2] * temp_z;
			y = mat_total[1][0] * temp_x + mat_total[1][1] * temp_y + mat_total[1][2] * temp_z;
			z = mat_total[2][0] * temp_x + mat_total[2][1] * temp_y + mat_total[2][2] * temp_z;
		}
		
		
		
		//So at this point we've scaled up by 2x a total of num_iterations times. The final distance is therefore:
		return Math.sqrt(x*x + y*y + z*z) * Math.pow(scale, -num_sierpinski_iterations);
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
	
	
	
	function randomize_parameters(animate_change = true)
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		rotation_angle_x_1_old = rotation_angle_x_1;
		rotation_angle_y_1_old = rotation_angle_y_1;
		rotation_angle_z_1_old = rotation_angle_z_1;
		rotation_angle_x_2_old = rotation_angle_x_2;
		rotation_angle_y_2_old = rotation_angle_y_2;
		rotation_angle_z_2_old = rotation_angle_z_2;
		
		rotation_angle_x_1_delta = Math.random()*.375 - .1875 - rotation_angle_x_1_old;
		rotation_angle_y_1_delta = Math.random()*.375 - .1875 - rotation_angle_y_1_old;
		rotation_angle_z_1_delta = Math.random()*.75 - .375 - rotation_angle_z_1_old;
		rotation_angle_x_2_delta = Math.random()*.375 - .1875 - rotation_angle_x_2_old;
		rotation_angle_y_2_delta = Math.random()*.375 - .1875 - rotation_angle_y_2_old;
		rotation_angle_z_2_delta = Math.random()*.75 - .375 - rotation_angle_z_2_old;
		
		rotation_angle_x_1_input_element.value = Math.round((rotation_angle_x_1_old + rotation_angle_x_1_delta) * 1000000) / 1000000;
		rotation_angle_y_1_input_element.value = Math.round((rotation_angle_y_1_old + rotation_angle_y_1_delta) * 1000000) / 1000000;
		rotation_angle_z_1_input_element.value = Math.round((rotation_angle_z_1_old + rotation_angle_z_1_delta) * 1000000) / 1000000;
		rotation_angle_x_2_input_element.value = Math.round((rotation_angle_x_2_old + rotation_angle_x_2_delta) * 1000000) / 1000000;
		rotation_angle_y_2_input_element.value = Math.round((rotation_angle_y_2_old + rotation_angle_y_2_delta) * 1000000) / 1000000;
		rotation_angle_z_2_input_element.value = Math.round((rotation_angle_z_2_old + rotation_angle_z_2_delta) * 1000000) / 1000000;
		
		
		
		if (animate_change)
		{
			animate_parameter_change();
		}
		
		else
		{
			rotation_angle_x_1 = rotation_angle_x_1_old + rotation_angle_x_1_delta;
			rotation_angle_y_1 = rotation_angle_y_1_old + rotation_angle_y_1_delta;
			rotation_angle_z_1 = rotation_angle_z_1_old + rotation_angle_z_1_delta;
			rotation_angle_x_2 = rotation_angle_x_2_old + rotation_angle_x_2_delta;
			rotation_angle_y_2 = rotation_angle_y_2_old + rotation_angle_y_2_delta;
			rotation_angle_z_2 = rotation_angle_z_2_old + rotation_angle_z_2_delta;
		}
	}
	
	
	
	function update_parameters()
	{
		rotation_angle_x_1_old = rotation_angle_x_1;
		rotation_angle_y_1_old = rotation_angle_y_1;
		rotation_angle_z_1_old = rotation_angle_z_1;
		rotation_angle_x_2_old = rotation_angle_x_2;
		rotation_angle_y_2_old = rotation_angle_y_2;
		rotation_angle_z_2_old = rotation_angle_z_2;
		
		rotation_angle_x_1_delta = (parseFloat(rotation_angle_x_1_input_element.value || 0) || 0) - rotation_angle_x_1_old;
		rotation_angle_y_1_delta = (parseFloat(rotation_angle_y_1_input_element.value || 0) || 0) - rotation_angle_y_1_old;
		rotation_angle_z_1_delta = (parseFloat(rotation_angle_z_1_input_element.value || 0) || 0) - rotation_angle_z_1_old;
		rotation_angle_x_2_delta = (parseFloat(rotation_angle_x_2_input_element.value || 0) || 0) - rotation_angle_x_2_old;
		rotation_angle_y_2_delta = (parseFloat(rotation_angle_y_2_input_element.value || 0) || 0) - rotation_angle_y_2_old;
		rotation_angle_z_2_delta = (parseFloat(rotation_angle_z_2_input_element.value || 0) || 0) - rotation_angle_z_2_old;
		
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
		
		rotation_angle_x_1 = rotation_angle_x_1_old + rotation_angle_x_1_delta * t;
		rotation_angle_y_1 = rotation_angle_y_1_old + rotation_angle_y_1_delta * t;
		rotation_angle_z_1 = rotation_angle_z_1_old + rotation_angle_z_1_delta * t;
		rotation_angle_x_2 = rotation_angle_x_2_old + rotation_angle_x_2_delta * t;
		rotation_angle_y_2 = rotation_angle_y_2_old + rotation_angle_y_2_delta * t;
		rotation_angle_z_2 = rotation_angle_z_2_old + rotation_angle_z_2_delta * t;
		
		
		
		let mat_z = [[Math.cos(rotation_angle_z_1), -Math.sin(rotation_angle_z_1), 0], [Math.sin(rotation_angle_z_1), Math.cos(rotation_angle_z_1), 0], [0, 0, 1]];
		let mat_y = [[Math.cos(rotation_angle_y_1), 0, -Math.sin(rotation_angle_y_1)], [0, 1, 0],[Math.sin(rotation_angle_y_1), 0, Math.cos(rotation_angle_y_1)]];
		let mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x_1), -Math.sin(rotation_angle_x_1)], [0, Math.sin(rotation_angle_x_1), Math.cos(rotation_angle_x_1)]];
		
		let mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix_1"], false, [mat_total[0][0], mat_total[1][0], mat_total[2][0], mat_total[0][1], mat_total[1][1], mat_total[2][1], mat_total[0][2], mat_total[1][2], mat_total[2][2]]);
		
		
		
		mat_z = [[Math.cos(rotation_angle_z_2), -Math.sin(rotation_angle_z_2), 0], [Math.sin(rotation_angle_z_2), Math.cos(rotation_angle_z_2), 0], [0, 0, 1]];
		mat_y = [[Math.cos(rotation_angle_y_2), 0, -Math.sin(rotation_angle_y_2)], [0, 1, 0],[Math.sin(rotation_angle_y_2), 0, Math.cos(rotation_angle_y_2)]];
		mat_x = [[1, 0, 0], [0, Math.cos(rotation_angle_x_2), -Math.sin(rotation_angle_x_2)], [0, Math.sin(rotation_angle_x_2), Math.cos(rotation_angle_x_2)]];
		
		mat_total = mat_mul(mat_mul(mat_z, mat_y), mat_x);
		
		wilson.gl.uniformMatrix3fv(wilson.uniforms["rotation_matrix_2"], false, [mat_total[0][0], mat_total[1][0], mat_total[2][0], mat_total[0][1], mat_total[1][1], mat_total[2][1], mat_total[0][2], mat_total[1][2], mat_total[2][2]]);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 121)
		{
			currently_animating_parameters = false;
		}
	}
	
	
	
	function change_polyhedron(new_polyhedron_index)
	{
		wilson.canvas.classList.add("animated-opacity");
		
		wilson.canvas.style.opacity = 0;
		
		setTimeout(() =>
		{
			polyhedron_index = new_polyhedron_index;
			
			
			
			wilson.gl.uniform3fv(wilson.uniforms["light_pos"], light_pos[polyhedron_index]);
			
			wilson.gl.uniform3fv(wilson.uniforms["scale_center"], scale_center[polyhedron_index]);
			
			wilson.gl.uniform3fv(wilson.uniforms["n1"], n1[polyhedron_index]);
			wilson.gl.uniform3fv(wilson.uniforms["n2"], n2[polyhedron_index]);
			wilson.gl.uniform3fv(wilson.uniforms["n3"], n3[polyhedron_index]);
			wilson.gl.uniform3fv(wilson.uniforms["n4"], n4[polyhedron_index]);
			
			wilson.gl.uniform1i(wilson.uniforms["num_ns"], num_ns[polyhedron_index]);
			
			
			
			window.requestAnimationFrame(draw_frame);
			
			wilson.canvas.style.opacity = 1;
			
			setTimeout(() =>
			{
				wilson.canvas.classList.remove("animated-opacity");
			});
		}, Site.opacity_animation_time);
	}
}()