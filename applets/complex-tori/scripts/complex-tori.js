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
	
	let wilson_ec_plot_output = null;
	
	let wilson_kleinj = null;
	
	let wilson_g2 = null;
	
	
	
	let aspect_ratio = 1;
	let aspect_ratio_ec_plot = 1;
	
	let zoom_level = -.585;
	let zoom_level_ec_plot = 1;
	
	let resolution = 500;
	let resolution_ec_plot = 1000;
	
	let black_point = 1;
	let white_point = 1;
	
	let g2 = -2;
	let g3 = 0;
	
	
	
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
	let last_timestamp_parameter_column = -1;
	
	let currently_animating_parameters = false;
	let parameter_animation_frame = 0;
	
	
	
	let resolution_input_element = document.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 500);
		
		wilson_wp.change_canvas_size(resolution, resolution);
		wilson_wpprime.change_canvas_size(resolution, resolution);
		
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
	
	
	
	let g2_slider_element = document.querySelector("#g2-slider");
	
	let g2_slider_value_element = document.querySelector("#g2-slider-value");
	
	g2_slider_element.addEventListener("input", () =>
	{
		//-5 to 5
		g2 = parseInt(g2_slider_element.value || 5000) / 1000 - 5;
		
		g2_slider_value_element.textContent = Math.round(g2 * 1000) / 1000;
		
		wilson_g2.draggables.world_coordinates[0] = [g2, g3];
		wilson_g2.draggables.recalculate_locations();
		
		window.requestAnimationFrame(draw_frame);
		window.requestAnimationFrame(draw_frame_ec_plot);
		window.requestAnimationFrame(draw_frame_parameter_column);
	});
	
	g2_slider_value_element.textContent = g2;
	
	
	
	let g3_slider_element = document.querySelector("#g3-slider");
	
	let g3_slider_value_element = document.querySelector("#g3-slider-value");
	
	g3_slider_element.addEventListener("input", () =>
	{
		//-5 to 5
		g3 = parseInt(g3_slider_element.value || 5000) / 1000 - 5;
		
		g3_slider_value_element.textContent = Math.round(g3 * 1000) / 1000;
		
		wilson_g2.draggables.world_coordinates[0] = [g2, g3];
		wilson_g2.draggables.recalculate_locations();
		
		window.requestAnimationFrame(draw_frame);
		window.requestAnimationFrame(draw_frame_ec_plot);
		window.requestAnimationFrame(draw_frame_parameter_column);
	});
	
	g3_slider_value_element.textContent = g3;
	
	
	
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
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			float dot_center_radius = world_size * .065;
			float dot_border_radius = world_size * .078;
			
			
			
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
				vec2 tau = inverse_g2_g3(g2_arg, g3_arg);
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
				
				
				
				vec2 tau = inverse_g2_g3(g2_arg, g3_arg);
				
				float distance = length(tau - z);
				
				if (distance < dot_center_radius)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				}
				
				else if (distance < dot_border_radius)
				{
					gl_FragColor = vec4(0.25, 0.25, 0.25, 1.0);
				}
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
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			float dot_center_radius = world_size * .065;
			float dot_border_radius = world_size * .078;
			
			
			
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
				vec2 tau = inverse_g2_g3(g2_arg, g3_arg);
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
				
				
				
				vec2 tau = inverse_g2_g3(g2_arg, g3_arg);
				
				float distance = length(tau - z);
				
				if (distance < dot_center_radius)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				}
				
				else if (distance < dot_border_radius)
				{
					gl_FragColor = vec4(0.25, 0.25, 0.25, 1.0);
				}
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
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			const int max_iterations = 200;
			
			
			
			float f(vec2 z)
			{
				return z.y * z.y   -   z.x * z.x * z.x   -   g2_arg * z.x   -   g3_arg;
			}
			
			
			
			void main(void)
			{
				float threshhold = world_size * 1000.0;
				
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
						
						if (adjacent_score >= 6.0)
						{
							gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
							
							return;
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
			
			
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float state = (4.0 * texture2D(u_texture, center).y +
				
					texture2D(u_texture, center + vec2(texture_step, 0.0)).y +
					texture2D(u_texture, center - vec2(texture_step, 0.0)).y +
					texture2D(u_texture, center + vec2(0.0, texture_step)).y +
					texture2D(u_texture, center - vec2(0.0, texture_step)).y +
					
					texture2D(u_texture, center + vec2(texture_step, texture_step)).y +
					texture2D(u_texture, center + vec2(texture_step, -texture_step)).y +
					texture2D(u_texture, center + vec2(-texture_step, texture_step)).y +
					texture2D(u_texture, center + vec2(-texture_step, -texture_step)).y
				) / 2.0;
				
				gl_FragColor = vec4(state, state, state, 1.0);
			}
		`;
		
		
		
		let frag_shader_source_kleinj = `
			precision highp float;
			
			varying vec2 uv;
			
			const float aspect_ratio = 1.0;
			
			const float world_center_x = 0.0;
			const float world_center_y = 1.0;
			const float world_size = 1.0;
			
			const float black_point = 1.0;
			const float white_point = 1.0;
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			float dot_center_radius = world_size * .065;
			float dot_border_radius = world_size * .078;
			
			
			
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
				return kleinJ(z);
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
				
				
				
				vec2 tau = inverse_g2_g3(g2_arg, g3_arg);
				
				float distance = length(tau - z);
				
				if (distance < dot_center_radius)
				{
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				}
				
				else if (distance < dot_border_radius)
				{
					gl_FragColor = vec4(0.25, 0.25, 0.25, 1.0);
				}
			}
		`;
		
		
		
		let frag_shader_source_g2 = `
			precision highp float;
			
			varying vec2 uv;
			
			const float aspect_ratio = 1.0;
			
			const float world_center_x = 0.0;
			const float world_center_y = 0.0;
			const float world_size = 10.0;
			
			const float black_point = 1.0;
			const float white_point = 1.0;
			
			uniform float g2_arg;
			uniform float g3_arg;
			
			
			
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
				return kleinj_from_g2_g3(z.x, z.y) * ONE;
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
		
		
		
		let options_ec_plot =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_ec_plot,
			
			canvas_width: resolution_ec_plot,
			canvas_height: resolution_ec_plot,
			
			world_width: 6,
			world_height: 6,
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
		
		
		
		let options_kleinj =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_kleinj,
			
			canvas_width: 500,
			canvas_height: 500
		};
		
		
		
		let options_g2 =
		{
			renderer: "gpu",
			
			shader: frag_shader_source_g2,
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 10,
			world_height: 10,
			world_center_x: 0,
			world_center_y: 0,
			
			use_draggables: true,
			
			draggables_mousemove_callback: on_drag_draggable,
			draggables_touchmove_callback: on_drag_draggable
		};
		
		
		
		wilson_wp = new Wilson(document.querySelector("#wp-canvas"), options_wp);

		wilson_wp.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "g2_arg", "g3_arg"]);
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["aspect_ratio"], 1);
		
		
		
		wilson_wpprime = new Wilson(document.querySelector("#wpprime-canvas"), options_wpprime);

		wilson_wpprime.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "black_point", "white_point", "g2_arg", "g3_arg"]);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["aspect_ratio"], 1);
		
		
		
		wilson_ec_plot = new Wilson(document.querySelector("#ec-plot-canvas"), options_ec_plot);
		
		wilson_ec_plot.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "step", "g2_arg", "g3_arg"]);
		
		
		
		wilson_ec_plot.render.load_new_shader(frag_shader_source_ec_plot_2);
		
		wilson_ec_plot.render.init_uniforms(["texture_step"]);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["texture_step"], 1 / resolution_ec_plot);
		
		
		
		wilson_ec_plot.render.create_framebuffer_texture_pair();
		
		
		
		wilson_kleinj = new Wilson(document.querySelector("#kleinj-canvas"), options_kleinj);
		
		wilson_kleinj.render.init_uniforms(["g2_arg", "g3_arg"]);
		
		
		
		wilson_g2 = new Wilson(document.querySelector("#g2-canvas"), options_g2);
		
		wilson_g2.render.init_uniforms(["g2_arg", "g3_arg"]);
		
		wilson_g2.draggables.add(g2, g3);
		
		
		
		Page.set_element_styles(".wilson-applet-canvas-container", "margin-top", "0", true);
		Page.set_element_styles(".wilson-applet-canvas-container", "margin-bottom", "0", true);
		
		
		
		window.requestAnimationFrame(draw_frame);
		window.requestAnimationFrame(draw_frame_ec_plot);
		setTimeout(() => window.requestAnimationFrame(draw_frame_ec_plot), 0);
		window.requestAnimationFrame(draw_frame_parameter_column);
		
		
		
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
	
	
	
	function on_drag_draggable(active_draggable, x, y, event)
	{
		g2 = x;
		g3 = y;
		
		g2_slider_element.value = (g2 + 5) * 1000;
		g3_slider_element.value = (g3 + 5) * 1000;
		
		g2_slider_value_element.textContent = Math.round(g2 * 1000) / 1000;
		g3_slider_value_element.textContent = Math.round(g3 * 1000) / 1000;
		
		window.requestAnimationFrame(draw_frame);
		window.requestAnimationFrame(draw_frame_ec_plot);
		window.requestAnimationFrame(draw_frame_parameter_column);
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
		
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["g2_arg"], g2);
		wilson_wp.gl.uniform1f(wilson_wp.uniforms["g3_arg"], g3);
		
		wilson_wp.render.draw_frame();
		
		
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["aspect_ratio"], aspect_ratio);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_center_x"], wilson_wpprime.world_center_x);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_center_y"], wilson_wpprime.world_center_y);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["world_size"], Math.min(wilson_wpprime.world_height, wilson_wpprime.world_width) / 2);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["black_point"], black_point);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["white_point"], white_point);
		
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["g2_arg"], g2);
		wilson_wpprime.gl.uniform1f(wilson_wpprime.uniforms["g3_arg"], g3);
		
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
		
		
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["aspect_ratio"], aspect_ratio_ec_plot);
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_center_x"], wilson_ec_plot.world_center_x);
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_center_y"], wilson_ec_plot.world_center_y);
		
		let world_size = Math.min(wilson_ec_plot.world_height, wilson_ec_plot.world_width);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["world_size"], world_size / 2);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["step"], world_size / resolution_ec_plot);
		
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["g2_arg"], g2);
			
		wilson_ec_plot.gl.uniform1f(wilson_ec_plot.uniforms["g3_arg"], g3);
		
		
		
		wilson_ec_plot.render.draw_frame();
		
		
		
		let pixels = wilson_ec_plot.render.get_pixel_data();
		
		let endpoints = [];
		
		const width = wilson_ec_plot.canvas_width;
		
		let max_interpolation_distance = wilson_ec_plot.canvas_width;
		
		//If the distance is at least this small, the number of neighbors is ignored.
		let min_guaranteed_interpolation_distance = 3;
		
		//This means a 5x5 square will be searched around each endpoint...
		let isolation_search_radius = 2;
		
		//...and it will be considered isolated if there are at most 2 pixels in the square.
		let isolation_threshhold = 1;
		
		for (let i = isolation_search_radius; i < wilson_ec_plot.canvas_height - isolation_search_radius; i++)
		{
			for (let j = isolation_search_radius; j < width - isolation_search_radius; j++)
			{
				let index = width * i + j;
				
				if (pixels[4 * index] !== 0)
				{
					//This is the sum of a radius 3 square centered at this pixel. It's an endpoint if there are 
					let close_total = pixels[4 * (index - 1)] + pixels[4 * (index + 1)] + pixels[4 * (index - width)] + pixels[4 * (index + width)] + pixels[4 * (index - 1 - width)] + pixels[4 * (index + 1 - width)] + pixels[4 * (index - 1 + width)] + pixels[4 * (index + 1 + width)];
					
					if (close_total <= 255)
					{
						let far_total = pixels[4 * (index - 2 * width - 2)] + pixels[4 * (index - 2 * width - 1)] + pixels[4 * (index - 2 * width)] + pixels[4 * (index - 2 * width + 1)] + pixels[4 * (index - 2 * width + 2)]   +   pixels[4 * (index + 2 * width - 2)] + pixels[4 * (index + 2 * width - 1)] + pixels[4 * (index + 2 * width)] + pixels[4 * (index + 2 * width + 1)] + pixels[4 * (index + 2 * width + 2)]   +   pixels[4 * (index - width - 2)] + pixels[4 * (index - 2)] + pixels[4 * (index + width - 2)]   +   pixels[4 * (index - width + 2)] + pixels[4 * (index + 2)] + pixels[4 * (index + width + 2)];
						
						//This is an endpoint. Now we'll check to see if it's isolated, which means it's connected to only at most two other pixels.
						if (far_total === 0)
						{
							endpoints.push([i, j, true]);
						}
						
						else
						{
							endpoints.push([i, j, false]);
						}
					}
				}
			}
		}
		
		
		
		//Connect every endpoint to the nearest other endpoint within a given radius.
		for (let i = 0; i < endpoints.length; i++)
		{
			if (endpoints[i][0] < wilson_ec_plot.canvas_width / 20 || endpoints[i][1] < wilson_ec_plot.canvas_height / 20 || endpoints[i][0] > 19 * wilson_ec_plot.canvas_width / 20 || endpoints[i][1] > 19 * wilson_ec_plot.canvas_height / 20)
			{
				continue;
			}
			
			
			
			let num_nearby_points = 0;
			let average_nearby_distance = 0;
			
			let min_open_j = -1;
			let min_open_distance = max_interpolation_distance;
			
			if (!(endpoints[i][2]))
			{
				min_open_distance = max_interpolation_distance / 20;
				
				if (zoom_level_ec_plot > 10)
				{
					min_open_distance *= zoom_level_ec_plot / 10;
				} 
			}
			
			
			
			for (let j = 0; j < endpoints.length; j++)
			{
				if (j === i)
				{
					continue;
				}
				
					
				
				let distance = Math.sqrt((endpoints[i][0] - endpoints[j][0])*(endpoints[i][0] - endpoints[j][0]) + (endpoints[i][1] - endpoints[j][1])*(endpoints[i][1] - endpoints[j][1]));
				
				if (distance < min_open_distance && distance >= 2)
				{
					//Only connect here if there are no white points in that general direction. General direction here means a 3x3 square centered at the shifted coordinate that doesn't intersect the endpoint itself.
					let row_movement = (endpoints[j][0] - endpoints[i][0]) / distance * 1.414214;
					let col_movement = (endpoints[j][1] - endpoints[i][1]) / distance * 1.414214;
					
					row_movement = Math.sign(row_movement) * Math.floor(Math.abs(row_movement));
					col_movement = Math.sign(col_movement) * Math.floor(Math.abs(col_movement));
					
					
					
					let test = 0;
					
					if (row_movement === 0)
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement + 1) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement - 1) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
					}
					
					else if (col_movement === 0)
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement + 1);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement - 1);
						test += pixels[4 * index];
					}
					
					else
					{
						let index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0]) + (endpoints[i][1] + col_movement);
						test += pixels[4 * index];
						
						index = width * (endpoints[i][0] + row_movement) + (endpoints[i][1]);
						test += pixels[4 * index];
					}
					
					
					
					if (test === 0)
					{
						min_open_j = j;
						min_open_distance = distance;
					}
				}
			}
			
			
			
			if (min_open_j !== -1)
			{
				//Interpolate between the two points.
				for (let k = 1; k < 2 * min_open_distance; k++)
				{
					let t = k / (2 * min_open_distance);
					
					let row = Math.round((1 - t) * endpoints[i][0] + t * endpoints[min_open_j][0]);
					let col = Math.round((1 - t) * endpoints[i][1] + t * endpoints[min_open_j][1]);
					
					let index = width * row + col;
					
					pixels[4 * index] = 0;
					pixels[4 * index + 1] = 255;
					pixels[4 * index + 2] = 0;
				}
			}
		}
		
		
		
		wilson_ec_plot.gl.texImage2D(wilson_ec_plot.gl.TEXTURE_2D, 0, wilson_ec_plot.gl.RGBA, wilson_ec_plot.canvas_width, wilson_ec_plot.canvas_height, 0, wilson_ec_plot.gl.RGBA, wilson_ec_plot.gl.UNSIGNED_BYTE, pixels);
		
		wilson_ec_plot.gl.useProgram(wilson_ec_plot.render.shader_programs[1]);
		
		wilson_ec_plot.gl.bindFramebuffer(wilson_ec_plot.gl.FRAMEBUFFER, null);
		
		wilson_ec_plot.render.draw_frame(pixels);
		
		
		
		
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
	
	
	
	function draw_frame_parameter_column(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp_parameter_column;
		
		last_timestamp_parameter_column = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_kleinj.gl.uniform1f(wilson_kleinj.uniforms["g2_arg"], g2);
		wilson_kleinj.gl.uniform1f(wilson_kleinj.uniforms["g3_arg"], g3);
		
		wilson_g2.gl.uniform1f(wilson_g2.uniforms["g2_arg"], g2);
		wilson_g2.gl.uniform1f(wilson_g2.uniforms["g3_arg"], g3);
		
		
		
		wilson_kleinj.render.draw_frame();
		
		wilson_g2.render.draw_frame();
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
				wilson_ec_plot.change_canvas_size(resolution_ec_plot, Math.floor(resolution_ec_plot / aspect_ratio_ec_plot));
				
				wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot) * aspect_ratio_ec_plot;
				wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot);
			}
			
			else
			{
				wilson_ec_plot.change_canvas_size(Math.floor(resolution_ec_plot * aspect_ratio_ec_plot), resolution_ec_plot);	
				
				wilson_ec_plot.world_width = 3 * Math.pow(2, zoom_level_ec_plot);
				wilson_ec_plot.world_height = 3 * Math.pow(2, zoom_level_ec_plot) / aspect_ratio_ec_plot;
			}
		}
		
		else
		{
			aspect_ratio_ec_plot = 1;
			
			wilson_ec_plot.change_canvas_size(resolution_ec_plot, resolution_ec_plot);
			
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