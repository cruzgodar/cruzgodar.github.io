!function()
{
	"use strict";
	
	
	
	hljs.highlightAll();
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform float a;
		uniform float b;
		uniform float brightness_scale;
		
		
		
		void main(void)
		{
			vec2 z = vec2(uv.x * 2.0, uv.y * 2.0);
			vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
			float brightness = exp(-length(z));
			
			
			
			vec2 c = vec2(a, b);
			
			for (int iteration = 0; iteration < 100; iteration++)
			{
				if (iteration == 99)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
				
				if (length(z) >= 10.0)
				{
					break;
				}
				
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				
				brightness += exp(-length(z));
			}
			
			
			gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
		}
	`;



	let options =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 1000,
		canvas_height: 1000,
		
		world_width: 4,
		world_height: 4,
		world_center_x: 0,
		world_center_y: 0,
		
		
		
		use_draggables: true,
		
		draggables_mousemove_callback: on_drag,
		draggables_touchmove_callback: on_drag
	};



	let wilson = new Wilson(document.querySelector("#output-canvas"), options);

	wilson.render.init_uniforms(["a", "b", "brightness_scale"]);

	let draggable = wilson.draggables.add(0, 1);
	
	
	
	wilson.draggables.container.setAttribute("data-aos-offset", 1000000);
	wilson.draggables.container.setAttribute("data-aos-delay", 0);
	
	Page.Load.AOS.elements[0].splice(Page.Load.AOS.elements[0].length - 2, 0, [wilson.draggables.container, Page.Load.AOS.elements[0][Page.Load.AOS.elements[0].length - 2][1]]);
	
	Page.Load.AOS.show_section(0);
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	let resolution = 1000;
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 1000);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set.png");
	});
	
	
	
	//Render the inital frame.
	wilson.gl.uniform1f(wilson.uniforms["a"], 0);
	wilson.gl.uniform1f(wilson.uniforms["b"], 1);
	wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], 10);
	
	wilson.change_canvas_size(resolution, resolution);
	
	wilson.render.draw_frame();



	function on_drag(active_draggable, x, y, event)
	{
		wilson.gl.uniform1f(wilson.uniforms["a"], x);
		wilson.gl.uniform1f(wilson.uniforms["b"], y);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], 10);
		
		wilson.render.draw_frame();
	}
	
	
	
	document.querySelector("#previous-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/1/introduction.html");
	});
	
	document.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/3/parallelizing.html");
	});
}()