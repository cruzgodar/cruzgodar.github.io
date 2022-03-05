!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let wilson = null;
	
	let wilson_hidden = null;
	
	
	
	let aspect_ratio = 1;
	
	let zoom_level = 1;
	
	let past_brightness_scales = [];
	
	let resolution = 500;
	
	let black_point = 1;
	let white_point = 1;
	
	let fixed_point_x = 0;
	let fixed_point_y = 0;
	
	let next_pan_velocity_x = 0;
	let next_pan_velocity_y = 0;
	let next_zoom_velocity = 0;
	
	let pan_velocity_x = 0;
	let pan_velocity_y = 0;
	let zoom_velocity = 0;
	
	const pan_friction = .96;
	const pan_velocity_start_threshhold = .0025;
	const pan_velocity_stop_threshhold = .00025;
	
	const zoom_friction = .93;
	const zoom_velocity_start_threshhold = .01;
	const zoom_velocity_stop_threshhold = .001;
	
	let last_timestamp = -1;
	
	let currently_animating_parameters = false;
	let parameter_animation_frame = 0;
	
	let use_selector_mode = false;
	
	let total_benchmark_time = 0;
	let benchmarks_left = 0;
	const benchmark_cycles = 10;
	const benchmark_resolution = 4000;
	
	
	
	let code_input_element = document.querySelector("#code-textarea");
	
	code_input_element.value = "cexp(cinv(z))";
	
	code_input_element.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			use_new_code();
			
			past_brightness_scales = [];
			
			zoom_level = -.585;
		}
	});
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", () =>
	{
		use_new_code();
		
		past_brightness_scales = [];
		
		zoom_level = -.585;
	});
	
	
	
	let selector_mode_button_element = document.querySelector("#selector-mode-button");
	
	selector_mode_button_element.addEventListener("click", () =>
	{
		use_selector_mode = true;
	});
	
	
	
	let benchmark_button_element = document.querySelector("#benchmark-button");
	
	benchmark_button_element.addEventListener("click", run_benchmark);
	
	
	
	if (!DEBUG)
	{
		selector_mode_button_element.parentNode.parentNode.remove();
	}
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson.change_canvas_size(resolution, resolution);
		
		window.requestAnimationFrame(draw_frame);
	});
	
	
	
	let black_point_input_element = document.querySelector("#black-point-input");
	
	black_point_input_element.addEventListener("input", () =>
	{
		black_point = parseFloat(black_point_input_element.value || 1);
		
		window.requestAnimationFrame(draw_frame);
	});
	
	
	
	let white_point_input_element = document.querySelector("#white-point-input");
	
	white_point_input_element.addEventListener("input", () =>
	{
		white_point = parseFloat(white_point_input_element.value || 1);
		
		window.requestAnimationFrame(draw_frame);
	});
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-complex-map.png");
	});
	
	
	
	let canvas_location_element = document.querySelector("#canvas-location");
	let hidden_canvas_location_element = document.querySelector("#hidden-canvas-location");
	
	
	
	use_new_code();
	
	past_brightness_scales = [];
	
	zoom_level = -.585;
	
	
	
	function use_new_code(selector_mode = false, world_width = 2, world_height = 2, world_center_x = 0, world_center_y = 0)
	{
		let generating_code = code_input_element.value || "cexp(cinv(z))";
		
		
		let selector_mode_string = "";
		
		if (selector_mode)
		{
			selector_mode_string = `
				image_z.x += 127.0;
				image_z.y += 127.0;
				
				float whole_1 = floor(image_z.x);
				float whole_2 = floor(image_z.y);
				
				float fract_1 = (image_z.x - whole_1);
				float fract_2 = (image_z.y - whole_2);
				
				gl_FragColor = vec4(whole_1 / 256.0, fract_1, whole_2 / 256.0, fract_2);
				
				return;
			`;
		}
		
		
		
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float black_point;
			uniform float white_point;
			
			uniform vec2 draggable_arg;
			
			
			
			${Site.get_glsl_bundle(generating_code)}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return ${generating_code};
			}
			
			
			
			void main(void)
			{
				vec2 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * world_size + world_center_x, uv.y * world_size + world_center_y);
				}
				
				else
				{
					z = vec2(uv.x * world_size + world_center_x, uv.y / aspect_ratio * world_size + world_center_y);
				}
				
				
				
				vec2 image_z = f(z);
				
				
				
				${selector_mode_string}
				
				
				
				float modulus = length(image_z);
				
				float h = atan(image_z.y, image_z.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / white_point / white_point)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * black_point * black_point)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;
		


		let options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: world_width,
			world_height: world_height,
			world_center_x: world_center_x,
			world_center_y: world_center_y,
			
			
			
			use_draggables: true,
			
			draggables_mousemove_callback: on_drag_draggable,
			draggables_touchmove_callback: on_drag_draggable,
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: change_aspect_ratio,
			
			
			
			mousedown_callback: on_grab_canvas,
			touchstart_callback: on_grab_canvas,
			
			mousedrag_callback: on_drag_canvas,
			touchmove_callback: on_drag_canvas,
			
			mouseup_callback: on_release_canvas,
			touchend_callback: on_release_canvas,
			
			wheel_callback: on_wheel_canvas,
			pinch_callback: on_pinch_canvas
		};
		
		
		
		try
		{
			wilson.output_canvas_container.parentNode.remove();
			
			canvas_location_element.insertAdjacentHTML("beforebegin", `
				<div>
					<canvas id="output-canvas" class="output-canvas"></canvas>
				</div>
			`);
		}
		
		catch(ex) {}
		
		
		
		wilson = new Wilson(document.querySelector("#output-canvas"), options);

		wilson.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "draggable_arg"]);
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
		
		
		
		if (generating_code.indexOf("draggable_arg") !== -1)
		{
			wilson.draggables.add(0, 0);
			
			wilson.gl.uniform2f(wilson.uniforms["draggable_arg"], 0, 0);
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
		
		
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
	}
	
	
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		
		
		if (use_selector_mode)
		{
			use_new_code(true, wilson.world_width, wilson.world_height, wilson.world_center_x, wilson.world_center_y);
			
			setTimeout(() =>
			{
				wilson.render.draw_frame();
				
				let coordinates = wilson.utils.interpolate.world_to_canvas(x, y);
				
				let pixel = new Uint8Array(4);
				
				wilson.gl.readPixels(coordinates[1], wilson.canvas_height - coordinates[0], 1, 1, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, pixel);
				
				let z_x = (pixel[0] - 127) + pixel[1] / 256;
				let z_y = (pixel[2] - 127) + pixel[3] / 256;
				
				
				
				let plus_1 = "+";
				
				if (y < 0)
				{
					plus_1 = "-";
				}
				
				let plus_2 = "+";
				
				if (z_y < 0)
				{
					plus_2 = "-";
				}
				
				console.log(`${x} ${plus_1} ${Math.abs(y)}i |---> ${z_x} ${plus_2} ${Math.abs(z_y)}i`);
				
				use_new_code(false, wilson.world_width, wilson.world_height, wilson.world_center_x, wilson.world_center_y);
				
				use_selector_mode = false;
			}, 20);
		}
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		wilson.world_center_x -= x_delta;
		wilson.world_center_y -= y_delta;
		
		next_pan_velocity_x = -x_delta / wilson.world_width;
		next_pan_velocity_y = -y_delta / wilson.world_height;
		
		try {wilson.draggables.recalculate_locations();}
		catch(ex) {}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (Math.sqrt(next_pan_velocity_x * next_pan_velocity_x + next_pan_velocity_y * next_pan_velocity_y) >= pan_velocity_start_threshhold)
		{
			pan_velocity_x = next_pan_velocity_x;
			pan_velocity_y = next_pan_velocity_y;
		}
		
		if (Math.abs(next_zoom_velocity) >= zoom_velocity_start_threshhold)
		{
			zoom_velocity = next_zoom_velocity;
		}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level += scroll_amount / 100;
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas();
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio >= 1)
		{
			zoom_level -= touch_distance_delta / wilson.world_width * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_width * 10;
		}
		
		else
		{
			zoom_level -= touch_distance_delta / wilson.world_height * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson.world_height * 10;
		}
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level) * aspect_ratio, 3 * Math.pow(2, zoom_level));
			
			wilson.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson.world_height = 3 * Math.pow(2, zoom_level);
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level), 3 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson.world_width = 3 * Math.pow(2, zoom_level);
			wilson.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		try {wilson.draggables.recalculate_locations();}
		catch(ex) {}
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		wilson.gl.uniform2f(wilson.uniforms["draggable_arg"], x, y);
		
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
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		wilson.gl.uniform1f(wilson.uniforms["world_center_x"], wilson.world_center_x);
		wilson.gl.uniform1f(wilson.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson.gl.uniform1f(wilson.uniforms["black_point"], black_point);
		wilson.gl.uniform1f(wilson.uniforms["white_point"], white_point);
		
		wilson.render.draw_frame();
		
		
		
		if (time_elapsed >= 50)
		{
			pan_velocity_x = 0;
			pan_velocity_y = 0;
			zoom_velocity = 0;
			
			next_pan_velocity_x = 0;
			next_pan_velocity_y = 0;
			next_zoom_velocity = 0;
		}
		
		
		
		if (pan_velocity_x !== 0 || pan_velocity_y !== 0 || zoom_velocity !== 0)
		{
			wilson.world_center_x += pan_velocity_x * wilson.world_width;
			wilson.world_center_y += pan_velocity_y * wilson.world_height;
			
			
			
			pan_velocity_x *= pan_friction;
			pan_velocity_y *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x = 0;
				pan_velocity_y = 0;
			}
			
			
			
			zoom_level += zoom_velocity;
			
			zoom_canvas(fixed_point_x, fixed_point_y);
			
			zoom_velocity *= zoom_friction;
			
			if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_frame);
		}
	}
	
	
	
	function change_aspect_ratio()
	{
		if (wilson.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				
				wilson.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 3 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson.world_width = 3 * Math.pow(2, zoom_level);
				wilson.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson.change_canvas_size(resolution, resolution);
			
			wilson.world_width = 3 * Math.pow(2, zoom_level);
			wilson.world_height = 3 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_frame);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
	
	
	
	function run_benchmark()
	{
		wilson.change_canvas_size(benchmark_resolution, benchmark_resolution);
		
		let start_time = Date.now();
		
		let pixel = new Uint8Array(4);
		
		for (let i = 0; i < benchmark_cycles; i++)
		{
			wilson.render.draw_frame();
			
			wilson.gl.readPixels(0, 0, 1, 1, wilson.gl.RGBA, wilson.gl.UNSIGNED_BYTE, pixel);
		}
		
		let average_time = (Date.now() - start_time) / benchmark_cycles;
				
		console.log(`Finished benchmark --- average time to draw a ${benchmark_resolution}x${benchmark_resolution} frame is ${average_time}ms`);
		
		wilson.change_canvas_size(resolution, resolution);
	}
}()