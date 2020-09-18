!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("experimental-webgl");
	
	let canvas_size = document.querySelector("#output-canvas").offsetWidth;
	
	let currently_dragging = false;
	
	let mouse_x = 0;
	let mouse_y = 0;
	
	let moving_forward = false;
	let moving_backward = false;
	let moving_right = false;
	let moving_left = false;
	
	let moving_speed = 0;
	let sprinting = false;
	
	let distance_to_scene = 1;
	
	
	
	let theta = 5 * Math.PI / 4;
	let phi = 2 * Math.PI / 3;
	
	
	
	let image_size = 500;
	let num_sierpinski_iterations = 15;
	
	let image_plane_center_pos = [];
	
	let forward_vec = [];
	let right_vec = [];
	let up_vec = [];
	
	let camera_pos = [1, 1, 1];
	
	let light_pos = [0, 0, 5];
	let light_brightness = 1.25;
	
	let focal_length = 2;
	let epsilon = .01;
	
	let max_epsilon = .01;
	let min_epsilon = Math.pow(2, -num_sierpinski_iterations);
	
	
	
	
	calculate_vectors();
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
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
		
		uniform vec3 light_pos;
		uniform float light_brightness;
		
		uniform int image_size;
		
		
		
		const float clip_distance = 100.0;
		const int max_marches = 256;
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .2;
		const int num_sierpinski_iterations = 15;
		
		
		vec3 color;
		
		const vec3 color_1 = vec3(1.0, 1.0, 1.0);
		const vec3 color_2 = vec3(1.0, 0.0, 0.0);
		const vec3 color_3 = vec3(0.0, 1.0, 0.0);
		const vec3 color_4 = vec3(0.0, 0.0, 1.0);
		
		
		
		float distance_estimator(vec3 pos)
		{
			vec3 mutable_pos = pos;
			
			vec3 vertex_1 = vec3(0.0, 0.0, 1.0);
			vec3 vertex_2 = vec3(.942809, 0.0, -.333333);
			vec3 vertex_3 = vec3(-.471405, .816497, -.333333);
			vec3 vertex_4 = vec3(-.471405, -.816497, -.333333);
			
			color = vec3(0.0, 0.0, 0.0);
			float color_scale = .75;
			
			
			//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
			for (int iteration = 0; iteration < num_sierpinski_iterations; iteration++)
			{
				float min_distance = clip_distance;
				vec3 closest_vertex;
				
				
				
				float distance = length(mutable_pos - vertex_1);
				
				if (distance < min_distance)
				{
					min_distance = distance;
					closest_vertex = vertex_1;
					color += color_scale * color_1;
				}
				
				
				
				distance = length(mutable_pos - vertex_2);
				
				if (distance < min_distance)
				{
					min_distance = distance;
					closest_vertex = vertex_2;
					color += color_scale * color_2;
				}
				
				
				
				distance = length(mutable_pos - vertex_3);
				
				if (distance < min_distance)
				{
					min_distance = distance;
					closest_vertex = vertex_3;
					color += color_scale * color_3;
				}
				
				
				
				distance = length(mutable_pos - vertex_4);
				
				if (distance < min_distance)
				{
					min_distance = distance;
					closest_vertex = vertex_4;
					color += color_scale * color_4;
				}
				
				
				
				//This one takes a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
				mutable_pos = 2.0 * mutable_pos - closest_vertex;
				
				color_scale *= .25;
			}
			
			
			
			return length(mutable_pos) * pow(.5, float(num_sierpinski_iterations));
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
			
			color = color * light_intensity * (1.0 - float(iteration) / 64.0);
			
			
			
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
			
			float t = 0.0;
			
			float epsilon = .00005;
			
			
			
			for (int iteration = 0; iteration < max_marches; iteration++)
			{
				vec3 pos = start_pos + t * ray_direction_vec;
				
				float distance = distance_estimator(pos);
				
				//This lowers the detail far away, which makes everything run nice and fast.
				if (distance / 50.0 > epsilon)
				{
					epsilon = distance / 50.0;
				}
				
				
				
				if (distance < epsilon)
				{
					final_color = compute_shading(pos, iteration);
					break;
				}
				
				else if (distance > clip_distance)
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
		
		shader_program.camera_pos_uniform = gl.getUniformLocation(shader_program, "camera_pos");
		shader_program.image_plane_center_pos_uniform = gl.getUniformLocation(shader_program, "image_plane_center_pos");
		shader_program.forward_vec_uniform = gl.getUniformLocation(shader_program, "forward_vec");
		shader_program.right_vec_uniform = gl.getUniformLocation(shader_program, "right_vec");
		shader_program.up_vec_uniform = gl.getUniformLocation(shader_program, "up_vec");
		
		shader_program.focal_length_uniform = gl.getUniformLocation(shader_program, "focal_length");
		shader_program.epsilon_uniform = gl.getUniformLocation(shader_program, "epsilon");
		
		shader_program.light_pos_uniform = gl.getUniformLocation(shader_program, "light_pos");
		shader_program.light_brightness_uniform = gl.getUniformLocation(shader_program, "light_brightness");
		
		
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
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
		gl.uniform1f(shader_program.epsilon_uniform, epsilon);
		
		gl.uniform3fv(shader_program.light_pos_uniform, light_pos);
		gl.uniform1f(shader_program.light_brightness_uniform, light_brightness);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		distance_to_scene = distance_estimator(image_plane_center_pos[0], image_plane_center_pos[1], image_plane_center_pos[2]);
	}
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setup_webgl();
	});
	
	
	
	
	
	function calculate_vectors()
	{
		//Here comes the serious math. Theta is the angle in the xy-plane and phi the angle down from the z-axis. We can use them get a normalized forward vector:
		forward_vec = [Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)];
		
		//Now the right vector needs to be constrained to the xy-plane, since otherwise the image will appear tilted. For a vector (a, b, c), the orthogonal plane that passes through the origin is ax + by + cz = 0, so we want ax + by = 0. One solution is (b, -a), and that's the one that goes to the "right" of the forward vector (when looking down).
		right_vec = normalize([forward_vec[1], -forward_vec[0], 0]);
		
		//Finally, the upward vector is the cross product of the previous two.
		up_vec = cross_product(right_vec, forward_vec);
		
		
		
		focal_length = distance_to_scene / 2;
		
		right_vec[0] *= focal_length;
		right_vec[1] *= focal_length;
		
		up_vec[0] *= focal_length;
		up_vec[1] *= focal_length;
		up_vec[2] *= focal_length;
		
		
		
		epsilon = Math.max(Math.min(distance_to_scene / 50, max_epsilon), min_epsilon);
		
		image_plane_center_pos = [camera_pos[0] + focal_length * forward_vec[0], camera_pos[1] + focal_length * forward_vec[1], camera_pos[2] + focal_length * forward_vec[2]];
	}
	
	
	
	function cross_product(vec1, vec2)
	{
		return [vec1[1] * vec2[2] - vec1[2] * vec2[1], vec1[2] * vec2[0] - vec1[0] * vec2[2], vec1[0] * vec2[1] - vec1[1] * vec2[0]];
	}
	
	
	
	function normalize(vec)
	{
		let magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
		
		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude];
	}
	
	
	
	function distance_estimator(x, y, z)
	{
		let vertices = [[0.0, 0.0, 1.0], [.942809, 0.0, -.333333], [-.471405, .816497, -.333333], [-.471405, -.816497, -.333333]];
		
		//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
		for (let iteration = 0; iteration < num_sierpinski_iterations; iteration++)
		{
			let min_distance = Infinity;
			let closest_vertex = 0;
			
			for (let i = 0; i < 4; i++)
			{
				//No need to take a square root if we're just trying to find a minimum.
				let distance = (x - vertices[i][0])*(x - vertices[i][0]) + (y - vertices[i][1])*(y - vertices[i][1]) + (z - vertices[i][2])*(z - vertices[i][2]);
				
				if (distance < min_distance)
				{
					min_distance = distance;
					closest_vertex = i;
				}
			}
			
			
			
			//This one takes a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
			x = 2*x - vertices[closest_vertex][0];
			y = 2*y - vertices[closest_vertex][1];
			z = 2*z - vertices[closest_vertex][2];
		}
		
		
		
		//So at this point we've scaled up by 2x a total of num_iterations times. The final distance is therefore:
		return Math.sqrt(x*x + y*y + z*z) * Math.pow(2, -num_sierpinski_iterations);
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
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
			
			
			
			let new_mouse_x = e.touches[0].clientX;
			let new_mouse_y = e.touches[0].clientY;
			
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
			
			draw_frame();
		});
		
		
		
		document.documentElement.addEventListener("keydown", function(e)
		{
			//W
			if (e.keyCode === 87)
			{
				moving_forward = true;
			}
			
			//S
			else if (e.keyCode === 83)
			{
				moving_backward = true;
			}
			
			//D
			if (e.keyCode === 68)
			{
				moving_right = true;
			}
			
			//A
			else if (e.keyCode === 65)
			{
				moving_left = true;
			}
			
			//Shift
			if (e.keyCode === 16)
			{
				sprinting = true;
			}
		});
		
		
		
		document.documentElement.addEventListener("keyup", function(e)
		{
			//W
			if (e.keyCode === 87)
			{
				moving_forward = false;
			}
			
			//S
			else if (e.keyCode === 83)
			{
				moving_backward = false;
			}
			
			//D
			if (e.keyCode === 68)
			{
				moving_right = false;
			}
			
			//A
			else if (e.keyCode === 65)
			{
				moving_left = false;
			}
			
			//Shift
			if (e.keyCode === 16)
			{
				sprinting = false;
			}
		});
		
		
		
		setInterval(function()
		{
			if (moving_forward || moving_backward || moving_right | moving_left)
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
				
				
				
				if (moving_forward)
				{
					camera_pos[0] += moving_speed * forward_vec[0];
					camera_pos[1] += moving_speed * forward_vec[1];
					camera_pos[2] += moving_speed * forward_vec[2];
				}
				
				else if (moving_backward)
				{
					camera_pos[0] -= moving_speed * forward_vec[0];
					camera_pos[1] -= moving_speed * forward_vec[1];
					camera_pos[2] -= moving_speed * forward_vec[2];
				}
				
				
				
				if (moving_right)
				{
					camera_pos[0] += moving_speed * right_vec[0] / focal_length;
					camera_pos[1] += moving_speed * right_vec[1] / focal_length;
					camera_pos[2] += moving_speed * right_vec[2] / focal_length;
				}
				
				else if (moving_left)
				{
					camera_pos[0] -= moving_speed * right_vec[0] / focal_length;
					camera_pos[1] -= moving_speed * right_vec[1] / focal_length;
					camera_pos[2] -= moving_speed * right_vec[2] / focal_length;
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
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "gravner-griffeath-snowflakes.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()