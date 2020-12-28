!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = Math.min(document.querySelector("#output-canvas").offsetWidth, document.querySelector("#output-canvas").offsetHeight);
	
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
	
	
	
	let theta = 3.2954;
	let phi = 1.9657;
	
	
	
	let image_size = 500;
	let image_width = 500;
	let image_height = 500;
	
	let num_sierpinski_iterations = 16;
	
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
	
	let min_scale_factor = [1.333, 1.333, 1.333];
	
	let num_ns = [3, 3, 4];
	
	let scale_center = [[0, 0, 1], [.577350, .577350, .577350], [0, 0, 1]];
	
	let scale = 2;
	let scale_old = 2;
	let scale_delta = 0;
	
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
	
	
	
	calculate_vectors();
	
	
	
	document.querySelector("#tetrahedron-radio-button").checked = true;
	
	document.querySelector("#output-canvas").setAttribute("width", image_width);
	document.querySelector("#output-canvas").setAttribute("height", image_height);
	
	document.querySelector("#dim-input").addEventListener("input", change_resolution);
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	document.querySelector("#tetrahedron-radio-button").addEventListener("input", function()
	{
		if (polyhedron_index !== 0)
		{
			change_polyhedron(0);
		}
	});
	
	document.querySelector("#cube-radio-button").addEventListener("input", function()
	{
		if (polyhedron_index !== 1)
		{
			change_polyhedron(1);
		}
	});
	
	document.querySelector("#octahedron-radio-button").addEventListener("input", function()
	{
		if (polyhedron_index !== 2)
		{
			change_polyhedron(2);
		}
	});
	
	
	
	let elements = document.querySelectorAll("#scale-input, #rotation-angle-x-1-input, #rotation-angle-y-1-input, #rotation-angle-z-1-input, #rotation-angle-x-2-input, #rotation-angle-y-2-input, #rotation-angle-z-2-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	document.querySelector("#randomize-parameters-button").addEventListener("click", randomize_parameters);
	
	
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	init_listeners();
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		if (canvas_is_fullscreen)
		{
			if (aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * aspect_ratio);
				image_height = image_size;
			}
		}
		
		else
		{
			image_width = image_size;
			image_height = image_size;
		}
		
		
		
		canvas_size = Math.min(document.querySelector("#output-canvas").offsetWidth, document.querySelector("#output-canvas").offsetHeight);
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		gl.viewport(0, 0, image_width, image_height);
		
		
		
		
		fractals_resize();
		
		window.requestAnimationFrame(draw_frame);
	};
	
	applet_canvas_true_fullscreen = true;
	
	set_up_canvas_resizer();
	
	
	
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
		
		uniform float aspect_ratio;
		
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
		const int num_sierpinski_iterations = 16;
		
		
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
		
		uniform float min_scale_factor;
		
		
		
		uniform float rotation_angle_x_1;
		uniform float rotation_angle_y_1;
		uniform float rotation_angle_z_1;
		uniform float rotation_angle_x_2;
		uniform float rotation_angle_y_2;
		uniform float rotation_angle_z_2;
		
		uniform float scale;
		
		
		
		mat3 rotation_matrix_1 = mat3(
			cos(rotation_angle_z_1), sin(rotation_angle_z_1), 0.0,
			-sin(rotation_angle_z_1), cos(rotation_angle_z_1), 0.0,
			0.0, 0.0, 1.0
		) * mat3(
			cos(rotation_angle_y_1), 0.0, sin(rotation_angle_y_1),
			0.0, 1.0, 0.0,
			-sin(rotation_angle_y_1), 0.0, cos(rotation_angle_y_1)
		) * mat3(
			1.0, 0.0, 0.0,
			0.0, cos(rotation_angle_x_1), sin(rotation_angle_x_1),
			0.0, -sin(rotation_angle_x_1), cos(rotation_angle_x_1)
		);
		
		mat3 rotation_matrix_2 = mat3(
			cos(rotation_angle_z_2), sin(rotation_angle_z_2), 0.0,
			-sin(rotation_angle_z_2), cos(rotation_angle_z_2), 0.0,
			0.0, 0.0, 1.0
		) * mat3(
			cos(rotation_angle_y_2), 0.0, sin(rotation_angle_y_2),
			0.0, 1.0, 0.0,
			-sin(rotation_angle_y_2), 0.0, cos(rotation_angle_y_2)
		) * mat3(
			1.0, 0.0, 0.0,
			0.0, cos(rotation_angle_x_2), sin(rotation_angle_x_2),
			0.0, -sin(rotation_angle_x_2), cos(rotation_angle_x_2)
		);
		
		
		
		float distance_estimator(vec3 pos)
		{
			vec3 mutable_pos = pos;
			
			color = vec3(1.0, 1.0, 1.0);
			float color_scale = .5;
			
			
			
			//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
			for (int iteration = 0; iteration < num_sierpinski_iterations; iteration++)
			{
				
				//Fold space over on itself so that we can reference only the top vertex.
				float t1 = dot(mutable_pos, n1);
				
				if (t1 < 0.0)
				{
					mutable_pos -= 2.0 * t1 * n1;
					
					color = (1.0 - color_scale) * color + color_scale * color_1;
				}
				
				float t2 = dot(mutable_pos, n2);
				
				if (t2 < 0.0)
				{
					mutable_pos -= 2.0 * t2 * n2;
					
					color = (1.0 - color_scale) * color + color_scale * color_2;
				}
				
				float t3 = dot(mutable_pos, n3);
				
				if (t3 < 0.0)
				{
					mutable_pos -= 2.0 * t3 * n3;
					
					color = (1.0 - color_scale) * color + color_scale * color_3;
				}
				
				if (num_ns >= 4)
				{
					float t4 = dot(mutable_pos, n4);
					
					if (t4 < 0.0)
					{
						mutable_pos -= 2.0 * t4 * n4;
						
						color = (1.0 - color_scale) * color + color_scale * color_4;
					}
				}
				
				
				
				mutable_pos = rotation_matrix_1 * mutable_pos;
				
				
				
				//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
				mutable_pos = scale*mutable_pos - (scale - 1.0)*scale_center;
				
				
				
				mutable_pos = rotation_matrix_2 * mutable_pos;
				
				
				
				color_scale *= .5;
			}
			
			return length(mutable_pos) * pow(1.0/scale, float(num_sierpinski_iterations));
		}
		
		
		
		vec3 get_surface_normal(vec3 pos)
		{
			float e = .00001;
			
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
			color = color * light_intensity * max((1.0 - float(iteration) / float(max_marches)), 0.0);
			
			
			
			//Apply fog.
			float distance_from_camera = length(pos - camera_pos);
			
			float fog_amount = 1.0 - exp(-distance_from_camera * fog_scaling);
			
			return (1.0 - fog_amount) * color + fog_amount * fog_color;
		}
		
		
		
		void main(void)
		{
			vec3 start_pos = image_plane_center_pos + right_vec * uv.x * aspect_ratio + up_vec * uv.y;
			
			//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9;
			
			vec3 final_color = fog_color;
			
			float normalized_scale = scale - min_scale_factor;
			
			float epsilon = 1.0 / (normalized_scale * normalized_scale) * .00001;
			
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
		
		
		
		shader_program.aspect_ratio_uniform = gl.getUniformLocation(shader_program, "aspect_ratio");
		
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
		
		shader_program.camera_pos_uniform = gl.getUniformLocation(shader_program, "camera_pos");
		shader_program.image_plane_center_pos_uniform = gl.getUniformLocation(shader_program, "image_plane_center_pos");
		shader_program.forward_vec_uniform = gl.getUniformLocation(shader_program, "forward_vec");
		shader_program.right_vec_uniform = gl.getUniformLocation(shader_program, "right_vec");
		shader_program.up_vec_uniform = gl.getUniformLocation(shader_program, "up_vec");
		
		shader_program.focal_length_uniform = gl.getUniformLocation(shader_program, "focal_length");
		
		shader_program.light_pos_uniform = gl.getUniformLocation(shader_program, "light_pos");
		
		shader_program.scale_center_uniform = gl.getUniformLocation(shader_program, "scale_center");
		
		shader_program.n1_uniform = gl.getUniformLocation(shader_program, "n1");
		shader_program.n2_uniform = gl.getUniformLocation(shader_program, "n2");
		shader_program.n3_uniform = gl.getUniformLocation(shader_program, "n3");
		shader_program.n4_uniform = gl.getUniformLocation(shader_program, "n4");
		
		shader_program.min_scale_factor_uniform = gl.getUniformLocation(shader_program, "min_scale_factor");
		
		shader_program.num_ns_uniform = gl.getUniformLocation(shader_program, "num_ns");
		
		shader_program.scale_uniform = gl.getUniformLocation(shader_program, "scale");
		
		shader_program.rotation_angle_x_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_x_1");
		shader_program.rotation_angle_y_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_y_1");
		shader_program.rotation_angle_z_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_z_1");
		shader_program.rotation_angle_x_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_x_2");
		shader_program.rotation_angle_y_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_y_2");
		shader_program.rotation_angle_z_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_z_2");
		
		
		
		gl.viewport(0, 0, image_width, image_height);
		
		
		
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
		gl.uniform1f(shader_program.aspect_ratio_uniform, image_width / image_height);
		
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		gl.uniform3fv(shader_program.camera_pos_uniform, camera_pos);
		gl.uniform3fv(shader_program.image_plane_center_pos_uniform, image_plane_center_pos);
		gl.uniform3fv(shader_program.forward_vec_uniform, forward_vec);
		gl.uniform3fv(shader_program.right_vec_uniform, right_vec);
		gl.uniform3fv(shader_program.up_vec_uniform, up_vec);
		
		gl.uniform1f(shader_program.focal_length_uniform, focal_length);
		
		gl.uniform3fv(shader_program.light_pos_uniform, light_pos[polyhedron_index]);
		
		gl.uniform3fv(shader_program.scale_center_uniform, scale_center[polyhedron_index]);
		
		gl.uniform3fv(shader_program.n1_uniform, n1[polyhedron_index]);
		gl.uniform3fv(shader_program.n2_uniform, n2[polyhedron_index]);
		gl.uniform3fv(shader_program.n3_uniform, n3[polyhedron_index]);
		gl.uniform3fv(shader_program.n4_uniform, n4[polyhedron_index]);
		
		gl.uniform1f(shader_program.min_scale_factor_uniform, min_scale_factor[polyhedron_index]);
		
		gl.uniform1i(shader_program.num_ns_uniform, num_ns[polyhedron_index]);
		
		gl.uniform1f(shader_program.scale_uniform, scale);
		
		gl.uniform1f(shader_program.rotation_angle_x_1_uniform, rotation_angle_x_1);
		gl.uniform1f(shader_program.rotation_angle_y_1_uniform, rotation_angle_y_1);
		gl.uniform1f(shader_program.rotation_angle_z_1_uniform, rotation_angle_z_1);
		gl.uniform1f(shader_program.rotation_angle_x_2_uniform, rotation_angle_x_2);
		gl.uniform1f(shader_program.rotation_angle_y_2_uniform, rotation_angle_y_2);
		gl.uniform1f(shader_program.rotation_angle_z_2_uniform, rotation_angle_z_2);
				
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
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
			if (document.activeElement.tagName === "INPUT")
			{
				return;
			}
			
			
			
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
			
			if (moving_speed < .000025)
			{
				moving_speed = .000025;
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
		canvas_size = Math.min(document.querySelector("#output-canvas").offsetWidth, document.querySelector("#output-canvas").offsetHeight);
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
		
		
		
		if (canvas_is_fullscreen)
		{
			if (aspect_ratio >= 1)
			{
				image_width = image_size;
				image_height = Math.floor(image_size / aspect_ratio);
			}
			
			else
			{
				image_width = Math.floor(image_size * aspect_ratio);
				image_height = image_size;
			}
		}
		
		
		
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		gl.viewport(0, 0, image_width, image_height);
		
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
		
		rotation_angle_x_1_delta = Math.random()*.75 - .375 - rotation_angle_x_1_old;
		rotation_angle_y_1_delta = Math.random()*.75 - .375 - rotation_angle_y_1_old;
		rotation_angle_z_1_delta = Math.random()*1.5 - .75 - rotation_angle_z_1_old;
		rotation_angle_x_2_delta = Math.random()*.75 - .375 - rotation_angle_x_2_old;
		rotation_angle_y_2_delta = Math.random()*.75 - .375 - rotation_angle_y_2_old;
		rotation_angle_z_2_delta = Math.random()*1.5 - .75 - rotation_angle_z_2_old;
		
		document.querySelector("#rotation-angle-x-1-input").value = Math.round((rotation_angle_x_1_old + rotation_angle_x_1_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-y-1-input").value = Math.round((rotation_angle_y_1_old + rotation_angle_y_1_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-z-1-input").value = Math.round((rotation_angle_z_1_old + rotation_angle_z_1_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-x-2-input").value = Math.round((rotation_angle_x_2_old + rotation_angle_x_2_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-y-2-input").value = Math.round((rotation_angle_y_2_old + rotation_angle_y_2_delta) * 1000000) / 1000000;
		document.querySelector("#rotation-angle-z-2-input").value = Math.round((rotation_angle_z_2_old + rotation_angle_z_2_delta) * 1000000) / 1000000;
		
		scale_old = scale;
		scale_delta = 0;
		
		
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
		scale_old = scale;
		rotation_angle_x_1_old = rotation_angle_x_1;
		rotation_angle_y_1_old = rotation_angle_y_1;
		rotation_angle_z_1_old = rotation_angle_z_1;
		rotation_angle_x_2_old = rotation_angle_x_2;
		rotation_angle_y_2_old = rotation_angle_y_2;
		rotation_angle_z_2_old = rotation_angle_z_2;
		
		scale_delta = (parseFloat(document.querySelector("#scale-input").value || 2) || 2) - scale_old;
		rotation_angle_x_1_delta = (parseFloat(document.querySelector("#rotation-angle-x-1-input").value || 0) || 0) - rotation_angle_x_1_old;
		rotation_angle_y_1_delta = (parseFloat(document.querySelector("#rotation-angle-y-1-input").value || 0) || 0) - rotation_angle_y_1_old;
		rotation_angle_z_1_delta = (parseFloat(document.querySelector("#rotation-angle-z-1-input").value || 0) || 0) - rotation_angle_z_1_old;
		rotation_angle_x_2_delta = (parseFloat(document.querySelector("#rotation-angle-x-2-input").value || 0) || 0) - rotation_angle_x_2_old;
		rotation_angle_y_2_delta = (parseFloat(document.querySelector("#rotation-angle-y-2-input").value || 0) || 0) - rotation_angle_y_2_old;
		rotation_angle_z_2_delta = (parseFloat(document.querySelector("#rotation-angle-z-2-input").value || 0) || 0) - rotation_angle_z_2_old;
		
		if (scale_old + scale_delta < min_scale_factor[polyhedron_index] + .1)
		{
			scale_delta = min_scale_factor[polyhedron_index] + .1 - scale_old;
		}
		
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
		
		scale = scale_old + scale_delta * t;
		rotation_angle_x_1 = rotation_angle_x_1_old + rotation_angle_x_1_delta * t;
		rotation_angle_y_1 = rotation_angle_y_1_old + rotation_angle_y_1_delta * t;
		rotation_angle_z_1 = rotation_angle_z_1_old + rotation_angle_z_1_delta * t;
		rotation_angle_x_2 = rotation_angle_x_2_old + rotation_angle_x_2_delta * t;
		rotation_angle_y_2 = rotation_angle_y_2_old + rotation_angle_y_2_delta * t;
		rotation_angle_z_2 = rotation_angle_z_2_old + rotation_angle_z_2_delta * t;
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 121)
		{
			currently_animating_parameters = false;
		}
	}
	
	
	
	function change_polyhedron(new_polyhedron_index)
	{
		document.querySelector("#output-canvas").classList.add("animated-opacity");
		
		document.querySelector("#output-canvas").style.opacity = 0;
		
		setTimeout(function()
		{
			polyhedron_index = new_polyhedron_index;
			
			window.requestAnimationFrame(draw_frame);
			
			document.querySelector("#output-canvas").style.opacity = 1;
			
			setTimeout(function()
			{
				document.querySelector("#output-canvas").classList.remove("animated-opacity");
			});
		}, 300);
	}
	
	
	
	function prepare_download()
	{
		let temp = image_size;
		
		image_size = parseInt(document.querySelector("#high-res-dim-input").value || 2000);
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		//This one needs to happen immediately, since otherwise we'll only download blank images.
		draw_frame();
		
		
		
		let link = document.createElement("a");
		
		link.download = "a-kaleidoscopic-ifs-fractal.png";
		
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