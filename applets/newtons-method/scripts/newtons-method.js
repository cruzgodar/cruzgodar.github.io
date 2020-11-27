!function()
{
	"use strict";
	
	
	
	let image_size = 500;
	
	let current_roots = [];
	let last_roots = [];
	
	let num_iterations = 50;
	
	let gl = document.querySelector("#newtons-method-plot").getContext("webgl");
	
	let web_worker = null;
	
	let draw_another_frame = false;
	let need_to_restart = true;
	
	
	
	let root_markers = [];
	
	let active_marker = -1;
	
	//Used with the root setter.
	let last_active_marker = -1;
	
	let root_selector_width = document.querySelector("#root-selector").offsetWidth;
	let root_selector_height = document.querySelector("#root-selector").offsetHeight;
	
	let root_marker_radius = 17.5;
	
	
	
	const threshold = .05;
	
	let brightness_map = [];
	let closest_roots = [];
	
	//We keep a rolling average of 10 of these to smooth out the low-res frames.
	let recent_max_brightnesses = [];
	
	const colors =
	[
		[255, 0, 0],
		[0, 255, 0],
		[0, 0, 255],
		
		[0, 255, 255],
		[255, 0, 255],
		[255, 255, 0],
		
		[127, 0, 255],
		[255, 127, 0]
	];
	
	
	
	adjust_for_settings();
	
	init_listeners();
	
	

	document.querySelector("#add-marker-button").addEventListener("click", add_marker);
	document.querySelector("#spread-markers-button").addEventListener("click", spread_roots);
	document.querySelector("#generate-high-res-plot-button").addEventListener("click", draw_frame);
	
	document.querySelector("#dim-input").addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_high_res_plot();
		}
	});
	
	window.addEventListener("resize", newtons_method_resize);
	temporary_handlers["resize"].push(newtons_method_resize);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#newtons-method-plot"), document.querySelector("#root-selector")];
	
	applet_canvas_resize_callback = function()
	{
		root_selector_width = document.querySelector("#root-selector").offsetWidth;
		root_selector_height = document.querySelector("#root-selector").offsetHeight;
		
		newtons_method_resize();
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
	
	
	
	const frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform int num_iterations;
		
		const float brightness_scale = 20.0;
		
		const vec2 root_1 = vec2(1.0, 0.0);
		const vec2 root_2 = vec2(-.5, .866);
		const vec2 root_3 = vec2(-.5, -.866);
		
		const vec3 color_1 = vec3(1.0, 0.0, 0.0);
		const vec3 color_2 = vec3(0.0, 1.0, 0.0);
		const vec3 color_3 = vec3(0.0, 0.0, 1.0);
		
		const int num_roots = 3;
		
		const float threshhold = .05;
		
		
		
		//Returns z_1 * z_2.
		vec2 complex_multiply(vec2 z_1, vec2 z_2)
		{
			return vec2(z_1.x * z_2.x - z_1.y * z_2.y, z_1.x * z_2.y + z_1.y * z_2.x);
		}
		
		
		
		//Returns 1/z.
		vec2 complex_invert(vec2 z)
		{
			float magnitude = length(z) * length(z);
			
			return vec2(z.x / magnitude, -z.y / magnitude);
		}
		
		
		
		//Returns f(z) for a polynomial f with given roots.
		vec2 complex_polynomial(vec2 z)
		{
			vec2 result = vec2(1.0, 0.0);
			
			if (num_roots == 0)
			{
				return result;
			}
			
			result = complex_multiply(result, z - root_1);
			
			
			
			if (num_roots == 1)
			{
				return result;
			}
			
			result = complex_multiply(result, z - root_2);
			
			
			
			if (num_roots == 2)
			{
				return result;
			}
			
			result = complex_multiply(result, z - root_3);
			
			
			
			return result;
		}
		
		
		
		//Approximates f'(z) for a polynomial f with given roots.
		vec2 complex_derivative(vec2 z)
		{
			return 1000.0 * (complex_polynomial(z) - complex_polynomial(z - vec2(.001, 0.0)));
		}
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * 2.0, uv.y * 2.0);
			vec2 last_z = vec2(0.0, 0.0);
			
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			for (int iteration = 0; iteration < 51; iteration++)
			{
				if (iteration == num_iterations)
				{
					break;
				}
				
				vec2 temp = complex_multiply(complex_polynomial(z), complex_invert(complex_derivative(z)));
				
				last_z = z;
				
				z -= temp;
				
				
				
				float d_0 = length(z - root_1);
				
				if (num_roots >= 1 && d_0 < threshhold)
				{
					float d_1 = length(last_z - root_1);
					
					float brightness_adjust = (log(threshhold) - log(d_0)) / (log(d_1) - log(d_0));
					
					float brightness = 1.0 - (float(iteration) - brightness_adjust) / brightness_scale;
					
					gl_FragColor = vec4(color_1 * brightness, 1.0);
					
					return;
				}
				
				
				
				d_0 = length(z - root_2);
				
				if (num_roots >= 2 && d_0 < threshhold)
				{
					float d_1 = length(last_z - root_2);
					
					float brightness_adjust = (log(threshhold) - log(d_0)) / (log(d_1) - log(d_0));
					
					float brightness = 1.0 - (float(iteration) - brightness_adjust) / brightness_scale;
					
					gl_FragColor = vec4(color_2 * brightness, 1.0);
					
					return;
				}
				
				
				
				d_0 = length(z - root_3);
				
				if (num_roots >= 2 && d_0 < threshhold)
				{
					float d_1 = length(last_z - root_3);
					
					float brightness_adjust = (log(threshhold) - log(d_0)) / (log(d_1) - log(d_0));
					
					float brightness = 1.0 - (float(iteration) - brightness_adjust) / brightness_scale;
					
					gl_FragColor = vec4(color_3 * brightness, 1.0);
					
					return;
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
		
		
		
		shader_program.num_iterations_uniform = gl.getUniformLocation(shader_program, "num_iterations");
		
		
		
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
		document.querySelector("#newtons-method-plot").setAttribute("width", image_size);
		document.querySelector("#newtons-method-plot").setAttribute("height", image_size);
		
		
		
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setTimeout(setup_webgl, 500);
	});
	
	
	
	//Writes MathJax to the space underneath the graph. This is the closest I've come to writing a text adventure.
	function update_polynomial_label(roots)
	{
		//This initializes the polynomial to z - z_0.
		let coefficients = [[-roots[0][0], -roots[0][1]], [1, 0]];
		
		
		
		//I really hate this part of the algorithm, but it doesn't happen that often and doesn't need to be super crazy fast.
		for (let i = 1; i < roots.length; i++)
		{
			let old_coefficients = JSON.parse(JSON.stringify(coefficients));
			
			//We're going to distribute (z - z_i) over the current polynomial. First, we'll do z, which shifts the degree up by 1.
			coefficients.unshift([0, 0]);
			
			//Now we'll distribute -z_i over everything.
			for (let j = 0; j < old_coefficients.length; j++)
			{
				let temp = complex_multiply([-roots[i][0], -roots[i][1]], old_coefficients[j]);
				
				coefficients[j][0] += temp[0];
				coefficients[j][1] += temp[1];
			}
		}
		
		
		
		//Now we have the coefficients, but we need to convert them into MathJax.
		let polynomial_string = "\\(f(z) = ";
		
		let num_terms_written = 0;
		
		let current_label = 1;
		
		
		
		document.querySelector("#polynomial-label-1").textContent = "";
		document.querySelector("#polynomial-label-2").textContent = "";
		document.querySelector("#polynomial-label-3").textContent = "";
		
		
		
		for (let i = coefficients.length - 1; i >= 0; i--)
		{
			let wrote_something = true;
			
			num_terms_written++;
			
			
			
			coefficients[i][0] = Math.round(coefficients[i][0] * 100) / 100;
			coefficients[i][1] = Math.round(coefficients[i][1] * 100) / 100;
			
			
			
			if (coefficients[i][0] === 0 && coefficients[i][1] === 0)
			{
				wrote_something = false;
				
				num_terms_written--;
			}
			
			
			
			else if (coefficients[i][1] === 0)
			{
				let coefficient = Math.abs(coefficients[i][0]);
				
				if (coefficient === 1 && i > 0)
				{
					//If this is the first term, we don't want a plus sign.
					if (coefficients[i][0] > 0 && i === coefficients.length - 1)
					{
						polynomial_string += ``;
					}
					
					else if (coefficients[i][0] > 0)
					{
						polynomial_string += ` + `;
					}
					
					else if (coefficients[i][0] < 0)
					{
						polynomial_string += ` - `;
					}
				}
				
				else
				{
					//If this is the first term, we don't want a plus sign.
					if (coefficients[i][0] > 0 && i === coefficients.length - 1)
					{
						polynomial_string += `${coefficient}`;
					}
					
					else if (coefficients[i][0] > 0)
					{
						polynomial_string += ` + ${coefficient}`;
					}
					
					else if (coefficients[i][0] < 0)
					{
						polynomial_string += ` - ${coefficient}`;
					}
				}
			}
			
			
			
			else if (coefficients[i][0] === 0)
			{
				let coefficient = Math.abs(coefficients[i][1]);
				
				if (coefficient === 1 && i > 0)
				{
					//If this is the first term, we don't want a plus sign.
					if (coefficients[i][1] > 0 && i === coefficients.length - 1)
					{
						polynomial_string += `i`;
					}
					
					else if (coefficients[i][1] > 0)
					{
						polynomial_string += ` + i`;
					}
					
					else if (coefficients[i][1] < 0)
					{
						polynomial_string += ` - i`;
					}
				}
				
				else
				{
					//If this is the first term, we don't want a plus sign.
					if (coefficients[i][1] > 0 && i === coefficients.length - 1)
					{
						polynomial_string += `${coefficient}i`;
					}
					
					else if (coefficients[i][1] > 0)
					{
						polynomial_string += ` + ${coefficient}i`;
					}
					
					else if (coefficients[i][1] < 0)
					{
						polynomial_string += ` - ${coefficient}i`;
					}
				}
			}
			
			
			
			else
			{
				if (i === coefficients.length - 1)
				{
					if (coefficients[i][1] > 0)
					{
						polynomial_string += `(${coefficients[i][0]} + ${coefficients[i][1]}i)`;
					}
					
					else
					{
						polynomial_string += `(${coefficients[i][0]} - ${Math.abs(coefficients[i][1])}i)`;
					}
				}
				
				else
				{
					if (coefficients[i][1] > 0)
					{
						polynomial_string += ` + (${coefficients[i][0]} + ${coefficients[i][1]}i)`;
					}
					
					else
					{
						polynomial_string += ` + (${coefficients[i][0]} - ${Math.abs(coefficients[i][1])}i)`;
					}
				}
			}
			
			
			
			//Now we'll add the power of z.
			if (wrote_something)
			{
				if (i > 1)
				{
					polynomial_string += `z^${i}`;
				}
				
				else if (i === 1)
				{
					polynomial_string += `z`;
				}
			}
			
			
			
			if (num_terms_written === 3)
			{
				polynomial_string += "\\)";
				
				document.querySelector(`#polynomial-label-${current_label}`).textContent = polynomial_string;
				
				polynomial_string = "\\(";
				
				//This just ensures we won't do this again.
				num_terms_written = 0;
				
				current_label++;
			}
		}
		
		
		
		if (current_label !== 4)
		{
			polynomial_string += "\\)";
			
			document.querySelector(`#polynomial-label-${current_label}`).textContent = polynomial_string;
		}
		
		
		
		typeset_math();
	}
	
	
	
	function init_listeners()
	{
		document.documentElement.addEventListener("touchstart", drag_start, false);
		document.documentElement.addEventListener("touchmove", drag_move, false);
		document.documentElement.addEventListener("touchend", drag_end, false);

		document.documentElement.addEventListener("mousedown", drag_start, false);
		document.documentElement.addEventListener("mousemove", drag_move, false);
		document.documentElement.addEventListener("mouseup", drag_end, false);
		
		
		temporary_handlers["touchstart"].push(drag_start);
		temporary_handlers["touchmove"].push(drag_move);
		temporary_handlers["touchend"].push(drag_end);
		
		temporary_handlers["mousedown"].push(drag_start);
		temporary_handlers["mousemove"].push(drag_move);
		temporary_handlers["mouseup"].push(drag_end);
		
		
		
		document.querySelector("#root-a-input").addEventListener("input", set_root);
		document.querySelector("#root-b-input").addEventListener("input", set_root);
		
		document.querySelector("#root-a-input").addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				image_size = 500;
				
				draw_newtons_method_plot(current_roots);
			}
		});
		
		document.querySelector("#root-b-input").addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				image_size = 500;
				
				draw_newtons_method_plot(current_roots);
			}
		});
	}
	
	
	
	function add_marker()
	{
		if (current_roots.length === colors.length)
		{
			return;
		}
		
		
		
		let element = document.createElement("div");
		element.classList.add("root-marker");
		element.id = `root-marker-${root_markers.length}`;
		element.style.transform = `translate3d(${root_selector_width / 2 - root_marker_radius}px, ${root_selector_height / 2 - root_marker_radius}px, 0)`;
		
		document.querySelector("#root-selector").appendChild(element);
		
		root_markers.push(element);
		
		current_roots.push([0, 0]);
		
		recent_max_brightnesses = [];
		
		image_size = 500;
				
		draw_frame();
	}
	
	
	
	function drag_start(e)
	{
		active_marker = -1;
		
		//Figure out which marker, if any, this is referencing.
		for (let i = 0; i < root_markers.length; i++)
		{
			if (e.target.id === `root-marker-${i}`)
			{
				e.preventDefault();
				
				recent_max_brightnesses = [];
				
				active_marker = i;
				
				break;
			}
		}
	}
	
	
	
	function drag_end(e)
	{
		if (active_marker !== -1)
		{
			document.body.style.WebkitUserSelect = "";
			
			image_size = 500;
			
			
			
			draw_another_frame = true;
			
			if (need_to_restart)
			{
				need_to_restart = false;
				
				window.requestAnimationFrame(draw_newtons_method_plot);
			}
			
			
	
			document.querySelector("#polynomial-label-1").textContent = "";	
			document.querySelector("#polynomial-label-2").textContent = "";
			document.querySelector("#polynomial-label-3").textContent = "";
			
			last_active_marker = active_marker;
			
			show_root_setter();
		}
		
		active_marker = -1;
	}
	
	
	
	function drag_move(e)
	{
		if (active_marker === -1)
		{
			return;
		}
		
		
		
		let row = null;
		let col = null;
		
		let rect = document.querySelector("#root-selector").getBoundingClientRect();
		
		if (e.type === "touchmove")
		{
			row = e.touches[0].clientY - rect.top;
			col = e.touches[0].clientX - rect.left;
		}
		
		else
		{
			row = e.clientY - rect.top;
			col = e.clientX - rect.left;
		}
		
		
		
		if (row < root_marker_radius)
		{
			row = root_marker_radius;
		}
		
		if (row > root_selector_height - root_marker_radius)
		{
			row = root_selector_height - root_marker_radius;
		}
		
		if (col < root_marker_radius)
		{
			col = root_marker_radius;
		}
		
		if (col > root_selector_width - root_marker_radius)
		{
			col = root_selector_width - root_marker_radius;
		}
		
		
		
		root_markers[active_marker].style.transform = `translate3d(${col - root_marker_radius}px, ${row - root_marker_radius}px, 0)`;
		
		let x = ((col - root_selector_width/2) / root_selector_width) * 4;
		let y = (-(row - root_selector_height/2) / root_selector_height) * 4;
		
		current_roots[active_marker][0] = x;
		current_roots[active_marker][1] = y;
		
		image_size = 100;
		
		

		draw_another_frame = true;
		
		if (need_to_restart)
		{
			need_to_restart = false;
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	//Spreads the roots in an even radius.
	function spread_roots(high_res = true)
	{
		document.querySelector("#polynomial-label-1").textContent = "";
		document.querySelector("#polynomial-label-2").textContent = "";
		document.querySelector("#polynomial-label-3").textContent = "";
		
		
		
		for (let i = 0; i < current_roots.length; i++)
		{
			if (i < current_roots.length / 2 || current_roots.length % 2 === 1)
			{
				current_roots[i][0] = Math.cos(2 * Math.PI * 2 * i / current_roots.length);
				current_roots[i][1] = Math.sin(2 * Math.PI * 2 * i / current_roots.length);
			}
			
			else
			{
				current_roots[i][0] = Math.cos(2 * Math.PI * (2 * i + 1) / current_roots.length);
				current_roots[i][1] = Math.sin(2 * Math.PI * (2 * i + 1) / current_roots.length);
			}
			
			
			
			let row = Math.floor(root_selector_height * (1 - (current_roots[i][1] / 4 + .5)));
			let col = Math.floor(root_selector_width * (current_roots[i][0] / 4 + .5));
			
			root_markers[i].style.transform = `translate3d(${col - root_marker_radius}px, ${row - root_marker_radius}px, 0)`;
		}
		
		if (high_res)
		{
			image_size = 500;
		}
		
		else
		{
			image_size = 100;
		}
		
		draw_newtons_method_plot(current_roots);
	}
	
	
	
	function show_root_setter()
	{
		document.querySelector("#root-a-input").value = Math.round(current_roots[last_active_marker][0] * 1000) / 1000;
		document.querySelector("#root-b-input").value = Math.round(current_roots[last_active_marker][1] * 1000) / 1000;
		
		document.querySelector("#root-setter").style.pointerEvents = "auto";
		
		document.querySelector("#root-setter").style.opacity = 1;
	}
	
	function set_root()
	{
		current_roots[last_active_marker][0] = parseFloat(document.querySelector("#root-a-input").value) || 0;
		current_roots[last_active_marker][1] = parseFloat(document.querySelector("#root-b-input").value) || 0;
		
		
		
		let row = Math.floor(root_selector_height * (1 - (current_roots[last_active_marker][1] / 4 + .5)));
		let col = Math.floor(root_selector_width * (current_roots[last_active_marker][0] / 4 + .5));
		
		root_markers[last_active_marker].style.transform = `translate3d(${col - root_marker_radius}px, ${row - root_marker_radius}px, 0)`;
		
		
		
		image_size = 100;
		
		draw_frame();
	}
	
	
	
	function prepare_download()
	{
		let link = document.createElement("a");
		
		link.download = "newtons-method.png";
		
		link.href = document.querySelector("#newtons-method-plot").toDataURL();
		
		link.click();
		
		link.remove();
	}
	
	
	
	function newtons_method_resize()
	{
		root_selector_width = document.querySelector("#root-selector").offsetWidth;
		root_selector_height = document.querySelector("#root-selector").offsetHeight;
		
		let rect = document.querySelector("#root-selector").getBoundingClientRect();
		
		for (let i = 0; i < current_roots.length; i++)
		{
			let row = Math.floor(root_selector_height * (1 - (current_roots[i][1] / 4 + .5)));
			let col = Math.floor(root_selector_width * (current_roots[i][0] / 4 + .5));
			
			root_markers[i].style.transform = `translate3d(${col - root_marker_radius}px, ${row - root_marker_radius}px, 0)`;
		}
	}



	function adjust_for_settings()
	{
		if (url_vars["contrast"] === 1)
		{
			if (url_vars["theme"] === 1)
			{
				document.querySelector("#newtons-method-plot").style.borderColor = "rgb(192, 192, 192)";
			}
			
			else
			{
				document.querySelector("#newtons-method-plot").style.borderColor = "rgb(64, 64, 64)";
			}
		}
		
		add_style(`
			.root-marker.hover
			{
				background-color: rgb(127, 127, 127);	
			}
			
			.root-marker:not(:hover):focus
			{
				background-color: rgb(127, 127, 127);
				outline: none;
			}
		`, true);
	}
}()