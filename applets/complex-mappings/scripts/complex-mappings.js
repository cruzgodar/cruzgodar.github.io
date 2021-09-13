!function()
{
	"use strict";
	
	
	
	let wilson = null;
	let wilson_hidden = null;
	
	
	
	let aspect_ratio = 1;
	
	let zoom_level = 1;
	
	let past_brightness_scales = [];
	
	let resolution = 500;
	let resolution_hidden = 100;
	
	let viewport_multiplier = 10;
	
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
	
	
	
	let code_input_element = document.querySelector("#code-textarea");
	
	code_input_element.value = "cmul(csin(z), csin(cmul(z, i)))";
	
	
	
	let generate_button_element = document.querySelector("#generate-button");
	
	generate_button_element.addEventListener("click", use_new_code);
	
	
	
	let download_button_element = document.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		wilson.download_frame("newtons-method.png");
	});
	
	
	
	let canvas_location_element = document.querySelector("#canvas-location");
	
	
	
	use_new_code();
	
	
	
	function use_new_code()
	{
		let generating_code = code_input_element.value || "cexp(cinv(z))";
		
		
		
		let frag_shader_source = `
			precision highp float;
			
			varying vec2 uv;
			
			
			
			uniform float aspect_ratio;
			
			uniform float world_center_x;
			uniform float world_center_y;
			uniform float world_size;
			
			uniform float brightness_scale;
			
			uniform float t;
			
			const vec2 i = vec2(0.0, 1.0);
			
			
			
			//Returns |z|.
			float cabs(vec2 z)
			{
				return length(z);
			}
			
			float cabs(float z)
			{
				return abs(z);
			}
			
			
			
			//Returns |z|.
			float carg(vec2 z)
			{
				if (z.x == 0.0)
				{
					if (z.y >= 0.0)
					{
						return 1.57079632;
					}
					
					return -1.57079632;
				}
				
				return atan(z.y, z.x);
			}
			
			float carg(float z)
			{
				if (z >= 0.0)
				{
					return 0.0;
				}
				
				return 3.14159265;
			}
			
			
			
			//Returns the conjugate of z.
			vec2 cconj(vec2 z)
			{
				return vec2(z.x, -z.y);
			}
			
			float cconj(float z)
			{
				return z;
			}
			
			
			
			//Returns z / |z|.
			vec2 csign(vec2 z)
			{
				if (length(z) == 0.0)
				{
					return vec2(0.0, 0.0);
				}
				
				return z / length(z);
			}
			
			float csign(float z)
			{
				return sign(z);
			}
			
			
			
			
			//Returns z + w.
			vec2 cadd(vec2 z, vec2 w)
			{
				return z + w;
			}
			
			vec2 cadd(vec2 z, float w)
			{
				return vec2(z.x + w, z.y);
			}
			
			vec2 cadd(float z, vec2 w)
			{
				return vec2(z + w.x, w.y);
			}
			
			float cadd(float z, float w)
			{
				return z + w;
			}
			
			
			
			//Returns z - w.
			vec2 csub(vec2 z, vec2 w)
			{
				return z - w;
			}
			
			vec2 csub(vec2 z, float w)
			{
				return vec2(z.x - w, z.y);
			}
			
			vec2 csub(float z, vec2 w)
			{
				return vec2(z - w.x, -w.y);
			}
			
			float csub(float z, float w)
			{
				return z - w;
			}
			
			
			
			//Returns z * w.
			vec2 cmul(vec2 z, vec2 w)
			{
				return vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
			}
			
			vec2 cmul(vec2 z, float w)
			{
				return z * w;
			}
			
			vec2 cmul(float z, vec2 w)
			{
				return z * w;
			}
			
			float cmul(float z, float w)
			{
				return z * w;
			}
			
			
			
			//Returns z / w.
			vec2 cdiv(vec2 z, vec2 w)
			{
				if (length(w) == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return vec2(z.x * w.x + z.y * w.y, -z.x * w.y + z.y * w.x) / (w.x * w.x + w.y * w.y);
			}
			
			vec2 cdiv(vec2 z, float w)
			{
				if (w == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return z / w;
			}
			
			vec2 cdiv(float z, vec2 w)
			{
				if (length(w) == 0.0)
				{
					return vec2(1.0, 0.0);
				}
				
				return vec2(z * w.x, -z * w.y) / (w.x * w.x + w.y * w.y);
			}
			
			float cdiv(float z, float w)
			{
				if (w == 0.0)
				{
					return 1.0;
				}
				
				return z / w;
			}
			
			
			
			//Returns 1/z.
			vec2 cinv(vec2 z)
			{
				float magnitude = z.x*z.x + z.y*z.y;
				
				return vec2(z.x / magnitude, -z.y / magnitude);
			}
			
			float cinv(float z)
			{
				if (z == 0.0)
				{
					return 1.0;
				}
				
				return 1.0 / z;
			}
			
			
			
			//Returns z^w.
			vec2 cpow(vec2 z, vec2 w)
			{
				float arg = carg(z);
				float magnitude = z.x * z.x + z.y * z.y;
				
				float exparg = exp(-w.y * arg);
				float magexp = pow(magnitude, w.x / 2.0);
				float logmag = log(magnitude) * w.y / 2.0;
				
				float p1 = exparg * cos(w.x * arg);
				float p2 = exparg * sin(w.x * arg);
				
				float q1 = magexp * cos(logmag);
				float q2 = magexp * sin(logmag);
				
				return vec2(p1 * q1 - p2 * q2, q1 * p2 + p1 * q2);
			}
			
			vec2 cpow(vec2 z, float w)
			{
				float arg = carg(z);
				float magnitude = z.x * z.x + z.y * z.y;
				
				float magexp = pow(magnitude, w / 2.0);
				
				float p1 = cos(w * arg);
				float p2 = sin(w * arg);
				
				return vec2(p1 * magexp, p2 * magexp);
			}
			
			vec2 cpow(float z, vec2 w)
			{
				if (z == 0.0)
				{
					return vec2(0.0, 0.0);
				}
				
				float zlog = log(z);
				float zexp = exp(w.x * zlog);
				
				return vec2(zexp * cos(w.y * zlog), zexp * sin(w.y * zlog));
			}
			
			float cpow(float z, float w)
			{
				return pow(z, w);
			}
			
			
			
			//Returns z^^w.
			vec2 ctet(vec2 z, float w)
			{
				if (w == 0.0)
				{
					return vec2(1.0, 0.0);
				}
			
				
				vec2 prod = z;
				
				for (int i = 1; i < 10000; i++)
				{
					if (float(i) >= w)
					{
						return prod;
					}
					
					prod = cpow(prod, z);
				}
				
				return prod;
			}
			
			float ctet(float z, float w)
			{
				if (w == 0.0)
				{
					return 1.0;
				}
				
				
				
				float prod = z;
				
				for (int i = 1; i < 10000; i++)
				{
					if (float(i) >= w)
					{
						return prod;
					}
					
					prod = pow(prod, z);
				}
				
				return prod;
			}
			
			
			
			//Returns sqrt(z).
			vec2 csqrt(vec2 z)
			{
				return cpow(z, .5);
			}
			
			vec2 csqrt(float z)
			{
				if (z >= 0.0)
				{
					return vec2(sqrt(z), 0.0);
				}
				
				return vec2(0.0, sqrt(-z));
			}
			
			
			
			//Returns e^z.
			vec2 cexp(vec2 z)
			{
				return cpow(2.7182818, z);
			}
			
			float cexp(float z)
			{
				return exp(z);
			}
			
			
			
			//Returns log(z).
			vec2 clog(vec2 z)
			{
				return vec2(.5 * log(z.x * z.x + z.y * z.y), carg(z));
			}
			
			float clog(float z)
			{
				if (z == 0.0)
				{
					return 0.0;
				}
				
				return log(z);
			}
			
			
			
			//Returns sin(z).
			vec2 csin(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) - cexp(cmul(z, vec2(0.0, -1.0)));
				
				return cmul(temp, vec2(0.0, -0.5));
			}
			
			float csin(float z)
			{
				return sin(z);
			}
			
			
			
			//Returns cos(z).
			vec2 ccos(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 1.0))) + cexp(cmul(z, vec2(0.0, -1.0)));
				
				return cmul(temp, vec2(0.0, -0.5));
			}
			
			float ccos(float z)
			{
				return cos(z);
			}
			
			
			
			//Returns tan(z).
			vec2 ctan(vec2 z)
			{
				vec2 temp = cexp(cmul(z, vec2(0.0, 2.0)));
				
				return cdiv(cmul(vec2(0.0, -1.0), vec2(-1.0, 0.0) + temp), vec2(1.0, 0.0) + temp);
			}
			
			float ctan(float z)
			{
				return tan(z);
			}
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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
				
				
				
				gl_FragColor = vec4(hsv2rgb(vec3(atan(z.y, z.x) / 6.284, 1.0, 2.0 / (1.0 + exp(-length(z) / 1.0)) - 1.0)), 1.0);
			}
		`;
		


		let options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: 500,
			canvas_height: 500,
			
			world_width: 4,
			world_height: 4,
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
		
		let options_hidden =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: 100,
			canvas_height: 100
		};
		
		
		
		try
		{
			wilson.output_canvas_container.parentNode.remove();
			wilson_hidden.output_canvas_container.parentNode.remove();
			
			canvas_location_element.insertAdjacentHTML("beforebegin", `
				<div>
					<canvas id="output-canvas" class="output-canvas"></canvas>
					<canvas id="hidden-canvas" class="hidden-canvas"></canvas>
				</div>
			`);
		}
		
		catch(ex) {}
		
		
		
		wilson = new Wilson(document.querySelector("#output-canvas"), options);

		wilson.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "brightness_scale", "t"]);
		
		
		
		wilson_hidden = new Wilson(document.querySelector("#hidden-canvas"), options_hidden);
		
		wilson_hidden.render.init_uniforms(["aspect_ratio", "world_center_x", "world_center_y", "world_size", "brightness_scale", "t"]);
		
		
		
		past_brightness_scales = [];
		
		zoom_level = 0;
		
		next_pan_velocity_x = 0;
		next_pan_velocity_y = 0;
		next_zoom_velocity = 0;
		
		pan_velocity_x = 0;
		pan_velocity_y = 0;
		zoom_velocity = 0;
		
		
		
		//Render the inital frame.
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], 1);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], 1);
		
		wilson.gl.uniform1f(wilson.uniforms["t"], 0);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["t"], 0);
		
		
		
		window.requestAnimationFrame(draw_newtons_method);
	}
	
	
	
	function animate_palette_change()
	{
		if (!currently_animating_parameters)
		{
			currently_animating_parameters = true;
			
			parameter_animation_frame = 0;
			
			
			
			let new_colors = generate_new_palette();
			old_colors = [...colors];
			
			for (let i = 0; i < 12; i++)
			{
				color_deltas[i] = new_colors[i] - colors[i];
			}
			
			window.requestAnimationFrame(draw_newtons_method);
		}
	}
	
	
	
	function animate_palette_change_step()
	{
		let t = .5 * Math.sin(Math.PI * parameter_animation_frame / 30 - Math.PI / 2) + .5;
		
		for (let i = 0; i < 12; i++)
		{
			colors[i] = old_colors[i] + color_deltas[i]*t;
		}
		
		wilson.gl.uniform3fv(wilson.uniforms["colors"], colors);
		wilson_hidden.gl.uniform3fv(wilson_hidden.uniforms["colors"], colors);
		
		
		
		parameter_animation_frame++;
		
		if (parameter_animation_frame === 31)
		{
			currently_animating_parameters = false;
		}
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
		wilson.world_center_x -= x_delta;
		wilson.world_center_y -= y_delta;
		
		next_pan_velocity_x = -x_delta / wilson.world_width;
		next_pan_velocity_y = -y_delta / wilson.world_height;
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
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
		
		window.requestAnimationFrame(draw_newtons_method);
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
		
		window.requestAnimationFrame(draw_newtons_method);
		
		wilson.draggables.recalculate_locations();
	}
	
	

	function draw_newtons_method(timestamp)
	{
		let time_elapsed = timestamp - last_timestamp;
		
		last_timestamp = timestamp;
		
		
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["aspect_ratio"], aspect_ratio);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_x"], wilson.world_center_x);
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson_hidden.gl.uniform1f(wilson_hidden.uniforms["brightness_scale"], 30);
		
		wilson_hidden.render.draw_frame();
		
		
		
		let pixel_data = wilson_hidden.render.get_pixel_data();
		
		let brightnesses = new Array(resolution_hidden * resolution_hidden);
		
		for (let i = 0; i < resolution_hidden * resolution_hidden; i++)
		{
			brightnesses[i] = Math.max(Math.max(pixel_data[4 * i], pixel_data[4 * i + 1]), pixel_data[4 * i + 2]);
		}
		
		brightnesses.sort((a, b) => a - b);
		
		let brightness_scale = Math.min(10000 / (brightnesses[Math.floor(resolution_hidden * resolution_hidden * .96)] + brightnesses[Math.floor(resolution_hidden * resolution_hidden * .98)]), 200);
		
		past_brightness_scales.push(brightness_scale);
		
		let denom = past_brightness_scales.length;
		
		if (denom > 10)
		{
			past_brightness_scales.shift();
		}
		
		brightness_scale = Math.max(past_brightness_scales.reduce((a, b) => a + b) / denom, .5);
		
		
		
		
		
		wilson.gl.uniform1f(wilson.uniforms["aspect_ratio"], aspect_ratio);
		wilson.gl.uniform1f(wilson.uniforms["world_center_x"], wilson.world_center_x);
		wilson.gl.uniform1f(wilson.uniforms["world_center_y"], wilson.world_center_y);
		
		wilson.gl.uniform1f(wilson.uniforms["world_size"], Math.min(wilson.world_height, wilson.world_width) / 2);
		
		wilson.gl.uniform1f(wilson.uniforms["brightness_scale"], brightness_scale);
		
		wilson.render.draw_frame();
		
		
		
		let need_new_frame = false;
		
		if (currently_animating_parameters)
		{
			animate_palette_change_step();
			
			need_new_frame = true;
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
			
			
			
			need_new_frame = true;
		}
		
		
		
		if (need_new_frame)
		{
			window.requestAnimationFrame(draw_newtons_method);
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
		
		window.requestAnimationFrame(draw_newtons_method);
	}

	window.addEventListener("resize", change_aspect_ratio);
	Page.temporary_handlers["resize"].push(change_aspect_ratio);
}()