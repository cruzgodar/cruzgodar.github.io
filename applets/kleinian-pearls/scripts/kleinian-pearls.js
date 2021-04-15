!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = Math.min(document.querySelector("#output-canvas").offsetWidth, document.querySelector("#output-canvas").offsetHeight);
	
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
	
	let moving_speed = 0;
	
	let distance_to_scene = 1;
	let last_distance_to_scene = 1;
	
	
	
	let theta = Math.PI / 2;
	let phi = Math.PI / 2;
	
	
	
	let image_size = 300;
	let image_width = 300;
	let image_height = 300;
	
	let small_image_size = 300;
	let large_image_size = 900;
	
	let num_iterations = 48;
	
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
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_width);
	document.querySelector("#output-canvas").setAttribute("height", image_height);
	
	document.querySelector("#dim-input").addEventListener("input", function()
	{
		change_resolution(0);
	});
	
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	
	
	let elements = document.querySelectorAll("#klein-r-input, #klein-i-input, #box-size-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("input", update_parameters);
	}
	
	document.querySelector("#randomize-parameters-button").addEventListener("click", randomize_parameters);
	
	
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	
	
	Applets.Canvases.to_resize = [document.querySelector("#output-canvas")];
	
	Applets.Canvases.resize_callback = function()
	{
		if (Applets.Canvases.is_fullscreen)
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
		
		
		
		if (image_width >= image_height)
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, image_width / image_height);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, 1);
		}
		
		else
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, 1);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, image_width / image_height);
		}
		
		
		
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		gl.viewport(0, 0, image_width, image_height);
		
		
		
		
		fractals_resize();
		
		window.requestAnimationFrame(draw_frame);
	};
	
	Applets.Canvases.true_fullscreen = true;
	
	Applets.Canvases.set_up_resizer();
	
	
	
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
		
		
		
		const float clip_distance = 1000.0;
		const int max_marches = 128; //Change to 512 to eliminate flickering in animations
		const vec3 fog_color = vec3(0.0, 0.0, 0.0);
		const float fog_scaling = .1;
		const int num_iterations = 48;
		
		
		
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
				
				//Uncomment to add aggressive understepping when close to the fractal boundary, which helps to prevent flickering but is a significant performance hit.
				
				
				else if (last_distance / distance > .999 && slowed_down == 0)
				{
					ray_direction_vec = normalize(start_pos - camera_pos) * .125;
					
					slowed_down = 1;
				}
				
				else if (last_distance / distance <= .999 && slowed_down == 1)
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
		
		
		
		calculate_vectors();
		
		
		
		shader_program.aspect_ratio_x_uniform = gl.getUniformLocation(shader_program, "aspect_ratio_x");
		shader_program.aspect_ratio_y_uniform = gl.getUniformLocation(shader_program, "aspect_ratio_y");
		
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
		
		shader_program.camera_pos_uniform = gl.getUniformLocation(shader_program, "camera_pos");
		shader_program.image_plane_center_pos_uniform = gl.getUniformLocation(shader_program, "image_plane_center_pos");
		shader_program.forward_vec_uniform = gl.getUniformLocation(shader_program, "forward_vec");
		shader_program.right_vec_uniform = gl.getUniformLocation(shader_program, "right_vec");
		shader_program.up_vec_uniform = gl.getUniformLocation(shader_program, "up_vec");
		
		shader_program.focal_length_uniform = gl.getUniformLocation(shader_program, "focal_length");
		
		shader_program.light_pos_uniform = gl.getUniformLocation(shader_program, "light_pos");
		
		shader_program.klein_r_uniform = gl.getUniformLocation(shader_program, "klein_r");
		shader_program.klein_i_uniform = gl.getUniformLocation(shader_program, "klein_i");
		
		shader_program.box_size_uniform = gl.getUniformLocation(shader_program, "box_size");
		
		shader_program.rotate_factor_uniform = gl.getUniformLocation(shader_program, "rotate_factor");
		
		
		
		if (image_width >= image_height)
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, image_width / image_height);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, 1);
		}
		
		else
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, 1);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, image_width / image_height);
		}
		
		
		
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		gl.uniform3fv(shader_program.camera_pos_uniform, camera_pos);
		gl.uniform3fv(shader_program.image_plane_center_pos_uniform, image_plane_center_pos);
		gl.uniform3fv(shader_program.forward_vec_uniform, forward_vec);
		gl.uniform3fv(shader_program.right_vec_uniform, right_vec);
		gl.uniform3fv(shader_program.up_vec_uniform, up_vec);
		
		gl.uniform1f(shader_program.focal_length_uniform, focal_length);
		
		gl.uniformMatrix3fv(shader_program.rotation_matrix_uniform, false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
		
		gl.uniform3fv(shader_program.light_pos_uniform, light_pos);
		
		gl.uniform1f(shader_program.klein_r_uniform, klein_r);
		gl.uniform1f(shader_program.klein_i_uniform, klein_i);
		
		gl.uniform1f(shader_program.box_size_uniform, box_size);
		
		gl.uniform1f(shader_program.rotate_factor_uniform, rotate_factor);
		
		
		
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
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		//Uncomment to write to a sequence of frames for a Juliabulb animation.
		/*
		let link = document.createElement("a");
		
		link.download = `${frame}.png`;
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		c = [.5 * (Math.cos(2 * Math.PI * frame / 6000) + Math.sin(5 * 2 * Math.PI * frame / 6000)), .5 * (Math.cos(2 * 2 * Math.PI * frame / 6000) + Math.sin(7 * 2 * Math.PI * frame / 6000)), .5 * (Math.cos(3 * 2 * Math.PI * frame / 6000) + Math.sin(11 * 2 * Math.PI * frame / 6000))];
		
		gl.uniform3fv(shader_program.c_uniform, c);
		
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
		
		
		last_distance_to_scene = distance_to_scene;
		distance_to_scene = distance_estimator(camera_pos[0], camera_pos[1], camera_pos[2]);
		
		
		
		focal_length = distance_to_scene / 20;
		
		//The factor we divide by here sets the fov.
		right_vec[0] *= focal_length / 2;
		right_vec[1] *= focal_length / 2;
		
		up_vec[0] *= focal_length / 2;
		up_vec[1] *= focal_length / 2;
		up_vec[2] *= focal_length / 2;
		
		
		
		image_plane_center_pos = [camera_pos[0] + focal_length * forward_vec[0], camera_pos[1] + focal_length * forward_vec[1], camera_pos[2] + focal_length * forward_vec[2]];
		
		
		
		gl.uniform3fv(shader_program.camera_pos_uniform, camera_pos);
		gl.uniform3fv(shader_program.image_plane_center_pos_uniform, image_plane_center_pos);
		gl.uniform3fv(shader_program.forward_vec_uniform, forward_vec);
		gl.uniform3fv(shader_program.right_vec_uniform, right_vec);
		gl.uniform3fv(shader_program.up_vec_uniform, up_vec);
		
		gl.uniform1f(shader_program.focal_length_uniform, focal_length);
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
				
				draw_start_time = Date.now();
				
				image_size = small_image_size;
				
				change_resolution(image_size);
				
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
		
		
		
		document.querySelector("#output-canvas").addEventListener("mouseup", function(e)
		{
			currently_dragging = false;
			
			currently_drawing = currently_dragging || moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch;
			
			if (!currently_drawing && (Date.now() - draw_start_time > 300))
			{
				image_size = large_image_size;
				
				change_resolution(image_size);
				
				window.requestAnimationFrame(draw_frame);
			}
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
				
				draw_start_time = Date.now();
				
				image_size = small_image_size;
				
				change_resolution(image_size);
				
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
			
			if (!currently_drawing && (Date.now() - draw_start_time > 300))
			{
				image_size = large_image_size;
				
				change_resolution(image_size);
				
				window.requestAnimationFrame(draw_frame);
			}
		});



		document.documentElement.addEventListener("keydown", function(e)
		{
			if (document.activeElement.tagName === "INPUT" || !(e.keyCode === 87 || e.keyCode === 83 || e.keyCode === 68 || e.keyCode === 65))
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
				
				draw_start_time = Date.now();
				
				image_size = small_image_size;
				
				change_resolution(image_size);
				
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
			
			if (!currently_drawing && (Date.now() - draw_start_time > 300))
			{
				image_size = large_image_size;
				
				change_resolution(image_size);
				
				window.requestAnimationFrame(draw_frame);
			}
		});
	}
	
	
	
	function update_camera_parameters()
	{
		if (moving_forward_keyboard || moving_backward_keyboard || moving_right_keyboard || moving_left_keyboard || moving_forward_touch || moving_backward_touch)
		{
			//This smoothes things out a bit.
			if (distance_to_scene < 1.2 * last_distance_to_scene)
			{
				moving_speed = distance_to_scene / 100;
			}
			
			
			
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
		canvas_size = Math.min(document.querySelector("#output-canvas").offsetWidth, document.querySelector("#output-canvas").offsetHeight);
	}
	
	
	
	function change_resolution(new_image_size = 0)
	{
		if (new_image_size === 0)
		{
			image_size = parseInt(document.querySelector("#dim-input").value || 300);
			
			if (image_size < 200)
			{
				image_size = 200;
			}
			
			if (image_size > 2000)
			{
				image_size = 2000;
			}
			
			small_image_size = image_size;
			large_image_size = image_size * 3;
		}
		
		else
		{
			image_size = new_image_size;
		}
		
		
		
		if (Applets.Canvases.is_fullscreen)
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
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		
		
		if (image_width >= image_height)
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, image_width / image_height);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, 1);
		}
		
		else
		{
			gl.uniform1f(shader_program.aspect_ratio_x_uniform, 1);
			gl.uniform1f(shader_program.aspect_ratio_y_uniform, image_width / image_height);
		}
		
		
		
		gl.uniform1i(shader_program.image_size_uniform, image_size);
		
		gl.viewport(0, 0, image_width, image_height);
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function update_parameters()
	{
		if (image_size !== small_image_size)
		{
			image_size = small_image_size;
			
			change_resolution(image_size);
		}
		
		
		
		klein_r_old = klein_r;
		klein_r_delta = (parseFloat(document.querySelector("#klein-r-input").value || 2) || 2) - klein_r_old;
		
		klein_i_old = klein_i;
		klein_i_delta = (parseFloat(document.querySelector("#klein-i-input").value || 0) || 0) - klein_i_old;
		
		box_size_old = box_size;
		box_size_delta = (parseFloat(document.querySelector("#box-size-input").value || 1) || 1) - box_size_old;
		
		
		
		animate_parameter_change();
	}
	
	
	
	function randomize_parameters(animate_change = true)
	{
		if (currently_animating_parameters)
		{
			return;
		}
		
		
		
		if (image_size !== small_image_size)
		{
			image_size = small_image_size;
			
			change_resolution(image_size);
		}
		
		
		
		klein_r_old = klein_r;
		klein_r_delta = Math.random()*.1 - .075 + 2 - klein_r_old;
		
		klein_i_old = klein_i;
		klein_i_delta = Math.random()*.1 - .05 - klein_i_old;
		
		box_size_old = box_size;
		box_size_delta = Math.random()*.2 - .1 + 1 - box_size_old;
		
		
		
		document.querySelector("#klein-r-input").value = Math.round((klein_r_old + klein_r_delta) * 1000000) / 1000000;
		document.querySelector("#klein-i-input").value = Math.round((klein_i_old + klein_i_delta) * 1000000) / 1000000;
		document.querySelector("#box-size-input").value = Math.round((box_size_old + box_size_delta) * 1000000) / 1000000;
		
		
		
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
		
		klein_r = klein_r_old + klein_r_delta * t;
		klein_i = klein_i_old + klein_i_delta * t;
		
		box_size = box_size_old + box_size_delta * t;
		
		
		
		gl.uniform1f(shader_program.klein_r_uniform, klein_r);
		gl.uniform1f(shader_program.klein_i_uniform, klein_i);
		
		gl.uniform1f(shader_program.box_size_uniform, box_size);
		
		
		
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
		
		link.download = "kleinian-pearls.png";
		
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