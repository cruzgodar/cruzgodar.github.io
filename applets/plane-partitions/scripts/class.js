"use strict";

class PlanePartitions extends Applet
{
	load_promise = null;
	
	wilson_numbers = null;
	
	wilson_hidden = null;
	wilson_hidden_2 = null;
	wilson_hidden_3 = null;
	wilson_hidden_4 = null;
	
	use_fullscreen_button = false;
	
	resolution = 2000;
	
	animation_time = 600;
	
	asymptote_lightness = .6;
	cube_lightness = .4;
	floor_lightness = .4;
	
	infinite_height = 100;
	
	add_walls = false;
	wall_size = 30;
	
	scene = null;
	
	orthographic_camera = null;
	
	renderer = null;
	
	loader = null;
	
	cube_texture = null;
	cube_texture_2 = null;
	floor_texture = null;
	floor_texture_2 = null;
	
	cube_geometry = null;
	floor_geometry = null;
	wall_left_geometry = null;
	wall_right_geometry = null;
	
	ambient_light = null;
	
	
	
	dimers_shown = false;
	
	ambient_light = null;
	point_light = null;
	
	rotation_y = 0;
	rotation_y_velocity = 0;
	next_rotation_y_velocity = 0;
	last_rotation_y_velocities = [];
	
	rotation_y_velocity_friction = .94;
	rotation_y_velocity_start_threshhold = .005;
	rotation_y_velocity_stop_threshhold = .0005;
	
	in_2d_view = false;
	in_exact_hex_view = true;
	
	currently_animating_camera = false;
	
	currently_running_algorithm = false;
	
	need_download = false;
	
	font_size = 10;
	
	arrays = [];
	
	total_array_footprint = 0;
	total_array_height = 0;
	total_array_size = 0;
	
	hex_view_camera_pos = [15, 15, 15];
	_2d_view_camera_pos = [0, 20, 0];
	
	algorithm_data =
	{
		hillman_grassl:
		{
			method: this.hillman_grassl,
			input_type: ["pp"]
		},
		
		hillman_grassl_inverse:
		{
			method: this.hillman_grassl_inverse,
			input_type: ["tableau"]
		},
		
		pak:
		{
			method: this.pak,
			input_type: ["pp"]
		},
		
		pak_inverse:
		{
			method: this.pak_inverse,
			input_type: ["tableau"]
		},
		
		sulzgruber:
		{
			method: this.sulzgruber,
			input_type: ["pp"]
		},
		
		sulzgruber_inverse:
		{
			method: this.sulzgruber_inverse,
			input_type: ["tableau"]
		},
		
		rsk:
		{
			method: this.rsk,
			input_type: ["ssyt", "ssyt"],
			same_shape: true
		},
		
		rsk_inverse:
		{
			method: this.rsk_inverse,
			input_type: ["tableau"]
		},
		
		godar_1:
		{
			method: this.godar_1,
			input_type: ["pp"]
		},
		
		godar_1_inverse:
		{
			method: this.godar_1_inverse,
			input_type: ["pp", "pp"]
		}
	};
	
	
	
	constructor(canvas, numbers_canvas, use_fullscreen_button = true)
	{
		super(canvas);
		
		this.use_fullscreen_button = use_fullscreen_button;
		
		
		
		const hidden_canvas = document.createElement("canvas");
		hidden_canvas.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas);
		Page.element.appendChild(hidden_canvas);
		
		const hidden_canvas_2 = document.createElement("canvas");
		hidden_canvas_2.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas_2);
		Page.element.appendChild(hidden_canvas_2);
		
		const hidden_canvas_3 = document.createElement("canvas");
		hidden_canvas_3.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas_3);
		Page.element.appendChild(hidden_canvas_3);
		
		const hidden_canvas_4 = document.createElement("canvas");
		hidden_canvas_4.classList.add("hidden-canvas");
		this.hidden_canvases.push(hidden_canvas_4);
		Page.element.appendChild(hidden_canvas_4);
		
		
		
		const options_numbers =
		{
			renderer: "cpu",
			
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			use_fullscreen: true,
			
			use_fullscreen_button: false,
			
			mousedown_callback: this.on_grab_canvas.bind(this),
			touchstart_callback: this.on_grab_canvas.bind(this),
			
			mousedrag_callback: this.on_drag_canvas.bind(this),
			touchmove_callback: this.on_drag_canvas.bind(this),
			
			mouseup_callback: this.on_release_canvas.bind(this),
			touchend_callback: this.on_release_canvas.bind(this)
		};
		
		this.wilson_numbers = new Wilson(numbers_canvas, options_numbers);
		
		this.wilson_numbers.ctx.fillStyle = "rgb(255, 255, 255)";
		
		document.body.querySelector(".wilson-fullscreen-components-container").style.setProperty("z-index", 200, "important");
		
		Page.set_element_styles(".wilson-applet-canvas-container", "background-color", "rgba(0, 0, 0, 0)", true);
		
		
		
		const options =
		{
			canvas_width: this.resolution,
			canvas_height: this.resolution,
			
			use_fullscreen: true,
			
			use_fullscreen_button: this.use_fullscreen_button,
			
			enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
			exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
			
			switch_fullscreen_callback: this.switch_fullscreen.bind(this)
		};
		
		this.wilson = new Wilson(canvas, options);
		
		
		
		const options_hidden =
		{
			renderer: "cpu",
			
			canvas_width: 64,
			canvas_height: 64
		};
		
		this.wilson_hidden = new Wilson(hidden_canvas, options_hidden);
		this.wilson_hidden_2 = new Wilson(hidden_canvas_2, options_hidden);
		this.wilson_hidden_3 = new Wilson(hidden_canvas_3, options_hidden);
		this.wilson_hidden_4 = new Wilson(hidden_canvas_4, options_hidden);
		
		this.wilson_hidden.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson_hidden.ctx._alpha = 1;
		
		this.wilson_hidden.ctx.fillStyle = "rgba(64, 64, 64, 1)"
		this.wilson_hidden.ctx.fillRect(0, 0, 64, 64);
		
		this.wilson_hidden.ctx.fillStyle = "rgba(128, 128, 128, 1)"
		this.wilson_hidden.ctx.fillRect(4, 4, 56, 56);
		
		this.wilson_hidden.ctx.lineWidth = 6;
		
		
		
		this.wilson_hidden_2.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson_hidden_2.ctx._alpha = 1;
		
		this.wilson_hidden_2.ctx.fillStyle = "rgba(64, 64, 64, 1)"
		this.wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
		
		this.wilson_hidden_2.ctx.fillStyle = "rgba(128, 128, 128, 1)"
		this.wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
		
		this.wilson_hidden_2.ctx.lineWidth = 6;
		
		
		
		this.wilson_hidden_3.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson_hidden_3.ctx._alpha = 1;
		
		this.wilson_hidden_3.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : 1})`;
		this.wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
		
		this.wilson_hidden_3.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : 1})`;
		this.wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
		
		this.wilson_hidden_3.ctx.lineWidth = 6;
		
		
		
		this.wilson_hidden_4.ctx.strokeStyle = "rgb(255, 255, 255)";
		this.wilson_hidden_4.ctx._alpha = 1;
		
		this.wilson_hidden_4.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : 1})`;
		this.wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
		
		this.wilson_hidden_4.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : 1})`;
		this.wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
		
		this.wilson_hidden_4.ctx.lineWidth = 6;
		
		
		
		this.load_promise = new Promise(async (resolve, reject) =>
		{
			if (!Site.scripts_loaded["three"])
			{
				await Site.load_script("/scripts/three.min.js")
				
				Site.scripts_loaded["three"] = true;
			}
			
			if (!Site.scripts_loaded["lodash"])
			{
				await Site.load_script("/scripts/lodash.min.js");
				
				Site.scripts_loaded["lodash"] = true;
			}
			
			this.scene = new THREE.Scene();
			this.scene.background = new THREE.Color(0x000000);
			
			this.orthographic_camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);
			
			
			
			this.renderer = new THREE.WebGLRenderer({canvas: this.wilson.canvas, antialias: true});
			
			this.renderer.setSize(this.resolution, this.resolution, false);
			
			
			
			this.loader = new THREE.TextureLoader();
			
			this.cube_texture = new THREE.CanvasTexture(this.wilson_hidden.canvas);
			this.cube_texture.minFilter = THREE.LinearFilter;
			this.cube_texture.magFilter = THREE.NearestFilter;
			
			this.cube_texture_2 = new THREE.CanvasTexture(this.wilson_hidden_2.canvas);
			this.cube_texture_2.minFilter = THREE.LinearFilter;
			this.cube_texture_2.magFilter = THREE.NearestFilter;
			
			this.floor_texture = new THREE.CanvasTexture(this.wilson_hidden_3.canvas);
			this.floor_texture.minFilter = THREE.LinearFilter;
			this.floor_texture.magFilter = THREE.NearestFilter;
			
			this.floor_texture_2 = new THREE.CanvasTexture(this.wilson_hidden_4.canvas);
			this.floor_texture_2.minFilter = THREE.LinearFilter;
			this.floor_texture_2.magFilter = THREE.NearestFilter;
			
			this.cube_geometry = new THREE.BoxGeometry();
			
			
			
			this.dimers_shown = false;
			
			
			
			this.floor_geometry = new THREE.BoxGeometry(1, .001, 1);
			this.wall_left_geometry = new THREE.BoxGeometry(.001, 1, 1);
			this.wall_right_geometry = new THREE.BoxGeometry(1, 1, .001);
			
			
			this.ambient_light = new THREE.AmbientLight(0xffffff, .2);
			this.scene.add(this.ambient_light);
			
			this.point_light = new THREE.PointLight(0xffffff, 3, 10000);
			this.point_light.position.set(750, 1000, 500);
			this.scene.add(this.point_light);
			
			this.draw_frame();
			
			resolve();
		});
	}
	
	
	
	on_grab_canvas(x, y, event)
	{
		this.in_exact_hex_view = false;
		
		this.rotation_y_velocity = 0;
		
		this.last_rotation_y_velocities = [0, 0, 0, 0];
	}
	
	on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (this.in_2d_view)
		{
			return;
		}
		
		this.rotation_y += x_delta;
		
		if (this.rotation_y > Math.PI)
		{
			this.rotation_y -= 2 * Math.PI;
		}
		
		else if (this.rotation_y < -Math.PI)
		{
			this.rotation_y += 2 * Math.PI;
		}
		
		this.scene.children.forEach(object => object.rotation.y = this.rotation_y);
		
		this.next_rotation_y_velocity = x_delta;
	}
	
	on_release_canvas(x, y, event)
	{
		if (!this.in_2d_view)
		{
			let max_index = 0;
			
			this.last_rotation_y_velocities.forEach((velocity, index) =>
			{
				if (Math.abs(velocity) > this.rotation_y_velocity)
				{
					this.rotation_y_velocity = Math.abs(velocity);
					max_index = index;
				}	
			});
			
			if (this.rotation_y_velocity < this.rotation_y_velocity_start_threshhold)
			{
				this.rotation_y_velocity = 0;
				return;
			}
			
			this.rotation_y_velocity = this.last_rotation_y_velocities[max_index];
		}
		
		this.last_rotation_y_velocities = [0, 0, 0, 0];
	}
	
	
	
	draw_frame()
	{
		this.renderer.render(this.scene, this.orthographic_camera);
		
		
		
		this.last_rotation_y_velocities.push(this.next_rotation_y_velocity);
		this.last_rotation_y_velocities.shift();
		
		this.next_rotation_y_velocity = 0;
		
		if (this.rotation_y_velocity !== 0)
		{
			this.rotation_y += this.rotation_y_velocity;
			
			this.scene.children.forEach(object => object.rotation.y = this.rotation_y);
			
			this.rotation_y_velocity *= this.rotation_y_velocity_friction;
			
			if (Math.abs(this.rotation_y_velocity) < this.rotation_y_velocity_stop_threshhold)
			{
				this.rotation_y_velocity = 0;
			}
		}
		
		
		
		if (this.rotation_y > Math.PI)
		{
			this.rotation_y -= 2 * Math.PI;
		}
		
		else if (this.rotation_y < -Math.PI)
		{
			this.rotation_y += 2 * Math.PI;
		}
		
		
		
		if (this.need_download)
		{
			this.need_download = false;
			
			this.wilson.canvas.toBlob(blob => 
			{
				const link = document.createElement("a");
				
				link.download = "a-plane-partition.png";
				
				link.href = window.URL.createObjectURL(blob);
				
				link.click();
				
				link.remove();
			});
		}
		
		
		
		window.requestAnimationFrame(this.draw_frame.bind(this));
	}
	
	
	
	switch_fullscreen()
	{
		if (this.use_fullscreen_button)
		{
			//Needs to be document.body because that's where Wilson puts this stuff.
			try {document.body.querySelector(".wilson-exit-fullscreen-button").style.setProperty("z-index", "300", "important")}
			catch(ex) {}
		}
		
		if (!this.in_2d_view)
		{
			this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
		}
		
		this.wilson_numbers.fullscreen.switch_fullscreen();	
	}
	
	
	
	generate_random_plane_partition()
	{
		const side_length = Math.floor(Math.random() * 3) + 5;
		
		const max_entry = Math.floor(Math.random() * 5) + 10;
		
		let plane_partition = new Array(side_length);
		
		
		
		for (let i = 0; i < side_length; i++)
		{
			plane_partition[i] = new Array(side_length);
		}
		
		plane_partition[0][0] = max_entry;
		
		for (let j = 1; j < side_length; j++)
		{
			plane_partition[0][j] = Math.max(plane_partition[0][j - 1] - Math.floor(Math.random() * 4), 0);
		}
		
		for (let i = 1; i < side_length; i++)
		{
			plane_partition[i][0] = Math.max(plane_partition[i - 1][0] - Math.floor(Math.random() * 4), 0);
			
			for (let j = 1; j < side_length; j++)
			{
				plane_partition[i][j] = Math.max(Math.min(plane_partition[i][j - 1], plane_partition[i - 1][j]) - Math.floor(Math.random() * 4), 0);
			}
		}
		
		for (let i = 0; i < side_length; i++)
		{
			plane_partition[side_length - 1][i] = 0;
			plane_partition[i][side_length - 1] = 0;
		}
		
		
		return plane_partition;
	}
	
	
	
	//Does not return a string, unlike the previous function.
	generate_random_tableau()
	{
		const side_length = Math.floor(Math.random() * 3) + 5;
		
		let tableau = new Array(side_length);
		
		
		
		for (let i = 0; i < side_length; i++)
		{
			tableau[i] = new Array(side_length);
			
			for (let j = 0; j < side_length; j++)
			{
				if (Math.random() < .75 / side_length)
				{
					tableau[i][j] = Math.floor(Math.random() * 3) + 1;
				}
				
				else
				{
					tableau[i][j] = 0;
				}
			}
		}
		
		for (let i = 0; i < side_length; i++)
		{
			tableau[i][side_length - 1] = 0;
			tableau[side_length - 1][i] = 0;
		}
		
		return tableau;
	}
	
	
	
	//Also doesn't return a string.
	generate_random_ssyt()
	{
		const side_length = Math.floor(Math.random() * 3) + 2;
		
		let ssyt = new Array(side_length);
		
		
		
		for (let i = 0; i < side_length; i++)
		{
			ssyt[i] = new Array(side_length);
		}
		
		ssyt[0][0] = Math.floor(Math.random() * 2);
		
		for (let j = 1; j < side_length; j++)
		{
			ssyt[0][j] = ssyt[0][j - 1] + Math.floor(Math.random() * 2);
		}
		
		for (let i = 1; i < side_length; i++)
		{
			ssyt[i][0] = ssyt[i - 1][0] + 1 + Math.floor(Math.random() * 2);
			
			for (let j = 1; j < side_length; j++)
			{
				ssyt[i][j] = Math.max(ssyt[i][j - 1], ssyt[i - 1][j] + 1) + Math.floor(Math.random() * 2);
			}
		}
		
		
		
		return ssyt;
	}
	
	
	
	//Turns a block of numbers into an array.
	parse_array(data)
	{
		const split_data = data.split("\n");
		
		let num_rows = split_data.length;
		
		let split_rows = new Array(split_data.length);
		
		for (let i = 0; i < split_rows.length; i++)
		{
			split_rows[i] = split_data[i].split(" ");
			
			for (let j = 0; j < split_rows[i].length; j++)
			{
				if (split_rows[i][j] === "")
				{
					split_rows[i].splice(j, 1);
					j--;
				}
			}
		}
		
		let num_cols = split_rows[0].length;
		
		
		
		if (data.indexOf(">") === -1)
		{
			for (let i = 0; i < split_rows.length; i++)
			{
				split_rows[i].push("0");
			}
			
			num_cols++;
		}
		
		if (data.indexOf("v") === -1)
		{
			split_rows.push(["0"]);
			
			num_rows++;
		}
		
		let size = Math.max(num_rows, num_cols);
		
		let array = new Array(size);
		
		
		
		
		
		for (let i = 0; i < num_rows; i++)
		{
			array[i] = new Array(size);
			
			for (let j = 0; j < split_rows[i].length; j++)
			{
				//A vertically upward leg.
				if (split_rows[i][j] === "^")
				{
					array[i][j] = Infinity;
				}
				
				//A leg pointing right or down.
				else if (split_rows[i][j] === ">")
				{
					array[i][j] = array[i][j - 1];
				}
				
				else if (split_rows[i][j] === "v")
				{
					array[i][j] = array[i - 1][j];
				}
				
				else
				{
					array[i][j] = parseInt(split_rows[i][j]);
				}
			}
			
			for (let j = split_rows[i].length; j < size; j++)
			{
				array[i][j] = 0;
			}
		}
		
		for (let i = num_rows; i < size; i++)
		{
			array[i] = new Array(size);
				
			for (let j = 0; j < size; j++)
			{
				array[i][j] = 0;
			}
		}
		
		
		
		return array;
	}
	
	
	
	array_to_ascii(numbers)
	{
		let num_characters = 1;
		
		for (let i = 0; i < numbers.length; i++)
		{
			for (let j = 0; j < numbers.length; j++)
			{
				if (numbers[i][j] !== Infinity)
				{
					num_characters = Math.max(num_characters, `${numbers[i][j]}`.length);
				}
			}	
		}
		
		num_characters++;
		
		
		
		let text = "";
		
		for (let i = 0; i < numbers.length - 1; i++)
		{
			for (let j = 0; j < numbers.length - 1; j++)
			{
				if (numbers[i][j] === Infinity)
				{
					for (let k = 0; k < num_characters - 1 - (j === 0); k++)
					{
						text += " ";
					}
					
					text += "^";
				}
				
				else
				{
					let len = `${numbers[i][j]}`.length;
					
					for (let k = 0; k < num_characters - len - (j === 0); k++)
					{
						text += " ";
					}
					
					text += numbers[i][j];
				}
			}
			
			
			
			if (numbers[i][numbers.length - 1] !== 0)
			{
				for (let k = 0; k < num_characters - 1; k++)
				{
					text += " ";
				}
				
				text += ">";
			}
			
			
			
			if (i !== numbers.length - 2)
			{
				text += "\n";
			}
		}
		
		
		
		if (numbers[numbers.length - 1][0] !== 0)
		{
			text += "\n";
			
			for (let j = 0; j < numbers.length - 1; j++)
			{
				if (numbers[numbers.length - 1][j] !== 0)
				{
					for (let k = 0; k < num_characters - 1 - (j === 0); k++)
					{
						text += " ";
					}
					
					text += "v";
				}
			}
		}
		
		
		
		return text;
	}
	
	
	
	verify_pp(plane_partition)
	{
		for (let i = 0; i < plane_partition.length - 1; i++)
		{
			for (let j = 0; j < plane_partition[i].length - 1; j++)
			{
				if (plane_partition[i][j] < plane_partition[i + 1][j] || plane_partition[i][j] < plane_partition[i][j + 1])
				{
					return false;
				}
			}
		}
		
		return true;
	}
	
	
	
	verify_ssyt(ssyt)
	{
		for (let i = 0; i < ssyt.length - 1; i++)
		{
			for (let j = 0; j < ssyt[i].length - 1; j++)
			{
				if ((ssyt[i + 1][j] !== 0 && ssyt[i][j] >= ssyt[i + 1][j]) || (ssyt[i][j + 1] !== 0 && ssyt[i][j] > ssyt[i][j + 1]))
				{
					return false;
				}
			}
		}
		
		return true;
	}
	
	
	
	display_error(message)
	{
		
	}
	
	
	
	add_new_array(index, numbers, keep_numbers_canvas_visible = false, horizontal_legs = true)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating)
			{
				resolve();
				return;
			}
			
			
			
			let array = {
				numbers: numbers,
				cubes: [],
				floor: [],
				left_wall: [],
				right_wall: [],
				
				cube_group: null,
				
				center_offset: 0,
				partial_footprint_sum: 0,
				
				footprint: 0,
				height: 0,
				size: 0
			};
			
			if (this.in_2d_view && !keep_numbers_canvas_visible)
			{
				await Page.Animate.change_opacity(this.wilson_numbers.canvas, 0, this.animation_time / 5);
			}
			
			
			
			this.arrays.splice(index, 0, array);
			
			array.footprint = array.numbers.length;
			
			//Update the other arrays.
			for (let i = index; i < this.arrays.length; i++)
			{
				this.arrays[i].partial_footprint_sum = this.arrays[i].footprint;
				
				if (i !== 0)
				{
					this.arrays[i].center_offset = this.arrays[i - 1].center_offset + this.arrays[i - 1].footprint / 2 + this.arrays[i].footprint / 2 + 1;
					
					this.arrays[i].partial_footprint_sum += this.arrays[i - 1].partial_footprint_sum + 1;
				}
				
				else
				{
					this.arrays[i].center_offset = 0;
				}
				
				if (i !== index)
				{
					if (this.in_2d_view)
					{
						anime({
							targets: this.arrays[i].cube_group.position,
							x: this.arrays[i].center_offset,
							y: 0,
							z: 0,
							duration: this.animation_time,
							easing: "easeInOutQuad"
						});
					}
					
					else
					{
						anime({
							targets: this.arrays[i].cube_group.position,
							x: this.arrays[i].center_offset,
							y: 0,
							z: -this.arrays[i].center_offset,
							duration: this.animation_time,
							easing: "easeInOutQuad"
						});
					}
				}
			}
			
			
			
			array.cube_group = new THREE.Object3D();
			this.scene.add(array.cube_group);
			
			if (!this.add_walls)
			{
				if (this.in_2d_view)
				{
					array.cube_group.position.set(array.center_offset, 0, 0);
				}
				
				else
				{
					array.cube_group.position.set(array.center_offset, 0, -array.center_offset);
				}
			}
			
			array.cube_group.rotation.y = this.rotation_y;
			
			
			
			array.cubes = new Array(array.footprint);
			array.floor = new Array(array.footprint);
			
			for (let i = 0; i < array.footprint; i++)
			{
				array.cubes[i] = new Array(array.footprint);
				array.floor[i] = new Array(array.footprint);
				
				for (let j = 0; j < array.footprint; j++)
				{
					if (array.numbers[i][j] !== Infinity)
					{
						array.cubes[i][j] = new Array(array.numbers[i][j]);
						
						if (array.numbers[i][j] > array.height)
						{
							array.height = array.numbers[i][j];
						}
						
						array.floor[i][j] = this.add_floor(array, j, i);
						
						
						
						if (horizontal_legs)
						{
							const leg_height = Math.max(array.numbers[i][array.footprint - 1], array.numbers[array.footprint - 1][j]);
							
							for (let k = 0; k < leg_height; k++)
							{
								array.cubes[i][j][k] = this.add_cube(array, j, k, i, 0, 0, this.asymptote_lightness);
							}
							
							for (let k = leg_height; k < array.numbers[i][j]; k++)
							{
								array.cubes[i][j][k] = this.add_cube(array, j, k, i);
							}
						}
						
						else
						{
							for (let k = 0; k < array.numbers[i][j]; k++)
							{
								array.cubes[i][j][k] = this.add_cube(array, j, k, i);
							}
						}
					}
					
					
					else
					{
						array.cubes[i][j] = new Array(this.infinite_height);
						
						array.floor[i][j] = this.add_floor(array, j, i);
						
						for (let k = 0; k < this.infinite_height; k++)
						{
							array.cubes[i][j][k] = this.add_cube(array, j, k, i, 0, 0, this.asymptote_lightness);
						}
					}	
				}
			}
			
			
			
			//Add walls. Disabled by default.
			if (this.add_walls)
			{
				array.left_wall = new Array(this.wall_size);
				array.right_wall = new Array(this.wall_size);
				
				for (let i = 0; i < this.wall_size; i++)
				{
					array.left_wall[i] = new Array(2 * this.wall_size);
					array.right_wall[i] = new Array(2 * this.wall_size);
				}
				
				for (let i = 0; i < this.wall_size; i++)
				{
					for (let j = 0; j < 2 * this.wall_size; j++)
					{
						array.left_wall[i][j] = this.add_left_wall(array, j, i);
						array.right_wall[i][j] = this.add_right_wall(array, i, j);
					}
				}
			}
			
			
			array.size = Math.max(array.footprint, array.height);
			
			this.total_array_footprint += array.footprint + 1;
			this.total_array_height = Math.max(this.total_array_height, array.height);
			this.total_array_size = Math.max(this.total_array_footprint, this.total_array_height);
			
			
			
			if (this.arrays.length === 1 && !keep_numbers_canvas_visible)
			{
				this.hex_view_camera_pos = [this.total_array_size, this.total_array_size + this.total_array_height / 3, this.total_array_size];
				this._2d_view_camera_pos = [0, this.total_array_size + 10, 0];
				
				if (this.in_2d_view && !keep_numbers_canvas_visible)
				{
					this.update_camera_height(true);
				}
				
				else
				{
					this.orthographic_camera.left = -this.total_array_size;
					this.orthographic_camera.right = this.total_array_size;
					this.orthographic_camera.top = this.total_array_size;
					this.orthographic_camera.bottom = -this.total_array_size;
					this.orthographic_camera.position.set(this.hex_view_camera_pos[0], this.hex_view_camera_pos[1], this.hex_view_camera_pos[2]);
					this.orthographic_camera.rotation.set(-0.785398163, 0.615479709, 0.523598775);
					this.orthographic_camera.updateProjectionMatrix();
				}
			}
			
			else if (!this.add_walls && !keep_numbers_canvas_visible)
			{
				this.update_camera_height(true);
			}
			
			
			
			if (index !== this.arrays.length - 1)
			{
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			}
			
			
			
			let things_to_animate = [];
			
			array.cube_group.traverse(node =>
			{
				if (node.material)
				{
					node.material.forEach(material => things_to_animate.push(material));
				}
			});
			
			await new Promise(async (resolve, reject) =>
			{
				anime({
					targets: things_to_animate,
					opacity: 1,
					duration: this.animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve
				});
			});
			
			
			
			if (this.in_2d_view && !keep_numbers_canvas_visible)
			{
				this.draw_all_2d_view_text();
			}
			
			resolve(array);
		});	
	}
	
	
	
	edit_array(index, numbers)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.display_error(`No array at index ${index}`);
				
				return;
			}
			
			await this.remove_array(index);
			
			await this.add_new_array(index, numbers);
			
			if (!this.in_2d_view)
			{
				this.update_camera_height();
			}	
			
			resolve();
		});	
	}
	
	
	//Resizes the array into the minimum possible square.
	trim_array(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.display_error(`No array at index ${index}`);
				
				return;
			}
			
			let array = arrays[index];
			
			let numbers = array.numbers;
			
			
			
			let min_size = 0;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== 0)
					{
						min_size = Math.max(min_size, Math.max(i + 1, j + 1));
					}
				}
			}
			
			
			
			let new_numbers = new Array(min_size);
			
			for (let i = 0; i < min_size; i++)
			{
				new_numbers[i] = new Array(min_size);
				
				for (let j = 0; j < min_size; j++)
				{
					new_numbers[i][j] = numbers[i][j];
				}
			}
			
			
			
			await this.remove_array(index);
			
			await this.add_new_array(index, new_numbers);
			
			if (!this.in_2d_view)
			{
				this.update_camera_height();
			}	
			
			resolve();
		});	
	}
	
	
	
	remove_array(index, keep_numbers_canvas_visible = false)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating)
			{
				resolve();
				return;
			}
			
			
			
			if (index >= this.arrays.length || index < 0)
			{
				this.display_error(`No array at index ${index}`);
				
				return;
			}
			
			
			
			if (this.in_2d_view && !keep_numbers_canvas_visible)
			{
				await Page.Animate.change_opacity(this.wilson_numbers.canvas, 0, this.animation_time / 5);
			}
			
			
			
			await new Promise((resolve, reject) =>
			{
				let things_to_animate = [];
				
				this.arrays[index].cube_group.traverse(node =>
				{
					if (node.material)
					{
						node.material.forEach(material => things_to_animate.push(material));
					}
				});
				
				anime({
					targets: things_to_animate,
					opacity: 0,
					duration: this.animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve
				});
			});
			
			
			
			//Dispose of all the materials.
			for (let i = 0; i < this.arrays[index].cubes.length; i++)
			{
				for (let j = 0; j < this.arrays[index].cubes[i].length; j++)
				{
					if (this.arrays[index].cubes[i][j])
					{
						for (let k = 0; k < this.arrays[index].cubes[i][j].length; k++)
						{
							if (this.arrays[index].cubes[i][j][k])
							{
								this.arrays[index].cubes[i][j][k].material.forEach(material => material.dispose());
							}	
						}
					}	
				}
			}
			
			this.scene.remove(this.arrays[index].cube_group);
			
			this.total_array_footprint -= this.arrays[index].footprint + 1;
			
			this.arrays.splice(index, 1);
			
			
			
			//Update the other arrays.
			for (let i = index; i < this.arrays.length; i++)
			{
				this.arrays[i].partial_footprint_sum = this.arrays[i].footprint;
				
				if (i !== 0)
				{
					this.arrays[i].center_offset = this.arrays[i - 1].center_offset + this.arrays[i - 1].footprint / 2 + this.arrays[i].footprint / 2 + 1;
					
					this.arrays[i].partial_footprint_sum += this.arrays[i - 1].partial_footprint_sum + 1;
				}
				
				else
				{
					this.arrays[i].center_offset = 0;
				}
				
				if (this.in_2d_view)
				{
					anime({
						targets: this.arrays[i].cube_group.position,
						x: this.arrays[i].center_offset,
						y: 0,
						z: 0,
						duration: this.animation_time,
						easing: "easeInOutQuad"
					});
				}
				
				else
				{
					anime({
						targets: this.arrays[i].cube_group.position,
						x: this.arrays[i].center_offset,
						y: 0,
						z: -this.arrays[i].center_offset,
						duration: this.animation_time,
						easing: "easeInOutQuad"
					});
				}
			}
			
			
			if (this.arrays.length !== 0 && !keep_numbers_canvas_visible)
			{
				this.update_camera_height(true);
			}	
			
			resolve();
		});	
	}
	
	
	
	add_cube(array, x, y, z, h = 0, s = 0, v = this.cube_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cube_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.cube_texture_2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const cube = new THREE.Mesh(this.cube_geometry, materials);
		
		array.cube_group.add(cube);
		
		if (this.add_walls)
		{
			cube.position.set(x, y, z);
		}
		
		else
		{
			cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}	
		
		return cube;
	}
	
	
	
	add_floor(array, x, z, h = 0, s = 0, v = this.floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const floor = new THREE.Mesh(this.floor_geometry, materials);
		
		array.cube_group.add(floor);
		
		//This aligns the thing correctly.
		if (this.add_walls)
		{
			floor.position.set(x, -.5 - .0005, z);
		}
		
		else
		{
			floor.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		}
		
		return floor;
	}
	
	
	
	add_left_wall(array, y, z, h = 0, s = 0, v = this.floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(this.wall_left_geometry, materials);
		
		array.cube_group.add(wall);
		
		//This aligns the thing correctly.
		if (this.add_walls)
		{
			wall.position.set(-.5 - .0005, y - this.wall_size, z);
		}
		
		else
		{
			wall.position.set(-.5 - .0005 - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}
		
		return wall;
	}
	
	
	
	add_right_wall(array, x, y, h = 0, s = 0, v = this.floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: this.floor_texture_2, transparent: true, opacity: 0})
		];
	
		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(this.wall_right_geometry, materials);
		
		array.cube_group.add(wall);
		
		//This aligns the thing correctly.
		if (this.add_walls)
		{
			wall.position.set(x, y - this.wall_size, -.5 - .0005);
		}
		
		else
		{
			wall.position.set(x - (array.footprint - 1) / 2, y, -.5 - .0005 - (array.footprint - 1) / 2);
		}	
		
		return wall;
	}
	
	
	
	show_hex_view()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating_camera)
			{
				resolve();
				return;
			}
			
			
			
			this.currently_animating_camera = true;
			
			if (this.in_2d_view)
			{
				await Page.Animate.change_opacity(this.wilson_numbers.canvas, 0, this.animation_time / 5);
			}
			
			this.in_2d_view = false;
			this.in_exact_hex_view = true;
			
			this.rotation_y_velocity = 0;
			
			this.last_rotation_y_velocities = [0, 0, 0, 0];
			
			
			
			this.update_camera_height(true);
			
			anime({
				targets: this.orthographic_camera.rotation,
				x: -0.785398163,
				y: 0.615479709,
				z: 0.523598775,
				duration: this.animation_time,
				easing: "easeInOutQuad",
				complete: () =>
				{
					this.currently_animating_camera = false;
					resolve();
				}	
			});
			
			this.arrays.forEach(array =>
			{
				anime({
					targets: array.cube_group.rotation,
					y: 0,
					duration: this.animation_time,
					easing: "easeInOutQuad"
				});
				
				anime({
					targets: array.cube_group.position,
					x: array.center_offset,
					y: 0,
					z: -array.center_offset,
					duration: this.animation_time,
					easing: "easeInOutQuad"
				});
			});
			
			this.rotation_y = 0;
		});	
	}
	
	show_2d_view()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating_camera || this.in_2d_view)
			{
				resolve();
				return;
			}
			
			
			if (this.dimers_shown)
			{
				await this.hide_dimers();
			}
			
			
			
			this.currently_animating_camera = true;
			
			this.in_2d_view = true;
			this.in_exact_hex_view = false;
			
			this.rotation_y_velocity = 0;
			
			this.last_rotation_y_velocities = [0, 0, 0, 0];
			
			
			
			this.update_camera_height(true);
			
			anime({
				targets: this.orthographic_camera.rotation,
				x: -1.570796327,
				y: 0,
				z: 0,
				duration: this.animation_time,
				easing: "easeInOutQuad"
			});
			
			this.arrays.forEach(array =>
			{
				anime({
					targets: array.cube_group.rotation,
					y: 0,
					duration: this.animation_time,
					easing: "easeInOutQuad"
				});
				
				anime({
					targets: array.cube_group.position,
					x: array.center_offset,
					y: 0,
					z: 0,
					duration: this.animation_time,
					easing: "easeInOutQuad"
				});
			});
			
			
			
			setTimeout(() =>
			{
				this.draw_all_2d_view_text();
				
				Page.Animate.change_opacity(this.wilson_numbers.canvas, 1, this.animation_time / 5)
				
				.then(() =>
				{
					this.currently_animating_camera = false;
					
					this.rotation_y = 0;
					
					resolve();
				});
			}, this.animation_time);
		});	
	}
	
	
	
	//Makes sure everything is in frame but doesn't affect rotation.
	update_camera_height(force = false)
	{
		if (!force)
		{
			if (this.currently_animating_camera)
			{
				return;
			}
			
			this.currently_animating_camera = true;
		}	
		
		
		
		this.total_array_height = 0;
		
		for (let i = 0; i < this.arrays.length; i++)
		{
			this.total_array_height = Math.max(this.total_array_height, this.arrays[i].height);
		}
		
		this.total_array_size = Math.max(this.total_array_footprint, this.total_array_height);
		
		
		
		let hex_view_camera_offset = (-this.arrays[0].footprint / 2 + this.arrays[this.arrays.length - 1].center_offset + this.arrays[this.arrays.length - 1].footprint / 2) / 2;
		
		this.hex_view_camera_pos = [this.total_array_size + hex_view_camera_offset, this.total_array_size + this.total_array_height / 3, this.total_array_size - hex_view_camera_offset];
		
		if (this.add_walls)
		{
			this.hex_view_camera_pos[0] += 10;
			this.hex_view_camera_pos[1] += 10;
			this.hex_view_camera_pos[2] += 10;
		}
		
		this._2d_view_camera_pos = [hex_view_camera_offset, this.total_array_size + 10, 0];	
		
		if (this.in_2d_view)
		{
			anime({
				targets: this.orthographic_camera.position,
				x: this._2d_view_camera_pos[0],
				y: this._2d_view_camera_pos[1],
				z: this._2d_view_camera_pos[2],
				duration: this.animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: this.orthographic_camera,
				left: -(this.total_array_footprint / 2 + .5),
				right: this.total_array_footprint / 2 + .5,
				top: this.total_array_footprint / 2 + .5,
				bottom: -(this.total_array_footprint / 2 + .5),
				duration: this.animation_time,
				easing: "easeInOutQuad",
				update: () => this.orthographic_camera.updateProjectionMatrix(),
				complete: () =>
				{
					this.orthographic_camera.updateProjectionMatrix();
					this.currently_animating_camera = false;
				}
			});
			
			setTimeout(() =>
			{
				this.draw_all_2d_view_text();
				
				Page.Animate.change_opacity(this.wilson_numbers.canvas, 1, this.animation_time / 5);
			}, this.animation_time);
		}
		
		else
		{
			anime({
				targets: this.orthographic_camera.position,
				x: this.hex_view_camera_pos[0],
				y: this.hex_view_camera_pos[1],
				z: this.hex_view_camera_pos[2],
				duration: this.animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: this.orthographic_camera,
				left: -this.total_array_size,
				right: this.total_array_size,
				top: this.total_array_size,
				bottom: -this.total_array_size,
				duration: this.animation_time,
				easing: "easeInOutQuad",
				update: () => this.orthographic_camera.updateProjectionMatrix(),
				complete: () =>
				{
					this.orthographic_camera.updateProjectionMatrix();
					this.currently_animating_camera = false;
				}
			});
		}	
	}
	
	
	
	show_dimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating_camera)
			{
				resolve();
				return;
			}
			
			this.dimers_shown = true;
			
			
			
			if (!this.in_exact_hex_view)
			{
				await this.show_hex_view();
			}	
			
			this.currently_animating_camera = true;
			
			
			
			let targets = [];
			
			//Hide everything not visible by the camera.
			this.arrays.forEach(array =>
			{
				for (let i = 0; i < array.footprint; i++)
				{
					for (let j = 0; j < array.footprint; j++)
					{
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							//Remove the top face.
							if (k < array.cubes[i][j].length - 1)
							{
								targets.push(array.cubes[i][j][k].material[2]);
							}
							
							//The left face.
							if (i < array.footprint - 1 && array.cubes[i + 1][j].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[4]);
							}
							
							//The right face.
							if (j < array.footprint - 1 && array.cubes[i][j + 1].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[0]);
							}
							
							targets.push(array.cubes[i][j][k].material[1]);
							targets.push(array.cubes[i][j][k].material[3]);
							targets.push(array.cubes[i][j][k].material[5]);
						}
						
						if (array.cubes[i][j].length !== 0)
						{
							targets.push(array.floor[i][j].material[2]);
						}
					}
				}
				
				
				
				if (this.add_walls)
				{
					for (let i = 0; i < this.wall_size; i++)
					{
						for (let j = 0; j < 2 * this.wall_size; j++)
						{
							targets.push(array.right_wall[i][j].material[0]);
							targets.push(array.left_wall[i][j].material[4]);
						}
					}
				}
			});
			
			targets.forEach(material => material.opacity = 0);
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [this.wilson_hidden.ctx, this.wilson_hidden_2.ctx, this.wilson_hidden_3.ctx, this.wilson_hidden_4.ctx],
					strokeStyle: "rgba(255, 255, 255, 1)",
					_alpha: 0,
					duration: this.animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						this.wilson_hidden.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilson_hidden.ctx._alpha})`;
						this.wilson_hidden.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilson_hidden.ctx._alpha})`;
						this.wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden.ctx.moveTo(42.7, 21.3);
						this.wilson_hidden.ctx.lineTo(21.3, 42.7);
						this.wilson_hidden.ctx.stroke();
						
						this.cube_texture.needsUpdate = true;
						
						
						
						this.wilson_hidden_2.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_2.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilson_hidden_2.ctx._alpha})`;
						this.wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_2.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilson_hidden_2.ctx._alpha})`;
						this.wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						this.wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						this.wilson_hidden_2.ctx.stroke();
						
						this.cube_texture_2.needsUpdate = true;
						
						
						
						this.wilson_hidden_3.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_3.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : this.wilson_hidden_3.ctx._alpha})`;
						this.wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_3.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : this.wilson_hidden_3.ctx._alpha})`;
						this.wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_3.ctx.moveTo(42.7, 21.3);
						this.wilson_hidden_3.ctx.lineTo(21.3, 42.7);
						this.wilson_hidden_3.ctx.stroke();
						
						this.floor_texture.needsUpdate = true;
						
						
						
						this.wilson_hidden_4.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_4.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : this.wilson_hidden_4.ctx._alpha})`;
						this.wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_4.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : this.wilson_hidden_4.ctx._alpha})`;
						this.wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_4.ctx.moveTo(21.3, 21.3);
						this.wilson_hidden_4.ctx.lineTo(42.7, 42.7);
						this.wilson_hidden_4.ctx.stroke();
						
						this.floor_texture_2.needsUpdate = true;
					}
				});
			});
			
			this.currently_animating_camera = false;
			
			resolve();
		});	
	}
	
	
	
	hide_dimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (this.currently_animating_camera)
			{
				resolve();
				return;
			}
			
			this.dimers_shown = false;
			
			
			
			let targets = [];
			
			//Show everything not visible by the camera.
			this.arrays.forEach(array =>
			{
				for (let i = 0; i < array.footprint; i++)
				{
					for (let j = 0; j < array.footprint; j++)
					{
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							//Remove the top face.
							if (k < array.cubes[i][j].length - 1)
							{
								targets.push(array.cubes[i][j][k].material[2]);
							}
							
							//The left face.
							if (i < array.footprint - 1 && array.cubes[i + 1][j].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[4]);
							}
							
							//The right face.
							if (j < array.footprint - 1 && array.cubes[i][j + 1].length >= k + 1)
							{
								targets.push(array.cubes[i][j][k].material[0]);
							}
							
							targets.push(array.cubes[i][j][k].material[1]);
							targets.push(array.cubes[i][j][k].material[3]);
							targets.push(array.cubes[i][j][k].material[5]);
						}
						
						if (array.cubes[i][j].length !== 0)
						{
							targets.push(array.floor[i][j].material[2]);
						}
					}
				}
				
				
				
				if (this.add_walls)
				{
					for (let i = 0; i < this.wall_size; i++)
					{
						for (let j = 0; j < 2 * this.wall_size; j++)
						{
							targets.push(array.left_wall[i][j].material[0]);
							targets.push(array.right_wall[i][j].material[4]);
						}
					}
				}
			});
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [this.wilson_hidden.ctx, this.wilson_hidden_2.ctx, this.wilson_hidden_3.ctx, this.wilson_hidden_4.ctx],
					strokeStyle: "rgba(255, 255, 255, 0)",
					_alpha: 1,
					duration: this.animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						this.wilson_hidden.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilson_hidden.ctx._alpha})`;
						this.wilson_hidden.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilson_hidden.ctx._alpha})`;
						this.wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden.ctx.moveTo(42.7, 21.3);
						this.wilson_hidden.ctx.lineTo(21.3, 42.7);
						this.wilson_hidden.ctx.stroke();
						
						this.cube_texture.needsUpdate = true;
						
						
						
						this.wilson_hidden_2.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_2.ctx.fillStyle = `rgba(64, 64, 64, ${this.wilson_hidden_2.ctx._alpha})`;
						this.wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_2.ctx.fillStyle = `rgba(128, 128, 128, ${this.wilson_hidden_2.ctx._alpha})`;
						this.wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						this.wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						this.wilson_hidden_2.ctx.stroke();
						
						this.cube_texture_2.needsUpdate = true;
						
						
						
						this.wilson_hidden_3.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_3.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : this.wilson_hidden_3.ctx._alpha})`;
						this.wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_3.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : this.wilson_hidden_3.ctx._alpha})`;
						this.wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_3.ctx.moveTo(42.7, 21.3);
						this.wilson_hidden_3.ctx.lineTo(21.3, 42.7);
						this.wilson_hidden_3.ctx.stroke();
						
						this.floor_texture.needsUpdate = true;
						
						
						
						this.wilson_hidden_4.ctx.clearRect(0, 0, 64, 64);
						
						this.wilson_hidden_4.ctx.fillStyle = `rgba(32, 32, 32, ${this.add_walls ? 0 : this.wilson_hidden_4.ctx._alpha})`;
						this.wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
						
						this.wilson_hidden_4.ctx.fillStyle = `rgba(64, 64, 64, ${this.add_walls ? 0 : this.wilson_hidden_4.ctx._alpha})`;
						this.wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
						
						this.wilson_hidden_4.ctx.moveTo(21.3, 21.3);
						this.wilson_hidden_4.ctx.lineTo(42.7, 42.7);
						this.wilson_hidden_4.ctx.stroke();
						
						this.floor_texture_2.needsUpdate = true;
					}
				});
			});
			
			targets.forEach(material => material.opacity = 1);
			
			this.currently_animating_camera = false;
			
			resolve();
		});	
	}
	
	
	
	show_floor(opacity = 1)
	{
		return new Promise(async (resolve, reject) =>
		{
			let targets = [];
			
			this.arrays.forEach(array =>
			{
				array.floor.forEach(row =>
				{
					row.forEach(floor =>
					{
						floor.material.forEach(material => targets.push(material));
					});
				});
			});
						
			anime({
				targets: targets,
				opacity: opacity,
				duration: this.animation_time / 2,
				easing: "easeOutQuad",
				complete: () =>
				{
					resolve();
				}
			});	
		});	
	}
	
	hide_floor()
	{
		return show_floor(0);
	}
	
	
	
	//Goes through and recomputes the sizes of array and then the total array sizes.
	recalculate_heights(array)
	{
		array.height = 0;
		
		array.numbers.forEach(row =>
		{
			row.forEach(entry =>
			{
				if (entry !== Infinity)
				{
					array.height = Math.max(entry, array.height);
				}	
			});
		});
		
		array.size = Math.max(array.footprint, array.height);
		
		
		
		let old_total_array_height = this.total_array_height;
		
		this.total_array_height = 0;
		
		this.arrays.forEach(array => this.total_array_height = Math.max(array.height, this.total_array_height));
		
		
		
		this.total_array_size = Math.max(this.total_array_footprint, this.total_array_height);
		
		if (this.total_array_height !== this.old_total_array_height)
		{
			this.update_camera_height();
		}
	}
	
	
	
	draw_all_2d_view_text()
	{
		this.font_size = this.wilson_numbers.canvas_width / (this.total_array_footprint + 1);
		
		const num_characters = Math.max(`${this.total_array_height}`.length, 2);
		
		this.wilson_numbers.ctx.font = `${this.font_size / num_characters}px monospace`;
		
		this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
		
		this.arrays.forEach(array =>
		{
			//Show the numbers in the right places.
			for (let i = 0; i < array.footprint; i++)
			{
				for (let j = 0; j < array.footprint; j++)
				{
					this.draw_single_cell_2d_view_text(array, i, j);
				}
			}
		});
	}
	
	
	
	draw_single_cell_2d_view_text(array, row, col)
	{
		const top = (this.total_array_footprint - array.footprint - 1) / 2;
		const left = array.partial_footprint_sum - array.footprint;
		
		this.wilson_numbers.ctx.clearRect(this.font_size * (col + left + 1), this.font_size * (row + top + 1), this.font_size, this.font_size);
		
		if (array.numbers[row][col] !== Infinity && (array.numbers[row][col] !== 0 || this.floor_lightness !== 0))
		{
			const text_metrics = this.wilson_numbers.ctx.measureText(array.numbers[row][col]);
			
			//The height adjustment is an annoying spacing computation.
			this.wilson_numbers.ctx.fillText(array.numbers[row][col], this.font_size * (col + left + 1) + (this.font_size - text_metrics.width) / 2, this.font_size * (row + top + 1) + (this.font_size + text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent) / 2);
		}	
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	color_cubes(array, coordinates, hue)
	{
		return new Promise((resolve, reject) =>
		{
			if (coordinates.length === 0)
			{
				resolve();
				return;
			}
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material.color));
			});
			
			targets.forEach(color => color.getRGB(color));
			
			//Convert HSV to HSL.
			let v = this.cube_lightness + 1 * Math.min(this.cube_lightness, 1 - this.cube_lightness);
			let s = v === 0 ? 0 : 2 * (1 - this.cube_lightness / v);
			
			let target_colors = targets.map(color => this.wilson.utils.hsv_to_rgb(hue, s, v));
			
			
			
			anime({
				targets: targets,
				r: (element, index) => target_colors[index][0] / 255,
				g: (element, index) => target_colors[index][1] / 255,
				b: (element, index) => target_colors[index][2] / 255,
				duration: this.animation_time,
				delay: (element, index) => Math.floor(index / 6) * this.animation_time / 10,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setRGB(color.r, color.g, color.b)),
				complete: resolve
			});
		});
	}
	
	
	
	uncolor_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material.color));
			});
			
			targets.forEach(color => color.getHSL(color));
			
			anime({
				targets: targets,
				s: 0,
				duration: this.animation_time,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setHSL(color.h, color.s, this.cube_lightness)),
				complete: resolve
			});
		});
	}
	
	
	
	//Lifts the specified cubes to the specified height. The animation is skipped in 2d mode.
	raise_cubes(array, coordinates, height)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = this.in_2d_view ? 0 : this.animation_time;
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot raise cubes from an infinite height");
				}
			});
			
			anime({
				targets: targets,
				y: height,
				duration: duration,
				easing: "easeInOutQuad",
				complete: resolve
			});
		});	
	}
	
	
	
	//Lowers the specified cubes onto the array. The animation is skipped in 2d mode.
	lower_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = this.in_2d_view ? 0 : this.animation_time;
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot lower cubes onto an infinite height");
				}
			});
			
			anime({
				targets: targets,
				y: (element, index) => array.numbers[coordinates[index][0]][coordinates[index][1]],
				duration: duration,
				easing: "easeInOutQuad",
				complete: () =>
				{
					coordinates.forEach(xyz =>
					{	
						array.cubes[xyz[0]][xyz[1]][array.numbers[xyz[0]][xyz[1]]] = array.cubes[xyz[0]][xyz[1]][xyz[2]];
						
						array.cubes[xyz[0]][xyz[1]][xyz[2]] = null;
					});
					
					resolve();
				}
			});
		});	
	}
	
	
	
	//Moves cubes from one array to another and changes their group.
	move_cubes(source_array, source_coordinates, target_array, target_coordinates, update_cube_array = true)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			source_coordinates.forEach(xyz =>
			{
				targets.push(source_array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				target_array.cube_group.attach(source_array.cubes[xyz[0]][xyz[1]][xyz[2]]);
				
				if (source_array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot move cubes from an infinite height");
				}
			});
			
			
			
			anime({
				targets: targets,
				x: (element, index) => target_coordinates[index][1] - (target_array.footprint - 1) / 2,
				y: (element, index) => target_coordinates[index][2],
				z: (element, index) => target_coordinates[index][0] - (target_array.footprint - 1) / 2,
				duration: this.animation_time,
				easing: "easeInOutQuad",
				complete: () =>
				{
					if (update_cube_array)
					{
						//This is necessary in case the source and target arrays are the same.
						let source_cubes = source_coordinates.map(xyz => source_array.cubes[xyz[0]][xyz[1]][xyz[2]]);
						
						source_coordinates.forEach(xyz => source_array.cubes[xyz[0]][xyz[1]][xyz[2]] = null);
						
						target_coordinates.forEach((xyz, index) =>
						{
							if (target_array.numbers[xyz[0]][xyz[1]] === Infinity)
							{
								console.error("Cannot move cubes to an infinite height");
							}
							
							if (target_array.cubes[xyz[0]][xyz[1]][xyz[2]] && !source_coordinates.some(e => e[0] === xyz[0] && e[1] === xyz[1] && e[2] === xyz[2]))
							{
								console.warn(`Moving a cube to a location that's already occupied: ${xyz}. This is probably not what you want to do.`);
							}
							
							target_array.cubes[xyz[0]][xyz[1]][xyz[2]] = source_cubes[index];
						});
					}
					
					resolve();
				}	
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to 1.
	reveal_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			if (coordinates.length === 0)
			{
				resolve();
				return;
			}
			
			
			
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material));
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot reveal cubes at an infinite height");
				}
			});
			
			anime({
				targets: targets,
				opacity: 1,
				duration: this.animation_time / 2,
				delay: (element, index) => Math.floor(index / 6) * this.animation_time / 10,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to zero, and then deletes them.
	delete_cubes(array, coordinates, instant = false, no_animation = false)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.cubes[xyz[0]][xyz[1]][xyz[2]].material.forEach(material => targets.push(material));
			});
						
			anime({
				targets: targets,
				opacity: 0,
				duration: this.animation_time / 2 * !no_animation,
				delay: (element, index) => (!instant) * Math.floor(index / 6) * this.animation_time / 10,
				easing: "easeOutQuad",
				complete: () =>
				{
					targets.forEach(material => material.dispose());
					
					coordinates.forEach(xyz =>
					{
						array.cube_group.remove(array.cubes[xyz[0]][xyz[1]][xyz[2]]);
						
						array.cubes[xyz[0]][xyz[1]][xyz[2]] = null;
					});
					
					resolve();
				}
			});	
		});
	}
	
	
	
	//For use with tableaux of skew shape.
	delete_floor(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			coordinates.forEach(xyz =>
			{
				array.floor[xyz[0]][xyz[1]].material.forEach(material => targets.push(material));
			});
						
			anime({
				targets: targets,
				opacity: 0,
				duration: this.animation_time / 2,
				easing: "easeOutQuad",
				complete: () =>
				{
					targets.forEach(material => material.dispose());
					
					coordinates.forEach(xyz =>
					{
						array.cube_group.remove(array.floor[xyz[0]][xyz[1]]);
						
						array.cubes[xyz[0]][xyz[1]] = null;
					});
					
					resolve();
				}
			});	
		});
	}
	
	
	
	run_example(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (index === 1 || index === 2)
			{
				while (this.arrays.length > 1)
				{
					await this.remove_array(1);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
				}
				
				if (this.arrays.length === 0)
				{
					const plane_partition = this.parse_array(this.generate_random_plane_partition());
					await this.add_new_array(this.arrays.length, plane_partition);
				}
				
				else if (!this.verify_pp(this.arrays[0].numbers))
				{
					await this.remove_array(0);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
					
					const plane_partition = this.parse_array(this.generate_random_plane_partition());
					await add_new_array(this.arrays.length, plane_partition);
				}
				
				
				
				if (index === 1)
				{
					await this.run_algorithm("hillman_grassl", 0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animation_time));
					
					await this.run_algorithm("hillman_grassl_inverse", 0);
				}
				
				else
				{
					await this.run_algorithm("pak", 0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animation_time));
					
					await this.show_hex_view();
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
					
					await this.run_algorithm("sulzgruber_inverse", 0);
				}	
				
				resolve();
			}
			
			
			
			else if (index === 3)
			{
				while (this.arrays.length > 0)
				{
					await this.remove_array(0);
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
				}
				
				await this.add_new_array(this.arrays.length, this.generate_random_tableau());
				
				
				
				await this.show_2d_view();
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
				
				await this.run_algorithm("rsk_inverse", 0)
				
				await new Promise((resolve, reject) => setTimeout(resolve, 3 * this.animation_time));
				
				await this.run_algorithm("rsk", 0);
				
				resolve();
			}
		});
	}
	
	
	
	run_algorithm(name, index, sub_algorithm = false)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!sub_algorithm && this.currently_running_algorithm)
			{
				resolve();
				return;
			}
			
			this.currently_running_algorithm = true;
			
			
			
			const data = this.algorithm_data[name];
			
			const num_arrays = data.input_type.length;
			
			if (index > this.arrays.length - 1 || index < 0)
			{
				console.log(`No array at index ${index}!`);
				
				this.currently_running_algorithm = false;
				
				resolve();
				return;
			}
			
			else if (num_arrays > 1 && index > this.arrays.length - num_arrays)
			{
				console.log(`No array at index ${index + num_arrays - 1}! (This algorithm needs ${num_arrays} arrays)`);
				
				this.currently_running_algorithm = false;
				
				resolve();
				return;
			}
			
			
			
			for (let i = 0; i < num_arrays; i++)
			{
				let type = data.input_type[i];
				
				if (type === "pp" && !this.verify_pp(this.arrays[index + i].numbers))
				{
					console.log(`Array at index ${index + i} is not a plane partition!`);
					
					this.currently_running_algorithm = false;
					
					reject();
					return;
				}
				
				if (type === "ssyt" && !this.verify_ssyt(this.arrays[index + i].numbers))
				{
					console.log(`Array at index ${index + i} is not an SSYT!`);
					
					this.currently_running_algorithm = false;
					
					resolve();
					return;
				}
			}
			
			
			
			if (num_arrays > 1 && data.same_shape !== undefined && data.same_shape)
			{
				let row_lengths = new Array(num_arrays);
				
				let max_num_rows = 0;
				
				for (let i = 0; i < num_arrays; i++)
				{
					max_num_rows = Math.max(max_num_rows, this.arrays[index + i].numbers.length);
				}	
				
				for (let i = 0; i < num_arrays; i++)
				{
					row_lengths[i] = new Array(max_num_rows);
					
					for (let j = 0; j < max_num_rows; j++)
					{
						row_lengths[i][j] = 0;
					}
					
					for (let j = 0; j < this.arrays[index + i].numbers.length; j++)
					{
						let k = 0;
						
						while (k < this.arrays[index + i].numbers[j].length && this.arrays[index + i].numbers[j][k] !== 0)
						{
							k++;
						}
						
						row_lengths[i][j] = k;
					}	
				}
				
				
				
				for (let i = 1; i < num_arrays; i++)
				{
					for (let j = 0; j < max_num_rows; j++)
					{
						if (row_lengths[i][j] !== row_lengths[0][j])
						{
							this.display_error(`Arrays are not the same shape!`);
							
							this.currently_running_algorithm = false;
							
							resolve();
							return;
						}
					}	
				}
			}
			
			
			
			//Uncolor everything.
			for (let i = 0; i < num_arrays; i++)
			{
				let coordinates = [];
				
				const numbers = this.arrays[index + i].numbers;
				
				for (let j = 0; j < numbers.length; j++)
				{
					for (let k = 0; k < numbers.length; k++)
					{
						if (numbers[j][k] !== Infinity)
						{
							for (let l = 0; l < numbers[j][k]; l++)
							{
								coordinates.push([j, k, l]);
							}
						}	
					}
				}
				
				this.uncolor_cubes(this.arrays[index + i], coordinates);
			}	
			
			
			
			const bound_function = data.method.bind(this);
			
			await bound_function(index);
			
			
			
			if (!this.sub_algorithm)
			{
				this.currently_running_algorithm = false;
			}
			
			resolve();
		});
	}
	
	
	hillman_grassl(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let plane_partition = _.cloneDeep(array.numbers);
			
			
			
			let column_starts = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				let j = 0;
				
				while (j < plane_partition.length && plane_partition[j][i] === Infinity)
				{
					j++;
				}
				
				column_starts[i] = j;
			}
			
			
			
			let row_starts = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				let j = 0;
				
				while (j < plane_partition.length && plane_partition[i][j] === Infinity)
				{
					j++;
				}
				
				row_starts[i] = j;
			}
			
			
			
			let zigzag_paths = [];
			
			while (true)
			{
				//Find the right-most nonzero entry at the top of its column.
				let starting_col = plane_partition[0].length - 1;
				
				while (starting_col >= 0 && column_starts[starting_col] < plane_partition.length && plane_partition[column_starts[starting_col]][starting_col] === 0)
				{
					starting_col--;
				}
				
				if (starting_col < 0 || column_starts[starting_col] === plane_partition.length)
				{
					break;
				}
				
				
				
				let current_row = column_starts[starting_col];
				let current_col = starting_col;
				
				let path = [[current_row, current_col, plane_partition[current_row][current_col] - 1]];
				
				while (true)
				{
					if (current_row < plane_partition.length - 1 && plane_partition[current_row + 1][current_col] === plane_partition[current_row][current_col])
					{
						current_row++;
					}
					
					else if (current_col > 0 && plane_partition[current_row][current_col - 1] !== Infinity)
					{
						current_col--;
					}
					
					else
					{
						break;
					}
					
					path.push([current_row, current_col, plane_partition[current_row][current_col] - 1]);
				}
				
				
				
				for (let i = 0; i < path.length; i++)
				{
					plane_partition[path[i][0]][path[i][1]]--;
				}
				
				zigzag_paths.push(path);
			}
			
			
			
			let empty_array = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				empty_array[i] = new Array(plane_partition.length);
				
				for (let j = 0; j < plane_partition.length; j++)
				{
					empty_array[i][j] = plane_partition[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let output_array = await this.add_new_array(index + 1, empty_array);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one.
			for (let i = 0; i < zigzag_paths.length; i++)
			{
				let hue = i / zigzag_paths.length * 6/7;
				
				await this.color_cubes(array, zigzag_paths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await this.raise_cubes(array, zigzag_paths[i], array.height);
				
				
				
				//Now we actually delete the cubes.
				for (let j = 0; j < zigzag_paths[i].length; j++)
				{
					array.numbers[zigzag_paths[i][j][0]][zigzag_paths[i][j][1]]--;
					
					if (this.in_2d_view)
					{
						this.draw_single_cell_2d_view_text(array, zigzag_paths[i][j][0], zigzag_paths[i][j][1]);
					}	
				}
				
				this.recalculate_heights(array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 5));
				
				//Find the pivot and rearrange the shape into a hook.
				let pivot = [zigzag_paths[i][zigzag_paths[i].length - 1][0], zigzag_paths[i][0][1]];
				
				let target_coordinates = [];
				
				let target_height = output_array.height + 1;
				
				//This is the vertical part of the hook.
				for (let j = column_starts[pivot[1]]; j <= pivot[0]; j++)
				{
					target_coordinates.push([j, pivot[1], target_height]);
				}
				
				let pivot_coordinates = target_coordinates[target_coordinates.length - 1];
				
				//And this is the horizontal part.
				for (let j = pivot[1] - 1; j >= row_starts[pivot[0]]; j--)
				{
					target_coordinates.push([pivot[0], j, target_height]);
				}
				
				await this.move_cubes(array, zigzag_paths[i], output_array, target_coordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				target_coordinates = [];
				
				for (let j = pivot[0] - 1; j >= column_starts[pivot[1]]; j--)
				{
					target_coordinates.push([j, pivot[1], target_height]);
				}
				
				this.delete_cubes(output_array, target_coordinates);
				
				target_coordinates = [];
				
				for (let j = pivot[1] - 1; j >= row_starts[pivot[0]]; j--)
				{
					target_coordinates.push([pivot[0], j, target_height]);
				}
				
				this.delete_cubes(output_array, target_coordinates);
				
				
				
				await this.lower_cubes(output_array, [pivot_coordinates]);
				
				
				
				output_array.numbers[pivot_coordinates[0]][pivot_coordinates[1]]++;
				
				this.recalculate_heights(output_array);
				
				if (this.in_2d_view)
				{
					this.draw_single_cell_2d_view_text(output_array, pivot_coordinates[0], pivot_coordinates[1]);
				}
				
				output_array.height = Math.max(output_array.height, output_array.numbers[pivot_coordinates[0]][pivot_coordinates[1]]);
				
				output_array.size = Math.max(output_array.size, output_array.height);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			}
			
			
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	hillman_grassl_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = _.cloneDeep(array.numbers);
			
			let zigzag_paths = [];
			
			
			
			let column_starts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[j][i] === Infinity)
				{
					j++;
				}
				
				column_starts[i] = j;
			}
			
			
			
			let row_starts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[i][j] === Infinity)
				{
					j++;
				}
				
				row_starts[i] = j;
			}
				
			
			
			let empty_array = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				empty_array[i] = new Array(tableau.length);
				
				for (let j = 0; j < tableau.length; j++)
				{
					empty_array[i][j] = tableau[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let plane_partition = _.cloneDeep(empty_array);
			
			let output_array = await this.add_new_array(index + 1, empty_array);
			
			
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let j = 0; j < tableau.length; j++)
			{
				for (let i = tableau.length - 1; i >= column_starts[j]; i--)
				{
					while (tableau[i][j] !== 0)
					{
						let path = [];
						
						let current_row = i;
						let current_col = row_starts[i];
						
						while (current_row >= 0)
						{
							//Go up at the last possible place with a matching entry.
							let k = current_col;
							
							if (current_row !== 0)
							{
								while (plane_partition[current_row][k] !== plane_partition[current_row - 1][k] && k < j)
								{
									k++;
								}
							}
							
							else
							{
								k = j;
							}
							
							//Add all of these boxes.
							for (let l = current_col; l <= k; l++)
							{
								path.push([current_row, l, plane_partition[current_row][l]]);
							}
							
							if (current_row - 1 >= column_starts[k])
							{
								current_row--;
								current_col = k;
							}
							
							else
							{
								break;
							}		
						}
						
						
						
						for (let k = 0; k < path.length; k++)
						{
							plane_partition[path[k][0]][path[k][1]]++;
						}
						
						zigzag_paths.push([path, [i, j, tableau[i][j] - 1]]);
						
						tableau[i][j]--;
					}
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			
			
			//Now we'll animate those paths actually incrementing, one-by-one.
			for (let i = 0; i < zigzag_paths.length; i++)
			{
				let hue = i / zigzag_paths.length * 6/7;
				
				await this.color_cubes(array, [zigzag_paths[i][1]], hue);
				
				
				
				let row = zigzag_paths[i][1][0];
				let col = zigzag_paths[i][1][1];
				let height = array.size;
				
				//Add a bunch of cubes corresponding to the hook that this thing is a part of.
				for (let j = column_starts[col]; j < row; j++)
				{
					array.cubes[j][col][height] = this.add_cube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
				}
				
				for (let j = row_starts[row]; j < col; j++)
				{
					array.cubes[row][j][height] = this.add_cube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
				}
				
				
				
				await this.raise_cubes(array, [zigzag_paths[i][1]], height);
				
				
				
				let coordinates = [];
				
				for (let j = row - 1; j >= column_starts[col]; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise_1 = this.reveal_cubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = col - 1; j >= row_starts[row]; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise_2 = this.reveal_cubes(array, coordinates);
				
				await Promise.all([promise_1, promise_2]);
				
				
				
				//The coordinates now need to be in a different order to match the zigzag path.
				coordinates = [];
				
				for (let j = row_starts[row]; j < col; j++)
				{
					coordinates.push([row, j, height]);
				}
				
				coordinates.push([row, col, array.numbers[row][col] - 1]);
				
				for (let j = row - 1; j >= column_starts[col]; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let target_coordinates = zigzag_paths[i][0];
				
				let target_height = output_array.height + 1;
				
				target_coordinates.forEach(entry => entry[2] = target_height);
				
				array.numbers[row][col]--;
				
				this.recalculate_heights(array);
				
				if (this.in_2d_view)
				{
					this.draw_single_cell_2d_view_text(array, row, col);
				}
				
				await this.move_cubes(array, coordinates, output_array, target_coordinates);
				
				
				
				await this.lower_cubes(output_array, target_coordinates);
				
				target_coordinates.forEach((entry) =>
				{
					output_array.numbers[entry[0]][entry[1]]++;
				});
				
				this.recalculate_heights(output_array);
				
				if (this.in_2d_view)
				{
					target_coordinates.forEach(entry => this.draw_single_cell_2d_view_text(output_array, entry[0], entry[1]));
				}
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			}
			
			
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	pak(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let plane_partition = array.numbers;
			
			if (!this.in_2d_view)
			{
				await this.show_2d_view();
			}
			
			
			
			let right_leg_size = 0;
			let bottom_leg_size = 0;
			
			while (right_leg_size < array.footprint && array.numbers[right_leg_size][array.footprint - 1] !== 0)
			{
				right_leg_size++;
			}
			
			while (bottom_leg_size < array.footprint && array.numbers[array.footprint - 1][bottom_leg_size] !== 0)
			{
				bottom_leg_size++;
			}
			
			//Todo: remove eventually
			right_leg_size = 0;
			bottom_leg_size = 0;
			
			let num_corners = 0;
			
			for (let row = array.footprint - 1 - bottom_leg_size; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - right_leg_size; col >= 0; col--)
				{
					if (plane_partition[row][col] !== Infinity)
					{
						num_corners++;
					}
				}
			}
			
			
			
			let hue_index = 0;
			
			//Get outer corners by just scanning through the array forwards.
			for (let row = 0; row < array.footprint - bottom_leg_size; row++)
			{
				for (let col = 0; col < array.footprint - right_leg_size; col++)
				{
					if (plane_partition[row][col] === Infinity)
					{
						continue;
					}
					
					//Highlight this diagonal.
					let diagonal_coordinates = [];
					
					let i = 0;
					
					while (row + i < array.footprint && col + i < array.footprint)
					{
						diagonal_coordinates.push([row + i, col + i, plane_partition[row + i][col + i] - 1]);
						
						i++;
					}
					
					
					
					i = diagonal_coordinates[0][0];
					let j = diagonal_coordinates[0][1];
					
					let coordinates_to_color = [];
					
					for (let k = plane_partition[i][j] - 2; k >= 0; k--)
					{
						coordinates_to_color.push([i, j, k]);
					}
					
					this.color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					
					
					
					coordinates_to_color = [];
					
					diagonal_coordinates.forEach(coordinate =>
					{
						if (coordinate[2] >= 0)
						{
							coordinates_to_color.push(coordinate);
						}
					});
					
					await this.color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					
					
					
					//For each coordinate in the diagonal, we need to find the toggled value. The first and last will always be a little different, since they don't have as many neighbors.
					let new_diagonal_height = new Array(diagonal_coordinates.length);
					
					diagonal_coordinates.forEach((coordinate, index) =>
					{
						let i = coordinate[0];
						let j = coordinate[1];
						
						let neighbor_1 = 0;
						let neighbor_2 = 0;
						
						if (i < array.footprint - 1)
						{
							neighbor_1 = plane_partition[i + 1][j];
						}
						
						if (j < array.footprint - 1)
						{
							neighbor_2 = plane_partition[i][j + 1];
						}
						
						new_diagonal_height[index] = Math.max(neighbor_1, neighbor_2);
						
						
						
						if (index > 0)
						{
							neighbor_1 = plane_partition[i - 1][j];
							neighbor_2 = plane_partition[i][j - 1];
							
							new_diagonal_height[index] += Math.min(neighbor_1, neighbor_2) - plane_partition[i][j];
						}
						
						else
						{
							new_diagonal_height[index] = plane_partition[i][j] - new_diagonal_height[index];
						}
					});	
					
					
					
					//This is async, so we can't use forEach easily.
					for (let index = 0; index < diagonal_coordinates.length; index++)
					{
						i = diagonal_coordinates[index][0];
						j = diagonal_coordinates[index][1];
						
						if (new_diagonal_height[index] > plane_partition[i][j])
						{
							let coordinates_to_reveal = [];
							
							for (let k = plane_partition[i][j]; k < new_diagonal_height[index]; k++)
							{
								array.cubes[i][j][k] = this.add_cube(array, j, k, i);
								
								coordinates_to_reveal.push([i, j, k]);
							}
							
							if (this.in_2d_view)
							{
								this.reveal_cubes(array, coordinates_to_reveal);
							}
							
							else
							{
								await this.reveal_cubes(array, coordinates_to_reveal);
							}	
						}
						
						
						
						else if (new_diagonal_height[index] < plane_partition[i][j])
						{
							let coordinates_to_delete = [];
							
							for (let k = plane_partition[i][j] - 1; k >= new_diagonal_height[index]; k--)
							{
								coordinates_to_delete.push([i, j, k]);
							}
							
							if (this.in_2d_view)
							{
								this.delete_cubes(array, coordinates_to_delete);
							}
							
							else
							{
								await this.delete_cubes(array, coordinates_to_delete);
							}
						}
						
						
						
						plane_partition[i][j] = new_diagonal_height[index];
						
						if (this.in_2d_view)
						{
							this.draw_single_cell_2d_view_text(array, i, j);
						}
					}
					
					
					
					let coordinates_to_uncolor = [];
					
					coordinates_to_color.forEach((coordinate, index) =>
					{
						if (index !== 0 && coordinate[2] < plane_partition[coordinate[0]][coordinate[1]])
						{
							coordinates_to_uncolor.push(coordinate);
						}
					});
					
					if (this.in_2d_view)
					{
						this.uncolor_cubes(array, coordinates_to_uncolor);
					}
					
					else
					{
						await this.uncolor_cubes(array, coordinates_to_uncolor);
					}		
					
					
					
					hue_index++;
					
					this.recalculate_heights(array);
					
					if (coordinates_to_color.length !== 0)
					{
						await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
					}
				}
			}
			
			
			
			this.update_camera_height(true);
			
			resolve();
		});	
	}
	
	
	
	pak_inverse(index, right_leg_size = 0, bottom_leg_size = 0)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = array.numbers;
			
			
			
			if (!this.in_2d_view)
			{
				await this.show_2d_view();
			}
			
			
			
			let num_corners = 0;
			
			for (let row = array.footprint - 1 - bottom_leg_size; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - right_leg_size; col >= 0; col--)
				{
					if (tableau[row][col] !== Infinity)
					{
						num_corners++;
					}
				}
			}
			
			
			
			let hue_index = 0;
			
			//Get outer corners by just scanning through the array backwards.
			for (let row = array.footprint - 1 - bottom_leg_size; row >= 0; row--)
			{
				for (let col = array.footprint - 1 - right_leg_size; col >= 0; col--)
				{
					if (tableau[row][col] === Infinity)
					{
						continue;
					}
					
					
					
					//Highlight this diagonal.
					let diagonal_coordinates = [];
					
					let i = 0;
					
					while (row + i < array.footprint && col + i < array.footprint)
					{
						diagonal_coordinates.push([row + i, col + i, tableau[row + i][col + i] - 1]);
						
						i++;
					}
					
					
					
					i = diagonal_coordinates[0][0];
					let j = diagonal_coordinates[0][1];
					
					
					
					//For each coordinate in the diagonal, we need to find the toggled value. The first and last will always be a little different, since they don't have as many neighbors.
					let new_diagonal_height = new Array(diagonal_coordinates.length);
					
					let any_change = false;
					
					diagonal_coordinates.forEach((coordinate, index) =>
					{
						let i = coordinate[0];
						let j = coordinate[1];
						
						let neighbor_1 = 0;
						let neighbor_2 = 0;
						
						if (i < array.footprint - 1)
						{
							neighbor_1 = tableau[i + 1][j];
						}
						
						if (j < array.footprint - 1)
						{
							neighbor_2 = tableau[i][j + 1];
						}
						
						new_diagonal_height[index] = Math.max(neighbor_1, neighbor_2);
						
						
						
						if (index > 0)
						{
							neighbor_1 = tableau[i - 1][j];
							neighbor_2 = tableau[i][j - 1];
							
							new_diagonal_height[index] += Math.min(neighbor_1, neighbor_2) - tableau[i][j];
						}
						
						else
						{
							new_diagonal_height[index] += tableau[i][j];
						}
						
						
						
						if (!any_change && new_diagonal_height[index] !== tableau[i][j])
						{
							any_change = true;
						}
					});
					
					
					
					if (tableau[i][j] !== 0)
					{
						let coordinates_to_color = [];
						
						for (let k = tableau[i][j] - 1; k >= 0; k--)
						{
							coordinates_to_color.push([i, j, k]);
						}
						
						this.color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					}
					
					else if (new_diagonal_height[0] !== 0)
					{
						array.cubes[i][j][0] = this.add_cube(array, j, 0, i, hue_index / num_corners * 6/7, 1, this.cube_lightness);
						
						tableau[i][j] = 1;
						
						this.reveal_cubes(array, [[i, j, 0]]);
					}
					
					else if (!any_change)
					{
						hue_index++;
						continue;
					}
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
					
					
					
					//This is async, so we can't use forEach easily.
					for (let index = 0; index < diagonal_coordinates.length; index++)
					{
						i = diagonal_coordinates[index][0];
						j = diagonal_coordinates[index][1];
						
						if (new_diagonal_height[index] > tableau[i][j])
						{
							let coordinates_to_reveal = [];
							
							for (let k = tableau[i][j]; k < new_diagonal_height[index]; k++)
							{
								array.cubes[i][j][k] = this.add_cube(array, j, k, i, hue_index / num_corners * 6/7, 1, this.cube_lightness);
								
								coordinates_to_reveal.push([i, j, k]);
							}
							
							if (this.in_2d_view)
							{
								this.reveal_cubes(array, coordinates_to_reveal);
							}
							
							else
							{
								await this.reveal_cubes(array, coordinates_to_reveal);
							}
						}
						
						
						
						else if (new_diagonal_height[index] < tableau[i][j])
						{
							let coordinates_to_delete = [];
							
							for (let k = tableau[i][j] - 1; k >= new_diagonal_height[index]; k--)
							{
								coordinates_to_delete.push([i, j, k]);
							}
							
							if (this.in_2d_view)
							{
								this.delete_cubes(array, coordinates_to_delete);
							}
							
							else
							{
								await this.delete_cubes(array, coordinates_to_delete);
							}
						}
						
						
						
						tableau[i][j] = new_diagonal_height[index];
						
						if (this.in_2d_view)
						{
							this.draw_single_cell_2d_view_text(array, i, j);
						}
					}
					
					
					
					hue_index++;
					
					this.recalculate_heights(array);
					
					await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
				}
			}
			
			
			
			this.update_camera_height(true);
			
			resolve();
		});	
	}
	
	
	
	sulzgruber(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let plane_partition = _.cloneDeep(array.numbers);
			
			
			
			let column_starts = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				let j = 0;
				
				while (j < plane_partition.length && plane_partition[j][i] === Infinity)
				{
					j++;
				}
				
				column_starts[i] = j;
			}
			
			
			
			let row_starts = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				let j = 0;
				
				while (j < plane_partition.length && plane_partition[i][j] === Infinity)
				{
					j++;
				}
				
				row_starts[i] = j;
			}
			
			
			
			//First, find the candidates. This first requires categorizing the diagonals.
			let diagonals = {};
			
			let diagonal_starts = {};
			
			
			
			//First the ones along the left edge.
			for (let i = 0; i < plane_partition.length; i++)
			{
				diagonal_starts[-i] = [i, 0];
			}
			
			//Now the ones along the top edge.
			for (let i = 1; i < plane_partition.length; i++)
			{
				diagonal_starts[i] = [0, i];
			}
			
			
			
			//First the ones along the left edge.
			for (let i = -plane_partition.length + 1; i < plane_partition.length; i++)
			{
				let row = diagonal_starts[i][0];
				let col = diagonal_starts[i][1];
				
				while (row < plane_partition.length && col < plane_partition.length && plane_partition[row][col] === Infinity)
				{
					row++;
					col++;
				}
				
				diagonal_starts[i] = [row, col];
				
				if (row === plane_partition.length || col === plane_partition.length)
				{
					diagonals[i] = -1;
					continue;
				}
				
				
				
				let boundary_left = col === 0 || plane_partition[row][col - 1] === Infinity;
				let boundary_up = row === 0 || plane_partition[row - 1][col] === Infinity;
				
				if (boundary_left && boundary_up)
				{
					diagonals[i] = 0;
				}
				
				else if (boundary_left)
				{
					diagonals[i] = 3;
				}
				
				else if (boundary_up)
				{
					diagonals[i] = 2;
				}
				
				else
				{
					diagonals[i] = 1;
				}
			}
			
			
			
			//Now we need to move through the candidates. They only occur in A and O regions, so we only scan those diagonals, top-left to bottom-right, and then bottom-left to top-right in terms of diagonals.
			let q_paths = [];
			let rim_hooks = [];
			
			for (let i = -plane_partition.length + 1; i < plane_partition.length; i++)
			{
				if (diagonals[i] === 1 || diagonals[i] === 3)
				{
					continue;
				}
				
				let start_row = diagonal_starts[i][0];
				let start_col = diagonal_starts[i][1];
				
				if (plane_partition[start_row][start_col] === 0)
				{
					continue;
				}
				
				
				
				while (true)
				{
					let found_candidate = false;	
					
					while (start_row < plane_partition.length && start_col < plane_partition.length && plane_partition[start_row][start_col] !== 0)
					{
						if ((start_col < plane_partition.length - 1 && plane_partition[start_row][start_col] > plane_partition[start_row][start_col + 1]) || (start_col === plane_partition.length - 1 && plane_partition[start_row][start_col] > 0))
						{
							if (diagonals[i] === 0 || (diagonals[i] === 2 && ((start_row < plane_partition.length - 1 && plane_partition[start_row][start_col] > plane_partition[start_row + 1][start_col]) || (start_row === plane_partition.length - 1 && plane_partition[start_row][start_col] > 0))))
							{
								found_candidate = true;
								break;
							}	
						}
						
						start_row++;
						start_col++;
					}
					
					if (!found_candidate)
					{
						break;
					}
					
					
					
					let row = start_row;
					let col = start_col;
					
					let path = [[row, col, plane_partition[row][col] - 1]];
					
					while (true)
					{
						let current_content = col - row;
						
						if (row < plane_partition.length - 1 && plane_partition[row][col] === plane_partition[row + 1][col] && (diagonals[current_content] === 0 || diagonals[current_content] === 3))
						{
							row++;
						}
						
						else if (col > row_starts[row] && (row === plane_partition.length - 1 || (row < plane_partition.length - 1 && plane_partition[row][col] > plane_partition[row + 1][col])))
						{
							col--;
						}
						
						else
						{
							break;
						}
						
						path.push([row, col, plane_partition[row][col] - 1]);
					}
					
					path.forEach(box => plane_partition[box[0]][box[1]]--);
					
					q_paths.push(path);
				}	
			}
			
			
			
			let empty_array = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				empty_array[i] = new Array(plane_partition.length);
				
				for (let j = 0; j < plane_partition.length; j++)
				{
					empty_array[i][j] = plane_partition[i][j] === Infinity ? Infinity : 0;
				}
			}
			
			let output_array = await this.add_new_array(index + 1, empty_array);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one. We're using a for loop because we need to await.
			for (let i = 0; i < q_paths.length; i++)
			{
				let hue = i / q_paths.length * 6/7;
				
				await this.color_cubes(array, q_paths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await this.raise_cubes(array, q_paths[i], array.height + 1);
				
				
				
				//Now we actually delete the cubes.
				q_paths[i].forEach(box =>
				{
					array.numbers[box[0]][box[1]]--;
					
					if (this.in_2d_view)
					{
						this.draw_single_cell_2d_view_text(array, box[0], box[1]);
					}	
				});
				
				this.recalculate_heights(array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 5));
				
				//Find the pivot and rearrange the shape into a hook. The end of the Q-path is the same as the end of the rim-hook, so it defines the row. To find the column, we need to go row boxes down, and then use the rest of the length to go right.
				let row = q_paths[i][q_paths[i].length - 1][0];
				
				let start_content = q_paths[i][q_paths[i].length - 1][1] - row;
				
				//Every step along the rim-hook increases the content by one.
				let end_content = start_content + q_paths[i].length - 1;
				
				let col = diagonal_starts[end_content][1];
				
				
				
				let target_coordinates = [];
				
				let target_height = Math.max(array.height + 1, output_array.height + 1);
				
				for (let j = column_starts[col]; j <= row; j++)
				{
					target_coordinates.push([j, col, target_height]);
				}
				
				for (let j = col - 1; j >= row_starts[row]; j--)
				{
					target_coordinates.push([row, j, target_height]);
				}
				
				await this.move_cubes(array, q_paths[i], output_array, target_coordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				target_coordinates = [];
				
				for (let j = row - 1; j >= column_starts[col]; j--)
				{
					target_coordinates.push([j, col, target_height]);
				}
				
				this.delete_cubes(output_array, target_coordinates);
				
				target_coordinates = [];
				
				for (let j = col - 1; j >= row_starts[row]; j--)
				{
					target_coordinates.push([row, j, target_height]);
				}
				
				this.delete_cubes(output_array, target_coordinates);
				
				
				
				await this.lower_cubes(output_array, [[row, col, target_height]]);
				
				
				
				output_array.numbers[row][col]++;
				
				if (this.in_2d_view)
				{
					this.draw_single_cell_2d_view_text(output_array, row, col);
				}
				
				this.recalculate_heights(output_array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			}
			
			
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	sulzgruber_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = array.numbers;
			
			let q_paths = [];
			
			
			
			let column_starts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[j][i] === Infinity)
				{
					j++;
				}
				
				column_starts[i] = j;
			}
			
			
			
			let row_starts = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				let j = 0;
				
				while (j < tableau.length && tableau[i][j] === Infinity)
				{
					j++;
				}
				
				row_starts[i] = j;
			}
			
			
			
			//First, find the candidates. This first requires categorizing the diagonals.
			let diagonal_starts = {};
			
			//First the ones along the left edge.
			for (let i = 0; i < tableau.length; i++)
			{
				diagonal_starts[-i] = [i, 0];
			}
			
			//Now the ones along the top edge.
			for (let i = 1; i < tableau.length; i++)
			{
				diagonal_starts[i] = [0, i];
			}
			
			for (let i = -tableau.length + 1; i < tableau.length; i++)
			{
				let row = diagonal_starts[i][0];
				let col = diagonal_starts[i][1];
				
				while (row < tableau.length && col < tableau.length && tableau[row][col] === Infinity)
				{
					row++;
					col++;
				}
				
				diagonal_starts[i] = [row, col];
			}
			
			
			
			let num_hues = 0;
			
			let empty_array = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				empty_array[i] = new Array(tableau.length);
				
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] === Infinity)
					{
						empty_array[i][j] = Infinity;
					}
					
					else
					{
						empty_array[i][j] = 0;
						
						num_hues += tableau[i][j];
					}	
				}
			}
			
			let output_array = await this.add_new_array(index + 1, empty_array);
			
			let plane_partition = output_array.numbers;
			
			
			
			let current_hue_index = 0;
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let j = tableau.length - 1; j >= 0; j--)
			{
				for (let i = tableau.length - 1; i >= 0; i--)
				{
					if (tableau[i][j] === Infinity)
					{
						continue;
					}
					
					
					
					while (tableau[i][j] !== 0)
					{
						let hue = current_hue_index / num_hues * 6/7;
						
						let height = Math.max(array.size + 1, output_array.size + 1);
						
						await this.color_cubes(array, [[i, j, tableau[i][j] - 1]], hue);
						
						await this.raise_cubes(array, [[i, j, tableau[i][j] - 1]], height);
						
						
						
						let row = i;
						let col = j;
						
						//Add a bunch of cubes corresponding to the hook that this thing is a part of.
						for (let k = column_starts[col]; k < row; k++)
						{
							array.cubes[k][col][height] = this.add_cube(array, col, height, k);
							array.cubes[k][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
						}
						
						for (let k = row_starts[row]; k < col; k++)
						{
							array.cubes[row][k][height] = this.add_cube(array, k, height, row);
							array.cubes[row][k][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
						}
						
						
						
						let coordinates = [];
						
						for (let k = row - 1; k >= column_starts[col]; k--)
						{
							coordinates.push([k, col, height]);
						}
						
						let promise_1 = this.reveal_cubes(array, coordinates);
						
						coordinates = [];
						
						for (let k = col - 1; k >= row_starts[row]; k--)
						{
							coordinates.push([row, k, height]);
						}
						
						let promise_2 = this.reveal_cubes(array, coordinates);
						
						await Promise.all([promise_1, promise_2]);
						
						
						
						//In order to animate this nicely, we won't just jump straight to the Q-path -- we'll turn it into a rim-hook first.
						coordinates = [];
						
						for (let k = row_starts[row]; k < col; k++)
						{
							coordinates.push([row, k, height]);
						}
						
						coordinates.push([row, col, array.numbers[row][col] - 1]);
						
						for (let k = row - 1; k >= column_starts[col]; k--)
						{
							coordinates.push([k, col, height]);
						}
						
						
						
						let start_content = row_starts[row] - row;
						let end_content = start_content + coordinates.length - 1;
						
						let target_coordinates = [];
						
						for (let k = start_content; k <= end_content; k++)
						{
							target_coordinates.push(_.clone(diagonal_starts[k]));
						}
						
						
						
						tableau[row][col]--;
						
						this.recalculate_heights(array);
						
						if (this.in_2d_view)
						{
							this.draw_single_cell_2d_view_text(array, row, col);
						}
						
						await this.move_cubes(array, coordinates, output_array, target_coordinates);
						
						
						
						//Now we'll lower one part at a time.
						let current_index = 0;
						
						let current_height = output_array.numbers[target_coordinates[0][0]][target_coordinates[0][1]];
						
						while (true)
						{
							let next_index = current_index;
							
							while (next_index < target_coordinates.length && target_coordinates[next_index][0] === target_coordinates[current_index][0])
							{
								next_index++;
							}
							
							coordinates = target_coordinates.slice(current_index, next_index);
							
							
							
							//Check if this part can all be inserted at the same height.
							let insertion_works = true;
							
							for (let k = 0; k < coordinates.length; k++)
							{
								if (output_array.numbers[coordinates[k][0]][coordinates[k][1]] !== current_height)
								{
									insertion_works = false;
									break;
								}
							}
							
							
							
							if (insertion_works)
							{
								await this.lower_cubes(output_array, coordinates);
								
								coordinates.forEach(coordinate => output_array.numbers[coordinate[0]][coordinate[1]]++);
								
								this.recalculate_heights(output_array);
								
								if (this.in_2d_view)
								{
									coordinates.forEach(entry =>
									{
										this.draw_single_cell_2d_view_text(output_array, entry[0], entry[1])
									});
								}
								
								current_index = next_index;
							}
							
							else
							{
								let old_target_coordinates = _.cloneDeep(target_coordinates.slice(current_index));
								
								//Shift the rest of the coordinates down and right by 1.
								for (let k = current_index; k < target_coordinates.length; k++)
								{
									target_coordinates[k][0]++;
									target_coordinates[k][1]++;
									
									if (target_coordinates[k][0] > output_array.footprint || target_coordinates[k][1] > output_array.footprint)
									{
										console.error("Insertion failed!");
										return;
									}
								}
								
								let new_target_coordinates = target_coordinates.slice(current_index);
								
								await this.move_cubes(output_array, old_target_coordinates, output_array, new_target_coordinates);
								
								current_height = output_array.numbers[target_coordinates[current_index][0]][target_coordinates[current_index][1]];
							}
							
							
							
							if (current_index === target_coordinates.length)
							{
								break;
							}
						}
						
						
						
						current_hue_index++;
						
						await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
					}	
				}
			}	
			
			
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	rsk(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let p_array = this.arrays[index];
			let q_array = this.arrays[index + 1];
			
			let p_ssyt = p_array.numbers;
			let q_ssyt = q_array.numbers;
			
			let array_size = 0;
			
			let num_hues = 0;
			
			//Remove any color that's here.
			for (let i = 0; i < p_ssyt.length; i++)
			{
				for (let j = 0; j < p_ssyt.length; j++)
				{
					if (p_ssyt[i][j] === Infinity || q_ssyt[i][j] === Infinity)
					{
						this.display_error(`The SSYT contain infinite values, which is not allowed in RSK!`);
						
						this.currently_running_algorithm = false;
						
						resolve();
						return;
					}
					
					if (p_ssyt[i][j] !== 0)
					{
						num_hues++;
					}
					
					array_size = Math.max(Math.max(array_size, p_ssyt[i][j]), q_ssyt[i][j]);
				}
			}
			
			if (array_size === 0)
			{
				display_error(`The SSYT are empty!`);
				
				currently_running_algorithm = false;
				
				resolve();
				return;
			}
			
			
			
			let empty_array = new Array(array_size);
			
			for (let i = 0; i < array_size; i++)
			{
				empty_array[i] = new Array(array_size);
				
				for (let j = 0; j < array_size; j++)
				{
					empty_array[i][j] = 0;
				}
			}
			
			let output_array = await this.add_new_array(index + 2, empty_array);
			
			
			
			//Start building up the entries in w. The first thing to do is to undo the insertion operations in P, using the entries in Q to ensure they're in the right order. The most recently added entry is the rightmost largest number in Q.
			let w = [];
			
			let hue_index = 0;
			
			while (q_ssyt[0][0] !== 0)
			{
				let hue = hue_index / num_hues * 6/7;
				
				let max_entry = 0;
				let row = 0;
				let col = 0;
				
				for (let i = 0; i < q_ssyt.length; i++)
				{
					let j = q_ssyt.length - 1;
					
					while (j >= 0 && q_ssyt[i][j] === 0)
					{
						j--;
					}
					
					if (j >= 0)
					{
						max_entry = Math.max(max_entry, q_ssyt[i][j]);
					}
				}
				
				for (let i = 0; i < q_ssyt.length; i++)
				{
					let j = q_ssyt.length - 1;
					
					while (j >= 0 && q_ssyt[i][j] === 0)
					{
						j--;
					}
					
					if (q_ssyt[i][j] === max_entry)
					{
						row = i;
						col = j;
						break;
					}
				}
				
				
				
				//Now row and col are the coordinates of the most recently added element. We just need to un-insert the corresponding element from P.
				let p_source_coordinates_local = [];
				let p_target_coordinates_local = [];
				let p_source_coordinates_external = [];
				let p_target_coordinates_external = [];
				
				let q_source_coordinates_external = [];
				let q_target_coordinates_external = [];
				
				let i = row;
				let j = col;
				let p_entry = p_ssyt[i][j];
				let q_entry = q_ssyt[i][j];
				
				let p_coordinate_path = [[i, j]];
				
				
				
				while (i !== 0)
				{
					//Find the rightmost element in the row above that's strictly smaller than this.
					let new_j = p_ssyt.length - 1;
					
					while (p_ssyt[i - 1][new_j] === 0 || p_entry <= p_ssyt[i - 1][new_j])
					{
						new_j--;
					}
					
					for (let k = 0; k < p_entry; k++)
					{
						p_source_coordinates_local.push([i, j, k]);
						p_target_coordinates_local.push([i - 1, new_j, k]);
					}
					
					i--;
					j = new_j;
					p_entry = p_ssyt[i][j];
					
					p_coordinate_path.push([i, j]);
				}
				
				
				
				//Alright, time for a stupid hack. The visual result we want is to take the stacks getting popped from both P and Q, move them to the first row and column of the output array to form a hook, delete all but one box (the top box of P), and then lower the other. The issue is that this will risk overwriting one of the two overlapping boxes, causing a memory leak and a glitchy state. The solution is to do a couple things. Only the P corner box will actually move to the output array -- the one from Q will appear to, but it will stay in its own array.
				
				let height = output_array.height + 1;
				
				for (let k = 0; k < p_entry; k++)
				{
					p_source_coordinates_external.push([i, j, k]);
					p_target_coordinates_external.push([q_entry - 1, k, height]);
				}
				
				for (let k = 0; k < q_entry - 1; k++)
				{
					q_source_coordinates_external.push([row, col, k]);
					q_target_coordinates_external.push([k, p_entry - 1, height]);
				}
				
				
				
				this.color_cubes(q_array, q_source_coordinates_external.concat([[row, col, q_entry - 1]]), hue);
				this.color_cubes(p_array, p_source_coordinates_local, hue);
				await this.color_cubes(p_array, p_source_coordinates_external, hue);
				
				
				
				//Update all the numbers.
				q_ssyt[row][col] = 0;
				
				for (let k = p_coordinate_path.length - 1; k > 0; k--)
				{
					p_ssyt[p_coordinate_path[k][0]][p_coordinate_path[k][1]] = p_ssyt[p_coordinate_path[k - 1][0]][p_coordinate_path[k - 1][1]];
				}
				
				p_ssyt[row][col] = 0;
				
				if (this.in_2d_view)
				{
					this.draw_single_cell_2d_view_text(p_array, row, col);
					
					for (let k = p_coordinate_path.length - 1; k > 0; k--)
					{
						this.draw_single_cell_2d_view_text(p_array, p_coordinate_path[k][0], p_coordinate_path[k][1]);
					}
					
					this.draw_single_cell_2d_view_text(q_array, row, col);
				}
				
				
				
				this.move_cubes(q_array, q_source_coordinates_external, output_array, q_target_coordinates_external);
				this.move_cubes(p_array, p_source_coordinates_external, output_array, p_target_coordinates_external);
				this.move_cubes(p_array, p_source_coordinates_local, p_array, p_target_coordinates_local);
				await this.move_cubes(q_array, [[row, col, q_entry - 1]], output_array, [[q_entry - 1, p_entry - 1, height]], false);
				
				
				
				this.uncolor_cubes(p_array, p_target_coordinates_local);
				
				
				
				//Delete the non-corner parts of the hook (animated), delete one of the overlapping corner cubes (instantly), and drop the other.
				
				//Gross but necessary. delete_cubes() needs to detach the object from its parent cube group, but what we pass isn't actually its parent, so we have to do it manually.
				output_array.cube_group.remove(q_array.cubes[row][col][q_entry - 1]);
				this.delete_cubes(q_array, [[row, col, q_entry - 1]], true, true);
				
				p_target_coordinates_external.reverse();
				q_target_coordinates_external.reverse();
				
				this.delete_cubes(output_array, p_target_coordinates_external.slice(1));
				this.delete_cubes(output_array, q_target_coordinates_external);
				
				await this.lower_cubes(output_array, [[q_entry - 1, p_entry - 1, height]]);
				
				empty_array[q_entry - 1][p_entry - 1]++;
				
				if (this.in_2d_view)
				{
					this.draw_single_cell_2d_view_text(output_array, q_entry - 1, p_entry - 1);
				}
				
				this.recalculate_heights(output_array);
				
				
				
				hue_index++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			}
			
			
			
			
			await this.remove_array(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	rsk_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			let tableau = _.cloneDeep(array.numbers);
			
			let num_entries = 0;
			
			tableau.forEach(row => row.forEach(entry => num_entries += entry));
			
			//The largest possible shape for these two is a straight line, requiring all the inserted elements to be increasing or decreasing.
			let p_ssyt = new Array(num_entries);
			let q_ssyt = new Array(num_entries);
			
			for (let i = 0; i < num_entries; i++)
			{
				p_ssyt[i] = new Array(num_entries);
				q_ssyt[i] = new Array(num_entries);
				
				for (let j = 0; j < num_entries; j++)
				{
					p_ssyt[i][j] = 0;
					q_ssyt[i][j] = 0;
				}
			}
			
			
			
			let p_row_lengths = new Array(tableau.length);
			
			for (let i = 0; i < tableau.length; i++)
			{
				p_row_lengths[i] = 0;
			}
			
			let p_num_rows = 0;
			
			
			
			//Unfortunately, there's no way to know the shape of P and Q without actually doing RSK, so we need to do all the calculations ahead of time, and only then animate things around.
			let p_insertion_paths = [];
			let q_insertion_locations = [];
			let tableau_removal_locations = [];
			
			for (let row = 0; row < tableau.length; row++)
			{
				for (let col = 0; col < tableau.length; col++)
				{
					while (tableau[row][col] !== 0)
					{
						tableau[row][col]--;
						
						let new_num = col + 1;
						
						let i = 0;
						let j = 0;
						
						let path = [];
						
						while (true)
						{
							j = p_row_lengths[i];
							
							while (j !== 0 && p_ssyt[i][j - 1] > new_num)
							{
								j--;
							}
							
							if (j === p_row_lengths[i])
							{
								p_ssyt[i][j] = new_num;
								
								p_row_lengths[i]++;
								
								if (j === 0)
								{
									p_num_rows++;
								}
								
								path.push([i, j]);
								
								break;
							}
							
							let temp = p_ssyt[i][j];
							p_ssyt[i][j] = new_num;
							new_num = temp;
							path.push([i, j]);
							
							i++;
						}
						
						p_insertion_paths.push(path);
						q_insertion_locations.push([i, j]);
						tableau_removal_locations.push([row, col]);
						
						q_ssyt[i][j] = row + 1;
					}
				}
			}
			
			
	
			let ssyt_size = Math.max(p_row_lengths[0], p_num_rows);
			
			p_ssyt = new Array(ssyt_size);
			q_ssyt = new Array(ssyt_size);
			
			for (let i = 0; i < ssyt_size; i++)
			{
				p_ssyt[i] = new Array(ssyt_size);
				q_ssyt[i] = new Array(ssyt_size);
				
				for (let j = 0; j < ssyt_size; j++)
				{
					p_ssyt[i][j] = 0;
					q_ssyt[i][j] = 0;
				}
			}
			
			let p_array = await this.add_new_array(index + 1, p_ssyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			let q_array = await this.add_new_array(index + 2, q_ssyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			
			
			let hue_index = 0;
			
			//Loop through the tableau in weirdo lex order and reassemble the paths.
			for (let i = 0; i < tableau_removal_locations.length; i++)
			{
				let row = tableau_removal_locations[i][0];
				let col = tableau_removal_locations[i][1];
				
				let height = array.height + 1;
				
				let hue = hue_index / num_entries * 6/7;
				
				
				
				//Add a bunch of cubes corresponding to the hook that this thing is a part of.
				for (let j = col; j >= 0; j--)
				{
					array.cubes[row][j][height] = this.add_cube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
				}
				
				for (let j = row - 1; j >= 0; j--)
				{
					array.cubes[j][col][height] = this.add_cube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
				}
				
				//This is the duplicate cube. As usual, we need to store it somewhere else in the array -- here, we're going to place it one space vertically above its actual location.
				
				array.cubes[row][col][height + 1] = this.add_cube(array, col, height, row);
				array.cubes[row][col][height + 1].material.forEach(material => material.color.setHSL(hue, 1, this.cube_lightness));
				
				
				
				await this.color_cubes(array, [[row, col, array.numbers[row][col] - 1]], hue);
				
				await this.raise_cubes(array, [[row, col, array.numbers[row][col] - 1]], height);
				
				
				
				let promise_1 = this.reveal_cubes(array, [[row, col, height + 1]]);
				
				let coordinates = [];
				
				for (let j = col - 1; j >= 0; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise_2 = this.reveal_cubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = row - 1; j >= 0; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise_3 = this.reveal_cubes(array, coordinates);
				
				await Promise.all([promise_1, promise_2, promise_3]);
				
				
				
				//First of all, we'll handle the insertion into P. As always, this takes some care. The strictly proper way to animate this would be to move the stacks one at a time, but just like with the forward direction, it is *much* easier (and time-efficient) to just move everything at once.
				let path = p_insertion_paths[hue_index];
				
				let p_source_coordinates_local = [];
				let p_target_coordinates_local = [];
				
				let p_source_coordinates_external = [[row, col, array.numbers[row][col] - 1]];
				let p_target_coordinates_external = [[path[0][0], path[0][1], col]];
				
				let q_source_coordinates_external = [[row, col, height + 1]];
				let q_target_coordinates_external = [[q_insertion_locations[hue_index][0], q_insertion_locations[hue_index][1], row]];
				
				
				
				for (let j = col - 1; j >= 0; j--)
				{
					p_source_coordinates_external.push([row, j, height]);
					p_target_coordinates_external.push([path[0][0], path[0][1], j]);
				}
				
				for (let j = 0; j < path.length - 1; j++)
				{
					for (let k = 0; k < p_ssyt[path[j][0]][path[j][1]]; k++)
					{
						p_source_coordinates_local.push([path[j][0], path[j][1], k]);
						p_target_coordinates_local.push([path[j + 1][0], path[j + 1][1], k]);
					}
				}
				
				for (let j = row - 1; j >= 0; j--)
				{
					q_source_coordinates_external.push([j, col, height]);
					q_target_coordinates_external.push([q_insertion_locations[hue_index][0], q_insertion_locations[hue_index][1], j]);
				}
				
				await this.color_cubes(p_array, p_source_coordinates_local, hue);
				
				
				
				for (let j = path.length - 1; j > 0; j--)
				{
					p_ssyt[path[j][0]][path[j][1]] = p_ssyt[path[j - 1][0]][path[j - 1][1]];
				}
				
				if (path.length !== 0)
				{
					p_ssyt[path[0][0]][path[0][1]] = 0;
				}
				
				if (this.in_2d_view)
				{
					this.draw_all_2d_view_text();
				}
				
				if (p_source_coordinates_local.length !== 0)
				{
					await this.move_cubes(p_array, p_source_coordinates_local, p_array, p_target_coordinates_local);	
				}	
				
				
				
				array.numbers[row][col]--;
				
				if (this.in_2d_view)
				{
					this.draw_all_2d_view_text();
				}
				
				this.move_cubes(array, p_source_coordinates_external, p_array, p_target_coordinates_external);
				
				await this.move_cubes(array, q_source_coordinates_external, q_array, q_target_coordinates_external);
				
				
				
				p_ssyt[path[0][0]][path[0][1]] = col + 1;
				
				q_ssyt[q_insertion_locations[hue_index][0]][q_insertion_locations[hue_index][1]] = row + 1;
				
				if (this.in_2d_view)
				{
					this.draw_all_2d_view_text();
				}
				
				
				
				this.recalculate_heights(array);
				this.recalculate_heights(p_array);
				this.recalculate_heights(q_array);
				
				
				
				hue_index++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			}
			
			
			
			await this.remove_array(index);
			
			resolve();
		});	
	}
	
	
	
	godar_1(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			//Figure out the shape of nu.
			let array = this.arrays[index];
			let plane_partition = array.numbers;
			
			let nu_row_lengths = new Array(2 * plane_partition.length);
			let nu_col_lengths = new Array(2 * plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				let j = 0;
				
				while (j < plane_partition.length && plane_partition[i][j] === Infinity)
				{
					j++;
				}
				
				nu_row_lengths[i] = j;
				
				
				
				j = 0;
				
				while (j < plane_partition.length && plane_partition[j][i] === Infinity)
				{
					j++;
				}
				
				nu_col_lengths[i] = j;
			}
			
			for (let i = plane_partition.length; i < 2 * plane_partition.length; i++)
			{
				nu_row_lengths[i] = 0;
				
				nu_col_lengths[i] = 0;
			}
			
			let rpp_size = Math.max(nu_row_lengths[0], nu_col_lengths[0]);
			
			
			
			let new_array = new Array(plane_partition.length);
			
			for (let i = 0; i < plane_partition.length; i++)
			{
				new_array[i] = new Array(plane_partition.length);
				
				for (let j = 0; j < plane_partition.length; j++)
				{
					if (plane_partition[i][j] === Infinity)
					{
						new_array[i][j] = this.infinite_height;
					}
					
					else
					{
						new_array[i][j] = plane_partition[i][j];
					}
				}
			}
			
			await this.add_new_array(index + 1, new_array);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			await this.remove_array(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			array = this.arrays[index];
			plane_partition = array.numbers;
			
			
			
			let right_leg_size = 0;
			let bottom_leg_size = 0;
			
			while (right_leg_size < plane_partition.length && plane_partition[right_leg_size][plane_partition.length - 1] !== 0)
			{
				right_leg_size++;
			}
			
			while (bottom_leg_size < plane_partition.length && plane_partition[plane_partition.length - 1][bottom_leg_size] !== 0)
			{
				bottom_leg_size++;
			}
			
			
			
			await this.run_algorithm("pak", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 2));
			
			array = this.arrays[index];
			plane_partition = array.numbers;
			
			
			
			//Clip out the finite part of the array.
			
			//The -1 is there to ensure the new array has the padding that indicates it's finite on the edges.
			const leg_size = Math.max(right_leg_size, bottom_leg_size);
			
			let finite_array = new Array(plane_partition.length - leg_size + 1);
			
			let cubes_to_delete = [];
			
			for (let i = 0; i < finite_array.length - 1; i++)
			{
				finite_array[i] = new Array(finite_array.length);
				
				for (let j = 0; j < finite_array.length - 1; j++)
				{
					finite_array[i][j] = plane_partition[i][j];
					
					for (let k = 0; k < plane_partition[i][j]; k++)
					{
						cubes_to_delete.push([i, j, k]);
					}
					
					plane_partition[i][j] = 0;
				}
				
				finite_array[i][finite_array.length - 1] = 0;
			}
			
			finite_array[finite_array.length - 1] = new Array(finite_array.length);
			
			for (let j = 0; j < finite_array.length; j++)
			{
				finite_array[finite_array.length - 1][j] = 0;
			}
			
			
			
			this.delete_cubes(array, cubes_to_delete, true, true);
			
			await this.add_new_array(index, finite_array);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			
			
			//Now we unPak the second array.
			
			await this.run_algorithm("pak_inverse", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 2));
			
			
	
			//We're now clear to pull apart the negative RPP from the finite part.n
			
			
			
			//In order for the bijection to actually be correct, we need to make sure the rearrangement works the same way each time. The easiest way to do this is to ensure that every hook length actually in the APP has a *full* array of possible locations, so that its index in that is correct.
			
			
			
			//Organize everything by hook length.
			let max_app_hook_length = 2 * plane_partition.length - nu_row_lengths[plane_partition.length - 1] - nu_col_lengths[plane_partition.length - 1];
			let max_rpp_hook_length = nu_row_lengths[0] + nu_col_lengths[0];
			
			let app_pivots_by_hook_length = new Array(4 * plane_partition.length);
			let rpp_pivots_by_hook_length = new Array(max_rpp_hook_length);
			let pp_pivots_by_hook_length = new Array(4 * plane_partition.length);
			
			for (let i = 0; i < 4 * plane_partition.length; i++)
			{
				app_pivots_by_hook_length[i] = new Array();
			}
			
			for (let i = 0; i < max_rpp_hook_length; i++)
			{
				rpp_pivots_by_hook_length[i] = new Array();
			}
			
			for (let i = 0; i < 4 * plane_partition.length; i++)
			{
				pp_pivots_by_hook_length[i] = new Array();
			}
			
			let pp_size = 1;
			
			//If nu = (3, 1) and the APP given is 3x3, then its maximum hook length is 5, and we need to check an 8x8 square.
			
			for (let i = 0; i < 2 * plane_partition.length; i++)
			{
				for (let j = 0; j < 2 * plane_partition.length; j++)
				{
					if (j >= nu_row_lengths[i])
					{
						app_pivots_by_hook_length[i + j + 1 - nu_row_lengths[i] - nu_col_lengths[j]].push([i, j]);
					}
					
					else
					{
						//.unshift rather than .push makes the hooks move in the correct order.
						rpp_pivots_by_hook_length[nu_row_lengths[i] + nu_col_lengths[j] - i - j - 1].unshift([rpp_size - i - 1, rpp_size - j - 1]);
					}
					
					pp_pivots_by_hook_length[i + j + 1].push([i, j]);
				}
			}
			
			
			
			let hook_map = new Array(2 * plane_partition.length);
			
			for (let i = 0; i < 2 * plane_partition.length; i++)
			{
				hook_map[i] = new Array(2 * plane_partition.length);
			}
			
			for (let i = 1; i < max_app_hook_length; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < app_pivots_by_hook_length[i].length; j++)
				{
					let row = app_pivots_by_hook_length[i][j][0];
					let col = app_pivots_by_hook_length[i][j][1];
					
					if (row < plane_partition.length - bottom_leg_size && col < plane_partition.length - right_leg_size)
					{
						for (let k = 0; k < this.arrays[index].numbers[row][col]; k++)
						{
							coordinates.push([row, col, k]);
						}
					}
					
					if (j < pp_pivots_by_hook_length[i].length)
					{
						hook_map[row][col] = [1, pp_pivots_by_hook_length[i][j]];
						
						if (row < plane_partition.length && col < plane_partition.length && this.arrays[index].numbers[row][col] > 0)
						{
							pp_size = Math.max(Math.max(pp_size, pp_pivots_by_hook_length[i][j][0] + 1), pp_pivots_by_hook_length[i][j][1] + 1);
						}
					}
					
					else
					{
						hook_map[row][col] = [0, rpp_pivots_by_hook_length[i][j - pp_pivots_by_hook_length[i].length]];
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.color_cubes(this.arrays[index], coordinates, (i - 1) / (max_app_hook_length - 1) * 6/7);
				}
			}
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 3));
			
			
			
			let rpp = new Array(rpp_size);
			
			for (let i = 0; i < rpp_size; i++)
			{
				rpp[i] = new Array(rpp_size);
				
				for (let j = 0; j < rpp_size; j++)
				{
					if (j < rpp_size - nu_row_lengths[rpp_size - i - 1])
					{
						rpp[i][j] = Infinity;
					}
					
					else
					{
						rpp[i][j] = 0;
					}
				}
			}
			
			let rpp_array = null;
			
			if (rpp_size > 0)
			{
				rpp_array = await this.add_new_array(index + 1, rpp);
				
				await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			}
			
			
			
			let pp = new Array(pp_size);
			
			for (let i = 0; i < pp_size; i++)
			{
				pp[i] = new Array(pp_size);
				
				for (let j = 0; j < pp_size; j++)
				{
					pp[i][j] = 0;
				}
			}
			
			let pp_array = await this.add_new_array(index + 2, pp);
			
			
			
			for (let i = 0; i < plane_partition.length - bottom_leg_size; i++)
			{
				for (let j = nu_row_lengths[i]; j < plane_partition.length - right_leg_size; j++)
				{
					if (this.arrays[index].numbers[i][j] > 0)
					{
						let source_coordinates = [];
						let target_coordinates = [];
						
						let target_row = hook_map[i][j][1][0];
						let target_col = hook_map[i][j][1][1];
						
						for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
						{
							source_coordinates.push([i, j, k]);
							target_coordinates.push([target_row, target_col, k]);
						}
						
						if (hook_map[i][j][0] === 0)
						{
							await this.move_cubes(this.arrays[index], source_coordinates, rpp_array, target_coordinates);
							
							rpp[target_row][target_col] = this.arrays[index].numbers[i][j];
							this.arrays[index].numbers[i][j] = 0;
						}
						
						else
						{
							await this.move_cubes(this.arrays[index], source_coordinates, pp_array, target_coordinates);
							
							pp[target_row][target_col] = this.arrays[index].numbers[i][j];
							this.arrays[index].numbers[i][j] = 0;
						}
						
						if (this.in_2d_view)
						{
							this.draw_all_2d_view_text();
						}
					}	
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 3));
			
			//Now it's time for the palindromic toggle.
			
			await this.run_algorithm("pak_inverse", index, true);
				
			if (rpp_size > 0)
			{
				await this.run_algorithm("hillman_grassl_inverse", index + 1, true);
			}	
			
			this.resolve();
		});	
	}
	
	
	
	godar_1_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			let pp_array = this.arrays[index + 1];
			let pp = pp_array.numbers;
			
			let rpp_array = this.arrays[index];
			let rpp = rpp_array.numbers;
			
			let nu_row_lengths = new Array(pp.length + 2 * rpp.length);
			let nu_col_lengths = new Array(pp.length + 2 * rpp.length);
			
			for (let i = 0; i < pp.length + 2 * rpp.length; i++)
			{
				nu_row_lengths[i] = 0;
				nu_col_lengths[i] = 0;
			}
			
			//Figure out the shape of nu.
			for (let i = 0; i < rpp.length; i++)
			{
				let j = rpp.length - 1;
				
				while (j >= 0 && rpp[i][j] !== Infinity)
				{
					j--;
				}
				
				nu_row_lengths[rpp.length - i - 1] = rpp.length - j - 1;
				
				
				
				j = rpp.length - 1;
				
				while (j >= 0 && rpp[j][i] !== Infinity)
				{
					j--;
				}
				
				nu_col_lengths[rpp.length - i - 1] = rpp.length - j - 1;
			}
			
			
			
			await this.run_algorithm("pak", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			await this.run_algorithm("pak", index + 1, true);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 3));
			
			
			
			//Uncolor everything.
			let coordinates = [];
			
			let numbers = this.arrays[index].numbers;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== Infinity)
					{
						for (let k = 0; k < numbers[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			this.uncolor_cubes(this.arrays[index], coordinates);
			
			
			
			coordinates = [];
			
			numbers = this.arrays[index + 1].numbers;
			
			for (let i = 0; i < numbers.length; i++)
			{
				for (let j = 0; j < numbers.length; j++)
				{
					if (numbers[i][j] !== Infinity)
					{
						for (let k = 0; k < numbers[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			await this.uncolor_cubes(arrays[index + 1], coordinates);
			
			
			
			//Organize everything by hook length. The largest the APP can be is determined by the maximum hook in the plane partition -- we'll narrow this down later but it suffices for now.
			let app_size = Math.max(nu_row_lengths[0], nu_col_lengths[0]) + 2 * pp.length - 1;
			let max_app_hook_length = 2 * app_size;
			let max_rpp_hook_length = nu_row_lengths[0] + nu_col_lengths[0];
			let max_pp_hook_length = 2 * pp.length;
			
			let app_pivots_by_hook_length = new Array(max_app_hook_length);
			let rpp_pivots_by_hook_length = new Array(max_rpp_hook_length);
			let pp_pivots_by_hook_length = new Array(max_pp_hook_length);
			
			for (let i = 0; i < max_app_hook_length; i++)
			{
				app_pivots_by_hook_length[i] = new Array();
			}
			
			for (let i = 0; i < max_rpp_hook_length; i++)
			{
				rpp_pivots_by_hook_length[i] = new Array();
			}
			
			for (let i = 0; i < max_pp_hook_length; i++)
			{
				pp_pivots_by_hook_length[i] = new Array(i);
				
				for (let j = 0; j < i; j++)
				{
					pp_pivots_by_hook_length[i][j] = -1;
				}
			}
			
			
			
			while (nu_row_lengths.length < app_size)
			{
				nu_row_lengths.push(0);
			}
			
			while (nu_col_lengths.length < app_size)
			{
				nu_col_lengths.push(0);
			}
			
			
			
			for (let i = 0; i < app_size; i++)
			{
				for (let j = 0; j < app_size; j++)
				{
					if (j >= nu_row_lengths[i])
					{
						app_pivots_by_hook_length[i + j + 1 - nu_row_lengths[i] - nu_col_lengths[j]].push([i, j]);
					}
					
					else
					{
						//.unshift rather than .push makes the hooks move in the correct order.
						rpp_pivots_by_hook_length[nu_row_lengths[i] + nu_col_lengths[j] - i - j - 1].unshift([rpp.length - i - 1, rpp.length - j - 1]);
					}
					
					
					
					if (i < pp.length && j < pp.length)
					{
						//We can't just use .push here -- there will be more hooks of any given length that aren't included in the square.
						pp_pivots_by_hook_length[i + j + 1][i] = [i, j];
					}	
				}
			}
			
			let pp_hook_map = new Array(pp.length);
			
			for (let i = 0; i < pp.length; i++)
			{
				pp_hook_map[i] = new Array(pp.length);
			}
			
			let rpp_hook_map = new Array(rpp.length);
			
			for (let i = 0; i < rpp.length; i++)
			{
				rpp_hook_map[i] = new Array(rpp.length);
			}
			
			
			
			app_size = 1;
			
			for (let i = 1; i < max_rpp_hook_length; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < rpp_pivots_by_hook_length[i].length; j++)
				{
					let row = rpp_pivots_by_hook_length[i][j][0];
					let col = rpp_pivots_by_hook_length[i][j][1];
					
					for (let k = 0; k < arrays[index].numbers[row][col]; k++)
					{
						coordinates.push([row, col, k]);
					}
					
					rpp_hook_map[row][col] = app_pivots_by_hook_length[i][j + pp_pivots_by_hook_length[i].length];
					
					if (this.arrays[index].numbers[row][col] !== 0)
					{
						app_size = Math.max(Math.max(app_size, rpp_hook_map[row][col][0] + 1), rpp_hook_map[row][col][1] + 1);
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.color_cubes(this.arrays[index], coordinates, (i - 1) / (max_rpp_hook_length - 1) * 6/7);
				}
			}
			
			
			
			for (let i = 1; i < max_pp_hook_length; i++)
			{
				let coordinates = [];
				
				for (let j = 0; j < pp_pivots_by_hook_length[i].length; j++)
				{
					if (pp_pivots_by_hook_length[i][j] === -1)
					{
						continue;
					}
					
					let row = pp_pivots_by_hook_length[i][j][0];
					let col = pp_pivots_by_hook_length[i][j][1];
					
					for (let k = 0; k < arrays[index + 1].numbers[row][col]; k++)
					{
						coordinates.push([row, col, k]);
					}
					
					pp_hook_map[row][col] = app_pivots_by_hook_length[i][j];
					
					if (this.arrays[index + 1].numbers[row][col] !== 0)
					{
						app_size = Math.max(Math.max(app_size, pp_hook_map[row][col][0] + 1), pp_hook_map[row][col][1] + 1);
					}
				}
				
				if (coordinates.length !== 0)
				{
					this.color_cubes(this.arrays[index + 1], coordinates, (i - 1) / (max_pp_hook_length - 1) * 6/7);
				}
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 3));
			
			
			
			let app = new Array(app_size);
			
			for (let i = 0; i < app_size; i++)
			{
				app[i] = new Array(app_size);
				
				for (let j = 0; j < app_size; j++)
				{
					if (j < nu_row_lengths[i])
					{
						app[i][j] = Infinity;
					}
					
					else
					{
						app[i][j] = 0;
					}	
				}
			}
			
			let app_array = await this.add_new_array(index + 2, app);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			
			
			for (let i = 0; i < rpp.length; i++)
			{
				for (let j = 0; j < rpp.length; j++)
				{
					if (arrays[index].numbers[i][j] > 0 && this.arrays[index].numbers[i][j] !== Infinity)
					{
						let source_coordinates = [];
						let target_coordinates = [];
						
						let target_row = rpp_hook_map[i][j][0];
						let target_col = rpp_hook_map[i][j][1];
						
						for (let k = 0; k < this.arrays[index].numbers[i][j]; k++)
						{
							source_coordinates.push([i, j, k]);
							target_coordinates.push([target_row, target_col, k]);
						}
						
						await this.move_cubes(this.arrays[index], source_coordinates, app_array, target_coordinates);
						
						app[target_row][target_col] = this.arrays[index].numbers[i][j];
						
						this.arrays[index].numbers[i][j] = 0;
						
						
						
						if (this.in_2d_view)
						{
							this.draw_all_2d_view_text();
						}
					}	
				}
			}
			
			
			
			for (let i = 0; i < pp.length; i++)
			{
				for (let j = 0; j < pp.length; j++)
				{
					if (this.arrays[index + 1].numbers[i][j] > 0 && arrays[index + 1].numbers[i][j] !== Infinity)
					{
						let source_coordinates = [];
						let target_coordinates = [];
						
						let target_row = pp_hook_map[i][j][0];
						let target_col = pp_hook_map[i][j][1];
						
						for (let k = 0; k < this.arrays[index + 1].numbers[i][j]; k++)
						{
							source_coordinates.push([i, j, k]);
							target_coordinates.push([target_row, target_col, k]);
						}
						
						
						
						await this.move_cubes(this.arrays[index + 1], source_coordinates, app_array, target_coordinates);
						
						app[target_row][target_col] = this.arrays[index + 1].numbers[i][j];
						this.arrays[index + 1].numbers[i][j] = 0;
						
						
						
						if (this.in_2d_view)
						{
							this.draw_all_2d_view_text();
						}
					}	
				}
			}
			
			
			
			await this.remove_array(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time / 2));
			
			await this.remove_array(index);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time * 3));
			
			
			
			await this.run_algorithm("pak_inverse", index, true);
			
			await new Promise((resolve, reject) => setTimeout(resolve, this.animation_time));
			
			
			
			resolve();
		});
	}
	
	
	
	//A demonstration of the n-quotient, not currently public-facing in the applet. It uses the numbers canvas to draw the appropriate edges and move them around. To call this function, the canvas should be in 2d mode but the numbers should be gone.
	draw_boundary(index, n)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (!this.in_2d_view)
			{
				await this.show_2d_view();
			}
			
			if (this.wilson_numbers.canvas.style.opacity !== "0")
			{
				await Page.Animate.change_opacity(this.wilson_numbers.canvas, 0, this.animation_time / 3);
			}
			
			this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
			
			
			
			let array = this.arrays[index];
			let plane_partition = array.numbers;
			
			let rects = [];
			
			let hue_index = 0;
			
			let j = 0;
			
			for (let i = array.footprint - 1; i >= 0; i--)
			{
				while (j < array.footprint && plane_partition[i][j] === Infinity)
				{
					//Add horizontal edges.
					if (i === array.footprint - 1 || plane_partition[i + 1][j] !== Infinity)
					{
						let h = (hue_index % n) / n;
						
						let rgb = this.wilson.utils.hsv_to_rgb(h, 1, 1);
						
						rects.push([i, j, true, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
						
						hue_index++;
					}
					
					j++;
				}
				
				//Add a vertical edge.
				let h = (hue_index % n) / n;
				
				let rgb = this.wilson.utils.hsv_to_rgb(h, 1, 1);
				
				rects.push([i, j, false, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
				
				hue_index++;
			}
			
			//Add all the horizontal edges we missed.
			let i = -1;
			
			while (j < array.footprint)
			{
				if (i === array.footprint - 1 || plane_partition[i + 1][j] !== Infinity)
				{
					let h = (hue_index % n) / n;
					
					let rgb = this.wilson.utils.hsv_to_rgb(h, 1, 1);
					
					rects.push([i, j, true, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, `]);
					
					hue_index++;
				}
				
				j++;
			}
			
			rects.forEach(rect =>
			{
				this.draw_boundary_rect(array, rect[0], rect[1], rect[2], `${rect[3]} 1)`);
			});
			
			
			
			await Page.Animate.change_opacity(this.wilson_numbers.canvas, 1, this.animation_time / 3);
			
			this.wilson_numbers.ctx.fillStyle = "rgb(255, 255, 255)";
			
			resolve(rects);
		});
	}
	
	
	
	draw_n_quotient(index, n, m, rects)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = this.arrays[index];
			
			//Fade out the ones we don't care about.
			
			let dummy = {t: 1};
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 0,
					duration: this.animation_time,
					easing: "easeOutQuad",
					
					complete: () => 
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							let opacity = index % n === m ? 1 : 0;
							
							this.draw_boundary_rect(array, rect[0], rect[1], rect[2], `${rect[3]} ${opacity})`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							let opacity = index % n === m ? 1 : dummy.t;
							
							this.draw_boundary_rect(array, rect[0], rect[1], rect[2], `${rect[3]} ${opacity})`);
						});
					}
				});
			});
			
			
			
			//Collapse the remaining ones. This assumes that the first and last rectangles are part of the endless border.
			rects = rects.filter((rect, index) => index % n === m);
			
			//If we start from the bottom-left, the only difficult thing to do is figure out the correct starting column. Thankfully, that's easy: it's just the number of vertical edges total.
			
			let num_vertical_edges = rects.filter(rect => !rect[2]).length;
			
			let target_rects = new Array(rects.length);
			
			let row = num_vertical_edges - 1;
			let col = 0;
			
			rects.forEach((rect, index) =>
			{
				target_rects[index] = [row, col];
				
				if (rect[2])
				{
					col++;
				}
				
				else
				{
					row--;
				}
			});
			
			
			
			dummy.t = 0;
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 1,
					duration: this.animation_time,
					easing: "easeInOutQuad",
					
					complete: () =>
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, target_rects[index][0], target_rects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, (1 - dummy.t) * rect[0] + dummy.t * target_rects[index][0], (1 - dummy.t) * rect[1] + dummy.t * target_rects[index][1], rect[2], `${rect[3]} 1)`);
						});
					}
				});
			});
			
			
			
			//We'll start the next animation without waiting for it so that it plays concurrently: any asymptotes where there should no longer be any need to be removed.
			
			let cubes_to_delete = [];
			
			target_rects.forEach((rect, index) =>
			{
				if (!rects[index][2])
				{
					for (let j = rect[1]; j < array.footprint; j++)
					{
						if (array.numbers[rect[0]][j] === Infinity)
						{
							for (let k = 0; k < this.infinite_height; k++)
							{
								cubes_to_delete.push([rect[0], j, k]);
							}
						}
					}
				}
			});
			
			this.delete_cubes(array, cubes_to_delete, true);
			
			
			
			//Now we'll go through and add more edges to make the whole thing look nicer.
			let bonus_rects = [];
			
			for (let i = array.footprint - 1; i > target_rects[0][0]; i--)
			{
				bonus_rects.push([i, 0, false]);
			}
			
			for (let j = target_rects[target_rects.length - 1][1]; j < array.footprint; j++)
			{
				bonus_rects.push([-1, j, true]);
			}
			
			dummy.t = 0;
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: dummy,
					t: 1,
					duration: this.animation_time / 2,
					easing: "easeInQuad",
					
					complete: () =>
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, target_rects[index][0], target_rects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						bonus_rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, rect[0], rect[1], rect[2], `${rects[0][3]} 1)`);
						});
						
						resolve();
					},
					
					update: () => 
					{
						this.wilson_numbers.ctx.clearRect(0, 0, this.wilson_numbers.canvas_width, this.wilson_numbers.canvas_height);
						
						rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, target_rects[index][0], target_rects[index][1], rect[2], `${rect[3]} 1)`);
						});
						
						bonus_rects.forEach((rect, index) =>
						{
							this.draw_boundary_rect(array, rect[0], rect[1], rect[2], `${rects[0][3]} ${dummy.t})`);
						});
					}
				});
			});
			
			
			this.wilson_numbers.ctx.fillStyle = "rgb(255, 255, 255)";
			
			resolve();
		});
	}
	
	
	
	draw_boundary_rect(array, i, j, horizontal, rgba)
	{
		let top = (this.total_array_footprint - array.footprint - 1) / 2;
		let left = array.partial_footprint_sum - array.footprint;
		
		this.wilson_numbers.ctx.fillStyle = rgba;
		
		if (horizontal)
		{
			this.wilson_numbers.ctx.fillRect(this.wilson_numbers.canvas_width * (j + left + 1) / (this.total_array_footprint + 1), this.wilson_numbers.canvas_height * (i + top + 1 + 15/16) / (this.total_array_footprint + 1) + 1, this.wilson_numbers.canvas_width / (this.total_array_footprint + 1), this.wilson_numbers.canvas_height * (1/16) / (this.total_array_footprint + 1));
		}
		
		else
		{
			this.wilson_numbers.ctx.fillRect(this.wilson_numbers.canvas_width * (j + left + 15/16) / (this.total_array_footprint + 1), this.wilson_numbers.canvas_height * (i + top + 1) / (this.total_array_footprint + 1) + 1, this.wilson_numbers.canvas_width * (1/16) / (this.total_array_footprint + 1), this.wilson_numbers.canvas_height / (this.total_array_footprint + 1));
		}
	}
}