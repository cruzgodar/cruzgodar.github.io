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
		const float light_brightness = 3.0;
		
		uniform int image_size;
		
		
		
		const float clip_distance = 100.0;
		const int max_marches = 100; //Change to 512 to eliminate flickering in animations
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .1;
		const int num_iterations = 32;
		
		
		
		uniform float klein_r;
		uniform float klein_i;
		
		uniform float box_size;
		
		const vec3 inversion_center = vec3(0.0, 0.0, 0.0);
		const vec3 re_center = vec3(0.0, 0.0, 0.0);
		const float inversion_radius = 1.0;
		
		uniform float rotate_factor;
		
		
		
		vec3 color;
		
		
		
		vec2 wrap(vec2 x, vec2 a, vec2 s)
		{
			x -= s; 
			
			return (x - a * floor(x / a)) + s;
		}
		
		
		
		void trans_a(inout vec3 z, inout float DF, float a, float b)
		{
			float iR = 1.0 / dot(z, z);
			z *= -iR;
			z.x = -b - z.x;
			z.y = a + z.y; 
			DF *= iR;
		}
		
		
		
		float jos_kleinian(vec3 z)
		{
			vec3 lz = z + vec3(1.0), llz = z + vec3(-1.0);
			
			float DE = 1000.0;
			float DF = 1.0;
			
			float a = klein_r, b = klein_i;
			
			float f = sign(b);
			
			color = vec3(1.0, 1.0, 1.0);
			float color_scale = .5;
			
			
			
			for (int i = 0; i < num_iterations; i++) 
			{
				z.x = z.x + b / a * z.y;
				
				z.xz = wrap(z.xz, vec2(2.0 * box_size, 2.0 * box_size), vec2(-box_size, -box_size));
				
				z.x = z.x - b / a * z.y;

				//If above the separation line, rotate by 180 deg about (-b/2, a/2)
				if (z.y >= a * (0.5 + f * 0.25 * sign(z.x + b * 0.5) * (1.0 - exp(-rotate_factor * abs(z.x + b * 0.5)))))
				{
					z = vec3(-b, a, 0.0) - z;
					//z.xy = vec2(-b, a) - z.xy;
				}
				
				

				//Apply transformation a
				trans_a(z, DF, a, b);
				
				if (dot(z - llz, z - llz) < .0000001)
				{
					break;
				}
				
				llz = lz;
				lz = z;
				
				
				
				color = mix(color, abs(z), color_scale);
				
				color_scale *= .5;
			}
			
			
			
			for (int i = 0; i < 5; i++)
			{
				float y = min(z.y, a - z.y);
				
				DE = min(DE, min(y, 1.0) / max(DF, 1.0));
				
				trans_a(z, DF, a, b);
			}
			
			

			float y = min(z.y, a - z.y);

			DE = min(DE, min(y, 1.0) / max(DF, 1.0));
			
			
			
			color /= max(max(color.x, color.y), color.z);
			
			

			return DE;
		}




		float distance_estimator(vec3 pos)
		{
			vec3 p = pos.xzy;
			
			return jos_kleinian(p);
		}
		
		
		
		vec3 get_surface_normal(vec3 pos)
		{
			float base = distance_estimator(pos);
			
			float x_step = distance_estimator(pos + vec3(.0001, 0.0, 0.0));
			float y_step = distance_estimator(pos + vec3(0.0, .0001, 0.0));
			float z_step = distance_estimator(pos + vec3(0.0, 0.0, .0001));
			
			return normalize(vec3(x_step - base, y_step - base, z_step - base));
		}
		
		
		
		vec3 compute_shading(vec3 pos, int iteration)
		{
			vec3 surface_normal = get_surface_normal(pos);
			
			vec3 light_direction = normalize(light_pos - pos);
			
			float dot_product = dot(surface_normal, light_direction);
			
			float light_intensity = light_brightness * max(dot_product, -.25 * dot_product);
			
			//The last factor adds ambient occlusion.
			color = color * light_intensity * max(1.0 - float(iteration) / float(max_marches), 0.0);
			
			
			
			//Apply fog.
			float distance_from_camera = distance(pos, camera_pos);
			
			float fog_amount = 1.0 - exp(-distance_from_camera * fog_scaling);
			
			return mix(color, fog_color, fog_amount);
		}
		
		
		
		vec3 raymarch(vec3 start_pos)
		{
			//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9;
			
			vec3 final_color = fog_color;
			
			float epsilon = 0.0;
			
			float t = 0.0;
			
			float last_distance = 1000.0;
			
			int slowed_down = 0;
			
			
			
			for (int iteration = 0; iteration < max_marches; iteration++)
			{
				vec3 pos = start_pos + t * ray_direction_vec;
				
				//This prevents overstepping, and is honestly a pretty clever fix.
				float distance = min(distance_estimator(pos), last_distance);
				last_distance = distance;
				
				//This lowers the detail far away, which makes everything run nice and fast.
				if (distance / float(image_size) * 1.5 > epsilon)
				{
					epsilon = distance / float(image_size) * 1.5;
				}
				
				
				
				if (distance < epsilon)
				{
					final_color = compute_shading(pos, iteration);
					break;
				}
				
				else if (last_distance / distance > .9999 && slowed_down == 0)
				{
					ray_direction_vec = normalize(start_pos - camera_pos) * .1;
					
					slowed_down = 1;
				}
				
				else if (last_distance / distance <= .9999 && slowed_down == 1)
				{
					ray_direction_vec = normalize(start_pos - camera_pos) * .9;
					
					slowed_down = 0;
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
	
	wilson.render.init_uniforms(["aspect_ratio_x", "aspect_ratio_y", "camera_pos", "image_plane_center_pos", "forward_vec", "right_vec", "up_vec", "focal_length", "light_pos", "image_size", "klein_r", "klein_i", "box_size", "rotate_factor"]);
	
	
	
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
	let last_distance_to_scene = 1;
	
	let last_timestamp = -1;
	
	
	
	let theta = Math.PI / 2;
	let phi = Math.PI / 2;
	
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
	
	let num_iterations = 48;
	
	let max_marches = 100;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [3.98, .25, .95];
	
	
	
	let klein_r = 1.902;
	let klein_i = .042;
	
	let box_size = 1.0;
	
	let rotate_factor = 6.0;
	
	let klein_r_old = 1.902;
	let klein_r_delta = 1.902;
	let klein_i_old = .042;
	let klein_i_delta = .042;
	
	let box_size_old = 1.0;
	let box_size_delta = 1.0;
	
	
	
	let focal_length = 2;
	
	let light_pos = [0, 0, 5];
	
	let parameter_animation_frame = 0;
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	let klein_r_input_element = document.querySelector("#klein-r-input");
	
	let klein_i_input_element = document.querySelector("#klein-i-input");
	
	let box_size_input_element = document.querySelector("#box-size-input");
	
	let elements = [resolution_input_element, klein_r_input_element, klein_i_input_element, box_size_input_element];
	
	for (let i = 0; i < 4; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	
	let randomize_parameters_button_element = document.querySelector("#randomize-parameters-button");
	
	randomize_parameters_button_element.addEventListener("click", randomize_parameters);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		if (julia_proportion === 0)
		{	
			wilson.download_frame("the-mandelbulb.png");
		}
		
		else
		{
			wilson.download_frame("a-juliabulb.png");
		}
	});
	
	
	
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
	
	wilson.gl.uniform1f(wilson.uniforms["klein_r"], klein_r);
	wilson.gl.uniform1f(wilson.uniforms["klein_i"], klein_i);
	
	wilson.gl.uniform1f(wilson.uniforms["box_size"], box_size);
	wilson.gl.uniform1f(wilson.uniforms["rotate_factor"], rotate_factor);
	
	
	
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
		
		
		
		focal_length = distance_to_scene / 20;
		
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
		let mutable_z = [x, z, y];
		
		let lz = [mutable_z[0] + 1, mutable_z[1] + 1, mutable_z[2] + 1];
		let llz = [mutable_z[0] - 1, mutable_z[1] - 1, mutable_z[2] - 1];
		
		let DE = 1000;
		let DF = 1;
		
		let a = klein_r;
		let b = klein_i;
		
		let f = Math.sign(b);
		
		
		
		for (let i = 0; i < num_iterations; i++) 
		{
			mutable_z[0] = mutable_z[0] + b / a * mutable_z[1];
			
			
			
			//z.xz = wrap(z.xz, vec2(2.0 * box_size, 2.0 * box_size), vec2(-box_size, -box_size));
			mutable_z[0] += box_size;
			mutable_z[2] += box_size;
			
			mutable_z[0] = mutable_z[0] - 2 * box_size * Math.floor(mutable_z[0] / (2 * box_size)) - box_size;
			mutable_z[2] = mutable_z[2] - 2 * box_size * Math.floor(mutable_z[2] / (2 * box_size)) - box_size;
			
			
			
			mutable_z[0] = mutable_z[0] - b / a * mutable_z[1];

			//If above the separation line, rotate by 180 deg about (-b/2, a/2)
			if (mutable_z[1] >= a * (0.5 + f * 0.25 * Math.sign(mutable_z[0] + b * 0.5) * (1.0 - Math.exp(-rotate_factor * Math.abs(mutable_z[0] + b * 0.5)))))
			{
				//z = vec3(-b, a, 0.0) - z;
				mutable_z[0] = -b - mutable_z[0];
				mutable_z[1] = a - mutable_z[1];
				mutable_z[2] = -mutable_z[2];
			}
			
			
			
			//trans_a(z, DF, a, b);
			let iR = 1.0 / dot_product(mutable_z, mutable_z);
			
			mutable_z[0] *= -iR;
			mutable_z[1] *= -iR;
			mutable_z[2] *= -iR;
			
			mutable_z[0] = -b - mutable_z[0];
			mutable_z[1] = a + mutable_z[1];
			
			DF *= iR;
			
			
			
			if ((mutable_z[0] - llz[0])*(mutable_z[0] - llz[0]) + (mutable_z[1] - llz[1])*(mutable_z[1] - llz[1]) + (mutable_z[2] - llz[2])*(mutable_z[2] - llz[2]) < .0000001)
			{
				break;
			}
			
			llz[0] = lz[0];
			llz[1] = lz[1];
			llz[2] = lz[2];
			
			lz[0] = mutable_z[0];
			lz[1] = mutable_z[1];
			lz[2] = mutable_z[2];
		}
		
		
		
		for (let i = 0; i < 5; i++)
		{
			let y_2 = Math.min(mutable_z[1], a - mutable_z[1]);
			
			DE = Math.min(DE, Math.min(y_2, 1.0) / Math.max(DF, 1.0));
			
			
			
			let iR = 1.0 / dot_product(mutable_z, mutable_z);
			
			mutable_z[0] *= -iR;
			mutable_z[1] *= -iR;
			mutable_z[2] *= -iR;
			
			mutable_z[0] = -b - mutable_z[0];
			mutable_z[1] = a + mutable_z[1];
			
			DF *= iR;
		}
		
		

		let y_2 = Math.min(mutable_z[1], a - mutable_z[1]);
		
		DE = Math.min(DE, Math.min(y_2, 1.0) / Math.max(DF, 1.0));

		return DE;
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
		moving_speed = Math.min(Math.max(.000002, distance_to_scene / 50), .02);
		
		
		
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
		//image_size = Math.max(100, parseInt(resolution_input_element.value || 500));
		
		
		
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
	
	
	
	function update_parameters()
	{
		klein_r_old = klein_r;
		klein_r_delta = (parseFloat(klein_r_input_element.value || 2) || 2) - klein_r_old;
		
		klein_i_old = klein_i;
		klein_i_delta = (parseFloat(klein_i_input_element.value || 0) || 0) - klein_i_old;
		
		box_size_old = box_size;
		box_size_delta = (parseFloat(box_size_input_element.value || 1) || 1) - box_size_old;
		
		
		
		animate_parameter_change();
	}
	
	
	
	function randomize_parameters(animate_change = true)
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		klein_r_old = klein_r;
		klein_r_delta = Math.random()*.1 - .075 + 2 - klein_r_old;
		
		klein_i_old = klein_i;
		klein_i_delta = Math.random()*.1 - .05 - klein_i_old;
		
		box_size_old = box_size;
		box_size_delta = Math.random()*.2 - .1 + 1 - box_size_old;
		
		
		
		klein_r_input_element.value = Math.round((klein_r_old + klein_r_delta) * 1000000) / 1000000;
		klein_i_input_element.value = Math.round((klein_i_old + klein_i_delta) * 1000000) / 1000000;
		box_size_input_element.value = Math.round((box_size_old + box_size_delta) * 1000000) / 1000000;
		
		
		
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
		
		klein_r = klein_r_old + klein_r_delta * t;
		klein_i = klein_i_old + klein_i_delta * t;
		
		box_size = box_size_old + box_size_delta * t;
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["klein_r"], klein_r);
		wilson.gl.uniform1f(wilson.uniforms["klein_i"], klein_i);
		
		wilson.gl.uniform1f(wilson.uniforms["box_size"], box_size);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 121)
		{
			currently_animating_parameters = false;
		}
	}
}()