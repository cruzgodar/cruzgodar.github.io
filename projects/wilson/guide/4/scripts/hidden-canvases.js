!function()
{
	"use strict";
	
	
	
	let elements = document.querySelectorAll("pre code");
	
	for (let i = 0; i < elements.length; i++)
	{
		elements[i].classList.add("highlightable");
	}
	
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
	
	let options_hidden =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 100,
		canvas_height: 100
	};
	
	
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);

	wilson.render.init_uniforms(["a", "b", "brightness_scale"]);

	let draggable = wilson.draggables.add(0, 1);
	
	
	
	let wilson_hidden = new Wilson(document.querySelector("#hidden-canvas"), options_hidden);
	
	wilson_hidden.render.init_uniforms(["a", "b", "brightness_scale"]);
	
	
	
	wilson.canvas.parentNode.parentNode.style.setProperty("margin-bottom", 0, "important");
	wilson_hidden.canvas.parentNode.parentNode.style.setProperty("margin-top", 0, "important");
	
	
	
	let a = 0;
	let b = 1;
	
	let resolution = 1000;
	let resolution_hidden = 100;
	
	let last_timestamp = -1;
	
	

	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 1000);
		
		wilson.change_canvas_size(resolution, resolution);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set.png");
	});
	
	
	
	//Render the inital frame.
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
		
		/*
			Like range in a photo, the brightness will get clipped if we let it go above 1.
			Therefore, we divide by a large number to make sure that doesn&#x2019;t happen.
			Too large and everything will get compressed into too few dark values instead,
			so we need to pick a brightness scale in the middle.
		*/
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 20);
		
		wilson_hidden.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		//Both the .98 and 18 here were found experimentally.
		let brightness_scale = brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)] / 255 * 18;
		
		brightness_scale = Math.max(brightness_scale, .1);
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["a"], a);
		wilson.gl.uniform1f(wilson.uniforms["b"], b);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
		wilson.render.draw_frame();
	}
	
	
	
	document.querySelector("#previous-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/3/parallelizing.html");
	});
	
	document.querySelector("#next-part-button").addEventListener("click", () =>
	{
		Page.Navigation.redirect("/projects/wilson/guide/5/fullscreen.html");
	});
}()