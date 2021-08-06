!function()
{
	"use strict";
	
	
	
	let wilson = null;
	
	let image_size = 2000;
	const num_iterations = 50;
	
	
	
	document.querySelector("#output-canvas").setAttribute("width", image_size);
	document.querySelector("#output-canvas").setAttribute("height", image_size);
	
	
	
	document.querySelector("#download-button").addEventListener("click", function(e)
	{
		wilson.download_frame("a-julia-set-mosaic.png");
	});
	
	
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
	
	
	
	setTimeout(() =>
	{
		let options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			
			
			use_fullscreen: true,
			
			use_fullscreen_button: true,
			
			enter_fullscreen_button_image_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_image_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		wilson = new Wilson(document.querySelector("#output-canvas"), options);
		
		
		
		wilson.render.init_uniforms(["julia_sets_per_side", "julia_set_size", "image_size", "num_iterations"]);
		
		
		
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
	}, 500);
	
	
	
	function draw_frame()
	{	
		let julia_sets_per_side = parseInt(document.querySelector("#num-julias-input").value || 100);
		let julia_set_size = parseInt(document.querySelector("#julia-size-input").value || 20);
		image_size = julia_sets_per_side * julia_set_size;
		
		
		
		wilson.change_canvas_size(image_size, image_size);
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["julia_sets_per_side"], julia_sets_per_side);
		wilson.gl.uniform1f(wilson.uniforms["julia_set_size"], julia_set_size);
		wilson.gl.uniform1f(wilson.uniforms["image_size"], image_size);
		wilson.gl.uniform1i(wilson.uniforms["num_iterations"], num_iterations);
		
		
		
		wilson.render.draw_frame();
	}
}()