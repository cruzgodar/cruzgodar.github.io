"use strict";

class QuasiFuchsianGroups extends Applet
{
	load_promise = null;
	
	wilson_hidden = null;
	
	resolution_small = 300;
	resolution_large = 900;
	
	image_size = this.resolution_small;
	image_width = this.resolution_small;
	image_height = this.resolution_small;
	
	box_size = 4;
	
	web_worker = null;
	
	last_timestamp = -1;
	
	t = [[2, 0], [2, 0]];
	
	coefficients = [[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]], [], []];
	
	draw_another_frame = false;
	need_to_restart = true;
	
	max_depth = 20;
	max_pixel_brightness = 10;

	x = 0;
	y = 0;
	
	hue = null;
	brightness = null;
	image = null;
	
	
	
	constructor(canvas)
	{
		super(canvas);
		
		
		
		const frag_shader_source = `
			precision highp float;
			precision highp sampler2D;
			
			varying vec2 uv;
			
			uniform sampler2D u_texture;
			
			uniform float texture_step;
			
			
			
			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			void main(void)
			{
				//Dilate the pixels to make a thicker line.
				vec2 center = (uv + vec2(1.0, 1.0)) / 2.0;
				
				float brightness =
					max(max(max(texture2D(u_texture, center + vec2(texture_step, 0.0)).z,
					texture2D(u_texture, center - vec2(texture_step, 0.0)).z),
					max(texture2D(u_texture, center + vec2(0.0, texture_step)).z,
					texture2D(u_texture, center - vec2(0.0, texture_step)).z)),
					
					max(max(texture2D(u_texture, center + vec2(texture_step, texture_step)).z,
					texture2D(u_texture, center + vec2(texture_step, -texture_step)).z),
					max(texture2D(u_texture, center + vec2(-texture_step, texture_step)).z,
					texture2D(u_texture, center + vec2(-texture_step, -texture_step)).z)));
					
				brightness = max(brightness, texture2D(u_texture, center).z);	
				
				if (brightness < .5)
				{
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
					
					return;
				}
				
				
				gl_FragColor = vec4(hsv2rgb(vec3(texture2D(u_texture, center).x, 1.0, brightness)), 1.0);
			}
		`;
		
		
		
		const options =
		{
			renderer: "gpu",
			
			shader: frag_shader_source,
			
			canvas_width: this.resolution_small,
			canvas_height: this.resolution_small,
			
			world_width: 1,
			world_height: 4,
			world_center_x: 2,
			world_center_y: 0,
			
			
			
			use_draggables: true,
			
			draggables_mousedown_callback: this.on_grab_draggable.bind(this),
			draggables_touchstart_callback: this.on_grab_draggable.bind(this),
			
			draggables_mousemove_callback: this.on_drag_draggable.bind(this),
			draggables_touchmove_callback: this.on_drag_draggable.bind(this),
			
			draggables_mouseup_callback: this.on_release_draggable.bind(this),
			draggables_touchend_callback: this.on_release_draggable.bind(this),
			
			
			
			use_fullscreen: true,
			
			true_fullscreen: true,
		
			use_fullscreen_button: true,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.change_aspect_ratio.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		this.wilson.render.init_uniforms(["texture_step"]);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["texture_step"], 1 / this.image_size);
		
		this.wilson.render.create_framebuffer_texture_pair();
		
		this.wilson.gl.bindTexture(this.wilson.gl.TEXTURE_2D, this.wilson.render.framebuffers[0].texture);
		this.wilson.gl.bindFramebuffer(this.wilson.gl.FRAMEBUFFER, null);
		
		this.image = new Float32Array(this.image_width * this.image_height * 4);
		
		
		
		this.regenerate_hue_and_brightness();
		
		
		
		this.load_promise = new Promise(async(resolve, reject) =>
		{
			if (!Site.scripts_loaded["complexjs"])
			{
				await Site.load_script("/scripts/complex.min.js");
				
				Site.scripts_loaded["complexjs"] = true;
			}
			
			this.init_draggables();
			
			resolve();
		});
	}
	
	
	
	bake_coefficients(x1 = this.wilson.draggables.world_coordinates[0][0], y1 = this.wilson.draggables.world_coordinates[0][1], x2 = this.wilson.draggables.world_coordinates[1][0], y2 = this.wilson.draggables.world_coordinates[1][1])
	{
		//Use Grandma's recipe, canidate for the worst-named algorithm of the last two decades.
		const ta = new Complex(x1, y1);
		const tb = new Complex(x2, y2);
		
		const b = ta.mul(tb);
		
		const c = ta.mul(ta).add(tb.mul(tb));
		
		const discriminant = b.mul(b).sub(c.mul(4));
		
		const tab = discriminant.arg() > 0 ? b.sub(discriminant.sqrt()).div(2) : b.add(discriminant.sqrt()).div(2);
		
		const z0 = tab.sub(2).mul(tb).div(tb.mul(tab).sub(ta.mul(2)).add(tab.mul(new Complex([0, 2]))));
		
		
		
		const c1 = ta.div(2);
		const c2 = ta.mul(tab).sub(tb.mul(2)).add(new Complex([0, 4])).div(tab.mul(2).add(4).mul(z0));
		const c3 = ta.mul(tab).sub(tb.mul(2)).sub(new Complex([0, 4])).mul(z0).div(tab.mul(2).sub(4));
		const c4 = tb.sub(new Complex([0, 2])).div(2);
		const c5 = tb.div(2);
		const c6 = tb.add(new Complex([0, 2])).div(2);
		
		this.coefficients[0][0][0] = c1.re;
		this.coefficients[0][0][1] = c1.im;
		
		this.coefficients[0][1][0] = c2.re;
		this.coefficients[0][1][1] = c2.im;
		
		this.coefficients[0][2][0] = c3.re;
		this.coefficients[0][2][1] = c3.im;
		
		this.coefficients[0][3][0] = c1.re;
		this.coefficients[0][3][1] = c1.im;
		
		this.coefficients[1][0][0] = c4.re;
		this.coefficients[1][0][1] = c4.im;
		
		this.coefficients[1][1][0] = c5.re;
		this.coefficients[1][1][1] = c5.im;
		
		this.coefficients[1][2][0] = c5.re;
		this.coefficients[1][2][1] = c5.im;
		
		this.coefficients[1][3][0] = c6.re;
		this.coefficients[1][3][1] = c6.im;
		
		
		
		//This weirdness lets us do 3 - index to reference an inverse.
		for (let i = 0; i < 2; i++)
		{
			const ax = this.coefficients[i][0][0];
			const ay = this.coefficients[i][0][1];
			const bx = this.coefficients[i][1][0];
			const by = this.coefficients[i][1][1];
			const cx = this.coefficients[i][2][0];
			const cy = this.coefficients[i][2][1];
			const dx = this.coefficients[i][3][0];
			const dy = this.coefficients[i][3][1];
			
			this.coefficients[i + 2] = [[dx, dy], [-bx, -by], [-cx, -cy], [ax, ay]];
		}
	}
	
	
	
	draw_frame(timestamp)
	{
		const time_elapsed = timestamp - this.last_timestamp;
		
		this.last_timestamp = timestamp;
		
		if (time_elapsed === 0)
		{
			return;
		}
		
		
		
		this.bake_coefficients();
		
		for (let i = 0; i < 4; i++)
		{
			this.search_step(0, 0, i, -1, -1, 1);
		}
		
		
		
		const brightness_sorted = this.brightness.slice().sort((a, b) => a - b);
		
		const max_brightness = brightness_sorted[brightness_sorted.length - 1];
		
		
		
		for (let i = 0; i < this.image_height; i++)
		{
			for (let j = 0; j < this.image_width; j++)
			{
				const index = (4 * i * this.image_width) + (4 * j);
				
				this.image[index] = this.hue[this.image_width * i + j];
				this.image[index + 1] = 1;
				this.image[index + 2] = Math.pow(this.brightness[this.image_width * i + j] / max_brightness, .25);
				this.image[index + 3] = 1;
			}
		}
		
		this.wilson.gl.texImage2D(this.wilson.gl.TEXTURE_2D, 0, this.wilson.gl.RGBA, this.wilson.canvas_width, this.wilson.canvas_height, 0, this.wilson.gl.RGBA, this.wilson.gl.FLOAT, this.image);
		
		this.wilson.render.draw_frame();
	}
	
	
	
	search_step(start_x, start_y, last_transformation_index, last_row, last_col, depth)
	{
		if (depth === this.max_depth)
		{
			return;
		}
		
		for (let i = 3; i < 6; i++)
		{
			this.x = start_x;
			this.y = start_y;
			
			const transformation_index = (last_transformation_index + i) % 4;
			
			this.apply_transformation(transformation_index);
			
			
			
			const row = (this.image_width >= this.image_height) ? Math.floor((-this.y + this.box_size / 2) / this.box_size * this.image_height) : Math.floor((-this.y * (this.image_width / this.image_height) + this.box_size / 2) / this.box_size * this.image_height);
			
			const col = (this.image_width >= this.image_height) ? Math.floor((this.x / (this.image_width / this.image_height) + this.box_size / 2) / this.box_size * this.image_width) : Math.floor((this.x + this.box_size / 2) / this.box_size * this.image_width);
			
			
			
			if (row >= 0 && row < this.image_height && col >= 0 && col < this.image_width)
			{
				if (this.brightness[this.image_width * row + col] === this.max_pixel_brightness)
				{
					continue;
				}
				
				if (depth > 10 || this.image_size !== this.resolution_small)
				{
					this.brightness[this.image_width * row + col]++;
				}
			}
			
			
			
			this.search_step(this.x, this.y, transformation_index, row, col, depth + 1);
		}
	}
	
	
	
	apply_transformation(index)
	{
		const ax = this.coefficients[index][0][0];
		const ay = this.coefficients[index][0][1];
		const bx = this.coefficients[index][1][0];
		const by = this.coefficients[index][1][1];
		const cx = this.coefficients[index][2][0];
		const cy = this.coefficients[index][2][1];
		const dx = this.coefficients[index][3][0];
		const dy = this.coefficients[index][3][1];
		
		
		
		const num_x = ax*this.x - ay*this.y + bx;
		const num_y = ax*this.y + ay*this.x + by;
		
		const den_x = cx*this.x - cy*this.y + dx;
		const den_y = cx*this.y + cy*this.x + dy;
		
		const new_x = num_x*den_x + num_y*den_y;
		const new_y = num_y*den_x - num_x*den_y;
		
		const magnitude = den_x*den_x + den_y*den_y;
		
		this.x = new_x / magnitude;
		this.y = new_y / magnitude;
	}
	
	
	
	init_draggables()
	{
		this.wilson.draggables.add(2, 0);
		this.wilson.draggables.add(2, 0);
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_grab_draggable(active_draggable, x, y, event)
	{
		this.image_size = this.resolution_small;
		
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				this.image_width = this.image_size;
				this.image_height = Math.floor(this.image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				this.image_width = Math.floor(this.image_size * Page.Layout.aspect_ratio);
				this.image_height = this.image_size;
			}
		}
		
		else
		{
			this.image_width = this.image_size;
			this.image_height = this.image_size;
		}
		
		
		
		this.max_depth = 20;
		this.max_pixel_brightness = 10;
		
		this.wilson.change_canvas_size(this.image_width, this.image_height);
		
		this.regenerate_hue_and_brightness();
		
		
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_release_draggable(active_draggable, x, y, event)
	{
		if (DEBUG)
		{
			console.log(active_draggable, x, y);
		}
		
		
		
		this.image_size = this.resolution_large;
		
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				this.image_width = this.image_size;
				this.image_height = Math.floor(this.image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				this.image_width = Math.floor(this.image_size * Page.Layout.aspect_ratio);
				this.image_height = this.image_size;
			}
		}
		
		else
		{
			this.image_width = this.image_size;
			this.image_height = this.image_size;
		}
		
		
		
		this.max_depth = 100;
		this.max_pixel_brightness = 50;
		
		this.wilson.change_canvas_size(this.image_width, this.image_height);
		
		this.regenerate_hue_and_brightness();
		
		
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	on_drag_draggable(active_draggable, x, y, event)
	{
		for (let i = 0; i < this.image_height; i++)
		{
			for (let j = 0; j < this.image_width; j++)
			{
				this.brightness[this.image_width * i + j] = 0;
			}
		}
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	request_high_res_frame(image_size, max_depth, max_pixel_brightness, box_size = this.box_size)
	{
		return new Promise((resolve, reject) =>
		{
			this.image_size = image_size;
			this.max_depth = max_depth
			this.max_pixel_brightness = max_pixel_brightness;
			this.box_size = box_size;
			
			
			
			if (this.wilson.fullscreen.currently_fullscreen)
			{
				if (Page.Layout.aspect_ratio >= 1)
				{
					this.image_width = this.image_size;
					this.image_height = Math.floor(this.image_size / Page.Layout.aspect_ratio);
				}
				
				else
				{
					this.image_width = Math.floor(this.image_size * Page.Layout.aspect_ratio);
					this.image_height = this.image_size;
				}
			}
			
			else
			{
				this.image_width = this.image_size;
				this.image_height = this.image_size;
			}
			
			
			
			this.regenerate_hue_and_brightness();
			
			
			
			try {this.web_worker.terminate()}
			catch(ex) {}
			
			this.web_worker = new Worker(`/applets/quasi-fuchsian-groups/scripts/worker.${DEBUG ? "" : "min."}js`);
			
			this.workers.push(this.web_worker);
			
			
			
			this.web_worker.onmessage = e =>
			{
				this.brightness = e.data[0];
				
				this.wilson.change_canvas_size(this.image_width, this.image_height);
				
				for (let i = 0; i < this.image_height; i++)
				{
					for (let j = 0; j < this.image_width; j++)
					{
						const index = (4 * i * this.image_width) + (4 * j);
						
						const rgb = this.wilson.utils.hsv_to_rgb(this.hue[this.image_width * i + j], 1, this.brightness[this.image_width * i + j]); 
						
						this.image[index] = rgb[0];
						this.image[index + 1] = rgb[1];
						this.image[index + 2] = rgb[2];
						this.image[index + 3] = 255;
					}
				}
				
				this.wilson.render.draw_frame(this.image);
				
				resolve();
			};
			
			this.web_worker.postMessage([this.image_width, this.image_height, this.max_depth, this.max_pixel_brightness, this.box_size, this.coefficients]);
		});
	}
	
	
	
	regenerate_hue_and_brightness()
	{
		this.hue = new Float32Array(this.image_width * this.image_height);
		this.brightness = new Float32Array(this.image_width * this.image_height);
		this.image = new Float32Array(this.image_width * this.image_height * 4);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["texture_step"], 1 / this.image_size);
		
		for (let i = 0; i < this.image_height; i++)
		{
			for (let j = 0; j < this.image_width; j++)
			{
				this.x = (i / this.image_height * this.box_size) - this.box_size / 2;
				this.y = this.box_size / 2 - (j / this.image_width * this.box_size);
				this.hue[this.image_width * i + j] = (Math.atan2(-this.y, -this.x) + Math.PI) / (2 * Math.PI);
				
				this.brightness[this.image_width * i + j] = 0;
			}
		}
	}
	
	
	
	change_aspect_ratio()
	{
		this.image_size = this.resolution_small;
		
		if (this.wilson.fullscreen.currently_fullscreen)
		{
			if (Page.Layout.aspect_ratio >= 1)
			{
				this.image_width = this.image_size;
				this.image_height = Math.floor(this.image_size / Page.Layout.aspect_ratio);
			}
			
			else
			{
				this.image_width = Math.floor(this.image_size * Page.Layout.aspect_ratio);
				this.image_height = this.image_size;
			}
		}
		
		else
		{
			this.image_width = this.image_size;
			this.image_height = this.image_size;
		}
		
		
		
		this.wilson.change_canvas_size(this.image_width, this.image_height);
		
		this.regenerate_hue_and_brightness();
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
}