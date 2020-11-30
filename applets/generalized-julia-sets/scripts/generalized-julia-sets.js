!function()
{
	"use strict";
	
	
	
	let code_string = "cadd(cmul(z, z), c)";
	
	let a = 0;
	let b = 0;
	let image_size = 1000;
	let num_iterations = 100;
	let brightness_scale = 5;
	
	let small_canvas_size = 0;
	let large_canvas_size = 0;

	let small_image_size = 1000;

	let small_num_iterations = 100;
	let large_num_iterations = 200;
	
	let box_size = 4;
	let escape_radius = 100;

	let persist_image = false;
	
	let stabilize_brightness_scale = false;
	
	let draw_another_frame = false;
	let need_to_restart = true;
	
	let gl = document.querySelector("#julia-set").getContext("webgl");
	
	document.querySelector("#julia-set").setAttribute("width", small_image_size);
	document.querySelector("#julia-set").setAttribute("height", small_image_size);



	adjust_for_settings();
	
	
	
	document.querySelector("#generate-button-1").addEventListener("click", prepare_new_code);
	
	let elements = document.querySelectorAll("#code-input, #box-size-input, #exposure-input, #escape-radius-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				prepare_new_code();
			}
		});
	}



	document.querySelector("#generate-button-2").addEventListener("click", draw_high_res_julia);
	
	elements = document.querySelectorAll("#a-input, #b-input, #dim-input");
	
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
	
	
	
	function get_frag_shader_source(mandelbrot = false)
	{
		let mandelbrot_code = "vec2 c = uniform_c";
		
		if (mandelbrot)
		{
			mandelbrot_code = "vec2 c = z";
		}
		
		
		
		return `
			precision highp float;
			
			varying vec2 uv;
			
			uniform vec2 uniform_c;
			
			uniform float brightness_scale;
			uniform float box_size_halved;
			uniform float escape_radius;
			uniform int num_iterations;
			
			const vec2 i = vec2(0.0, 1.0);
			
			
			
			//Returns |z|.
			float cabs(vec2 z)
			{
				return length(z);
			}
			
			float cabs(float z)
			{
				return abs(z);
			}
			
			
			
			//Returns |z|.
			float carg(vec2 z)
			{
				if (z.x == 0.0)
				{
					if (z.y >= 0.0)
					{
						return 1.57079632;
					}
					
					return -1.57079632;
				}
				
				return atan(z.y, z.x);
			}
			
			float carg(float z)
			{
				if (z >= 0.0)
				{
					return 0.0;
				}
				
				return 3.14159265;
			}
			
			
			
			//Returns the conjugate of z.
			vec2 cconj(vec2 z)
			{
				return vec2(z.x, -z.y);
			}
			
			float cconj(float z)
			{
				return z;
			}
			
			
			
			//Returns z / |z|.
			vec2 csign(vec2 z)
			{
				if (length(z) == 0.0)
				{
					return vec2(0.0, 0.0);
				}
				
				return z / length(z);
			}
			
			float csign(float z)
			{
				return sign(z);
			}
			
			
			
			
			//Returns z + w.
			vec2 cadd(vec2 z, vec2 w)
			{
				return z + w;
			}
			
			vec2 cadd(vec2 z, float w)
			{
				return vec2(z.x + w, z.y);
			}
			
			vec2 cadd(float z, vec2 w)
			{
				return vec2(z + w.x, w.y);
			}
			
			float cadd(float z, float w)
			{
				return z + w;
			}
			
			
			
			//Returns z - w.
			vec2 csub(vec2 z, vec2 w)
			{
				return z - w;
			}
			
			vec2 csub(vec2 z, float w)
			{
				return vec2(z.x - w, z.y);
			}
			
			vec2 csub(float z, vec2 w)
			{
				return vec2(z - w.x, -w.y);
			}
			
			float csub(float z, float w)
			{
				return z - w;
			}
			
			
			
			//Returns z * w.
			vec2 cmul(vec2 z, vec2 w)
			{
				return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
			}
			
			vec2 cmul(vec2 z, float w)
			{
				return z * w;
			}
			
			vec2 cmul(float z, vec2 w)
			{
				return z * w;
			}
			
			float cmul(float z, float w)
			{
				return z * w;
			}
			
			
			
			//Returns z / w.
			vec2 cdiv(vec2 z, vec2 w)
			{
				if (length(w) == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / (w.x * w.x + w.y * w.y);
			}
			
			vec2 cdiv(vec2 z, float w)
			{
				if (w == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return z / w;
			}
			
			vec2 cdiv(float z, vec2 w)
			{
				if (length(w) == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return vec2(z * w.x, -z * w.y) / (w.x * w.x + w.y * w.y);
			}
			
			float cdiv(float z, float w)
			{
				if (w == 0.0)
				{
					return 1.0;
				}
				
				return z / w;
			}
			
			
			
			//Returns z^w.
			vec2 cpow(vec2 z, vec2 w)
			{
				float arg = carg(z);
				float magnitude = z.x * z.x + z.y * z.y;
				
				float exparg = exp(-w.y * arg);
				float magexp = pow(magnitude, w.x / 2.0);
				float logmag = log(magnitude) * w.y / 2.0;
				
				float p1 = exparg * cos(w.x * arg);
				float p2 = exparg * sin(w.x * arg);
				
				float q1 = magexp * cos(logmag);
				float q2 = magexp * sin(logmag);
				
				return vec2(p1 * q1 - p2 * q2, q1 * p2 + p1 * q2);
			}
			
			vec2 cpow(vec2 z, float w)
			{
				float arg = carg(z);
				float magnitude = z.x * z.x + z.y * z.y;
				
				float magexp = pow(magnitude, w / 2.0);
				
				float p1 = cos(w * arg);
				float p2 = sin(w * arg);
				
				return vec2(p1 * magexp, p2 * magexp);
			}
			
			vec2 cpow(float z, vec2 w)
			{
				if (z == 0.0)
				{
					return vec2(0.0, 0.0);
				}
				
				float zlog = log(z);
				float zexp = exp(w.x * zlog);
				
				return vec2(zexp * cos(w.y * zlog), zexp * sin(w.y * zlog));
			}
			
			float cpow(float z, float w)
			{
				return pow(z, w);
			}
			
			
			
			//Returns sqrt(z).
			vec2 csqrt(vec2 z)
			{
				return cpow(z, .5);
			}
			
			vec2 csqrt(float z)
			{
				if (z >= 0.0)
				{
					return vec2(sqrt(z), 0.0);
				}
				
				return vec2(0.0, sqrt(-z));
			}
			
			
			
			//Returns e^z.
			vec2 cexp(vec2 z)
			{
				return cpow(2.7182818, z);
			}
			
			float cexp(float z)
			{
				return exp(z);
			}
			
			
			
			//Returns log(z).
			vec2 clog(vec2 z)
			{
				return vec2(.5 * log(z.x * z.x + z.y * z.y), carg(z));
			}
			
			float clog(float z)
			{
				if (z == 0.0)
				{
					return 0.0;
				}
				
				return log(z);
			}
			
			
			
			//Returns sin(z).
			vec2 csin(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) - cexp(cmul(z, vec2(0.0, -1.0)));
				
				return cmul(temp, vec2(0.0, -0.5));
			}
			
			float csin(float z)
			{
				return sin(z);
			}
			
			
			
			//Returns cos(z).
			vec2 ccos(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) + cexp(cmul(z, vec2(0.0, -1.0)));
				
				return cmul(temp, vec2(0.0, -0.5));
			}
			
			float ccos(float z)
			{
				return cos(z);
			}
			
			
			
			//Returns tan(z).
			vec2 ctan(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 2.0)));
				
				return cdiv(cmul(vec2(0.0, -1.0), vec2(-1.0, 0.0) + temp), vec2(1.0, 0.0) + temp);
			}
			
			float ctan(float z)
			{
				return tan(z);
			}
			
			
			
			void main(void)
			{
				vec2 z = vec2(uv.x * box_size_halved, uv.y * box_size_halved);
				float brightness = exp(-length(z));
				
				${mandelbrot_code};
				
				
				for (int iteration = 0; iteration < 201; iteration++)
				{
					if (iteration == num_iterations)
					{
						gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
						return;
					}
					
					if (length(z) >= escape_radius)
					{
						break;
					}
					
					z = ${code_string};
					
					brightness += exp(-length(z));
				}
				
				
				
				gl_FragColor = vec4(.333 * brightness / brightness_scale, brightness * .333 / brightness_scale, brightness / brightness_scale, 1.0);
			}
		`;
	}
	
	
	
	let shader_program = null;
	
	function setup_webgl(mandelbrot = false)
	{
		let vertex_shader = load_shader(gl, gl.VERTEX_SHADER, vertex_shader_source);
		
		let frag_shader = load_shader(gl, gl.FRAGMENT_SHADER, get_frag_shader_source(mandelbrot));
		
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
		
		
		
		shader_program.c_uniform = gl.getUniformLocation(shader_program, "uniform_c");
		shader_program.num_iterations_uniform = gl.getUniformLocation(shader_program, "num_iterations");
		shader_program.box_size_halved_uniform = gl.getUniformLocation(shader_program, "box_size_halved");
		shader_program.escape_radius_uniform = gl.getUniformLocation(shader_program, "escape_radius");
		shader_program.brightness_scale_uniform = gl.getUniformLocation(shader_program, "brightness_scale");
		
		
		
		gl.viewport(0, 0, image_size, image_size);
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
		gl.uniform2f(shader_program.c_uniform, a, b);
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		gl.uniform1f(shader_program.box_size_halved_uniform, box_size / 2);
		gl.uniform1f(shader_program.escape_radius_uniform, escape_radius);
		gl.uniform1f(shader_program.brightness_scale_uniform, brightness_scale);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		let pixels = new Uint8Array(image_size * image_size * 4);
		gl.readPixels(0, 0, image_size, image_size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		
		let num_pixels_at_max = 0;
		
		for (let i = 0; i < image_size * image_size; i++)
		{
			let brightness = pixels[4 * i + 2];
			
			if (brightness === 255)
			{
				num_pixels_at_max++;
			}
		}
		
		
		
		let changed_brightness_scale = false;
		
		if (num_pixels_at_max < 10 * image_size && brightness_scale > .25)
		{
			brightness_scale -= .25;
			
			changed_brightness_scale = true;
		}
		
		else if (num_pixels_at_max > 15 * image_size)
		{
			brightness_scale += .25;
			
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
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setTimeout(function()
		{
			prepare_new_code();
			
			init_listeners_no_touch();
			init_listeners_touch();
		}, 500);
	});
	
	
	
	function prepare_new_code()
	{
		box_size = parseFloat(document.querySelector("#box-size-input").value || 4);
		
		escape_radius = parseFloat(document.querySelector("#escape-radius-input").value || 100);
		
		code_string = document.querySelector("#code-input").value || "cadd(cpow(z, 2.0), c)";
		
		
		
		document.querySelector("#julia-set").remove();
		
		let julia_set = document.createElement("canvas");
		julia_set.id = "julia-set";
		julia_set.classList.add("no-floating-footer");
	
		julia_set.setAttribute("width", small_image_size);
		julia_set.setAttribute("height", small_image_size);
		
		document.querySelector("#mandelbrot-set").setAttribute("width", small_image_size);
		document.querySelector("#mandelbrot-set").setAttribute("height", small_image_size);
		
		gl = julia_set.getContext("webgl");
		
		document.querySelector("#container").appendChild(julia_set);
		
		
		
		brightness_scale = 5;
		
		
		
		setup_webgl(true);
		
		
		
		stabilize_brightness_scale = false;
		
		draw_frame();
		
		document.querySelector("#mandelbrot-set").getContext("2d").drawImage(julia_set, 0, 0);
		
		
		
		document.querySelector("#julia-set").remove();
		
		julia_set = document.createElement("canvas");
		julia_set.id = "julia-set";
		julia_set.classList.add("no-floating-footer");
	
		julia_set.setAttribute("width", small_image_size);
		julia_set.setAttribute("height", small_image_size);
		
		gl = julia_set.getContext("webgl");
		
		document.querySelector("#container").appendChild(julia_set);
		
		
		
		brightness_scale = 5;
		
		
		
		setup_webgl();
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
				
				a = ((mouse_x / small_canvas_size) - .5) * box_size;
				b = (((small_canvas_size - mouse_y) / small_canvas_size) - .5) * box_size;
				
				
				
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
			
			a = ((touch_x / small_canvas_size) - .5) * box_size;
			b = (((small_canvas_size - touch_y) / small_canvas_size) - .5) * box_size;
			
			
			
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