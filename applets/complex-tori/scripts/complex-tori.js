!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["glsl"])
	{
		await Site.load_glsl();
	}
	
	
	
	let wilson_wp = null;
	
	let wilson_wpprime = null;
	
	let wilson_ec_plot = null;
	
	
	
	let aspect_ratio = 1;
	let aspect_ratio_ec_plot = 1;
	
	let zoom_level = -.585;
	let zoom_level_ec_plot = -.585;
	
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
	
	
	
	let fixed_point_x_ec_plot = 0;
	let fixed_point_y_ec_plot = 0;
	
	let next_pan_velocity_x_ec_plot = 0;
	let next_pan_velocity_y_ec_plot = 0;
	let next_zoom_velocity_ec_plot = 0;
	
	let pan_velocity_x_ec_plot = 0;
	let pan_velocity_y_ec_plot = 0;
	let zoom_velocity_ec_plot = 0;
	
	
	
	const pan_friction = .96;
	const pan_velocity_start_threshhold = .0025;
	const pan_velocity_stop_threshhold = .00025;
	
	const zoom_friction = .93;
	const zoom_velocity_start_threshhold = .01;
	const zoom_velocity_stop_threshhold = .001;
	
	let last_timestamp = -1;
	let last_timestamp_ec_plot = -1;
	
	let currently_animating_parameters = false;
	let parameter_animation_frame = 0;
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson_wp.change_canvas_size(resolution, resolution);
		wilson_wpprime.change_canvas_size(resolution, resolution);
		
		wilson_ec_plot.change_canvas_size(resolution, resolution);
		
		wilson_ec_plot.gl.texImage2D(wilson_ec_plot.gl.TEXTURE_2D, 0, wilson_ec_plot.gl.RGBA, wilson_ec_plot.canvas_width, wilson_ec_plot.canvas_height, 0, wilson_ec_plot.gl.RGBA, wilson_ec_plot.gl.UNSIGNED_BYTE, null);
		
		window.requestAnimationFrame(draw_frame);
		
		window.requestAnimationFrame(draw_frame_ec_plot);
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
		wilson_ec_plot.download_frame("a-complex-map.png");
	});
	
	
	
	init_canvases();
	
	
	
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
		
		
		
		let frag_shader_source_ec_plot = `
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float step;
			
			uniform float g2;
			uniform float g3;
			
			const int max_iterations = 50;
			
			
			
			float f(vec2 z)
			{
				return z.y * z.y   -   4.0 * z.x * z.x * z.x   +   g2 * z.x   +   g3;
			}
			
			
			
			void main(void)
			{
				float threshhold = world_size / 10.0;
				
				vec2 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * world_size + world_center_x, uv.y * world_size + world_center_y);
				}
				
				else
				{
					z = vec2(uv.x * world_size + world_center_x, uv.y / aspect_ratio * world_size + world_center_y);
				}
				
				
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				
				
				
				for (int i = 0; i < max_iterations; i++)
				{
					float score = abs(f(z)) / threshhold;
					
					if (score < 1.0)
					{
						float adjacent_score = (abs(f(z + vec2(step, 0.0))) + abs(f(z - vec2(step, 0.0))) + abs(f(z + vec2(0.0, step))) + abs(f(z - vec2(0.0, step)))) / threshhold;
						
						if (adjacent_score > 8.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							return;
						}
						
						else if (adjacent_score > 4.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							gl_FragColor.xyz *= (adjacent_score - 4.0) / 4.0;
						}
					}
					
					threshhold /= 1.25;
				}
			}
		`;
		
		
		
		let frag_shader_source_ec_plot_2 = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float texture_step;
			
			const int dilate_radius = 2;
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				if (texture_step >= .001)
				{	
					vec4 state = (4.0 * texture2D(u_texture, center) +
					
						texture2D(u_texture, center + vec2(texture_step, 0.0)) +
						texture2D(u_texture, center - vec2(texture_step, 0.0)) +
						texture2D(u_texture, center + vec2(0.0, texture_step)) +
						texture2D(u_texture, center - vec2(0.0, texture_step)) +
						
						texture2D(u_texture, center + vec2(texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(texture_step, -texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, -texture_step))
					) / 3.0;
					
					state.w = 1.0;
					
					state.x = pow(state.x, .75);
					state.y = pow(state.y, .75);
					state.z = pow(state.z, .75);
					
					gl_FragColor = state;
				}
				
				else
				{
					vec4 state = (4.0 * texture2D(u_texture, center) +
					
					
					
						texture2D(u_texture, center + vec2(texture_step, 0.0)) +
						texture2D(u_texture, center - vec2(texture_step, 0.0)) +
						texture2D(u_texture, center + vec2(0.0, texture_step)) +
						texture2D(u_texture, center - vec2(0.0, texture_step)) +
						
						texture2D(u_texture, center + vec2(texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(texture_step, -texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, -texture_step)) +
						
						
						
						texture2D(u_texture, center + vec2(2.0 * texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(2.0 * texture_step, 0.0)) +
						texture2D(u_texture, center + vec2(2.0 * texture_step, -texture_step)) +
						
						texture2D(u_texture, center + vec2(-2.0 * texture_step, texture_step)) +
						texture2D(u_texture, center + vec2(-2.0 * texture_step, 0.0)) +
						texture2D(u_texture, center + vec2(-2.0 * texture_step, -texture_step)) +
						
						texture2D(u_texture, center + vec2(texture_step, 2.0 * texture_step)) +
						texture2D(u_texture, center + vec2(0.0, 2.0 * texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, 2.0 * texture_step)) +
						
						texture2D(u_texture, center + vec2(texture_step, -2.0 * texture_step)) +
						texture2D(u_texture, center + vec2(0.0, -2.0 * texture_step)) +
						texture2D(u_texture, center + vec2(-texture_step, -2.0 * texture_step))
					) / 6.0;
					
					state.w = 1.0;
					
					state.x = pow(state.x, .75);
					state.y = pow(state.y, .75);
					state.z = pow(state.z, .75);
					
					gl_FragColor = state;
				}
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
		
		
		
		let options_ec_plot =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_ec_plot,
			
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
			
			switch_fullscreen_callback: change_aspect_ratio_ec_plot,
			
			
			
			mousedown_callback: on_grab_canvas_ec_plot,
			touchstart_callback: on_grab_canvas_ec_plot,
			
			mousedrag_callback: on_drag_canvas_ec_plot,
			touchmove_callback: on_drag_canvas_ec_plot,
			
			mouseup_callback: on_release_canvas_ec_plot,
			touchend_callback: on_release_canvas_ec_plot,
			
			wheel_callback: on_wheel_canvas_ec_plot,
			pinch_callback: on_pinch_canvas_ec_plot
		};
		
		
		
		wilson_wp = new Wilson(document.querySelector("#wp-canvas"), options_wp);

		wilson_wp.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "tau"]);
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["aspect_ratio"], 1);
			
		wilson_wp.gl.uniform2f(wilson_wp.uniforms["tau"], .5, .866);
		
		
		
		wilson_wpprime = new Wilson(document.querySelector("#wpprime-canvas"), options_wpprime);

		wilson_wpprime.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "tau"]);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["aspect_ratio"], 1);
			
		wilson_wpprime.gl.uniform2f(wilson_wpprime.uniforms["tau"], .5, .866);
		
		
		
		wilson_ec_plot = new Wilson(document.querySelector("#ec-plot-canvas"), options_ec_plot);
		
		wilson_ec_plot.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "step", "g2", "g3"]);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["step"], 1 / resolution);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["g2"], 1);
			
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["g3"], 0);
		
		
		
		wilson_ec_plot.render.load_new_shader(frag_shader_source_ec_plot_2);
		
		wilson_ec_plot.render.init_uniforms(["texture_step"]);
		
		wilson_ec_plot.render.create_framebuffer_texture_pair(wilson_ec_plot.gl.UNSIGNED_BYTE);
		
		
		
		window.requestAnimationFrame(draw_frame);
		
		window.requestAnimationFrame(draw_frame_ec_plot);
		
		
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		
		
		next_pan_velocity_x_ec_plot = 0;
		next_pan_velocity_y_ec_plot = 0;
		next_zoom_velocity_ec_plot = 0;
		
		pan_velocity_x_ec_plot = 0;
		pan_velocity_y_ec_plot = 0;
		zoom_velocity_ec_plot = 0;
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
	
	function on_grab_canvas_ec_plot(x, y, event)
	{
		pan_velocity_x_ec_plot = 0;
		pan_velocity_y_ec_plot = 0;
		zoom_velocity_ec_plot = 0;
		
		next_pan_velocity_x_ec_plot = 0;
		next_pan_velocity_y_ec_plot = 0;
		next_zoom_velocity_ec_plot = 0;
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
	
	function on_drag_canvas_ec_plot(x, y, x_delta, y_delta, event)
	{
		wilson_ec_plot.world_center_x -= x_delta;
		wilson_ec_plot.world_center_y -= y_delta;
		
		next_pan_velocity_x_ec_plot = -x_delta / wilson_ec_plot.world_width;
		next_pan_velocity_y_ec_plot = -y_delta / wilson_ec_plot.world_height;
		
		window.requestAnimationFrame(draw_frame_ec_plot);
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
	
	function on_release_canvas_ec_plot(x, y, event)
	{
		if (Math.sqrt(next_pan_velocity_x_ec_plot * next_pan_velocity_x_ec_plot + next_pan_velocity_y_ec_plot * next_pan_velocity_y_ec_plot) >= pan_velocity_start_threshhold)
		{
			pan_velocity_x_ec_plot = next_pan_velocity_x_ec_plot;
			pan_velocity_y_ec_plot = next_pan_velocity_y_ec_plot;
		}
		
		if (Math.abs(next_zoom_velocity_ec_plot) >= zoom_velocity_start_threshhold)
		{
			zoom_velocity_ec_plot = next_zoom_velocity_ec_plot;
		}
		
		window.requestAnimationFrame(draw_frame_ec_plot);
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
	
	function on_wheel_canvas_ec_plot(x, y, scroll_amount, event)
	{
		fixed_point_x_ec_plot = x;
		fixed_point_y_ec_plot = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level_ec_plot += scroll_amount / 100;
		}
		
		else
		{
			zoom_velocity_ec_plot += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas_ec_plot();
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
	
	function on_pinch_canvas_ec_plot(x, y, touch_distance_delta, event)
	{
		if (aspect_ratio_ec_plot >= 1)
		{
			zoom_level_ec_plot -= touch_distance_delta / wilson_ec_plot.world_width * 10;
			
			next_zoom_velocity_ec_plot = -touch_distance_delta / wilson_ec_plot.world_width * 10;
		}
		
		else
		{
			zoom_level_ec_plot -= touch_distance_delta / wilson_ec_plot.world_height * 10;
			
			next_zoom_velocity_ec_plot = -touch_distance_delta / wilson_ec_plot.world_height * 10;
		}
		
		fixed_point_x_ec_plot = x;
		fixed_point_y_ec_plot = y;
		
		zoom_canvas_ec_plot();
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
			let new_world_center = wilson_wp.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 3 * Math.pow(2, zoom_level), 3 * Math.pow(2, zoom_level) / aspect_ratio);
			
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
	
	function zoom_canvas_ec_plot()
	{
		if (aspect_ratio_ec_plot >= 1)
		{
			let new_world_center = wilson_ec_plot.input.get_zoomed_world_center(fixed_point_x_ec_plot, fixed_point_y_ec_plot, 3 * Math.pow(2, zoom_level_ec_plot) * aspect_ratio_ec_plot, 3 * Math.pow(2, zoom_level_ec_plot));
			
			wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot) * aspect_ratio_ec_plot;
			wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot);
			
			wilson_ec_plot.world_center_x = new_world_center[0];
			wilson_ec_plot.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson_ec_plot.input.get_zoomed_world_center(fixed_point_x_ec_plot, fixed_point_y_ec_plot, 3 * Math.pow(2, zoom_level_ec_plot), 3 * Math.pow(2, zoom_level_ec_plot) / aspect_ratio_ec_plot);
			
			wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot);
			wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot) / aspect_ratio_ec_plot;
			
			wilson_ec_plot.world_center_x = new_world_center[0];
			wilson_ec_plot.world_center_y = new_world_center[1];
		}
		
		window.requestAnimationFrame(draw_frame_ec_plot);
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
	
	
	
	function draw_frame_ec_plot(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp_ec_plot;
		
		last_timestamp_ec_plot = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_ec_plot.gl.useProgram(wilson_ec_plot.render.shader_programs[0]);
		
		wilson_ec_plot.gl.bindFramebuffer(wilson_ec_plot.gl.FRAMEBUFFER, wilson_ec_plot.render.framebuffers[0].framebuffer);
		
		
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["aspect_ratio"], aspect_ratio);
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_center_x"], wilson_ec_plot.world_center_x);
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_center_y"], wilson_ec_plot.world_center_y);
		
		let world_size = Math.min(wilson_ec_plot.world_height, wilson_ec_plot.world_width);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_size"], world_size / 2);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["step"], world_size / resolution);
		
		
		
		wilson_ec_plot.render.draw_frame();
		
		
		
		wilson_ec_plot.gl.useProgram(wilson_ec_plot.render.shader_programs[1]);
		
		wilson_ec_plot.gl.bindTexture(wilson_ec_plot.gl.TEXTURE_2D, wilson_ec_plot.render.framebuffers[0].texture);
		wilson_ec_plot.gl.bindFramebuffer(wilson_ec_plot.gl.FRAMEBUFFER, null);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["texture_step"], 1 / resolution);
		
		wilson_ec_plot.render.draw_frame();
		
		
		
		
		if (time_elapsed >= 50)
		{
			pan_velocity_x_ec_plot = 0;
			pan_velocity_y_ec_plot = 0;
			zoom_velocity_ec_plot = 0;
			
			next_pan_velocity_x_ec_plot = 0;
			next_pan_velocity_y_ec_plot = 0;
			next_zoom_velocity_ec_plot = 0;
		}
		
		
		
		if (pan_velocity_x_ec_plot !== 0 || pan_velocity_y_ec_plot !== 0 || zoom_velocity_ec_plot !== 0)
		{
			wilson_ec_plot.world_center_x += pan_velocity_x_ec_plot * wilson_ec_plot.world_width;
			wilson_ec_plot.world_center_y += pan_velocity_y_ec_plot * wilson_ec_plot.world_height;
			
			
			
			pan_velocity_x_ec_plot *= pan_friction;
			pan_velocity_y_ec_plot *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x_ec_plot * pan_velocity_x_ec_plot + pan_velocity_y_ec_plot * pan_velocity_y_ec_plot) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x_ec_plot = 0;
				pan_velocity_y_ec_plot = 0;
			}
			
			
			
			zoom_level_ec_plot += zoom_velocity_ec_plot;
			
			zoom_canvas_ec_plot(fixed_point_x_ec_plot, fixed_point_y_ec_plot);
			
			zoom_velocity_ec_plot *= zoom_friction;
			
			if (Math.abs(zoom_velocity_ec_plot) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity_ec_plot = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_frame_ec_plot);
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
	
	function change_aspect_ratio_ec_plot()
	{
		if (wilson_ec_plot.fullscreen.currently_fullscreen)
		{
			aspect_ratio_ec_plot = window.innerWidth / window.innerHeight;
			
			if (aspect_ratio_ec_plot >= 1)
			{
				wilson_ec_plot.change_canvas_size(resolution, Math.floor(resolution / aspect_ratio_ec_plot));
				
				wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot) * aspect_ratio_ec_plot;
				wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot);
			}
			
			else
			{
				wilson_ec_plot.change_canvas_size(Math.floor(resolution * aspect_ratio_ec_plot), resolution);	
				
				wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot);
				wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot) / aspect_ratio_ec_plot;
			}
		}
		
		else
		{
			aspect_ratio_ec_plot = 1;
			
			wilson_ec_plot.change_canvas_size(resolution, resolution);
			
			wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot);
			wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot);
		}
		
		window.requestAnimationFrame(draw_frame_ec_plot);
	}
	
	

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
	
	window.addEventListener("resize", change_aspect_ratio_ec_plot);
	Page.temporary_handlers["resize"].push(change_aspect_ratio_ec_plot);
}()