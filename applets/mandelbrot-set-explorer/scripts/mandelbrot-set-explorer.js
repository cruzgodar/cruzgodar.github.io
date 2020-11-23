!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	let canvas_size = document.querySelector("#output-canvas").offsetWidth;
	
	let currently_drawing = false;
	let stabilize_brightness_scale = false;
	
	let mouse_x = 0;
	let mouse_y = 0;
	
	let currently_dragging = false;
	let zooming_in = false;
	let zooming_out = false;
	let pressing_shift = false;
	
	
	
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
		
		
		
		if (num_pixels_at_max < .1 * image_size)
		{
			brightness_scale -= 2;
		}
		
		else if (num_pixels_at_max > .2 * image_size)
		{
			brightness_scale += 2;
		}
		
		
		
		if (currently_drawing)
		{
			update_parameters();
			
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
		document.querySelector("#output-canvas").addEventListener("mousedown", function(e)
		{
			e.preventDefault();
			
			
			
			mouse_x = e.clientX;
			mouse_y = e.clientY;
			
			currently_dragging = true;
			
			if (!currently_drawing)
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
				
				center_x -= mouse_x_delta / canvas_size * box_size;
				center_y += mouse_y_delta / canvas_size * box_size;
				
				mouse_x = new_mouse_x;
				mouse_y = new_mouse_y;
			}
		});
		
		
		
		document.documentElement.addEventListener("mouseup", function(e)
		{
			currently_dragging = false;
			
			currently_drawing = currently_dragging || zooming_in || zooming_out;
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchstart", function(e)
		{
			mouse_x = e.touches[0].clientX;
			mouse_y = e.touches[0].clientY;
			
			currently_dragging = true;
			
			if (e.touches.length === 2)
			{
				zooming_in = true;
				zooming_out = false;
			}
			
			else if (e.touches.length === 3)
			{
				zooming_in = false;
				zooming_out = true;
			}
			
			
			
			if (!currently_drawing)
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
			
			if (Math.abs(mouse_x_delta) > 100 || Math.abs(mouse_y_delta) > 100)
			{
				return;
			}
			
			center_x -= mouse_x_delta / canvas_size * box_size;
			center_y += mouse_y_delta / canvas_size * box_size;
			
			mouse_x = new_mouse_x;
			mouse_y = new_mouse_y;
		});
		
		
		
		document.querySelector("#output-canvas").addEventListener("touchend", function(e)
		{
			if (e.touches.length === 2)
			{
				zooming_in = true;
				zooming_out = false;
			}
			
			else if (e.touches.length === 3)
			{
				zooming_in = false;
				zooming_out = true;
			}
			
			else
			{
				zooming_in = false;
				zooming_out = false;
				
				if (e.touches.length === 0)
				{
					currently_drawing = false;
				}
			}
		});
		
		
		
		document.documentElement.addEventListener("keydown", function(e)
		{
			//W
			if (e.keyCode === 87)
			{
				zooming_in = true;
				zooming_out = false;
				
				if (!currently_drawing)
				{
					currently_drawing = true;
					
					window.requestAnimationFrame(draw_frame);
				}
			}
			
			//S
			else if (e.keyCode === 83)
			{
				zooming_in = false;
				zooming_out = true;
				
				if (!currently_drawing)
				{
					currently_drawing = true;
					
					window.requestAnimationFrame(draw_frame);
				}
			}
		});
		
		
		
		document.documentElement.addEventListener("keyup", function(e)
		{
			//W
			if (e.keyCode === 87)
			{
				zooming_in = false;
				zooming_out = false;
				
				currently_drawing = currently_dragging || zooming_in || zooming_out;
			}
			
			//S
			else if (e.keyCode === 83)
			{
				zooming_in = false;
				zooming_out = false;
				
				currently_drawing = currently_dragging || zooming_in || zooming_out;
			}
		});
	}
	
	
	
	function update_parameters()
	{
		if (zooming_in)
		{
			box_size /= 1.02;
			zoom_level++;
			
			num_iterations = zoom_level * 3 + 50;
		}
		
		else if (zooming_out && zoom_level > 1)
		{
			box_size *= 1.02;
			zoom_level--;
			
			num_iterations = zoom_level * 3 + 50;
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