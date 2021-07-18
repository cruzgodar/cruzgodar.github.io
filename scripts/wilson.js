let Wilson =
{
	canvas: null,
	
	ctx: null,
	gl: null,
	
	img_data: null,
	
	shader_program: null,
	texture: null,
	
	canvas_width: null,
	canvas_height: null,
	
	world_width: -1,
	world_height: -1,
	
	world_center_x: -1,
	world_center_y: -1,
	
	
	
	//Sets up a canvas to work with Wilson.
	/*
		options:
		{
			world_width, world_height: 
			world_center_x, world_center_y:
			
			renderer: "cpu", "gpu", "hybrid"
		}
	*/
	
	init: function(canvas, options)
	{
		this.canvas = canvas;
		
		this.canvas_width = parseInt(this.canvas.getAttribute("width"));
		this.canvas_height = parseInt(this.canvas.getAttribute("height"));
		
		
		
		console.log(`[Wilson] Registered a ${this.canvas_width}x${this.canvas_height} canvas`);
		
		
		
		if (typeof options.world_width !== "undefined")
		{
			this.world_width = options.world_width;
		}
		
		if (typeof options.world_height !== "undefined")
		{
			this.world_height = options.world_height;
		}
		
		if (typeof options.world_center_x !== "undefined")
		{
			this.world_center_x = options.world_center_x;
		}
		
		if (typeof options.world_center_y !== "undefined")
		{
			this.world_center_y = options.world_center_y;
		}
		
		
		
		if (typeof options.renderer === "undefined" || options.renderer === "cpu")
		{
			this.ctx = this.canvas.getContext("2d");
			
			this.img_data = this.ctx.getImageData(0, 0, this.canvas_width, this.canvas_height);
		}
		
		else
		{
			this.init_webgl();
		}
	},
	
	
	
	//Contains utility functions for switching between canvas and world coordinates.
	Interpolate:
	{
		canvas_to_world: function(row, col)
		{
			return [(col / Wilson.canvas_width - .5) * Wilson.world_width + Wilson.world_center_x, (.5 - row / Wilson.canvas_height) * Wilson.world_height + Wilson.world_center_y];
		},
		
		world_to_canvas: function(x, y)
		{
			return [Math.floor((.5 - (y - Wilson.world_center_y) / Wilson.world_height) * Wilson.canvas_height), Math.floor(((x - Wilson.world_center_x) / Wilson.world_width + .5) * Wilson.canvas_width)];
		}
	},
	
	
	
	//A utility function for converting from HSV to RGB. Accepts hsv in [0, 1] and returns rgb in [0, 255], unrounded.
	hsv_to_rgb: function(h, s, v)
	{
		function f(n)
		{
			let k = (n + 6*h) % 6;
			return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
		}
		
		return [255 * f(5), 255 * f(3), 255 * f(1)];
	},
	
	
	
	draw_frame: null,
	
	//Draws an entire frame to a cpu canvas by directly modifying the canvas data. Tends to be significantly faster than looping fillRect, **when the whole canvas needs to be updated**. If that's not the case, sticking to fillRect is generally a better idea. Here, image is a width*height array, where each element is a length-3 array of the form [r, g, b].
	draw_frame_cpu: function(image)
	{
		const width = this.canvas_width;
		const height = this.canvas_height;
		
		this.img_data = this.ctx.getImageData(0, 0, width, height);
		data = this.img_data.data;
		
		for (let i = 0; i < height; i++)
		{
			for (let j = 0; j < width; j++)
			{
				//The index in the array of rgba values
				let index = (4 * i * width) + (4 * j);
				
				data[index] = image[i][j][0];
				data[index + 1] = image[i][j][1];
				data[index + 2] = image[i][j][2];
			}
		}
		
		this.ctx.putImageData(this.img_data, 0, 0);
	},
	
	
	
	//Gets WebGL started for the canvas.
	init_webgl: function()
	{
		this.gl = this.canvas.getContext("webgl");
		
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
			
			uniform sampler2D u_texture;
			
			
			
			void main(void)
			{
				gl_FragColor = texture2D(u_texture, (uv + vec2(1.0, 1.0)) / 2.0);
			}
		`;
		
		const quad = [-1, -1, 0,   -1, 1, 0,   1, -1, 0,   1, 1, 0];
		
		
		
		let vertex_shader = load_shader(this.gl, this.gl.VERTEX_SHADER, vertex_shader_source);
		
		let frag_shader = load_shader(this.gl, this.gl.FRAGMENT_SHADER, frag_shader_source);
		
		this.shader_program = this.gl.createProgram();
		
		this.gl.attachShader(this.shader_program, vertex_shader);
		this.gl.attachShader(this.shader_program, frag_shader);
		this.gl.linkProgram(this.shader_program);
		
		if (!this.gl.getProgramParameter(this.shader_program, this.gl.LINK_STATUS))
		{
			console.log(`[Wilson] Couldn't link shader program: ${this.gl.getShaderInfoLog(shader)}`);
			gl.deleteProgram(this.shader_program);
		}
		
		this.gl.useProgram(this.shader_program);
		
		let position_buffer = this.gl.createBuffer();
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, position_buffer);
		
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quad), this.gl.STATIC_DRAW);
		
		this.shader_program.position_attribute = this.gl.getAttribLocation(this.shader_program, "position");
		
		this.gl.enableVertexAttribArray(this.shader_program.position_attribute);
		
		this.gl.vertexAttribPointer(this.shader_program.position_attribute, 3, this.gl.FLOAT, false, 0, 0);
		
		this.gl.viewport(0, 0, this.canvas_width, this.canvas_height);
		
		
		
		this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
		
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		
		const level = 0;
		const internal_format = this.gl.RGB;
		const width = 3;
		const height = 3;
		const border = 0;
		const src_format = this.gl.RGB;
		const src_type = this.gl.UNSIGNED_BYTE;
		const image_data = Uint8Array.from([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0, 255, 0, 255, 0, 255, 255, 255, 255, 255, 0, 0, 0, 127, 127, 127]);
		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internal_format, width, height, border, src_format, src_type, image_data);
		
		
		
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		let tex_loc = this.gl.getUniformLocation(this.shader_program, "u_texture");
		
		this.gl.uniform1i(this.tex_loc, 1);
		
		
		
		//Turn off mipmapping, since in general we won't have power of two canvases.
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		
		this.gl.disable(this.gl.DEPTH_TEST);
		
		
		
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
		
		
		
		function load_shader(gl, type, source)
		{
			let shader = gl.createShader(type);
			
			gl.shaderSource(shader, source);
			
			gl.compileShader(shader);
			
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			{
				console.log(`[Wilson] Couldn't load shader: ${gl.getProgramInfoLog(shaderProgram)}`);
				gl.deleteShader(shader);
			}
			
			return shader;
		}
	},
	
	
	
	draw_frame_hybrid: function(image)
	{
		
	}
};