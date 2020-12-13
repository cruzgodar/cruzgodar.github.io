!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = document.querySelector("#output-canvas").offsetWidth;
	
	let currently_drawing = false;
	let currently_animating_parameters = false;
	
	let currently_dragging = false;
	
	let mouse_x = 0;
	let mouse_y = 0;
	
	let moving_forward_keyboard = false;
	let moving_backward_keyboard = false;
	let moving_right_keyboard = false;
	let moving_left_keyboard = false;
	
	let moving_forward_touch = false;
	let moving_backward_touch = false;
	
	let moving_speed = 0;
	
	let distance_to_scene = 1;
	
	
	
	let theta = 4.6601;
	let phi = 2.272;
	
	
	
	let image_size = 500;
	let num_iterations = 32;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [.0828, 2.17, 1.8925];
	
	let power = 8;
	let c = [0, 0, 0];
	
	let rotation_angle_x = 0;
	let rotation_angle_y = 0;
	let rotation_angle_z = 0;
	
	let julia_proportion = 0;
	
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
	
	let focal_length = 2;
	
	let light_pos = [0, 0, 5];
	
	let parameter_animation_frame = 0;
	
	
	
	calculate_vectors();
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	document.querySelector("#dim-input").addEventListener("input", change_resolution);
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	
	
	let elements = document.querySelectorAll("#power-input, #rotation-angle-x-input, #rotation-angle-y-input, #rotation-angle-z-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	document.querySelector("#randomize-parameters-button").addEventListener("click", randomize_parameters);
	document.querySelector("#switch-bulb-button").addEventListener("click", switch_bulb);
	
	
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		canvas_size = document.querySelector("#output-canvas").offsetWidth;
	};
	
	set_up_canvas_resizer();
	
	
	
	init_listeners();
	
	
	
	setTimeout(setup_webgl, 500);
	
	
	
	const vertex_shader_source = `
		attribute vec3 position;
		varying vec2 uv;

		void main(void)
		{
			gl_Position = vec4(position, 1.0);

			//Interpolate quad coordinates in the fragment shader.
			uv = position.xy;
		}
	`;
	
	
	
	const frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
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
		const int max_marches = 64; //Change to 512 to eliminate flickering in animations
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .2;
		const int num_iterations = 32;
		
		uniform float power;
		uniform vec3 c;
		uniform float julia_proportion;
		
		vec3 color;
		
		
		
		uniform float rotation_angle_x;
		uniform float rotation_angle_y;
		uniform float rotation_angle_z;
		
		
		
		mat3 rotation_matrix = mat3(
			cos(rotation_angle_z), sin(rotation_angle_z), 0.0,
			-sin(rotation_angle_z), cos(rotation_angle_z), 0.0,
			0.0, 0.0, 1.0
		) * mat3(
			cos(rotation_angle_y), 0.0, sin(rotation_angle_y),
			0.0, 1.0, 0.0,
			-sin(rotation_angle_y), 0.0, cos(rotation_angle_y)
		) * mat3(
			1.0, 0.0, 0.0,
			0.0, cos(rotation_angle_x), sin(rotation_angle_x),
			0.0, -sin(rotation_angle_x), cos(rotation_angle_x)
		);
		
		
		
		float distance_estimator(vec3 pos)
		{
			vec3 z = pos;
			
			float r = 0.0;
			float dr = 1.0;
			
			color = vec3(1.0, 1.0, 1.0);
			float color_scale = .5;
			
			for (int iteration = 0; iteration < num_iterations; iteration++)
			{
				r = length(z);
				
				if (r > 16.0)
				{
					break;
				}
				
				float theta = acos(z.z / r);
				
				float phi = atan(z.y, z.x);
				
				dr = pow(r, power - 1.0) * power * dr + 1.0;
				
				theta = theta * power;
				
				phi = phi * power;
				
				z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
				
				z += (1.0 - julia_proportion) * pos + julia_proportion * c;
				
				z = rotation_matrix * z;
				
				color = (1.0 - color_scale) * color + color_scale * abs(normalize(z));
				
				color_scale *= .5;
			}
			
			float max_color_component = max(max(color.x, color.y), color.z);
			color /= max_color_component;
			
			return .5 * log(r) * r / dr;
		}
		
		
		
		vec3 get_surface_normal(vec3 pos)
		{
			float e = .000001;
			
			float base = distance_estimator(pos);
			
			float x_step = distance_estimator(pos + vec3(e, 0.0, 0.0));
			float y_step = distance_estimator(pos + vec3(0.0, e, 0.0));
			float z_step = distance_estimator(pos + vec3(0.0, 0.0, e));
			
			return normalize(vec3(x_step - base, y_step - base, z_step - base));
		}
		
		
		
		vec3 compute_shading(vec3 pos, int iteration)
		{
			vec3 surface_normal = get_surface_normal(pos);
			
			vec3 light_direction = normalize(light_pos - pos);
			
			float light_intensity = light_brightness * max(dot(surface_normal, light_direction), .25 * dot(surface_normal, -light_direction));
			
			//The last factor adds ambient occlusion.
			color = color * light_intensity * max(1.0 - float(iteration) / float(max_marches), 0.0);
			
			
			
			//Apply fog.
			float distance_from_camera = length(pos - camera_pos);
			
			float fog_amount = 1.0 - exp(-distance_from_camera * fog_scaling);
			
			return (1.0 - fog_amount) * color + fog_amount * fog_color;
		}
		
		
		
		vec3 raymarch(vec3 start_pos)
		{
			//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9;
			
			vec3 final_color = fog_color;
			
			float epsilon = 0.0;
			
			float t = 0.0;
			
			float last_distance = 1000.0;
			
			//int slowed_down = 0;
			
			
			
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
			vec3 final_color = raymarch(image_plane_center_pos + right_vec * uv.x + up_vec * uv.y);
			
			//Uncomment to use 2x antialiasing.
			//vec3 final_color = (raymarch(image_plane_center_pos + right_vec * (uv.x + .5 / float(image_size)) + up_vec * (uv.y + .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x + .5 / float(image_size)) + up_vec * (uv.y - .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x - .5 / float(image_size)) + up_vec * (uv.y + .5 / float(image_size))) + raymarch(image_plane_center_pos + right_vec * (uv.x - .5 / float(image_size)) + up_vec * (uv.y - .5 / float(image_size)))) / 4.0;
			
			gl_FragColor = vec4(final_color.xyz, 1.0);
		}
	`;
	
	
	
	let shader_program = null;
	
	function setup_webgl()
	{
		let vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
		
		let frag_shader = load_shader(gl, gl.FRAGMENT_SHADER, frag_shader_source);
		
		shader_program = gl.createProgram();
		
		gl.attachShader(shader_program, vertex_shader);
		gl.attachShader(shader_program, frag_shader);
		gl.linkProgram(shader_program);
		
		if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS))
		{
			console.log(`Couldn't link shader program: ${gl.getShaderInfoLog(shader)}`);
			gl.deleteProgram(shader_program);
		}
		
		
		
		gl.useProgram(shader_program);
		
		
		
		let quad = [-1, -1, 0,   -1, 1, 0,   1, -1, 0,   1, 1, 0];
		
		
		
		let position_buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad), gl.STATIC_DRAW);
		
		shader_program.position_attribute = gl.getAttribLocation(shader_program, "position");
		
		gl.enableVertexAttribArray(shader_program.position_attribute);
		
		gl.vertexAttribPointer(shader_program.position_attribute, 3, gl.FLOAT, false, 0, 0);
		
		
		
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
		
		shader_program.camera_pos_uniform = gl.getUniformLocation(shader_program, "camera_pos");
		shader_program.image_plane_center_pos_uniform = gl.getUniformLocation(shader_program, "image_plane_center_pos");
		shader_program.forward_vec_uniform = gl.getUniformLocation(shader_program, "forward_vec");
		shader_program.right_vec_uniform = gl.getUniformLocation(shader_program, "right_vec");
		shader_program.up_vec_uniform = gl.getUniformLocation(shader_program, "up_vec");
		
		shader_program.focal_length_uniform = gl.getUniformLocation(shader_program, "focal_length");
		
		shader_program.light_pos_uniform = gl.getUniformLocation(shader_program, "light_pos");
		
		shader_program.power_uniform = gl.getUniformLocation(shader_program, "power");
		shader_program.c_uniform = gl.getUniformLocation(shader_program, "c");
		
		shader_program.rotation_angle_x_uniform = gl.getUniformLocation(shader_program, "rotation_angle_x");
		shader_program.rotation_angle_y_uniform = gl.getUniformLocation(shader_program, "rotation_angle_y");
		shader_program.rotation_angle_z_uniform = gl.getUniformLocation(shader_program, "rotation_angle_z");
		
		shader_program.julia_proportion_uniform = gl.getUniformLocation(shader_program, "julia_proportion");
		
		
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function load_shader(gl, type, source)
	{
		let shader = gl.createShader(type);
		
		gl.shaderSource(shader, source);
		
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			console.log(`Couldn't load shader: ${gl.getProgramInfoLog(shaderProgram)}`);
			gl.deleteShader(shader);
		}
		
		return shader;
	}
	
	
	
	function draw_frame()
	{
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		gl.uniform3fv(shader_program.camera_pos_uniform, camera_pos);
		gl.uniform3fv(shader_program.image_plane_center_pos_uniform, image_plane_center_pos);
		gl.uniform3fv(shader_program.forward_vec_uniform, forward_vec);
		gl.uniform3fv(shader_program.right_vec_uniform, right_vec);
		gl.uniform3fv(shader_program.up_vec_uniform, up_vec);
		
		gl.uniform1f(shader_program.focal_length_uniform, focal_length);
		
		gl.uniform3fv(shader_program.light_pos_uniform, light_pos);
		
		gl.uniform1f(shader_program.power_uniform, power);
		gl.uniform3fv(shader_program.c_uniform, c);
		
		gl.uniform1f(shader_program.rotation_angle_x_uniform, rotation_angle_x);
		gl.uniform1f(shader_program.rotation_angle_y_uniform, rotation_angle_y);
		gl.uniform1f(shader_program.rotation_angle_z_uniform, rotation_angle_z);
		
		gl.uniform1f(shader_program.julia_proportion_uniform, julia_proportion);
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		//Uncomment to write to a sequence of frames for a Juliabulb animation.
		/*
		let link = document.createElement("a");
		
		link.download = `${frame}.png`;
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		c = [.5 * (Math.cos(2 * Math.PI * frame / 6000) + Math.sin(5 * 2 * Math.PI * frame / 6000)), .5 * (Math.cos(2 * 2 * Math.PI * frame / 6000) + Math.sin(7 * 2 * Math.PI * frame / 6000)), .5 * (Math.cos(3 * 2 * Math.PI * frame / 6000) + Math.sin(11 * 2 * Math.PI * frame / 6000))];
		
		julia_proportion = 1;
		
		frame++;
		
		setTimeout(function()
		{
			window.requestAnimationFrame(draw_frame);
		}, 100);
		
		return;
		*/
		
		
		
		if (currently_animating_parameters)
		{
			animate_parameter_change_step();
			
			window.requestAnimationFrame(draw_frame);
		}
		
		else if (currently_drawing)
		{
			update_camera_parameters();
			
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
			mat1[0][0]*mat2[0][2] + mat1[0][1]*mat2[1][2] + mat1[0][2]*mat2[2][2]
			], [
			mat1[1][0]*mat2[0][0] + mat1[1][1]*mat2[1][0] + mat1[1][2]*mat2[2][0],
			mat1[1][0]*mat2[0][1] + mat1[1][1]*mat2[1][1] + mat1[1][2]*mat2[2][1],
			mat1[1][0]*mat2[0][2] + mat1[1][1]*mat2[1][2] + mat1[1][2]*mat2[2][2]
			], [
			mat1[2][0]*mat2[0][0] + mat1[2][1]*mat2[1][0] + mat1[2][2]*mat2[2][0],
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
		
		for (let iteration = 0; iteration < num_iterations; iteration++)
		{
			r = Math.sqrt(dot_product(mutable_z, mutable_z));
			
			if (r > 10.0)
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
	
	
	
	function init_listeners()
	{
		document.querySelector("#output-canvas").addEventListener("mousedown", function(e)
		{
			currently_dragging = true;
			
			mouse_x = e.clientX;
			mouse_y = e.clientY;
			
			if (!currently_drawing && !currently_animating_parameters)
			{
				currently_drawing = true;
				window.requestAnimationFrame(draw_frame);
			}
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("mousemove", function(e)
		{
			if (currently_dragging)
			{
				e.preventDefault();
				
				
				
				let new_mouse_x = e.clientX;
				let new_mouse_y = e.clientY;
				
				let mouse_x_delta = new_mouse_x - mouse_x;
				let mouse_y_delta = new_mouse_y - mouse_y;
				
				
				
				theta += mouse_x_delta / canvas_size * Math.PI;
				
				if (theta >= 2 * Math.PI)
				{
					theta -= 2 * Math.PI;
				}
				
				else if (theta < 0)
				{
					theta += 2 * Math.PI;
				}
				
				
				
				phi -= mouse_y_delta / canvas_size * Math.PI;
				
				if (phi > Math.PI - .01)
				{
					phi = Math.PI - .01;
				}
				
				else if (phi < .01)
				{
					phi = .01;
				}
				
				
				
				mouse_x = new_mouse_x;
				mouse_y = new_mouse_y;
				
				
				
				calculate_vectors();
			}
		});
		
		
		
		document.documentElement.addEventListener("mouseup", function(e)
		{
			currently_dragging = false;
			
			currently_drawing = currently_dragging || moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch;
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchstart", function(e)
		{
			currently_dragging = true;
			
			mouse_x = e.touches[0].clientX;
			mouse_y = e.touches[0].clientY;
			
			if (e.touches.length === 2)
			{
				moving_forward_touch = true;
				moving_backward_touch = false;
			}
			
			else if (e.touches.length === 3)
			{
				moving_backward_touch = true;
				moving_forward_touch = false;
			}
			
			
			
			if (!currently_drawing && !currently_animating_parameters)
			{
				currently_drawing = true;
				window.requestAnimationFrame(draw_frame);
			}
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
			
			
			
			let new_mouse_x = e.touches[0].clientX;
			let new_mouse_y = e.touches[0].clientY;
			
			let mouse_x_delta = new_mouse_x - mouse_x;
			let mouse_y_delta = new_mouse_y - mouse_y;
			
			if (Math.abs(mouse_x_delta) > 20 || Math.abs(mouse_y_delta) > 20)
			{
				return;
			}
			
			
			
			theta += mouse_x_delta / canvas_size * Math.PI;
			
			if (theta >= 2 * Math.PI)
			{
				theta -= 2 * Math.PI;
			}
			
			else if (theta < 0)
			{
				theta += 2 * Math.PI;
			}
			
			
			
			phi -= mouse_y_delta / canvas_size * Math.PI;
			
			if (phi > Math.PI - .01)
			{
				phi = Math.PI - .01;
			}
			
			else if (phi < .01)
			{
				phi = .01;
			}
			
			
			
			mouse_x = new_mouse_x;
			mouse_y = new_mouse_y;
			
			
			
			calculate_vectors();
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchend", function(e)
		{
			if (e.touches.length === 2)
			{
				moving_forward_touch = true;
				moving_backward_touch = false;
			}
			
			else if (e.touches.length === 3)
			{
				moving_backward_touch = true;
				moving_forward_touch = false;
			}
			
			else
			{
				moving_forward_touch = false;
				moving_backward_touch = false;
				
				if (e.touches.length === 0)
				{
					currently_dragging = false;
				}
			}
			
			
			
			currently_drawing = currently_dragging || moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch;
		});



		document.documentElement.addEventListener("keydown", function(e)
		{
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
			
			
			
			if (!currently_drawing && !currently_animating_parameters)
			{
				currently_drawing = true;
				window.requestAnimationFrame(draw_frame);
			}
		});
		
		
		
		document.documentElement.addEventListener("keyup", function(e)
		{
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
			
			
			currently_drawing = currently_dragging || moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch;
		});
	}
	
	
	
	function update_camera_parameters()
	{
		if (moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch)
		{
			moving_speed = distance_to_scene / 20;
			
			if (moving_speed < .000001)
			{
				moving_speed = .000001;
			}
			
			if (moving_speed > .02)
			{
				moving_speed = .02;
			}
			
			
			
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
		
		
		
			calculate_vectors();
		}
	}
	
	
	
	function fractals_resize()
	{
		canvas_size = document.querySelector("#output-canvas").offsetWidth;
	}
	
	
	
	function change_resolution()
	{
		image_size = parseInt(document.querySelector("#dim-input").value || 500);
		
		if (image_size < 200)
		{
			image_size = 200;
		}
		
		if (image_size > 2000)
		{
			image_size = 2000;
		}
		
		
		
		gl.uniform1i(shader_program.small_image_size_uniform, image_size);
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function update_parameters()
	{
		power_old = power;
		power_delta = parseFloat(document.querySelector("#power-input").value || 8) - power_old;
		
		if (power_old + power_delta < 1)
		{
			power_delta = 0;
		}
		
		
		
		rotation_angle_x_old = rotation_angle_x;
		rotation_angle_y_old = rotation_angle_y;
		rotation_angle_z_old = rotation_angle_z;
		
		rotation_angle_x_delta = parseFloat(document.querySelector("#rotation-angle-x-input").value || 0) - rotation_angle_x_old;
		rotation_angle_y_delta = parseFloat(document.querySelector("#rotation-angle-y-input").value || 0) - rotation_angle_y_old;
		rotation_angle_z_delta = parseFloat(document.querySelector("#rotation-angle-z-input").value || 0) - rotation_angle_z_old;
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 0;
		
		animate_parameter_change();
	}
	
	
	
	function switch_bulb()
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		document.querySelector("#switch-bulb-button").style.opacity = 0;
		
		setTimeout(function()
		{
			if (julia_proportion_old === 0)
			{
				document.querySelector("#switch-bulb-button").textContent = "Switch to Mandelbulb";
			}
			
			else
			{
				document.querySelector("#switch-bulb-button").textContent = "Switch to Juliabulb";
			}
			
			document.querySelector("#switch-bulb-button").style.opacity = 1;
		}, 300);
		
		
		
		if (julia_proportion === 0)
		{
			c = [...camera_pos];
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
		
		animate_parameter_change();
	}
	
	
	
	function randomize_parameters(animate_change = true)
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
		
		document.querySelector("#rotation-angle-x-input").value = Math.round((rotation_angle_x_old + rotation_angle_x_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-y-input").value = Math.round((rotation_angle_y_old + rotation_angle_y_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-z-input").value = Math.round((rotation_angle_z_old + rotation_angle_z_delta) * 1000000) / 1000000;
		
		
		
		julia_proportion_old = julia_proportion;
		julia_proportion_delta = 0;
		
		power_old = power;
		power_delta = 0;
		
		
		
		animate_parameter_change();
	}
	
	
	
	function animate_parameter_change()
	{
		currently_animating_parameters = true;
		
		parameter_animation_frame = 0;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function animate_parameter_change_step()
	{
		let t = .5 * Math.sin(Math.PI * parameter_animation_frame / 120 - Math.PI / 2) + .5;
		
		power = power_old + power_delta * t;
		julia_proportion = julia_proportion_old + julia_proportion_delta * t;
		
		rotation_angle_x = rotation_angle_x_old + rotation_angle_x_delta * t;
		rotation_angle_y = rotation_angle_y_old + rotation_angle_y_delta * t;
		rotation_angle_z = rotation_angle_z_old + rotation_angle_z_delta * t;
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 121)
		{
			currently_animating_parameters = false;
		}
	}
	
	
	
	function prepare_download()
	{
		let temp = image_size;
		
		image_size = parseInt(document.querySelector("#high-res-dim-input").value || 2000);
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
		
		
		
		let link = document.createElement("a");
		
		if (julia_proportion === 0)
		{
			link.download = "the-mandelbulb.png";
		}
		
		else
		{
			link.download = "a-juliabulb.png";
		}
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		image_size = temp;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
	}
}()