!function()
{
	"use strict";
	
	
	
	let a = 0;
	let b = 0;
	let image_size = 1000;
	let num_iterations = 100;
	let brightness_scale = 10;
	
	let small_canvas_size = 0;
	let large_canvas_size = 0;

	let small_image_size = 1000;

	let small_num_iterations = 200;
	let large_num_iterations = 500;

	let persist_image = false;
	
	let stabilize_brightness_scale = false;
	
	let draw_another_frame = false;
	let need_to_restart = true;
	
	let gl = document.querySelector("#julia-set").getContext("webgl");
	
	document.querySelector("#julia-set").setAttribute("width", small_image_size);
	document.querySelector("#julia-set").setAttribute("height", small_image_size);



	adjust_for_settings();



	document.querySelector("#generate-button").addEventListener("click", draw_high_res_julia);
	
	let elements = document.querySelectorAll("#a-input, #b-input, #dim-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				draw_high_res_julia();
			}
		});
	}
	
	document.querySelector("#download-button").addEventListener("click", prepare_download);



	//Only get the width of the Mandelbrot set has finished loading in order to get the correct value.
	small_canvas_size = document.querySelector("#julia-set").offsetWidth;
	large_canvas_size = document.querySelector("#output-canvas").offsetWidth;

	window.addEventListener("resize", julia_resize);
	temporary_handlers["resize"].push(julia_resize);

	setTimeout(julia_resize, 1000);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_resize_callback = function()
	{
		large_canvas_size = document.querySelector("#output-canvas").offsetWidth;
	};
	
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
		
		const float box_size_halved = 2.0;
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		uniform int num_iterations;
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * box_size_halved, uv.y * box_size_halved);
			float brightness = exp(-length(z));
			
			
			
			for (int iteration = 0; iteration < 201; iteration++)
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
		
		
		
		shader_program.a_uniform = gl.getUniformLocation(shader_program, "a");
		shader_program.b_uniform = gl.getUniformLocation(shader_program, "b");
		shader_program.num_iterations_uniform = gl.getUniformLocation(shader_program, "num_iterations");
		shader_program.brightness_scale_uniform = gl.getUniformLocation(shader_program, "brightness_scale");
		
		
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
		init_listeners_no_touch();
		init_listeners_touch();
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
		gl.uniform1f(shader_program.a_uniform, a);
		gl.uniform1f(shader_program.b_uniform, b);
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		gl.uniform1f(shader_program.brightness_scale_uniform, brightness_scale);
		
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
		
		if (num_pixels_at_max < .1 * image_size)
		{
			brightness_scale -= .5;
			
			changed_brightness_scale = true;
		}
		
		else if (num_pixels_at_max > .2 * image_size)
		{
			brightness_scale += .5;
			
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
				stabilize_brightness_scale = false;
			}
		}
		
		else if (draw_another_frame)
		{
			draw_another_frame = false;
			
			window.requestAnimationFrame(draw_frame);
		}
		
		else
		{
			need_to_restart = true;
		}
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		
		
		if (b < 0)
		{
			link.download = a + " - " + (-b) + "i.png";
		}
		
		else
		{
			link.download = a + " + " + b + "i.png";
		}
		
		
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}



	function draw_high_res_julia()
	{
		a = parseFloat(document.querySelector("#a-input").value || 0);
		b = parseFloat(document.querySelector("#b-input").value || 1);
		image_size = parseFloat(document.querySelector("#dim-input").value) || 1000;
		
		document.querySelector("#julia-set").setAttribute("width", image_size);
		document.querySelector("#julia-set").setAttribute("height", image_size);
		gl.viewport(0, 0, image_size, image_size);
		
		num_iterations = large_num_iterations;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		
		
		draw_frame();
		
		
		
		document.querySelector("#output-canvas").getContext("2d").drawImage(document.querySelector("#julia-set"), 0, 0);
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(192, 192, 192)";
				document.querySelector("#julia-set").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#mandelbrot-set").style.borderColor = "rgb(64, 64, 64)";
				document.querySelector("#julia-set").style.borderColor = "rgb(64, 64, 64)";
			}
		}
	}



	function init_listeners_no_touch()
	{	
		document.querySelector("#mandelbrot-set").addEventListener("mouseenter", function(e)
		{
			persist_image = false;
			
			
			
			document.querySelector("#julia-set").setAttribute("width", small_image_size);
			document.querySelector("#julia-set").setAttribute("height", small_image_size);
			gl.viewport(0, 0, small_image_size, small_image_size);
			
			image_size = small_image_size;
			num_iterations = small_num_iterations;
		});
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("mousemove", function(e)
		{
			if (persist_image === false)
			{
				let mouse_x = e.clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
				let mouse_y = e.clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
				
				a = ((mouse_x / small_canvas_size) - .5) * 3 - .75;
				b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * 3;
				
				
				
				draw_another_frame = true;
				
				if (need_to_restart)
				{
					need_to_restart = false;
					
					window.requestAnimationFrame(draw_frame);
				}
			}
		});
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("click", function(e)
		{
			stabilize_brightness_scale = true;
			window.requestAnimationFrame(draw_frame);
			
			persist_image = true;
			
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
		});
	}



	function init_listeners_touch()
	{
		let last_touch_x = 0;
		let last_touch_y = 0;
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchstart", function(e)
		{
			e.preventDefault();
			
			
			document.querySelector("#julia-set").setAttribute("width", small_image_size);
			document.querySelector("#julia-set").setAttribute("height", small_image_size);
			gl.viewport(0, 0, small_image_size, small_image_size);
			
			image_size = small_image_size;
			num_iterations = small_num_iterations;
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchmove", function(e)
		{
			e.preventDefault();
				
			let touch_x = e.touches[0].clientX - document.querySelector("#mandelbrot-set").getBoundingClientRect().left;
			let touch_y = e.touches[0].clientY - document.querySelector("#mandelbrot-set").getBoundingClientRect().top;
			
			last_touch_x = touch_x;
			last_touch_y = touch_y;
			
			a = ((touch_x / small_canvas_size) - .5) * 3 - .75;
			b = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * 3;
			
			
			
			draw_another_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_frame);
			}
		}, false);
		
		
		
		document.querySelector("#mandelbrot-set").addEventListener("touchend", function(e)
		{
			e.preventDefault();
			
			stabilize_brightness_scale = true;
			window.requestAnimationFrame(draw_frame);
				
			document.querySelector("#a-input").value = Math.round(1000000 * a) / 1000000;
			document.querySelector("#b-input").value = Math.round(1000000 * b) / 1000000;
		}, false);
	}



	function julia_resize()
	{
		small_canvas_size = document.querySelector("#julia-set").offsetWidth;
		large_canvas_size = document.querySelector("#output-canvas").offsetWidth;
	}
}()