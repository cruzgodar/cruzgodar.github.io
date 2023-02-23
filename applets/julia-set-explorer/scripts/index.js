!function()
{
	"use strict";
	
	
	
	let frag_shader_source = `
		precision highp float;
		
		varying vec2 uv;
		
		uniform int julia_mode;
		uniform int double_precision;
		
		uniform float aspect_ratio;
		
		uniform vec2 world_center_x;
		uniform vec2 world_center_y;
		uniform float world_size;
		
		uniform float a;
		uniform float b;
		uniform int num_iterations;
		uniform float brightness_scale;
		
		
		
		float times_frc(float a, float b)
		{
			return mix(0.0, a * b, b != 0.0 ? 1.0 : 0.0);
		}

		float plus_frc(float a, float b)
		{
			return mix(a, a + b, b != 0.0 ? 1.0 : 0.0);
		}

		float minus_frc(float a, float b)
		{
			return mix(a, a - b, b != 0.0 ? 1.0 : 0.0);
		}

		// Double emulation based on GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
		// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
		// Add: res = ds_add(a, b) => res = a + b
		vec2 add (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float t1, t2, e;
			t1 = plus_frc(dsa.x, dsb.x);
			e = minus_frc(t1, dsa.x);
			t2 = plus_frc(plus_frc(plus_frc(minus_frc(dsb.x, e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);
			dsc.x = plus_frc(t1, t2);
			dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
			return dsc;
		}

		// Subtract: res = ds_sub(a, b) => res = a - b
		vec2 sub (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float e, t1, t2;
			t1 = minus_frc(dsa.x, dsb.x);
			e = minus_frc(t1, dsa.x);
			t2 = minus_frc(plus_frc(plus_frc(minus_frc(minus_frc(0.0, dsb.x), e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);
			dsc.x = plus_frc(t1, t2);
			dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
			return dsc;
		}

		// Compare: res = -1 if a < b // = 0 if a == b // = 1 if a > b
		float cmp(vec2 dsa, vec2 dsb)
		{
			if (dsa.x < dsb.x)
			{
				return -1.;
			}
			
			if (dsa.x > dsb.x)
			{
				return 1.;
			}
			
			if (dsa.y < dsb.y)
			{
				return -1.;
			}
			
			if (dsa.y > dsb.y)
			{
				return 1.;
			}
			
			return 0.;
		}

		// Multiply: res = ds_mul(a, b) => res = a * b

		vec2 mul (vec2 dsa, vec2 dsb)
		{
			vec2 dsc;
			float c11, c21, c2, e, t1, t2;
			float a1, a2, b1, b2, cona, conb, split = 8193.;
			cona = times_frc(dsa.x, split);
			conb = times_frc(dsb.x, split);
			a1 = minus_frc(cona, minus_frc(cona, dsa.x));
			b1 = minus_frc(conb, minus_frc(conb, dsb.x));
			a2 = minus_frc(dsa.x, a1);
			b2 = minus_frc(dsb.x, b1);
			c11 = times_frc(dsa.x, dsb.x);
			c21 = plus_frc(times_frc(a2, b2), plus_frc(times_frc(a2, b1), plus_frc(times_frc(a1, b2), minus_frc(times_frc(a1, b1), c11))));
			c2 = plus_frc(times_frc(dsa.x, dsb.y), times_frc(dsa.y, dsb.x));
			t1 = plus_frc(c11, c2);
			e = minus_frc(t1, c11);
			t2 = plus_frc(plus_frc(times_frc(dsa.y, dsb.y), plus_frc(minus_frc(c2, e), minus_frc(c11, minus_frc(t1, e)))), c21);
			dsc.x = plus_frc(t1, t2);
			dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
			return dsc;
		}

		// create double-single number from float
		vec2 set(float a)
		{
			return vec2(a, 0.0);
		}

		float rand(vec2 co)
		{
			// implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
			return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}

		vec2 complexMul(vec2 a, vec2 b)
		{
			return vec2(a.x*b.x - a.y*b.y,a.x*b.y + a.y * b.x);
		}

		// double complex multiplication
		vec4 dcMul(vec4 a, vec4 b)
		{
			return vec4(sub(mul(a.xy,b.xy),mul(a.zw,b.zw)),add(mul(a.xy,b.zw),mul(a.zw,b.xy)));
		}

		vec4 dcAdd(vec4 a, vec4 b)
		{
			return vec4(add(a.xy,b.xy),add(a.zw,b.zw));
		}

		// Length of double complex
		vec2 dcLength(vec4 a)
		{
			return add(mul(a.xy,a.xy),mul(a.zw,a.zw));
		}

		vec4 dcSet(vec2 a)
		{
			return vec4(a.x,0.,a.y,0.);
		}

		vec4 dcSet(vec2 a, vec2 ad)
		{
			return vec4(a.x, ad.x,a.y,ad.y);
		}

		// Multiply double-complex with double
		vec4 dcMul(vec4 a, vec2 b)
		{
			return vec4(mul(a.xy,b),mul(a.wz,b));
		}
		
		
		
		void main(void)
		{
			if (double_precision == 0)
			{
				vec2 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = vec2(uv.x * aspect_ratio * world_size + world_center_x.x, uv.y * world_size + world_center_y.x);
				}
				
				else
				{
					z = vec2(uv.x * world_size + world_center_x.x, uv.y / aspect_ratio * world_size + world_center_y.x);
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (julia_mode == 0)
				{
					vec2 c = z;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
				}
				
				
				
				else if (julia_mode == 1)
				{
					vec2 c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
				}
				
				
				
				else
				{
					vec2 c = z;
					
					bool broken = false;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightness_scale * color, 1.0);
					}
					
					
					
					z = vec2(uv.x * aspect_ratio * 2.0, uv.y * 2.0);
					color = normalize(vec3(abs(z.x + z.y) / 2.0, abs(z.x) / 2.0, abs(z.y) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec2(a, b);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor.xyz /= 4.0;
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightness_scale * color, 0.0);
					}
				}
			}
			
			
			
			else
			{
				vec4 z;
				
				if (aspect_ratio >= 1.0)
				{
					z = dcAdd(dcMul(vec4(uv.x * aspect_ratio, 0.0, uv.y, 0.0), vec2(world_size, 0.0)), vec4(world_center_x, world_center_y));
				}
				
				else
				{
					z = dcAdd(dcMul(vec4(uv.x, 0.0, uv.y / aspect_ratio, 0.0), vec2(world_size, 0.0)), vec4(world_center_x, world_center_y));
				}
				
				vec3 color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
				float brightness = exp(-length(z));
				
				
				
				if (julia_mode == 0)
				{
					vec4 c = z;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
				}
				
				else if (julia_mode == 1)
				{
					vec4 c = vec4(a, 0.0, b, 0.0);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							return;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					gl_FragColor = vec4(brightness / brightness_scale * color, 1.0);
				}
				
				else
				{
					vec4 c = z;
					
					bool broken = false;
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					
					
					if (!broken)
					{
						gl_FragColor = vec4(.5 * brightness / brightness_scale * color, 1.0);
					}
					
					
					
					z = c;
					color = normalize(vec3(abs(z.x + z.z) / 2.0, abs(z.x) / 2.0, abs(z.z) / 2.0) + .1 / length(z) * vec3(1.0, 1.0, 1.0));
					brightness = exp(-length(z));
					
					broken = false;
					
					c = vec4(a, 0.0, b, 0.0);
					
					for (int iteration = 0; iteration < 3001; iteration++)
					{
						if (iteration == num_iterations)
						{
							gl_FragColor.xyz /= 4.0;
							
							broken = true;
							
							break;
						}
						
						if (length(z) >= 4.0)
						{
							break;
						}
						
						z = dcAdd(dcMul(z, z), c);
						
						brightness += exp(-length(z));
					}
					
					if (!broken)
					{
						gl_FragColor += vec4(brightness / brightness_scale * color, 0.0);
					}
				}
			}	
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
		world_center_x: -.75,
		world_center_y: 0,
		
		
		
		use_fullscreen: true,
		
		true_fullscreen: true,
	
		use_fullscreen_button: true,
		
		enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
		exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
		
		switch_fullscreen_callback: change_aspect_ratio,
		
		
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousemove_callback: on_hover_canvas,
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas,
		
		wheel_callback: on_wheel_canvas,
		pinch_callback: on_pinch_canvas
	};
	
	let options_hidden =
	{
		renderer: "gpu",
		
		shader: frag_shader_source,
		
		canvas_width: 100,
		canvas_height: 100
	};
	
	
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);

	wilson.render.init_uniforms(["julia_mode", "double_precision", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "brightness_scale"]);
	
	wilson.gl.uniform1i(wilson.uniforms["double_precision"], 0);
	
	
	
	let wilson_hidden = new Wilson(Page.element.querySelector("#hidden-canvas"), options_hidden);
	
	wilson_hidden.render.init_uniforms(["julia_mode", "double_precision", "aspect_ratio", "world_center_x", "world_center_y", "world_size", "a", "b", "num_iterations", "brightness_scale"]);
	
	wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 0);
	
	
	
	let julia_mode = 0;
	
	let aspect_ratio = 1;
	
	let num_iterations = 100;
	
	let zoom_level = 0;
	let double_precision = false;
	
	//Experimentally, the level at which a 2k x 2k canvas can see the grain of single precision rendering.
	const double_precision_zoom_threshhold = -16;
	
	let past_brightness_scales = [];
	
	let a = 0;
	let b = 1;
	
	let resolution = 1000;
	let resolution_hidden = 100;
	
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
	
	

	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 1000);
		
		wilson.change_canvas_size(resolution, resolution);
		
		window.requestAnimationFrame(draw_julia_set);
	});
	
	
	
	let force_floats_checkbox_element = Page.element.querySelector("#force-floats-checkbox");
	
	force_floats_checkbox_element.addEventListener("input", () =>
	{
		if (force_floats_checkbox_element.checked)
		{
			try {force_doubles_checkbox_element.checked = false;}
			catch(ex) {}
			
			force_doubles = false;
		}
		
		if (force_floats_checkbox_element.checked && double_precision)
		{
			double_precision = false;
			
			wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 0);
			wilson.gl.uniform1i(wilson.uniforms["double_precision"], 0);
			
			wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else if (!force_floats_checkbox_element.checked && !double_precision && zoom_level < double_precision_zoom_threshhold)
		{
			double_precision = true;
			
			wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 1);
			wilson.gl.uniform1i(wilson.uniforms["double_precision"], 1);
			
			wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
			
			window.requestAnimationFrame(draw_julia_set);
		}
	});
	
	
	
	let force_doubles = false;
	
	let force_doubles_checkbox_element = Page.element.querySelector("#force-doubles-checkbox");
	
	if (DEBUG)
	{
		force_doubles_checkbox_element.addEventListener("input", () =>
		{
			if (force_doubles_checkbox_element.checked)
			{
				force_floats_checkbox_element.checked = false;
			}
			
			if (force_doubles_checkbox_element.checked && !double_precision)
			{
				double_precision = true;
				
				wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 1);
				wilson.gl.uniform1i(wilson.uniforms["double_precision"], 1);
				
				wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
				
				window.requestAnimationFrame(draw_julia_set);
			}
			
			else if (!force_doubles_checkbox_element.checked && double_precision && zoom_level > double_precision_zoom_threshhold)
			{
				double_precision = false;
				
				wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 0);
				wilson.gl.uniform1i(wilson.uniforms["double_precision"], 0);
				
				wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
				
				window.requestAnimationFrame(draw_julia_set);
			}
			
			force_doubles = force_doubles_checkbox_element.checked;
		});
	}	
	
	else
	{
		Page.element.querySelectorAll(".checkbox-row")[1].remove();
	}
	
	
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("a-julia-set.png");
	});
	
	
	
	let switch_julia_mode_button_element = Page.element.querySelector("#switch-julia-mode-button");
	
	switch_julia_mode_button_element.style.opacity = 1;
	
	switch_julia_mode_button_element.addEventListener("click", () =>
	{
		Page.Animate.change_opacity(switch_julia_mode_button_element, 0, Site.opacity_animation_time);
		
		setTimeout(() =>
		{
			if (julia_mode === 2)
			{
				switch_julia_mode_button_element.textContent = "Return to Mandelbrot Set";
			}
			
			else if (julia_mode === 0)
			{
				switch_julia_mode_button_element.textContent = "Pick Julia Set";
				
				Page.Animate.change_opacity(switch_julia_mode_button_element, 1, Site.opacity_animation_time);
			}
		}, Site.opacity_animation_time);
		
		
		
		if (julia_mode === 0)
		{
			julia_mode = 2;
			
			a = 0;
			b = 0;
			
			pan_velocity_x = 0;
			pan_velocity_y = 0;
			zoom_velocity = 0;
			
			next_pan_velocity_x = 0;
			next_pan_velocity_y = 0;
			next_zoom_velocity = 0;
			
			past_brightness_scales = [];
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else if (julia_mode === 1)
		{
			julia_mode = 0;
			
			wilson.world_center_x = -.75;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			window.requestAnimationFrame(draw_julia_set);
		}
	});
	
	
	
	//Render the inital frame.
	wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
	wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], 1);
	
	window.requestAnimationFrame(draw_julia_set);
	
	
	
	Page.show();
	
	
	
	function on_grab_canvas(x, y, event)
	{
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		
		
		if (julia_mode === 2 && event.type === "mousedown")
		{
			julia_mode = 1;
			
			wilson.world_center_x = 0;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			Page.Animate.change_opacity(switch_julia_mode_button_element, 1, Site.opacity_animation_time);
			
			window.requestAnimationFrame(draw_julia_set);
		}
	}
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (julia_mode === 2 && event.type === "touchmove")
		{
			a = x;
			b = y;
		}
		
		else
		{
			wilson.world_center_x -= x_delta;
			wilson.world_center_y -= y_delta;
			
			next_pan_velocity_x = -x_delta / wilson.world_width;
			next_pan_velocity_y = -y_delta / wilson.world_height;
			
			wilson.world_center_x = Math.min(Math.max(wilson.world_center_x, -2), 2);
			wilson.world_center_y = Math.min(Math.max(wilson.world_center_y, -2), 2);
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function on_hover_canvas(x, y, x_delta, y_delta, event)
	{
		if (julia_mode === 2 && event.type === "mousemove")
		{
			a = x;
			b = y;
			
			window.requestAnimationFrame(draw_julia_set);
		}
	}
	
	
	
	function on_release_canvas(x, y, event)
	{
		if (julia_mode === 2 && event.type === "touchend")
		{
			julia_mode = 1;
			
			wilson.world_center_x = 0;
			wilson.world_center_y = 0;
			wilson.world_width = 4;
			wilson.world_height = 4;
			zoom_level = 0;
			
			past_brightness_scales = [];
			
			Page.Animate.change_opacity(switch_julia_mode_button_element, 1, Site.opacity_animation_time);
			
			window.requestAnimationFrame(draw_julia_set);
		}
		
		else
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
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}
	
	
	
	function on_wheel_canvas(x, y, scroll_amount, event)
	{
		fixed_point_x = x;
		fixed_point_y = y;
		
		if (Math.abs(scroll_amount / 100) < .3)
		{
			zoom_level += scroll_amount / 100;
			
			zoom_level = Math.min(zoom_level, 1);
		}
		
		else
		{
			zoom_velocity += Math.sign(scroll_amount) * .05;
		}
		
		zoom_canvas();
	}
	
	
	
	function on_pinch_canvas(x, y, touch_distance_delta, event)
	{
		if (julia_mode === 2)
		{
			return;
		}
		
		
		
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
		
		zoom_level = Math.min(zoom_level, 1);
		
		fixed_point_x = x;
		fixed_point_y = y;
		
		zoom_canvas();
	}
	
	
	
	function zoom_canvas()
	{
		if (aspect_ratio >= 1)
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level) * aspect_ratio, 4 * Math.pow(2, zoom_level));
			
			wilson.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
			wilson.world_height = 4 * Math.pow(2, zoom_level);
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		else
		{
			let new_world_center = wilson.input.get_zoomed_world_center(fixed_point_x, fixed_point_y, 4 * Math.pow(2, zoom_level), 4 * Math.pow(2, zoom_level) / aspect_ratio);
			
			wilson.world_width = 4 * Math.pow(2, zoom_level);
			wilson.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			
			wilson.world_center_x = new_world_center[0];
			wilson.world_center_y = new_world_center[1];
		}
		
		num_iterations = (-zoom_level * 30) + 200;
		
		
		
		if (!double_precision && zoom_level < double_precision_zoom_threshhold && !force_floats_checkbox_element.checked)
		{
			double_precision = true;
			wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 1);
			wilson.gl.uniform1i(wilson.uniforms["double_precision"], 1);
			
			wilson.canvas.style.borderColor = "rgb(127, 0, 0)";
		}
		
		else if (double_precision && zoom_level > double_precision_zoom_threshhold && !force_doubles)
		{
			double_precision = false;
			wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["double_precision"], 0);
			wilson.gl.uniform1i(wilson.uniforms["double_precision"], 0);
			
			wilson.canvas.style.borderColor = "rgb(127, 127, 127)";
		}
		
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
		
		
		
		let cx = double_to_df(wilson.world_center_x);
		let cy = double_to_df(wilson.world_center_y);
		
		
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["julia_mode"], julia_mode);
		wilson_hidden.gl.uniform2fv(wilson_hidden.uniforms["world_center_x"], cx);
		wilson_hidden.gl.uniform2fv(wilson_hidden.uniforms["world_center_y"], cy);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson_hidden.gl.uniform1i(wilson_hidden.uniforms["num_iterations"], num_iterations);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["a"], a);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["b"], b);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 20 * (Math.abs(zoom_level) + 1));
		
		wilson_hidden.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = pixel_data[4 * i] + pixel_data[4 * i + 1] + pixel_data[4 * i + 2];
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = (brightnesses[Math.floor(resolution_hidden * resolution_hidden * .96)] + brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)]) / 255 * 15 * (Math.abs(zoom_level / 2) + 1);
		
		past_brightness_scales.push(brightness_scale);
		
		let denom = past_brightness_scales.length;
		
		if (denom > 10)
		{
			past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		wilson.gl.uniform1i(wilson.uniforms["julia_mode"], julia_mode);
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		
		wilson.gl.uniform2fv(wilson.uniforms["world_center_x"], cx);
		wilson.gl.uniform2fv(wilson.uniforms["world_center_y"], cy);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson.gl.uniform1i(wilson.uniforms["num_iterations"], num_iterations);
		wilson.gl.uniform1f(wilson.uniforms["a"], a);
		wilson.gl.uniform1f(wilson.uniforms["b"], b);
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
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
			
			wilson.world_center_x = Math.min(Math.max(wilson.world_center_x, -2), 2);
			wilson.world_center_y = Math.min(Math.max(wilson.world_center_y, -2), 2);
			
			
			
			pan_velocity_x *= pan_friction;
			pan_velocity_y *= pan_friction;
			
			if (Math.sqrt(pan_velocity_x * pan_velocity_x + pan_velocity_y * pan_velocity_y) < pan_velocity_stop_threshhold)
			{
				pan_velocity_x = 0;
				pan_velocity_y = 0;
			}
			
			
			
			zoom_level += zoom_velocity;
			
			zoom_level = Math.min(zoom_level, 1);
			
			zoom_canvas(fixed_point_x, fixed_point_y);
			
			zoom_velocity *= zoom_friction;
			
			if (Math.abs(zoom_velocity) < zoom_velocity_stop_threshhold)
			{
				zoom_velocity = 0;
			}
			
			
			
			window.requestAnimationFrame(draw_julia_set);
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
				
				wilson.world_width = 4 * Math.pow(2, zoom_level) * aspect_ratio;
				wilson.world_height = 4 * Math.pow(2, zoom_level);
			}
			
			else
			{
				wilson.change_canvas_size(Math.floor(resolution * aspect_ratio), resolution);
				
				wilson.world_width = 4 * Math.pow(2, zoom_level);
				wilson.world_height = 4 * Math.pow(2, zoom_level) / aspect_ratio;
			}
		}
		
		else
		{
			aspect_ratio = 1;
			
			wilson.change_canvas_size(resolution, resolution);
			
			wilson.world_width = 4 * Math.pow(2, zoom_level);
			wilson.world_height = 4 * Math.pow(2, zoom_level);
		}
		
		window.requestAnimationFrame(draw_julia_set);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
	
	
	
	function double_to_df(d)
	{
		let df = new Float32Array(2);
		const split = (1 << 29) + 1;
		
		let a = d * split;
		let hi = a - (a - d);
		let lo = d - hi;
		
		df[0] = hi;
		df[1] = lo;
		
		return [df[0], df[1]];
	}	
}()