!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let wilson_wp = null;
	
	let wilson_wpprime = null;
	
	
	
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
	
	
	
	init_canvases();
	
	past_brightness_scales = [];
	
	zoom_level = -.585;
	
	
	
	function init_canvases()
	{
		let frag_shader_source_wp = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float black_point;
			uniform float white_point;
			
			uniform vec2 tau;
			
			
			
			${COMPLEX_GLSL}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return wp(z, tau);
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
				
				
				
				float modulus = length(image_z);
				
				float h = atan(image_z.y, image_z.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / white_point / white_point)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * black_point * black_point)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;
		
		
		
		let frag_shader_source_wpprime = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float black_point;
			uniform float white_point;
			
			uniform vec2 tau;
			
			
			
			${COMPLEX_GLSL}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			//Returns f(z) for a polynomial f with given roots.
			vec2 f(vec2 z)
			{
				return wpprime(z, tau);
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
				
				
				
				float modulus = length(image_z);
				
				float h = atan(image_z.y, image_z.x) / 6.283;
				float s = clamp(1.0 / (1.0 + .01 * (modulus / white_point / white_point)), 0.0, 1.0);
				float v = clamp(1.0 / (1.0 + .01 / (modulus * black_point * black_point)), 0.0, 1.0);
				
				gl_FragColor = vec4(hsv2rgb(vec3(h, s, v)), 1.0);
			}
		`;
		
		

		let options_wp =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_wp,
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 2,
			world_height: 2,
			world_center_x: 0,
			world_center_y: 0,
			
			
			
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
		
		
		
		let options_wpprime =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_wpprime,
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 2,
			world_height: 2,
			world_center_x: 0,
			world_center_y: 0,
			
			
			
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
		
		
		
		wilson_wp = new Wilson(document.querySelector("#wp-canvas"), options_wp);

		wilson_wp.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "tau"]);
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["aspect_ratio"], 1);
			
		wilson_wp.gl.uniform2f(wilson_wp.uniforms["tau"], .5, .866);
		
		
		
		wilson_wpprime = new Wilson(document.querySelector("#wpprime-canvas"), options_wpprime);

		wilson_wpprime.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "tau"]);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["aspect_ratio"], 1);
			
		wilson_wpprime.gl.uniform2f(wilson_wpprime.uniforms["tau"], .5, .866);
		
		
		
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
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		wilson_wp.world_center_x -= x_delta;
		wilson_wp.world_center_y -= y_delta;
		
		wilson_wpprime.world_center_x -= x_delta;
		wilson_wpprime.world_center_y -= y_delta;
		
		//This can always use wilson_wp, since it will agree with wpprime.
		next_pan_velocity_x = -x_delta / wilson_wp.world_width;
		next_pan_velocity_y = -y_delta / wilson_wp.world_height;
		
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
			zoom_level -= touch_distance_delta / wilson_wp.world_width * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson_wp.world_width * 10;
		}
		
		else
		{
			zoom_level -= touch_distance_delta / wilson_wp.world_height * 10;
			
			next_zoom_velocity = -touch_distance_delta / wilson_wp.world_height * 10;
		}
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson_wp.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level) * aspect_ratio, 3 * Math.pow(2, zoom_level));
			
			wilson_wp.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson_wp.world_height = 3 * Math.pow(2, zoom_level);
			
			wilson_wpprime.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson_wpprime.world_height = 3 * Math.pow(2, zoom_level);
			
			
			
			wilson_wp.world_center_x = new_world_center[0];
			wilson_wp.world_center_y = new_world_center[1];
			
			wilson_wpprime.world_center_x = new_world_center[0];
			wilson_wpprime.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level), 3 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson_wp.world_width = 3 * Math.pow(2, zoom_level);
			wilson_wp.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson_wpprime.world_width = 3 * Math.pow(2, zoom_level);
			wilson_wpprime.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			
			
			
			wilson_wp.world_center_x = new_world_center[0];
			wilson_wp.world_center_y = new_world_center[1];
			
			wilson_wpprime.world_center_x = new_world_center[0];
			wilson_wpprime.world_center_y = new_world_center[1];
		}
		
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
		
		
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["aspect_ratio"], aspect_ratio);
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["world_center_x"], wilson_wp.world_center_x);
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["world_center_y"], wilson_wp.world_center_y);
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["world_size"], Math.min(wilson_wp.world_height, wilson_wp.world_width) / 2);
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["black_point"], black_point);
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["white_point"], white_point);
		
		wilson_wp.render.draw_frame();
		
		
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["aspect_ratio"], aspect_ratio);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_center_x"], wilson_wpprime.world_center_x);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_center_y"], wilson_wpprime.world_center_y);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_size"], Math.min(wilson_wpprime.world_height, wilson_wpprime.world_width) / 2);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["black_point"], black_point);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["white_point"], white_point);
		
		wilson_wpprime.render.draw_frame();
		
		
		
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
			wilson_wp.world_center_x += pan_velocity_x * wilson_wp.world_width;
			wilson_wp.world_center_y += pan_velocity_y * wilson_wp.world_height;
			
			wilson_wpprime.world_center_x += pan_velocity_x * wilson_wpprime.world_width;
			wilson_wpprime.world_center_y += pan_velocity_y * wilson_wpprime.world_height;
			
			
			
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
		if (wilson_wp.fullscreen.currently_fullscreen)
		{
			aspect_ratio = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio >= 1)
			{
				wilson_wp.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				
				wilson_wpprime.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio));
				
				
				
				wilson_wp.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson_wp.world_height = 3 * Math.pow(2, zoom_level);
				
				wilson_wpprime.world_width = 3 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson_wpprime.world_height = 3 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson_wp.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson_wpprime.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				
				
				wilson_wp.world_width = 3 * Math.pow(2, zoom_level);
				wilson_wp.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
				
				wilson_wpprime.world_width = 3 * Math.pow(2, zoom_level);
				wilson_wpprime.world_height = 3 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			
			
			wilson_wp.change_canvas_size(resolution, resolution);
			
			wilson_wpprime.change_canvas_size(resolution, resolution);
			
			
			
			wilson_wp.world_width = 3 * Math.pow(2, zoom_level);
			wilson_wp.world_height = 3 * Math.pow(2, zoom_level);
			
			wilson_wpprime.world_width = 3 * Math.pow(2, zoom_level);
			wilson_wpprime.world_height = 3 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_frame);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()