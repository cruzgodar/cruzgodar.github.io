!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	
	let julia_sets_per_side = 100;
	let julia_set_size = 20;
	let image_size = 2000;
	let num_iterations = 50;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	
	
	let elements = document.querySelectorAll("#num-julias-input, #julia-size-input");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("keydown", function(e)
		{
			if (e.keyCode === 13)
			{
				draw_frame();
			}
		});
	}
	
	
	
	document.querySelector("#generate-button").addEventListener("click", draw_frame);
	document.querySelector("#download-button").addEventListener("click", prepare_download);
	
	
	
	applet_canvases_to_resize = [document.querySelector("#output-canvas")];
	
	applet_canvas_true_fullscreen = false;
	
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
		
		uniform float julia_sets_per_side;
		uniform float julia_set_size;
		uniform float image_size;
		uniform int num_iterations;
		
		
		
		void main(void)
		{
			float a = (floor((uv.x + 1.0) / 2.0 * julia_sets_per_side) / julia_sets_per_side * 2.0 - 1.0) * 1.5 - .75;
			float b = (floor((uv.y + 1.0) / 2.0 * julia_sets_per_side) / julia_sets_per_side * 2.0 - 1.0) * 1.5;
			
			vec2 z = vec2((mod((uv.x + 1.0) / 2.0 * image_size, julia_set_size) / julia_set_size * 2.0 - 1.0) * 1.5, (mod((uv.y + 1.0) / 2.0 * image_size, julia_set_size) / julia_set_size * 2.0 - 1.0) * 1.5);
			float brightness = exp(-length(z));
			
			vec3 color = vec3(0.0, 0.0, 0.0);
			
			float color_scale = .25;
			
			
			
			for (int iteration = 0; iteration < 100; iteration++)
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
				
				color = mix(color, vec3(abs(z.x) / 2.0, abs(z.y) / 2.0, abs(atan(z.y, z.x) / 3.141593)), color_scale);
				
				color_scale *= .25;
			}
			
			
			
			gl_FragColor = vec4(brightness / 10.0 * normalize(color), 1.0);
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
		
		
		
		shader_program.julia_sets_per_side_uniform = gl.getUniformLocation(shader_program, "julia_sets_per_side");
		shader_program.julia_set_size_uniform = gl.getUniformLocation(shader_program, "julia_set_size");
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
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
		julia_sets_per_side = parseInt(document.querySelector("#num-julias-input").value || 100);
		julia_set_size = parseInt(document.querySelector("#julia-size-input").value || 20);
		image_size = julia_sets_per_side * julia_set_size;
		
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
		gl.uniform1f(shader_program.julia_sets_per_side_uniform, julia_sets_per_side);
		gl.uniform1f(shader_program.julia_set_size_uniform, julia_set_size);
		gl.uniform1f(shader_program.image_size_uniform, julia_sets_per_side * julia_set_size);
		gl.uniform1i(shader_program.num_iterations_uniform, num_iterations);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	
	
	
	function prepare_download()
	{
		//Go figure, man.
		draw_frame();
		
		let link = document.createElement("a");
		
		link.download = "a-julia-set-mosaic.png";
		
		link.href = document.querySelector("#output-canvas").toDataURL();
		
		link.click();
		
		link.remove();
	}
}()