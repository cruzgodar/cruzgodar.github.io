!function()
{
	"use strict";
	
	
	
	let gl = document.querySelector("#output-canvas").getContext("webgl");
	
	
	
	let image_size = 500;
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
		
		uniform float image_size;
		
		
		
		void main(void)
		{
			vec4 luminance = texture2D(texture_sampler, (uv + vec2(1.0, 1.0)) / 2.0);
			gl_FragColor = vec4(luminance.x, 0.0, 0.0, 1.0);
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
		
		shader_program.image_size_uniform = gl.getUniformLocation(shader_program, "image_size");
		
		
		
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
		let width = 4;
		let height = 4;
		let border = 0;
		let src_format = gl.LUMINANCE;
		let src_type = gl.UNSIGNED_BYTE;
		
		let image = new Uint8Array([
			0, 32, 64, 96,
			32, 64, 96, 128,
			64, 96, 128, 160,
			96, 128, 160, 192
		]);
		
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		
		/*
		for (let i = 0; i < image_size; i++)
		{
			for (let j = 0; j < image_size; j++)
			{
				image[(image_size * i + j) * 4] = 255;
				image[(image_size * i + j) * 4 + 1] = 255;
				image[(image_size * i + j) * 4 + 2] = 255;
				image[(image_size * i + j) * 4 + 3] = 255;
			}
		}
		*/
		gl.texImage2D(gl.TEXTURE_2D, level, internal_format, width, height, border, src_format, src_type, image);
		
		return texture;
	}
	
	
	
	function draw_frame()
	{
		document.querySelector("#output-canvas").setAttribute("width", image_size);
		document.querySelector("#output-canvas").setAttribute("height", image_size);
		
		gl.viewport(0, 0, image_size, image_size);
		
		
		
		gl.uniform1f(shader_program.image_size_uniform, image_size);
		
		gl.uniform1i(shader_program.texture_sampler_uniform, 0);
		
		
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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