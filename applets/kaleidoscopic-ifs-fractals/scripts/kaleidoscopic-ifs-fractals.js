!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = document.querySelector("#output-canvas").offsetWidth;
	
	let currently_dragging = false;
	
	let mouse_x = 0;
	let mouse_y = 0;
	
	let moving_forward_keyboard = false;
	let moving_backward_keyboard = false;
	let moving_right_keyboard = false;
	let moving_left_keyboard = false;
	
	let moving_forward_touch = false;
	let moving_backward_touch = false;
	
	let increasing_rotation_angle = false;
	
	let moving_speed = 0;
	let sprinting = false;
	
	let distance_to_scene = 1;
	
	
	
	let theta = 3.2954;
	let phi = 1.9657;
	
	
	
	let image_size = parseInt(document.querySelector("#dim-input").value || 500);
	let num_sierpinski_iterations = 16;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [4.2178, .8269, 1.9065];
	
	let focal_length = 2;
	
	let scale = 1.5;
	
	let rotation_angle_x_1 = Math.random() - .5;
	let rotation_angle_y_1 = Math.random() - .5;
	let rotation_angle_z_1 = Math.random() - .5;
	let rotation_angle_x_2 = Math.random() - .5;
	let rotation_angle_y_2 = Math.random() - .5;
	let rotation_angle_z_2 = Math.random() - .5;
	
	
	
	let vertices = [[0.0, 0.0, 1.0], [.942809, 0.0, -.333333], [-.471405, .816497, -.333333], [-.471405, -.816497, -.333333]];
	let n1 = normalize([vertices[0][0] - vertices[1][0], vertices[0][1] - vertices[1][1], vertices[0][2] - vertices[1][2]]);
	let n2 = normalize([vertices[0][0] - vertices[2][0], vertices[0][1] - vertices[2][1], vertices[0][2] - vertices[2][2]]);
	let n3 = normalize([vertices[0][0] - vertices[3][0], vertices[0][1] - vertices[3][1], vertices[0][2] - vertices[3][2]]);
	
	
	
	calculate_vectors();
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	document.querySelector("#dim-input").addEventListener("input", change_resolution);
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	init_listeners();
	
	
	
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
		
		const vec3 light_pos = vec3(0.0, 0.0, 5.0);
		const float light_brightness = 1.5;
		
		uniform int image_size;
		uniform int small_image_size;
		
		
		
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
		const vec3 color_5 = vec3(1.0, 0.0, 1.0);
		const vec3 color_6 = vec3(0.0, 1.0, 1.0);
		
		
		
		const vec3 vertex_0 = vec3(0.0, 0.0, 1.0);
		const vec3 vertex_1 = vec3(.942809, 0.0, -.333333);
		const vec3 vertex_2 = vec3(-.471405, .816497, -.333333);
		const vec3 vertex_3 = vec3(-.471405, -.816497, -.333333);
		
		const vec3 n1 = normalize(vertex_0 - vertex_1);
		const vec3 n2 = normalize(vertex_0 - vertex_2);
		const vec3 n3 = normalize(vertex_0 - vertex_3);
		
		
		
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
				
				
				
				mutable_pos = rotation_matrix_1 * mutable_pos;
				
				
				
				//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
				mutable_pos = scale*mutable_pos - (scale - 1.0)*vertex_0;
				
				
				
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
			
			float light_intensity = light_brightness * dot(surface_normal, light_direction);
			
			//The last factor adds ambient occlusion.
			color = color * light_intensity * max((1.0 - float(iteration) / float(max_marches)), 0.0);
			
			
			
			//Apply fog.
			float distance_from_camera = length(pos - camera_pos);
			
			float fog_amount = 1.0 - exp(-distance_from_camera * fog_scaling);
			
			return (1.0 - fog_amount) * color + fog_amount * fog_color;
		}
		
		
		
		void main(void)
		{
			vec3 start_pos = image_plane_center_pos + right_vec * uv.x + up_vec * uv.y;
			
			//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
			vec3 ray_direction_vec = normalize(start_pos - camera_pos) * .9;
			
			vec3 final_color = fog_color;
			
			float epsilon = .001;
			
			float t = 0.0;
			
			
			
			for (int iteration = 0; iteration < max_marches; iteration++)
			{
				vec3 pos = start_pos + t * ray_direction_vec;
				
				float distance = distance_estimator(pos);
				
				//This lowers the detail far away, which makes everything run nice and fast.
				if (image_size == small_image_size && distance / 150.0 > epsilon)
				{
					epsilon = distance / 150.0;
				}
				
				else if (image_size != small_image_size && distance / 500.0 > epsilon)
				{
					epsilon = distance / 500.0;
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
		
		
		
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
		shader_program.small_image_size_uniform = gl.getUniformLocation(shader_program, "small_image_size");
		
		shader_program.camera_pos_uniform = gl.getUniformLocation(shader_program, "camera_pos");
		shader_program.image_plane_center_pos_uniform = gl.getUniformLocation(shader_program, "image_plane_center_pos");
		shader_program.forward_vec_uniform = gl.getUniformLocation(shader_program, "forward_vec");
		shader_program.right_vec_uniform = gl.getUniformLocation(shader_program, "right_vec");
		shader_program.up_vec_uniform = gl.getUniformLocation(shader_program, "up_vec");
		
		shader_program.focal_length_uniform = gl.getUniformLocation(shader_program, "focal_length");
		
		shader_program.scale_uniform = gl.getUniformLocation(shader_program, "scale");
		
		shader_program.rotation_angle_x_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_x_1");
		shader_program.rotation_angle_y_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_y_1");
		shader_program.rotation_angle_z_1_uniform = gl.getUniformLocation(shader_program, "rotation_angle_z_1");
		shader_program.rotation_angle_x_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_x_2");
		shader_program.rotation_angle_y_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_y_2");
		shader_program.rotation_angle_z_2_uniform = gl.getUniformLocation(shader_program, "rotation_angle_z_2");
		
		
		
		gl.viewport(0, 0, image_size, image_size);
		gl.uniform1i(shader_program.small_image_size_uniform, image_size);
		
		
		
		draw_frame();
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
		
		gl.uniform1f(shader_program.scale_uniform, scale);
		
		gl.uniform1f(shader_program.rotation_angle_x_1_uniform, rotation_angle_x_1);
		gl.uniform1f(shader_program.rotation_angle_y_1_uniform, rotation_angle_y_1);
		gl.uniform1f(shader_program.rotation_angle_z_1_uniform, rotation_angle_z_1);
		gl.uniform1f(shader_program.rotation_angle_x_2_uniform, rotation_angle_x_2);
		gl.uniform1f(shader_program.rotation_angle_y_2_uniform, rotation_angle_y_2);
		gl.uniform1f(shader_program.rotation_angle_z_2_uniform, rotation_angle_z_2);
				
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setTimeout(setup_webgl, 500);
	});
	
	
	
	
	
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
			let t1 = dot_product([x, y, z], n1);
			
			if (t1 < 0)
			{
				x -= 2 * t1 * n1[0];
				y -= 2 * t1 * n1[1];
				z -= 2 * t1 * n1[2];
			}
			
			let t2 = dot_product([x, y, z], n2);
			
			if (t2 < 0)
			{
				x -= 2 * t2 * n2[0];
				y -= 2 * t2 * n2[1];
				z -= 2 * t2 * n2[2];
			}
			
			let t3 = dot_product([x, y, z], n3);
			
			if (t3 < 0)
			{
				x -= 2 * t3 * n3[0];
				y -= 2 * t3 * n3[1];
				z -= 2 * t3 * n3[2];
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
			x = scale * x;
			y = scale * y;
			z = scale * z - (scale - 1);
			
			
			
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
				
				draw_frame();
			}
		});
		
		
		
		document.documentElement.addEventListener("mouseup", function(e)
		{
			currently_dragging = false;
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchstart", function(e)
		{
			mouse_x = e.touches[0].clientX;
			mouse_y = e.touches[0].clientY;
			
			if (e.touches.length === 2)
			{
				moving_forward_touch = true;
				moving_backward_touch = false;
				increasing_rotation_angle = false;
			}
			
			else if (e.touches.length === 3)
			{
				moving_backward_touch = true;
				moving_forward_touch = false;
				increasing_rotation_angle = false;
			}
			
			else if (e.touches.length === 4)
			{
				increasing_rotation_angle = true;
				moving_forward_touch = false;
				moving_backward_touch = false;
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
			
			draw_frame();
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchend", function(e)
		{
			if (e.touches.length === 2)
			{
				moving_forward_touch = true;
				moving_backward_touch = false;
				increasing_rotation_angle = false;
			}
			
			else if (e.touches.length === 3)
			{
				moving_backward_touch = true;
				moving_forward_touch = false;
				increasing_rotation_angle = false;
			}
			
			else if (e.touches.length === 4)
			{
				increasing_rotation_angle = true;
				moving_forward_touch = false;
				moving_backward_touch = false;
			}
			
			else
			{
				moving_forward_touch = false;
				moving_backward_touch = false;
				increasing_rotation_angle = false;
			}
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
			
			//Shift
			if (e.keyCode === 16)
			{
				sprinting = true;
			}
			
			//R
			if (e.keyCode === 82)
			{
				increasing_rotation_angle = true;
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
			
			//Shift
			if (e.keyCode === 16)
			{
				sprinting = false;
			}
			
			//R
			if (e.keyCode === 82)
			{
				increasing_rotation_angle = false;
			}
		});
		
		
		
		setInterval(function()
		{
			if (moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch || increasing_rotation_angle)
			{
				moving_speed = distance_to_scene / 60;
				
				if (moving_speed < 0)
				{
					moving_speed = 0;
				}
				
				if (moving_speed > .02)
				{
					moving_speed = .02;
				}
				
				
				
				if (sprinting)
				{
					moving_speed *= 3;
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
				
				
				
				if (increasing_rotation_angle)
				{
					rotation_angle_z_1 += .001;
					
					if (rotation_angle_x_1 >= 2 * Math.PI)
					{
						rotation -= 2 * Math.PI;
					}
					
					draw_frame();
				}
			
			
			
				calculate_vectors();
				
				draw_frame();
			}
		}, 8);
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
		
		draw_frame();
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
		
		link.download = "the-sierpinski-tetrahedron.png";
		
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