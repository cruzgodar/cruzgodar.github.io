!function()
{
	"use strict";
	
	
	
	let elements = Page.element.querySelectorAll("pre code");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.add("highlightable");
	}
	
	hljs.highlightAll();
	
	
	
	{
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
			draggables_touchmove_callback: on_drag,
			
			
			
			use_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png"
		};
		
		let options_hidden =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: 100,
			canvas_height: 100
		};
		
		
		
		let wilson = new Wilson(Page.element.querySelector("#output-canvas-1"), options);

		wilson.render.init_uniforms(["a", "b", "brightness_scale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilson_hidden = new Wilson(Page.element.querySelector("#hidden-canvas-1"), options_hidden);
		
		wilson_hidden.render.init_uniforms(["a", "b", "brightness_scale"]);
		
		
		
		wilson.draggables.container.setAttribute("data-aos-offset", 1000000);
		wilson.draggables.container.setAttribute("data-aos-delay", 0);
		
		Page.Load.AOS.elements[0].splice(Page.Load.AOS.elements[0].length - 2, 0, [wilson.draggables.container, Page.Load.AOS.elements[0][Page.Load.AOS.elements[0].length - 2][1]]);
		
		Page.Load.AOS.show_section(0);
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilson_hidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
		let resolution_hidden = 100;
		
		let last_timestamp = -1;
		
		

		let resolution_input_element = Page.element.querySelector("#resolution-1-input");
		
		resolution_input_element.addEventListener("input", () =>
		{
			resolution = parseInt(resolution_input_element.value || 1000);
			
			wilson.change_canvas_size(resolution, resolution);
		});
		
		
		
		let download_button_element = Page.element.querySelector("#download-1-button");
		
		download_button_element.addEventListener("click", () =>
		{
			wilson.download_frame("a-julia-set.png");
		});
		
		
		
		//Render the inital frame.
		wilson.change_canvas_size(resolution, resolution);
		window.requestAnimationFrame(draw_julia_set);
		
		
		
		function on_drag(active_draggable, x, y, event)
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(draw_julia_set);
		}



		function draw_julia_set(timestamp)
		{
			let time_elapsed = timestamp - last_timestamp;
			
			last_timestamp = timestamp;
			
			
			
			if (time_elapsed === 0)
			{
				return;
			}
			
			
			
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["a"], a);
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["b"], b);
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 20);
			
			wilson_hidden.render.draw_frame();
			
			
			
			let pixel_data = wilson_hidden.render.get_pixel_data();
			
			let brightnesses = new Array(resolution_hidden * resolution_hidden);
			
			for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
			{
				brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
			}
			
			brightnesses.sort((a, b) => a - b);
			
			let brightness_scale = brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)] / 255 * 18;
			
			brightness_scale = Math.max(brightness_scale, .1);
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
			
			wilson.render.draw_frame();
		}
	}
	
	
	
	{
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float a;
			uniform float b;
			uniform float brightness_scale;
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * 2.0, uv.y * 2.0);
				}
				
				else
				{
					z = vec2(uv.x * 2.0, uv.y / aspect_ratio * 2.0);
				}
				
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
			draggables_touchmove_callback: on_drag,
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: change_aspect_ratio
		};
		
		let options_hidden =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: 100,
			canvas_height: 100
		};
		
		
		
		let wilson = new Wilson(Page.element.querySelector("#output-canvas-2"), options);

		wilson.render.init_uniforms(["aspect_ratio", "a", "b", "brightness_scale"]);

		let draggable = wilson.draggables.add(0, 1);
		
		
		
		let wilson_hidden = new Wilson(Page.element.querySelector("#hidden-canvas-2"), options_hidden);
		
		wilson_hidden.render.init_uniforms(["aspect_ratio", "a", "b", "brightness_scale"]);
		
		
		
		wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
		wilson_hidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
		
		
		
		let aspect_ratio = 1;
		
		let a = 0;
		let b = 1;
		
		let resolution = 1000;
		let resolution_hidden = 100;
		
		let last_timestamp = -1;
		
		

		let resolution_input_element = Page.element.querySelector("#resolution-2-input");
		
		resolution_input_element.addEventListener("input", () =>
		{
			resolution = parseInt(resolution_input_element.value || 1000);
			
			wilson.change_canvas_size(resolution, resolution);
		});
		
		
		
		let download_button_element = Page.element.querySelector("#download-2-button");
		
		download_button_element.addEventListener("click", () =>
		{
			wilson.download_frame("a-julia-set.png");
		});
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], 1);
		
		window.requestAnimationFrame(draw_julia_set);
		
		
		
		function on_drag(active_draggable, x, y, event)
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(draw_julia_set);
		}



		function draw_julia_set(timestamp)
		{
			let time_elapsed = timestamp - last_timestamp;
			
			last_timestamp = timestamp;
			
			
			
			if (time_elapsed === 0)
			{
				return;
			}
			
			
			
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["a"], a);
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["b"], b);
			wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 20);
			
			wilson_hidden.render.draw_frame();
			
			
			
			let pixel_data = wilson_hidden.render.get_pixel_data();
			
			let brightnesses = new Array(resolution_hidden * resolution_hidden);
			
			for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
			{
				brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
			}
			
			brightnesses.sort((a, b) => a - b);
			
			let brightness_scale = brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)] / 255 * 18;
			
			brightness_scale = Math.max(brightness_scale, .1);
			
			
			
			wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
			
			wilson.gl.uniform1f(wilson.uniforms["a"], a);
			wilson.gl.uniform1f(wilson.uniforms["b"], b);
			wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
			
			wilson.render.draw_frame();
		}
		
		
		
		function change_aspect_ratio()
		{
			if (wilson.fullscreen.currently_fullscreen)
			{
				aspect_ratio = window.innerWidth / window.innerHeight;
				
				if (aspect_ratio >= 1)
				{
					wilson.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
					
					wilson.world_width = 4 * aspect_ratio;
					wilson.world_height = 4;
				}
				
				else
				{
					wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
					
					wilson.world_width = 4;
					wilson.world_height = 4 / aspect_ratio;
				}
			}
			
			else
			{
				aspect_ratio = 1;
				
				wilson.change_canvas_size(resolution, resolution);
				
				wilson.world_width = 4;
				wilson.world_height = 4;
			}
			
			window.requestAnimationFrame(draw_julia_set);
		}

		window.addEventListener("resize", change_aspect_ratio);
		Page.temporary_handlers["resize"].push(change_aspect_ratio);
	}
	
	
	
	Page.element.querySelector("#previous-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/4/hidden-canvases.html");
	});
	
	Page.element.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/6/interactivity.html");
	});
}()