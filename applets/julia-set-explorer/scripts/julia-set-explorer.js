!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_width = document.querySelector("#output-canvas").offsetWidth;
	let canvas_height = document.querySelector("#output-canvas").offsetHeight;
	let canvas_size = Math.min(canvas_width, canvas_height);
	
	let currently_drawing = false;
	let stabilize_brightness_scale = false;
	let brightness_stabilization_direction = 0;
	let timeout_id = null;
	
	let mouse_x = 0;
	let mouse_y = 0;
	let touch_distance = 0;
	let wheel_cooldown = 0;
	
	let currently_dragging = false;
	let zooming_in = false;
	let zooming_out = false;
	let pressing_shift = false;
	
	let was_recently_pinching = 0;
	
	let julia_mode = 0;
	
	
	
	let center_x = -.75;
	let center_y = 0;
	let a = 0;
	let b = 0;
	let box_size = 3;
	let zoom_level = 0;
	let brightness_scale = 13;
	
	
	
	let image_size = 500;
	let image_width = 500;
	let image_height = 500;
	
	let num_iterations = 200;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_width);
	document.querySelector("#output-canvas").setAttribute("height", image_height);
	
	document.querySelector("#image-size-input").addEventListener("input", change_resolution);
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	document.querySelector("#switch-julia-mode-button").addEventListener("click", function()
	{
		document.querySelector("#switch-julia-mode-button").style.opacity = 0;
		
		setTimeout(function()
		{
			if (julia_mode === 2)
			{
				document.querySelector("#switch-julia-mode-button").textContent = "Return to Mandelbrot Set";
			}
			
			else if (julia_mode === 0)
			{
				document.querySelector("#switch-julia-mode-button").textContent = "Pick Julia Set";
				
				document.querySelector("#switch-julia-mode-button").style.opacity = 1;
			}
		}, 300);
		
		
		
		if (julia_mode === 0)
		{
			julia_mode = 2;
			a = 0;
			b = 0;
		}
		
		else if (julia_mode === 1)
		{
			julia_mode = 0;
			
			center_x = -.75;
			center_y = 0;
			box_size = 3;
			zoom_level = 0;
			brightness_scale = 13;
		}
		
		stabilize_brightness_scale = true;
		
		if (!currently_drawing)
		{
			currently_drawing = true;
			window.requestAnimationFrame(draw_frame);
		}
	});
	
	
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	
	
	Page.Applets.Canvases.to_resize = [document.querySelector("#output-canvas")];
	
	Page.Applets.Canvases.resize_callback = function()
	{
		if (Page.Applets.Canvases.is_fullscreen)
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
		
		
		
		canvas_width = document.querySelector("#output-canvas").offsetWidth;
		canvas_height = document.querySelector("#output-canvas").offsetHeight;
		canvas_size = Math.min(canvas_width, canvas_height);
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		gl.viewport(0, 0, image_width, image_height);
		
		
		
		
		fractals_resize();
		
		window.requestAnimationFrame(draw_frame);
	};
	
	Page.Applets.Canvases.true_fullscreen = true;
	
	Page.Applets.Canvases.set_up_resizer();
	
	
	
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
		
		uniform float aspect_ratio;
		
		uniform float box_size_halved;
		uniform float a;
		uniform float b;
		uniform float center_x;
		uniform float center_y;
		uniform float brightness_scale;
		uniform int num_iterations;
		
		uniform int julia_mode;
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * aspect_ratio * box_size_halved + center_x, uv.y * box_size_halved + center_y);
			vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
			float brightness = exp(-length(z));
			
			
			
			if (julia_mode == 0)
			{
				vec2 c = z;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
			}
			
			
			
			else if (julia_mode == 1)
			{
				vec2 c = vec2(a, b);
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
			}
			
			
			
			else
			{
				vec2 c = z;
				
				bool broken = false;
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				
				
				if (!broken)
				{
					gl_FragColor = vec4(.5 * brightness / brightness_scale * color, 1.0);
				}
				
				
				
				z = vec2(uv.x * aspect_ratio * 2.0, uv.y * 2.0);
				color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				brightness = exp(-length(z));
				
				broken = false;
				
				c = vec2(a, b);
				
				for (int iteration = 0; iteration < 3001; iteration++)
				{
					if (iteration == num_iterations)
					{
						gl_FragColor.xyz /= 4.0;
						
						broken = true;
						
						break;
					}
					
					if (length(z) >= 4.0)
					{
						break;
					}
					
					z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
					
					brightness += exp(-length(z));
				}
				
				if (!broken)
				{
					gl_FragColor += vec4(brightness / brightness_scale * color, 0.0);
				}
			}
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
		
		shader_program.box_size_halved_uniform = gl.getUniformLocation(shader_program, "box_size_halved");
		shader_program.center_x_uniform = gl.getUniformLocation(shader_program, "center_x");
		shader_program.center_y_uniform = gl.getUniformLocation(shader_program, "center_y");
		shader_program.a_uniform = gl.getUniformLocation(shader_program, "a");
		shader_program.b_uniform = gl.getUniformLocation(shader_program, "b");
		shader_program.brightness_scale_uniform = gl.getUniformLocation(shader_program, "brightness_scale");
		shader_program.num_iterations_uniform = gl.getUniformLocation(shader_program, "num_iterations");
		
		shader_program.julia_mode_uniform = gl.getUniformLocation(shader_program, "julia_mode");
		
		
		
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
		currently_drawing = false;
		
		gl.uniform1f(shader_program.aspect_ratio_uniform, image_width / image_height);
		
		gl.uniform1f(shader_program.box_size_halved_uniform, box_size / 2);
		gl.uniform1f(shader_program.center_x_uniform, center_x);
		gl.uniform1f(shader_program.center_y_uniform, center_y);
		gl.uniform1f(shader_program.a_uniform, a);
		gl.uniform1f(shader_program.b_uniform, b);
		gl.uniform1f(shader_program.brightness_scale_uniform, brightness_scale);
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		
		gl.uniform1i(shader_program.julia_mode_uniform, julia_mode);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		let pixels = new Uint8Array(image_width * image_height * 4);
		gl.readPixels(0, 0, image_width, image_height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		
		let num_pixels_at_max = 0;
		
		for (let i = 0; i < image_width * image_height; i++)
		{
			if (pixels[4 * i] === 255 || pixels[4 * i + 1] === 255 || pixels[4 * i + 2] === 255)
			{
				num_pixels_at_max++;
			}
		}
		
		
		
		let changed_brightness_scale = false;
		
		let denom = center_x * center_x + center_y * center_y + 2;
		
		if (julia_mode !== 0)
		{
			denom = a*a + b*b + 2;
		}
		
		if (num_pixels_at_max < 2 * image_size && brightness_stabilization_direction !== 1 && brightness_scale > 1 / denom)
		{
			brightness_scale -= .5 / denom;
			
			if (stabilize_brightness_scale)
			{
				brightness_scale -= .5 / denom;
				
				brightness_stabilization_direction = -1;
			}
			
			changed_brightness_scale = true;
		}
		
		else if (num_pixels_at_max > 4 * image_size && brightness_stabilization_direction !== -1)
		{
			brightness_scale += .5 / denom;
			
			if (stabilize_brightness_scale)
			{
				brightness_scale += .5 / denom;
				
				brightness_stabilization_direction = 1;
			}
			
			changed_brightness_scale = true;
		}
		
		
		
		if (stabilize_brightness_scale)
		{
			if (changed_brightness_scale)
			{
				window.requestAnimationFrame(draw_frame);
			}
			
			else
			{
				brightness_stabilization_direction = 0;
				
				stabilize_brightness_scale = false;
			}
		}
		
		else if (currently_drawing)
		{
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function init_listeners()
	{
		document.querySelector("#output-canvas").addEventListener("mousedown", handle_mousedown_event);
		
		document.documentElement.addEventListener("mousemove", handle_mousemove_event);
		Page.temporary_handlers["mousemove"].push(handle_mousemove_event);
		
		document.documentElement.addEventListener("mouseup", handle_mouseup_event);
		Page.temporary_handlers["mouseup"].push(handle_mouseup_event);
		
		document.querySelector("#output-canvas").addEventListener("touchstart", handle_touchstart_event);
		
		document.querySelector("#output-canvas").addEventListener("touchmove", handle_touchmove_event);
		
		document.querySelector("#output-canvas").addEventListener("touchend", handle_touchend_event);
		
		window.addEventListener("wheel", handle_wheel_event, {passive: false});
		Page.temporary_handlers["wheel"].push(handle_wheel_event);
	}
	
	
	
	function handle_mousedown_event(e)
	{
		e.preventDefault();
		
		mouse_x = e.clientX;
		mouse_y = e.clientY;
		
		if (julia_mode !== 2)
		{
			currently_dragging = true;
		}
		
		else
		{
			julia_mode = 1;
			
			center_x = 0;
			center_y = 0;
			box_size = 4;
			zoom_level = 0;
			
			stabilize_brightness_scale = true;
			
			document.querySelector("#switch-julia-mode-button").style.opacity = 1;
		}
		
		if (!currently_drawing)
		{
			currently_drawing = true;
			stabilize_brightness_scale = true;
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function handle_mousemove_event(e)
	{
		let new_mouse_x = e.clientX;
		let new_mouse_y = e.clientY;
		
		let mouse_x_delta = new_mouse_x - mouse_x;
		let mouse_y_delta = new_mouse_y - mouse_y;
		
		mouse_x = new_mouse_x;
		mouse_y = new_mouse_y;
		
		if (document.elementFromPoint(mouse_x, mouse_y) !== document.querySelector("#output-canvas"))
		{
			return;
		}
		
		
		
		if (julia_mode !== 2)
		{
			if (currently_dragging)
			{
				e.preventDefault();
				
				center_x -= mouse_x_delta / canvas_height * box_size;
				center_y += mouse_y_delta / canvas_height * box_size;
				
				if (!currently_drawing)
				{
					currently_drawing = true;
					stabilize_brightness_scale = false;
					
					window.requestAnimationFrame(draw_frame);
				}
			}
		}
		
		else
		{
			e.preventDefault();
			
			let local_mouse_x = mouse_x - document.querySelector("#output-canvas").getBoundingClientRect().left;
			let local_mouse_y = mouse_y - document.querySelector("#output-canvas").getBoundingClientRect().top;
			
			a = ((local_mouse_x / canvas_width) - .5) * box_size + center_x;
			b = (((canvas_height - local_mouse_y) / canvas_height) - .5) * box_size + center_y;
			
			if (!currently_drawing)
			{
				currently_drawing = true;
				stabilize_brightness_scale = false;
				
				window.requestAnimationFrame(draw_frame);
			}
		}
	}
	
	
	
	function handle_mouseup_event(e)
	{
		currently_dragging = false;
		
		currently_drawing = currently_dragging;
	}
	
	
	
	function handle_touchstart_event(e)
	{
		mouse_x = e.touches[0].clientX;
		mouse_y = e.touches[0].clientY;
		
		currently_dragging = true;
		
		
		
		if (!currently_drawing)
		{
			currently_drawing = true;
			stabilize_brightness_scale = false;
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function handle_touchmove_event(e)
	{
		e.preventDefault();
		
		
		
		if (stabilize_brightness_scale)
		{
			return;
		}
		
		
		
		let new_mouse_x = e.touches[0].clientX;
		let new_mouse_y = e.touches[0].clientY;
		
		
		
		if (e.touches.length >= 2)
		{
			was_recently_pinching = 10;
			
			let x_distance = e.touches[0].clientX - e.touches[1].clientX;
			let y_distance = e.touches[0].clientY - e.touches[1].clientY;
			
			let new_touch_distance = Math.sqrt(x_distance * x_distance + y_distance * y_distance);
			
			let touch_distance_delta = new_touch_distance - touch_distance;
			
			touch_distance = new_touch_distance;
			
			if (Math.abs(touch_distance_delta) > 20)
			{
				return;
			}
			
			
			
			let rect = document.querySelector("#output-canvas").getBoundingClientRect();
			
			let touch_center_x_proportion = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / canvas_width;
			let touch_center_y_proportion = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / canvas_height;
			
			let fixed_point_x = (touch_center_x_proportion * box_size - box_size / 2) * image_width / image_height + center_x;
			let fixed_point_y = (box_size / 2 - touch_center_y_proportion * box_size) + center_y;
			
			
			
			let increment = touch_distance_delta / 2;
			
			if (zoom_level + increment >= 0)
			{
				zoom_level += increment;
				
				box_size = 3 / Math.pow(1.02, zoom_level);
				
				num_iterations = zoom_level * 3 + 200;
			}
			
			
			
			center_x = fixed_point_x - (touch_center_x_proportion * box_size - box_size / 2) * image_width / image_height;
			center_y = fixed_point_y - (box_size / 2 - touch_center_y_proportion * box_size);
		}
		
		
		
		else
		{
			was_recently_pinching--;
			
			if (was_recently_pinching < 0)
			{
				was_recently_pinching = 0;
			}
		}
		
		
		
		let mouse_x_delta = new_mouse_x - mouse_x;
		let mouse_y_delta = new_mouse_y - mouse_y;
		
		if (was_recently_pinching && (Math.abs(mouse_x_delta) > 50 || Math.abs(mouse_y_delta) > 50))
		{
			return;
		}
		
		mouse_x = new_mouse_x;
		mouse_y = new_mouse_y;
		
		if (julia_mode !== 2)
		{
			center_x -= mouse_x_delta / canvas_height * box_size;
			center_y += mouse_y_delta / canvas_height * box_size;
		}
		
		else
		{
			let local_mouse_x = mouse_x - document.querySelector("#output-canvas").getBoundingClientRect().left;
			let local_mouse_y = mouse_y - document.querySelector("#output-canvas").getBoundingClientRect().top;
			
			a = ((local_mouse_x / canvas_width) - .5) * box_size + center_x;
			b = (((canvas_height - local_mouse_y) / canvas_height) - .5) * box_size + center_y;
		}
		
		if (!currently_drawing)
		{
			currently_drawing = true;
			stabilize_brightness_scale = false;
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function handle_touchend_event(e)
	{
		if (e.touches.length === 0)
		{
			currently_drawing = false;
			
			if (julia_mode === 2)
			{
				julia_mode = 1;
				
				center_x = 0;
				center_y = 0;
				box_size = 4;
				zoom_level = 0;
				
				document.querySelector("#switch-julia-mode-button").style.opacity = 1;
			}
		}
		
		stabilize_brightness_scale = true;
		
		setTimeout(function()
		{
			if (!currently_drawing)
			{
				window.requestAnimationFrame(draw_frame);
			}
		}, 200);
	}
	
	
	
	function handle_wheel_event(e)
	{
		if (document.elementFromPoint(mouse_x, mouse_y).id === "output-canvas")
		{
			e.preventDefault();
			
			zoom_level -= Math.sign(e.deltaY) * 10;
			
			if (zoom_level < 1)
			{
				zoom_level = 1;
				
				brightness_scale = 13;
			}
			
			
			
			let rect = document.querySelector("#output-canvas").getBoundingClientRect();
			
			let mouse_x_proportion = (mouse_x - rect.left) / canvas_width;
			let mouse_y_proportion = (mouse_y - rect.top) / canvas_height;
			
			let fixed_point_x = (mouse_x_proportion * box_size - box_size / 2) * image_width / image_height + center_x;
			let fixed_point_y = (box_size / 2 - mouse_y_proportion * box_size) + center_y;
			
			
			
			box_size = 3 / Math.pow(1.02, zoom_level);
				
			num_iterations = zoom_level * 3 + 200;
			
			
			
			center_x = fixed_point_x - (mouse_x_proportion * box_size - box_size / 2) * image_width / image_height;
			center_y = fixed_point_y - (box_size / 2 - mouse_y_proportion * box_size);
			
			
			
			window.requestAnimationFrame(draw_frame);
			
			
			
			try {clearTimeout(timeout_id);}
			catch(ex) {}
			
			timeout_id = setTimeout(function()
			{
				stabilize_brightness_scale = true;
				
				brightness_stabilization_direction = 0;
				
				window.requestAnimationFrame(draw_frame);
			}, 500);
		}
	}
	
	
	
	function fractals_resize()
	{
		canvas_width = document.querySelector("#output-canvas").offsetWidth;
		canvas_height = document.querySelector("#output-canvas").offsetHeight;
		canvas_size = Math.min(canvas_width, canvas_height);
	}
	
	
	
	function change_resolution()
	{
		image_size = parseInt(document.querySelector("#image-size-input").value || 500);
		
		if (image_size < 200)
		{
			image_size = 200;
		}
		
		if (image_size > 2000)
		{
			image_size = 2000;
		}
		
		
		
		if (Page.Applets.Canvases.is_fullscreen)
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
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", image_width);
		document.querySelector("#output-canvas").setAttribute("height", image_height);
		
		gl.viewport(0, 0, image_width, image_height);
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function prepare_download()
	{
		let temp = image_size;
		
		image_size = parseInt(document.querySelector("#high-res-dim-input").value || 2000);
		
		num_iterations += 50;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
		
		
		
		let link = document.createElement("a");
		
		link.download = "a-mandelbrot-zoom.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
		
		
		
		image_size = temp;
		
		num_iterations -= 50;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		draw_frame();
	}
}()