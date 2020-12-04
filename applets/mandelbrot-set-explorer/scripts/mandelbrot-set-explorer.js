!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = document.querySelector("#output-canvas").offsetWidth;
	
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
	
	
	
	let center_x = -.75;
	let center_y = 0;
	let box_size = 3;
	let zoom_level = 0;
	let brightness_scale = 25;
	
	
	
	let image_size = 500;
	let num_iterations = 50;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	document.querySelector("#image-size-input").addEventListener("input", change_resolution);
	document.querySelector("#generate-high-res-image-button").addEventListener("click", prepare_download);
	
	
	
	window.addEventListener("resize", fractals_resize);
	setTimeout(fractals_resize, 500);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		canvas_size = document.querySelector("#output-canvas").offsetWidth;
	};
	
	set_up_canvas_resizer();
	
	
	
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
		
		uniform float box_size_halved;
		uniform float center_x;
		uniform float center_y;
		uniform float brightness_scale;
		uniform int num_iterations;
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * box_size_halved + center_x, uv.y * box_size_halved + center_y);
			float brightness = exp(-length(z));
			
			float a = z.x;
			float b = z.y;
			
			
			
			for (int iteration = 0; iteration < 3001; iteration++)
			{
				if (iteration == num_iterations)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
				
				if (length(z) >= 2.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y + a, 2.0 * z.x * z.y + b);
				
				brightness += exp(-length(z));
			}
			
			
			
			gl_FragColor = vec4(0.0, brightness / brightness_scale, brightness / brightness_scale, 1.0);
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
		
		
		
		shader_program.box_size_halved_uniform = gl.getUniformLocation(shader_program, "box_size_halved");
		shader_program.center_x_uniform = gl.getUniformLocation(shader_program, "center_x");
		shader_program.center_y_uniform = gl.getUniformLocation(shader_program, "center_y");
		shader_program.brightness_scale_uniform = gl.getUniformLocation(shader_program, "brightness_scale");
		shader_program.num_iterations_uniform = gl.getUniformLocation(shader_program, "num_iterations");
		
		
		
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
		gl.uniform1f(shader_program.box_size_halved_uniform, box_size / 2);
		gl.uniform1f(shader_program.center_x_uniform, center_x);
		gl.uniform1f(shader_program.center_y_uniform, center_y);
		gl.uniform1f(shader_program.brightness_scale_uniform, brightness_scale);
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		let pixels = new Uint8Array(image_size * image_size * 4);
		gl.readPixels(0, 0, image_size, image_size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		
		let num_pixels_at_max = 0;
		
		for (let i = 0; i < image_size * image_size; i++)
		{
			let brightness = pixels[4 * i + 1];
			
			if (brightness === 255)
			{
				num_pixels_at_max++;
			}
		}
		
		
		
		let changed_brightness_scale = false;
		
		if (num_pixels_at_max < .1 * image_size && brightness_stabilization_direction !== 1)
		{
			brightness_scale -= 2;
			
			if (stabilize_brightness_scale)
			{
				brightness_scale -= 8;
				
				brightness_stabilization_direction = -1;
			}
			
			changed_brightness_scale = true;
		}
		
		else if (num_pixels_at_max > .2 * image_size && brightness_stabilization_direction !== -1)
		{
			brightness_scale += 2;
			
			if (stabilize_brightness_scale)
			{
				brightness_scale += 8;
				
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
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setTimeout(setup_webgl, 500);
	});
	
	
	
	function init_listeners()
	{
		document.querySelector("#output-canvas").addEventListener("mousedown", handle_mousedown_event);
		
		document.documentElement.addEventListener("mousemove", handle_mousemove_event);
		temporary_handlers["mousemove"].push(handle_mousemove_event);
		
		document.documentElement.addEventListener("mouseup", handle_mouseup_event);
		temporary_handlers["mouseup"].push(handle_mouseup_event);
		
		document.querySelector("#output-canvas").addEventListener("touchstart", handle_touchstart_event);
		
		document.querySelector("#output-canvas").addEventListener("touchmove", handle_touchmove_event);
		
		document.querySelector("#output-canvas").addEventListener("touchend", handle_touchend_event);
		
		window.addEventListener("wheel", handle_wheel_event, {passive: false});
		temporary_handlers["wheel"].push(handle_wheel_event);
	}
	
	
	
	function handle_mousedown_event(e)
	{
		e.preventDefault();
		
		mouse_x = e.clientX;
		mouse_y = e.clientY;
		
		currently_dragging = true;
		
		if (!currently_drawing && !stabilize_brightness_scale)
		{
			currently_drawing = true;
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
		
		
		
		if (currently_dragging)
		{
			e.preventDefault();
			
			center_x -= mouse_x_delta / canvas_size * box_size;
			center_y += mouse_y_delta / canvas_size * box_size;
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
			
			let touch_center_x_proportion = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / canvas_size;
			let touch_center_y_proportion = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / canvas_size;
			
			let fixed_point_x = (touch_center_x_proportion * box_size - box_size / 2) + center_x;
			let fixed_point_y = (box_size / 2 - touch_center_y_proportion * box_size) + center_y;
			
			
			
			let increment = touch_distance_delta / 2;
			
			if (zoom_level + increment >= 0)
			{
				zoom_level += increment;
				
				box_size = 3 / Math.pow(1.02, zoom_level);
				
				num_iterations = zoom_level * 3 + 50;
			}
			
			if (zoom_level < 1)
			{
				brightness_scale = 25;
			}
			
			
			
			center_x = fixed_point_x - (touch_center_x_proportion * box_size - box_size / 2);
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
		
		center_x -= mouse_x_delta / canvas_size * box_size;
		center_y += mouse_y_delta / canvas_size * box_size;
		
		mouse_x = new_mouse_x;
		mouse_y = new_mouse_y;
	}
	
	
	
	function handle_touchend_event(e)
	{
		if (e.touches.length === 0)
		{
			currently_drawing = false;
		}
		
		setTimeout(function()
		{
			if (!currently_drawing && !stabilize_brightness_scale)
			{
				stabilize_brightness_scale = true;
				
				window.requestAnimationFrame(draw_frame);
			}
		}, 500);
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
				
				brightness_scale = 25;
			}
			
			
			
			let rect = document.querySelector("#output-canvas").getBoundingClientRect();
			
			let mouse_x_proportion = (mouse_x - rect.left) / canvas_size;
			let mouse_y_proportion = (mouse_y - rect.top) / canvas_size;
			
			let fixed_point_x = (mouse_x_proportion * box_size - box_size / 2) + center_x;
			let fixed_point_y = (box_size / 2 - mouse_y_proportion * box_size) + center_y;
			
			
			
			box_size = 3 / Math.pow(1.02, zoom_level);
				
			num_iterations = zoom_level * 3 + 50;
			
			
			
			center_x = fixed_point_x - (mouse_x_proportion * box_size - box_size / 2);
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
		canvas_size = document.querySelector("#output-canvas").offsetWidth;
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
		
		
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
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