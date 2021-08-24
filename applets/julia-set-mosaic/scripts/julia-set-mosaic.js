!function()
{
	"use strict";
	
	
	
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
			
			vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
			
			
			
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
			}
			
			
			
			gl_FragColor = vec4(brightness / 10.0 * color, 1.0);
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
	
	wilson.render.init_uniforms(["julia_sets_per_side", "julia_set_size", "image_size", "num_iterations"]);
	
	
	
	let image_size = 2000;
	const num_iterations = 50;
	
	
	
	let generate_button_element = document.querySelector("#generate-button");

	generate_button_element.addEventListener("click", draw_frame);
	
	
	
	let num_julias_input_element = document.querySelector("#num-julias-input");
	let julia_size_input_element = document.querySelector("#julia-size-input");
	
	num_julias_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_frame();
		}
	});
	
	julia_size_input_element.addEventListener("keydown", function(e)
	{
		if (e.keyCode === 13)
		{
			draw_frame();
		}
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set-mosaic.png");
	});
	
	
	
	function draw_frame()
	{	
		let julia_sets_per_side = parseInt(num_julias_input_element.value || 100);
		let julia_set_size = parseInt(julia_size_input_element.value || 20);
		image_size = julia_sets_per_side * julia_set_size;
		
		
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["julia_sets_per_side"], julia_sets_per_side);
		wilson.gl.uniform1f(wilson.uniforms["julia_set_size"], julia_set_size);
		wilson.gl.uniform1f(wilson.uniforms["image_size"], image_size);
		wilson.gl.uniform1i(wilson.uniforms["num_iterations"], num_iterations);
		
		
		
		wilson.render.draw_frame();
	}
}()