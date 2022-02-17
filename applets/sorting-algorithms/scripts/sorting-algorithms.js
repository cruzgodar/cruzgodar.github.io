!function()
{
	"use strict";
	
	
	let resolution = 2000;
	
	let data_length = 10;
	
	let data = new Array(data_length);
	
	for (let i = 0; i < data_length; i++)
	{
		data[i] = i;
	}
	
	let current_generator = null;
	
	let last_timestamp = -1;
	
	let starting_process_id = null;
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		const float circle_size = .8;
		
		uniform float data_length;
		
		uniform sampler2D u_texture;
		
		
		
		vec3 hsv2rgb(vec3 c)
		{
			vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
			vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
			return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}
		
		
		
		void main(void)
		{
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			
			if (length(uv) <= circle_size)
			{
				float sample = mod(atan(uv.y, uv.x) / 6.283, 1.0);
				
				float h_1 = texture2D(u_texture, vec2(floor(sample * data_length) / data_length, .5)).x / data_length * 255.0;
				float h_2 = texture2D(u_texture, vec2(mod(floor(sample * data_length + 1.0) / data_length, 1.0), .5)).x / data_length * 255.0;
				
				if (abs(h_1 - h_2) > .5)
				{
					if (h_1 > h_2)
					{
						h_1 -= 1.0;
					}
					
					else
					{
						h_2 -= 1.0;
					}
				}
				
				float h = mix(h_1, h_2, fract(sample * data_length));
				
				float s = clamp((length(uv) / circle_size - .03) * 1.0, 0.0, 1.0);
				
				float v = min(1.0, (1.0 - length(uv) / circle_size) * 100.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		}
	`;
	
	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 2000,
		canvas_height: 2000,
		
		
		
		use_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	wilson.render.init_uniforms(["data_length"]);
	
	
	
	let texture = wilson.gl.createTexture();
	
	wilson.gl.bindTexture(wilson.gl.TEXTURE_2D, texture);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MAG_FILTER, wilson.gl.NEAREST);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_MIN_FILTER, wilson.gl.NEAREST);
	
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_S, wilson.gl.CLAMP_TO_EDGE);
	wilson.gl.texParameteri(wilson.gl.TEXTURE_2D, wilson.gl.TEXTURE_WRAP_T, wilson.gl.CLAMP_TO_EDGE);
	
	wilson.gl.disable(wilson.gl.DEPTH_TEST);
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_sorting_algorithm);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			draw_sorting_algorithm();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("an-aztec-diamond.png");
	});
	
	
	
	function draw_sorting_algorithm()
	{
		starting_process_id = Site.applet_process_id;
		
		
		
		resolution = parseInt(resolution_input_element.value || 2000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		wilson.gl.uniform1f(wilson.uniforms["data_length"], data_length);
		
		
		
		current_generator = shuffle_array();
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function draw_frame(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		let texture_data = new Uint8Array(data_length * 4);
		
		for (let i = 0; i < data_length; i++)
		{
			texture_data[4 * i] = data[i];
			texture_data[4 * i + 1] = 0;
			texture_data[4 * i + 2] = 0;
			texture_data[4 * i + 3] = 0;
		}
		
		wilson.gl.texImage2D(wilson.gl.TEXTURE_2D, 0, wilson.gl.RGBA, data_length, 1, 0, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, texture_data);
		
		wilson.render.draw_frame();
		
		current_generator.next();
		
		
		
		if (starting_process_id !== Site.applet_process_id)
		{
			console.log("Terminated applet process");
			
			return;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function* shuffle_array()
	{
		for (let i = 0; i < data_length - 1; i++)
		{
			let j = Math.floor(Math.random() * (data_length - i - 1)) + i;
			
			let temp = data[i];
			data[i] = data[j];
			data[j] = temp;
			
			yield;
		}
	}
}()