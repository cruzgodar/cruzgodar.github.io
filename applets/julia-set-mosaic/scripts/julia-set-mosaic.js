!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	
	
	let image_size = 100;
	let num_iterations = 50;
	
	let image = new Float32Array(image_size * image_size);
	
	image[Math.floor(image_size / 2) * image_size + Math.floor(image_size / 2)] = 10000;
	
	
	
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
		
		uniform sampler2D texture_sampler;
		
		uniform float pixel_step_size;
		
		
		
		void main(void)
		{
			float total_1 = floor(texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0 + vec2(0.0, pixel_step_size)).x / 4.0);
			
			float total_2 = floor(texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0 + vec2(0.0, -pixel_step_size)).x / 4.0);
			
			float total_3 = floor(texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0 + vec2(pixel_step_size, 0.0)).x / 4.0);
			
			float total_4 = floor(texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0 + vec2(-pixel_step_size, 0.0)).x / 4.0);
			
			float total_here = texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0).x;
			
			float new_total = total_1 + total_2 + total_3 + total_4 + mod(total_here, 4.0);
			
			float r = floor(new_total / 65536.0);
			
			float g = floor((new_total - r * 65536.0) / 256.0);
			
			float b = floor(new_total - r * 65536.0 - g * 256.0);
			
			if (b == 1.0)
			{
				gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
			}
			
			else if (b == 2.0)
			{
				gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
			}
			
			else if (b == 3.0)
			{
				gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
			}
			
			else
			{
				gl_FragColor = vec4(r / 255.0, g / 255.0, b / 255.0, .99);
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
		
		
		
		let texture = load_texture();
		
		
		
		shader_program.position_attribute = gl.getAttribLocation(shader_program, "position");
		
		gl.enableVertexAttribArray(shader_program.position_attribute);
		
		gl.vertexAttribPointer(shader_program.position_attribute, 3, gl.FLOAT, false, 0, 0);
		
		
		
		gl.activeTexture(gl.TEXTURE0);
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		
		
		shader_program.texture_sampler_uniform = gl.getUniformLocation(shader_program, "texture_sampler");
		
		shader_program.pixel_step_size_uniform = gl.getUniformLocation(shader_program, "pixel_step_size");
		
		
		
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
	
	
	
	function load_texture()
	{
		let texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		let level = 0;
		let internal_format = gl.LUMINANCE;
		let width = image_size;
		let height = image_size;
		let border = 0;
		let src_format = gl.LUMINANCE;
		let src_type = gl.FLOAT;
		
		
		
		
		
		
		
		try {let ext = gl.getExtension("OES_texture_float");}
		catch(ex) {}
		
		
		
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		
		
		gl.texImage2D(gl.TEXTURE_2D, level, internal_format, width, height, border, src_format, src_type, image);
		
		return texture;
	}
	
	
	
	function draw_frame()
	{
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
		gl.uniform1f(shader_program.pixel_step_size_uniform, 1 / image_size);
		
		gl.uniform1i(shader_program.texture_sampler_uniform, 0);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		let pixels = new Uint8Array(image_size * image_size * 4);
		gl.readPixels(0, 0, image_size, image_size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		
		
		
		for (let i = 0; i < image_size * image_size; i++)
		{
			if (pixels[4 * i + 3] !== 255)
			{
				image[i] = 65536 * pixels[4 * i] + 256 * pixels[4 * i + 1] + pixels[4 * i + 2];
			}
			
			else if (pixels[4 * i] === 255)
			{
				image[i] = 3;
			}
			
			else if (pixels[4 * i] > 0)
			{
				image[i] = 2;
			}
			
			else
			{
				image[i] = 1;
			}
		}
		
		
		let texture = load_texture();
		
		gl.activeTexture(gl.TEXTURE0);
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	load_script("/scripts/gl-matrix.min.js")
	
	.then(function()
	{
		setTimeout(setup_webgl, 500);
	});
	
	
	
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