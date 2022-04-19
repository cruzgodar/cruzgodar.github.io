!async function()
{
	"use strict";
	
	
	
	let resolution = 2000;
	
	let animation_time = 500;
	
	let options_numbers =
	{
		renderer: "cpu",
		
		canvas_width: resolution,
		canvas_height: resolution,
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas
	};
	
	let wilson_numbers = new Wilson(Page.element.querySelector("#numbers-canvas"), options_numbers);
	
	wilson_numbers.ctx.fillStyle = "rgb(255, 255, 255)";
	
	Page.element.querySelector(".wilson-fullscreen-components-container").style.setProperty("z-index", 200, "important");
	
	
	
	let options =
	{
		canvas_width: resolution,
		canvas_height: resolution
	};
	
	let wilson = new Wilson(Page.element.querySelector("#output-canvas"), options);
	
	
	
	let wilson_hidden = new Wilson(Page.element.querySelector("#hidden-canvas"), {renderer: "cpu", canvas_width: 64, canvas_height: 64});
	
	wilson_hidden.ctx.fillStyle = "rgb(63, 63, 63)";
	wilson_hidden.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden.ctx.fillStyle = "rgb(127, 127, 127)";
	wilson_hidden.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden.ctx.lineWidth = 6;
	
	
	
	let wilson_hidden_2 = new Wilson(Page.element.querySelector("#hidden-canvas-2"), {renderer: "cpu", canvas_width: 64, canvas_height: 64});
	
	wilson_hidden_2.ctx.fillStyle = "rgb(63, 63, 63)";
	wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden_2.ctx.fillStyle = "rgb(127, 127, 127)";
	wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden_2.ctx.lineWidth = 6;
	
	
	
	if (!Site.scripts_loaded["three"])
	{
		await Site.load_script("/scripts/three.min.js")
		
		.then(() =>
		{
			Site.scripts_loaded["three"] = true;
		})
		
		.catch((error) =>
		{
			console.error("Could not load THREE.js");
		});
	}
	
	
	
	let numbers_canvas_container_element = Page.element.querySelector("#numbers-canvas-container");
	
	
	
	const section_names = ["view-controls", "add-array", "remove-array", "algorithms"];
	
	const section_elements = 
	{
		"view-controls": Page.element.querySelectorAll(".view-controls-section"),
		"add-array": Page.element.querySelectorAll(".add-array-section"),
		"remove-array": Page.element.querySelectorAll(".remove-array-section"),
		"algorithms": Page.element.querySelectorAll(".algorithms-section")
	}
	
	const category_holder_element = Page.element.querySelector("#category-holder");
	const canvas_landscape_left_element = Page.element.querySelector("#canvas-landscape-left");
	
	let visible_section = "view-controls";
	
	section_names.forEach(section_name =>
	{
		if (section_name !== visible_section)
		{
			section_elements[section_name].forEach(element =>
			{
				element.style.opacity = 0;
			});
		}	
	});
	
	section_elements[visible_section].forEach(element => canvas_landscape_left_element.appendChild(element));
	
	Page.Load.TextButtons.equalize();
	setTimeout(Page.Load.TextButtons.equalize, 10);
	
	Page.Layout.AppletColumns.equalize();
	
	
	
	let category_selector_dropdown_element = Page.element.querySelector("#category-selector-dropdown");
	
	category_selector_dropdown_element.addEventListener("input", async () =>
	{
		await Promise.all(Array.from(section_elements[visible_section]).map(element => Page.Animate.change_opacity(element, 0, Site.opacity_animation_time)));
		
		section_elements[visible_section].forEach(element => category_holder_element.appendChild(element));
		
		section_elements[visible_section].forEach(element => element.classList.remove("move-to-left"));
		section_elements[visible_section].forEach(element => element.classList.remove("move-to-right"));
		
		visible_section = category_selector_dropdown_element.value;
		
		section_elements[visible_section].forEach(element => canvas_landscape_left_element.appendChild(element));
		
		Page.Load.TextButtons.equalize();
		setTimeout(Page.Load.TextButtons.equalize, 10);
		
		Page.Layout.AppletColumns.equalize();
		
		section_elements[visible_section].forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time))
	});	
	
	
	
	let show_dimers_button_element = Page.element.querySelector("#show-dimers-button");
	
	show_dimers_button_element.addEventListener("click", () =>
	{
		if (dimers_shown)
		{
			hide_dimers();
		}
		
		else
		{
			show_dimers();
		}
	});
	
	
	
	let switch_view_button_element = Page.element.querySelector("#switch-view-button");
	
	switch_view_button_element.addEventListener("click", () =>
	{
		if (in_2d_view)
		{
			show_hex_view();
		}
		
		else
		{
			show_2d_view();
		}
	});
	
	
	
	let array_data_textarea_element = Page.element.querySelector("#array-data-textarea");
	
	
	
	let add_pp_button_element = Page.element.querySelector("#add-pp-button");
	
	add_pp_button_element.addEventListener("click", () =>
	{
		let plane_partition = parse_array(array_data_textarea_element.value);
		
		if (verify_pp(plane_partition))
		{
			add_new_array(arrays.length, plane_partition, "pp");
		}
	});
	
	
	
	let add_tableau_button_element = Page.element.querySelector("#add-tableau-button");
	
	add_tableau_button_element.addEventListener("click", () =>
	{
		let tableau = parse_array(array_data_textarea_element.value);
		
		add_new_array(arrays.length, tableau, "tableau");
	});
	
	
	
	let remove_array_index_input_element = Page.element.querySelector("#remove-array-index-input");
	
	let remove_array_button_element = Page.element.querySelector("#remove-array-button");
	
	remove_array_button_element.addEventListener("click", () =>
	{
		remove_array(parseInt(remove_array_index_input_element.value));
	});
	
	
	
	let algorithm_index_input_element = Page.element.querySelector("#algorithm-index-input");
	
	let hillman_grassl_button_element = Page.element.querySelector("#hillman-grassl-button");
	
	hillman_grassl_button_element.addEventListener("click", () =>
	{
		hillman_grassl(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let hillman_grassl_inverse_button_element = Page.element.querySelector("#hillman-grassl-inverse-button");
	
	hillman_grassl_inverse_button_element.addEventListener("click", () =>
	{
		hillman_grassl_inverse(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let need_download = false;
	
	let download_button_element = Page.element.querySelector("#download-button");
	
	download_button_element.addEventListener("click", () =>
	{
		need_download = true;
	});
	
	
	
	const scene = new THREE.Scene();
	
	const orthographic_camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);
	
	
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(resolution, resolution, false);
	
	
	
	const loader = new THREE.TextureLoader();
	
	//const cube_texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	const cube_texture = new THREE.CanvasTexture(wilson_hidden.canvas);
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
	const cube_texture_2 = new THREE.CanvasTexture(wilson_hidden_2.canvas);
	cube_texture_2.minFilter = THREE.LinearFilter;
	cube_texture_2.magFilter = THREE.NearestFilter;
	
	const cube_geometry = new THREE.BoxGeometry();
	
	
	
	let dimers_shown = false;
	
	
	
	const floor_geometry = new THREE.BoxGeometry(1, .001, 1);
	
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 3, 10000);
	point_light.position.set(750, 1000, 500);
	scene.add(point_light);
	
	
	
	let rotation_y = 0;
	let rotation_y_velocity = 0;
	let last_rotation_y_velocities = [];
	
	const rotation_y_velocity_friction = .94;
	const rotation_y_velocity_start_threshhold = .005;
	const rotation_y_velocity_stop_threshhold = .0005;
	
	
	
	let in_2d_view = false;
	let in_exact_hex_view = true;
	
	let currently_animating_camera = false;
	
	let currently_running_algorithm = false;
	
	let font_size = 10;
	
	//A 1D list of the plane partitions, etc, that are stored.
	let arrays = [];
	
	let total_array_footprint = 0;
	let total_array_height = 0;
	let total_array_size = 0;
	
	let hex_view_camera_pos = [0, 0, 0];
	let _2d_view_camera_pos = [0, 0, 0];
	
	
	
	add_new_array(0, generate_random_plane_partition(), "pp");
	
	
	
	draw_frame();
	
	Page.show();
	
	
	
	function on_grab_canvas(x, y, event)
	{
		in_exact_hex_view = false;
		
		rotation_y_velocity = 0;
		
		last_rotation_y_velocities = [0, 0, 0, 0];
	}
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		if (in_2d_view)
		{
			return;
		}
		
		rotation_y += x_delta;
		
		if (rotation_y > 3.14159265)
		{
			rotation_y -= 6.283185301;
		}
		
		else if (rotation_y < -3.14159265)
		{
			rotation_y += 6.283185301;
		}
		
		scene.children.forEach(object => object.rotation.y = rotation_y);
		
		last_rotation_y_velocities.push(x_delta);
		last_rotation_y_velocities.shift();
	}
	
	function on_release_canvas(x, y, event)
	{
		if (!in_2d_view)
		{
			let max_index = 0;
			rotation_y_velocity = 0;
			
			last_rotation_y_velocities.forEach((velocity, index) =>
			{
				if (Math.abs(velocity) > rotation_y_velocity)
				{
					rotation_y_velocity = Math.abs(velocity);
					max_index = index;
				}	
			});
			
			if (rotation_y_velocity < rotation_y_velocity_start_threshhold)
			{
				rotation_y_velocity = 0;
				return;
			}
			
			rotation_y_velocity = last_rotation_y_velocities[max_index];
		}
		
		
		
		else
		{
			let row = Math.floor((1 - y) / 2 * (total_array_footprint + 1));
			let col = Math.floor((x + 1) / 2 * (total_array_footprint + 1));
			
			
		}	
	}
	
	
	
	function draw_frame()
	{
		renderer.render(scene, orthographic_camera);
		
		
		
		if (rotation_y_velocity !== 0)
		{
			rotation_y += rotation_y_velocity;
			
			scene.children.forEach(object => object.rotation.y = rotation_y);
			
			rotation_y_velocity *= rotation_y_velocity_friction;
			
			if (Math.abs(rotation_y_velocity) < rotation_y_velocity_stop_threshhold)
			{
				rotation_y_velocity = 0;
			}
		}
		
		
		
		if (rotation_y > 3.14159265)
		{
			rotation_y -= 6.283185301;
		}
		
		else if (rotation_y < -3.14159265)
		{
			rotation_y += 6.283185301;
		}
		
		
		
		if (need_download)
		{
			need_download = false;
			
			wilson.canvas.toBlob((blob) => 
			{
				let link = document.createElement("a");
				
				link.download = "a-plane-partition.png";
				
				link.href = window.URL.createObjectURL(blob);
				
				link.click();
				
				link.remove();
			});
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function generate_random_plane_partition()
	{
		let side_length = Math.floor(Math.random() * 3) + 4;
		
		let max_entry = Math.floor(Math.random() * 5) + 10;
		
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
		
		
		
		return plane_partition;
	}
	
	
	
	function generate_random_tableau()
	{
		let side_length = Math.floor(Math.random() * 3) + 4;
		
		let tableau = new Array(side_length);
		
		for (let i = 0; i < side_length; i++)
		{
			tableau[i] = new Array(side_length);
			
			for (let j = 0; j < side_length; j++)
			{
				if (Math.random() < 3 / Math.pow(side_length, 1.5))
				{
					tableau[i][j] = Math.floor(Math.random() * 2) + 1;
				}
				
				else
				{
					tableau[i][j] = 0;
				}
			}
		}
		
		return tableau;
	}
	
	
	
	//Turns a block of numbers into an array.
	function parse_array(data)
	{
		let split_data = data.split("\n");
		
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
		
		let size = Math.max(num_rows, num_cols);
		
		let array = new Array(size);
		
		
		
		for (let i = 0; i < num_rows; i++)
		{
			array[i] = new Array(size);
			
			for (let j = 0; j < split_rows[i].length; j++)
			{
				array[i][j] = parseInt(split_rows[i][j]);
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
	
	
	
	function verify_pp(plane_partition)
	{
		for (let i = 0; i < plane_partition.length - 1; i++)
		{
			for (let j = 0; j < plane_partition[i].length - 1; j++)
			{
				if (plane_partition[i][j] < plane_partition[i + 1][j] || plane_partition[i][j] < plane_partition[i][j + 1])
				{
					display_error(`Not a valid plane partition! Wrong inequality at (${i}, ${j})`);
					
					return false;
				}
			}
		}
		
		return true;
	}
	
	
	
	function display_error(message)
	{
		Page.Footer.Floating.show_settings_text(message);
	}
	
	
	
	async function add_new_array(index, numbers, type)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = {
				type: type,
				numbers: numbers,
				cubes: [],
				floor: [],
				
				cube_group: null,
				
				center_offset: 0,
				partial_footprint_sum: 0,
				
				footprint: 0,
				height: 0,
				size: 0
			};
			
			arrays.splice(index, 0, array);
			
			array.footprint = array.numbers.length;
			
			//Update the other arrays.
			for (let i = index; i < arrays.length; i++)
			{
				arrays[i].partial_footprint_sum = arrays[i].footprint;
				
				if (i !== 0)
				{
					arrays[i].center_offset = arrays[i - 1].center_offset + arrays[i - 1].footprint / 2 + arrays[i].footprint / 2 + 1;
					
					arrays[i].partial_footprint_sum += arrays[i - 1].partial_footprint_sum + 1;
				}
				
				else
				{
					arrays[i].center_offset = 0;
				}
				
				if (i !== index)
				{
					anime({
						targets: arrays[i].cube_group.position,
						x: arrays[i].center_offset,
						y: 0,
						z: -arrays[i].center_offset,
						duration: animation_time,
						easing: "easeInOutQuad"
					});
				}
			}
			
			
			
			array.cube_group = new THREE.Object3D();
			scene.add(array.cube_group);
			
			array.cube_group.position.set(array.center_offset, 0, -array.center_offset);
			
			array.cube_group.rotation.y = rotation_y;
			
			
			
			array.cubes = new Array(array.footprint);
			
			for (let i = 0; i < array.footprint; i++)
			{
				array.cubes[i] = new Array(array.footprint);
				
				for (let j = 0; j < array.footprint; j++)
				{
					array.cubes[i][j] = new Array(array.numbers[i][j]);
					
					if (array.numbers[i][j] > array.height)
					{
						array.height = array.numbers[i][j];
					}
					
					add_floor(array, j, i);
					
					for (let k = 0; k < array.numbers[i][j]; k++)
					{
						array.cubes[i][j][k] = add_cube(array, j, k, i);
					}
				}
			}
			
			array.size = Math.max(array.footprint, array.height);
			
			total_array_footprint += array.footprint + 1;
			total_array_height = Math.max(total_array_height, array.height);
			total_array_size = Math.max(total_array_footprint, total_array_height);
			
			
			
			font_size = wilson_numbers.canvas_width / (total_array_footprint + 1);
			
			let num_characters = Math.max(`${total_array_height}`.length, 2);
			
			wilson_numbers.ctx.font = `${font_size / num_characters}px monospace`;
			
			
			if (arrays.length === 1)
			{
				hex_view_camera_pos = [total_array_size, total_array_size + total_array_height / 3, total_array_size];
				_2d_view_camera_pos = [0, total_array_size + 10, 0];
				
				orthographic_camera.left = -total_array_size;
				orthographic_camera.right = total_array_size;
				orthographic_camera.top = total_array_size;
				orthographic_camera.bottom = -total_array_size;
				orthographic_camera.position.set(hex_view_camera_pos[0], hex_view_camera_pos[1], hex_view_camera_pos[2]);
				orthographic_camera.rotation.set(-0.785398163, 0.615479709, 0.523598775);
				orthographic_camera.updateProjectionMatrix();
			}
			
			else
			{
				let hex_view_camera_offset = (-arrays[0].footprint / 2 + arrays[arrays.length - 1].center_offset + arrays[arrays.length - 1].footprint / 2) / 2;
				
				hex_view_camera_pos = [total_array_size + hex_view_camera_offset, total_array_size + total_array_height / 3, total_array_size - hex_view_camera_offset];
				
				_2d_view_camera_pos = [hex_view_camera_offset, total_array_size + 10, -hex_view_camera_offset];
				
				if (in_2d_view)
				{
					await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 5);
					
					anime({
						targets: orthographic_camera.position,
						x: _2d_view_camera_pos[0],
						y: _2d_view_camera_pos[1],
						z: _2d_view_camera_pos[2],
						duration: animation_time,
						easing: "easeInOutQuad"
					});
					
					anime({
						targets: orthographic_camera,
						left: -(total_array_footprint / 2 + .5),
						right: total_array_footprint / 2 + .5,
						top: total_array_footprint / 2 + .5,
						bottom: -(total_array_footprint / 2 + .5),
						duration: animation_time,
						easing: "easeInOutQuad",
						update: () => orthographic_camera.updateProjectionMatrix()
					});
					
					setTimeout(() =>
					{
						draw_all_2d_view_text();
						
						Page.Animate.change_opacity(numbers_canvas_container_element, 1, animation_time / 5);
					}, animation_time);
				}
				
				else
				{
					anime({
						targets: orthographic_camera.position,
						x: hex_view_camera_pos[0],
						y: hex_view_camera_pos[1],
						z: hex_view_camera_pos[2],
						duration: animation_time,
						easing: "easeInOutQuad"
					});
					
					anime({
						targets: orthographic_camera,
						left: -total_array_size,
						right: total_array_size,
						top: total_array_size,
						bottom: -total_array_size,
						duration: animation_time,
						easing: "easeInOutQuad",
						update: () => orthographic_camera.updateProjectionMatrix()
					});
				}
			}
			
			
			
			if (index !== arrays.length - 1)
			{
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
			}
			
			
			
			let things_to_animate = [];
			
			array.cube_group.traverse(node =>
			{
				if (node.material)
				{
					node.material.forEach(material => things_to_animate.push(material));
				}
			});
			
			anime({
				targets: things_to_animate,
				opacity: 1,
				duration: animation_time / 2,
				easing: "easeOutQuad",
				complete: () => resolve(array)
			});
		});	
	}
	
	
	
	async function remove_array(index)
	{
		await new Promise((resolve, reject) =>
		{
			let things_to_animate = [];
			
			arrays[index].cube_group.traverse(node =>
			{
				if (node.material)
				{
					node.material.forEach(material => things_to_animate.push(material));
				}
			});		
			
			anime({
				targets: things_to_animate,
				opacity: 0,
				duration: animation_time / 2,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
		
		
			
		//Dispose of all the materials.
		for (let i = 0; i < arrays[index].cubes.length; i++)
		{
			for (let j = 0; j < arrays[index].cubes[i].length; j++)
			{
				for (let k = 0; k < arrays[index].cubes[i][j].length; k++)
				{
					if (arrays[index].cubes[i][j][k])
					{
						arrays[index].cubes[i][j][k].material.forEach(material => material.dispose());
					}	
				}
			}
		}
		
		scene.remove(arrays[index].cube_group);
		
		total_array_footprint -= arrays[index].footprint + 1;
		
		arrays.splice(index, 1);
		
		
		
		//Update the other arrays.
		for (let i = index; i < arrays.length; i++)
		{
			arrays[i].partial_footprint_sum = arrays[i].footprint;
			
			if (i !== 0)
			{
				arrays[i].center_offset = arrays[i - 1].center_offset + arrays[i - 1].footprint / 2 + arrays[i].footprint / 2 + 1;
				
				arrays[i].partial_footprint_sum += arrays[i - 1].partial_footprint_sum + 1;
			}
			
			else
			{
				arrays[i].center_offset = 0;
			}
			
			anime({
				targets: arrays[i].cube_group.position,
				x: arrays[i].center_offset,
				y: 0,
				z: -arrays[i].center_offset,
				duration: animation_time,
				easing: "easeInOutQuad"
			});	
		}
		
		
		
		total_array_height = 0;
		
		for (let i = 0; i < arrays.length; i++)
		{
			total_array_height = Math.max(total_array_height, arrays[i].height);
		}
		
		total_array_size = Math.max(total_array_footprint, total_array_height);
		
		
		
		font_size = wilson_numbers.canvas_width / (total_array_footprint + 1);
		
		let num_characters = `${total_array_height}`.length;
		
		if (num_characters === 1)
		{
			wilson_numbers.ctx.font = `${font_size * .75}px monospace`;
		}
		
		else
		{
			wilson_numbers.ctx.font = `${font_size / num_characters}px monospace`;
		}
		
		
		
		let hex_view_camera_offset = (-arrays[0].footprint / 2 + arrays[arrays.length - 1].center_offset + arrays[arrays.length - 1].footprint / 2) / 2;
		
		hex_view_camera_pos = [total_array_size + hex_view_camera_offset, total_array_size + total_array_height / 3, total_array_size - hex_view_camera_offset];
		
		_2d_view_camera_pos = [hex_view_camera_offset, total_array_size + 10, -hex_view_camera_offset];
		
		if (in_2d_view)
		{
			await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 5);
			
			anime({
				targets: orthographic_camera.position,
				x: _2d_view_camera_pos[0],
				y: _2d_view_camera_pos[1],
				z: _2d_view_camera_pos[2],
				duration: animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -(total_array_footprint / 2 + .5),
				right: total_array_footprint / 2 + .5,
				top: total_array_footprint / 2 + .5,
				bottom: -(total_array_footprint / 2 + .5),
				duration: animation_time,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix()
			});
			
			setTimeout(() =>
			{
				draw_all_2d_view_text();
				
				Page.Animate.change_opacity(numbers_canvas_container_element, 1, animation_time / 5);
			}, animation_time);
		}
		
		else
		{
			anime({
				targets: orthographic_camera.position,
				x: hex_view_camera_pos[0],
				y: hex_view_camera_pos[1],
				z: hex_view_camera_pos[2],
				duration: animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -total_array_size,
				right: total_array_size,
				top: total_array_size,
				bottom: -total_array_size,
				duration: animation_time,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix()
			});
		}
	}
	
	
	
	function add_cube(array, x, y, z)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture_2, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(0, 0, .5));
		
		const cube = new THREE.Mesh(cube_geometry, materials);
		
		array.cube_group.add(cube);
		
		cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		
		return cube;
	}
	
	
	
	function add_floor(array, x, z)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(0, 0, .2));
		
		const floor = new THREE.Mesh(floor_geometry, materials);
		
		array.cube_group.add(floor);
		
		//This aligns the thing correctly.
		floor.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		
		return floor;
	}
	
	
	
	function show_hex_view()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_animating_camera)
			{
				reject();
				return;
			}
			
			
			
			Page.Animate.change_opacity(switch_view_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				switch_view_button_element.textContent = "Show 2D View";
				
				Page.Animate.change_opacity(switch_view_button_element, 1, Site.opacity_animation_time);
			});
			
			
			
			currently_animating_camera = true;
			
			if (in_2d_view)
			{
				await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 5);
			}
			
			in_2d_view = false;
			in_exact_hex_view = true;
			
			
			
			rotation_y_velocity = 0;
			
			last_rotation_y_velocities = [0, 0, 0, 0];
			
			
			
			update_camera_height(true);
			
			anime({
				targets: orthographic_camera.rotation,
				x: -0.785398163,
				y: 0.615479709,
				z: 0.523598775,
				duration: animation_time,
				easing: "easeInOutQuad",
				complete: () =>
				{
					currently_animating_camera = false;
					resolve();
				}	
			});
			
			arrays.forEach(array =>
			{
				anime({
					targets: array.cube_group.rotation,
					y: 0,
					duration: animation_time,
					easing: "easeInOutQuad"
				});
			});
			
			rotation_y = 0;
		});	
	}
	
	function show_2d_view()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_animating_camera || in_2d_view)
			{
				reject();
				return;
			}
			
			
			
			Page.Animate.change_opacity(switch_view_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				switch_view_button_element.textContent = "Show 3D View";
				
				Page.Animate.change_opacity(switch_view_button_element, 1, Site.opacity_animation_time);
			});
			
			
			
			if (dimers_shown)
			{
				await hide_dimers();
			}
			
			
			
			currently_animating_camera = true;
			
			in_2d_view = true;
			
			in_exact_hex_view = false;
			
			
			
			rotation_y_velocity = 0;
			
			last_rotation_y_velocities = [0, 0, 0, 0];
			
			
			
			update_camera_height(true);
			
			anime({
				targets: orthographic_camera.rotation,
				x: -1.570796327,
				y: 0,
				z: 0,
				duration: animation_time,
				easing: "easeInOutQuad"
			});
			
			arrays.forEach(array =>
			{
				anime({
					targets: array.cube_group.rotation,
					y: 0,
					duration: animation_time,
					easing: "easeInOutQuad"
				});
			});
			
			
			
			setTimeout(() =>
			{
				draw_all_2d_view_text();
				
				Page.Animate.change_opacity(numbers_canvas_container_element, 1, animation_time / 5)
				
				.then(() =>
				{
					currently_animating_camera = false;
					
					resolve();
				});
			}, animation_time);
		});	
	}
	
	//Makes sure everything is in frame but doesn't affect rotation.
	function update_camera_height(force = false)
	{
		if (!force)
		{
			if (currently_animating_camera)
			{
				return;
			}
			
			currently_animating_camera = true;
		}	
		
		
		
		hex_view_camera_pos[1] = total_array_size + total_array_height / 3;
		_2d_view_camera_pos[1] = total_array_size + 10;
		
		if (in_2d_view)
		{
			anime({
				targets: orthographic_camera.position,
				x: _2d_view_camera_pos[0],
				y: _2d_view_camera_pos[1],
				z: _2d_view_camera_pos[2],
				duration: animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -(total_array_footprint / 2 + .5),
				right: total_array_footprint / 2 + .5,
				top: total_array_footprint / 2 + .5,
				bottom: -(total_array_footprint / 2 + .5),
				duration: animation_time,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix(),
				complete: () => {if (!force) {currently_animating_camera = false}}
			});
		}
		
		else
		{
			anime({
				targets: orthographic_camera.position,
				x: hex_view_camera_pos[0],
				y: hex_view_camera_pos[1],
				z: hex_view_camera_pos[2],
				duration: animation_time,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -total_array_size,
				right: total_array_size,
				top: total_array_size,
				bottom: -total_array_size,
				duration: animation_time,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix(),
				complete: () => {if (!force) {currently_animating_camera = false}}
			});
		}
	}
	
	
	
	function show_dimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_animating_camera)
			{
				reject();
				return;
			}
			
			dimers_shown = true;
			
			Page.Animate.change_opacity(show_dimers_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				show_dimers_button_element.textContent = "Hide Dimers";
				
				Page.Animate.change_opacity(show_dimers_button_element, 1, Site.opacity_animation_time);
			});
			
			
			
			if (!in_exact_hex_view)
			{
				await show_hex_view();
			}	
			
			currently_animating_camera = true;
			
			
			
			
			await new Promise((resolve, reject) =>
			{
				let temp_object = {brightness: 127};
				
				anime({
					targets: temp_object,
					brightness: 255,
					duration: animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						wilson_hidden.ctx.strokeStyle = `rgb(${temp_object.brightness}, ${temp_object.brightness}, ${temp_object.brightness})`;
						
						wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden.ctx.moveTo(42.7, 21.3);
						wilson_hidden.ctx.lineTo(21.3, 42.7);
						wilson_hidden.ctx.stroke();
						
						cube_texture.needsUpdate = true;
						
						
						
						wilson_hidden_2.ctx.strokeStyle = `rgb(${temp_object.brightness}, ${temp_object.brightness}, ${temp_object.brightness})`;
						
						wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						wilson_hidden_2.ctx.stroke();
						
						cube_texture_2.needsUpdate = true;
					}
				});
			});
			
			currently_animating_camera = false;
			
			resolve();
		});	
	}
	
	function hide_dimers()
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_animating_camera)
			{
				reject();
				return;
			}
			
			dimers_shown = false;
			
			Page.Animate.change_opacity(show_dimers_button_element, 0, Site.opacity_animation_time)
			
			.then(() =>
			{
				show_dimers_button_element.textContent = "Show Dimers";
				
				Page.Animate.change_opacity(show_dimers_button_element, 1, Site.opacity_animation_time);
			});
			
			currently_animating_camera = true;
			
			
			
			await new Promise((resolve, reject) =>
			{
				let temp_object = {brightness: 255};
				
				anime({
					targets: temp_object,
					brightness: 127,
					duration: animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						wilson_hidden.ctx.strokeStyle = `rgb(${temp_object.brightness}, ${temp_object.brightness}, ${temp_object.brightness})`;
						
						wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden.ctx.moveTo(42.7, 21.3);
						wilson_hidden.ctx.lineTo(21.3, 42.7);
						wilson_hidden.ctx.stroke();
						
						cube_texture.needsUpdate = true;
						
						
						
						wilson_hidden_2.ctx.strokeStyle = `rgb(${temp_object.brightness}, ${temp_object.brightness}, ${temp_object.brightness})`;
						
						wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						wilson_hidden_2.ctx.stroke();
						
						cube_texture_2.needsUpdate = true;
					}
				});
			});
			
			
			
			currently_animating_camera = false;
			
			resolve();
		});	
	}
	
	
	
	//Goes through and recomputes the sizes of array and then the total array sizes.
	function recalculate_heights(array)
	{
		array.numbers.forEach(row => row.forEach(entry => array.height = Math.max(entry, array.height)));
		
		array.size = Math.max(array.footprint, array.height);
		
		
		
		let old_total_array_height = total_array_height;
		
		if (array.height >= total_array_height)
		{
			total_array_height = array.height;
		}
		
		else
		{
			total_array_height = 0;
			
			arrays.forEach(array => total_array_height = Math.max(array.height, total_array_height));
		}
		
		total_array_size = Math.max(total_array_footprint, total_array_height);
		
		if (total_array_height !== old_total_array_height);
		{
			update_camera_height();
		}
	}
	
	
	
	function draw_all_2d_view_text()
	{
		wilson_numbers.ctx.clearRect(0, 0, wilson_numbers.canvas_width, wilson_numbers.canvas_height);
		
		arrays.forEach(array =>
		{
			let top = total_array_footprint - array.partial_footprint_sum - 1;
			let left = array.partial_footprint_sum - array.footprint;
			
			//Show the numbers in the right places.
			for (let i = 0; i < array.footprint; i++)
			{
				for (let j = 0; j < array.footprint; j++)
				{
					draw_single_cell_2d_view_text(array, i, j, top, left);
				}
			}
		});
	}
	
	function draw_single_cell_2d_view_text(array, row, col, top, left)
	{
		wilson_numbers.ctx.clearRect(font_size * (col + left + 1), font_size * (row + top + 1), font_size, font_size);
		
		let text_metrics = wilson_numbers.ctx.measureText(array.numbers[row][col]);
		
		//The height adjustment is an annoying spacing computation.
		wilson_numbers.ctx.fillText(array.numbers[row][col], font_size * (col + left + 1) + (font_size - text_metrics.width) / 2, font_size * (row + top + 1) + (font_size + text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent) / 2);
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	function color_cubes(array, coordinates, hue)
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
				s: 1,
				duration: animation_time,
				delay: (element, index) => Math.floor(index / 6) * animation_time / 10,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setHSL(hue, color.s, .5)),
				complete: resolve
			});
		});
	}
	
	
	
	function uncolor_cubes(array, coordinates)
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
				duration: animation_time,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setHSL(color.h, color.s, .5)),
				complete: resolve
			});
		});
	}
	
	
	
	//Lifts the specified cubes to the specified height. The animation is skipped in 2d mode.
	function raise_cubes(array, coordinates, height)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = in_2d_view ? 0 : animation_time;
			
			let targets = [];
			
			coordinates.forEach(xyz => targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position));
			
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
	function lower_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = in_2d_view ? 0 : animation_time;
			
			let targets = [];
			
			coordinates.forEach(xyz => targets.push(array.cubes[xyz[0]][xyz[1]][xyz[2]].position));
			
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
	function move_cubes(source_array, source_coordinates, target_array, target_coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let targets = [];
			
			source_coordinates.forEach(xyz =>
			{
				targets.push(source_array.cubes[xyz[0]][xyz[1]][xyz[2]].position);
				target_array.cube_group.attach(source_array.cubes[xyz[0]][xyz[1]][xyz[2]]);
			});
			
			
			anime({
				targets: targets,
				x: (element, index) => target_coordinates[index][1] - (target_array.footprint - 1) / 2,
				y: (element, index) => target_coordinates[index][2],
				z: (element, index) => target_coordinates[index][0] - (target_array.footprint - 1) / 2,
				duration: animation_time,
				easing: "easeInOutQuad",
				complete: () =>
				{
					target_coordinates.forEach((xyz, index) =>
					{
						if (target_array.cubes[xyz[0]][xyz[1]][xyz[2]])
						{
							console.warn(`Moving a cube to a location that's already occupied: ${xyz}. This is probably not what you want to do.`);
						}
						
						target_array.cubes[xyz[0]][xyz[1]][xyz[2]] = source_array.cubes[source_coordinates[index][0]][source_coordinates[index][1]][source_coordinates[index][2]];
						
						source_array.cubes[source_coordinates[index][0]][source_coordinates[index][1]][source_coordinates[index][2]] = null;
					});
					
					resolve();
				}
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to 1.
	function reveal_cubes(array, coordinates)
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
			});
			
			anime({
				targets: targets,
				opacity: 1,
				duration: animation_time / 2,
				delay: (element, index) => Math.floor(index / 6) * animation_time / 10,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	}
	
	
	
	//Fades the specified cubes' opacity to zero, and then deletes them.
	function delete_cubes(array, coordinates)
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
				duration: animation_time / 2,
				delay: (element, index) => Math.floor(index / 6) * animation_time / 10,
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
	
	
	
	async function hillman_grassl(index)
	{
		if (currently_running_algorithm)
		{
			return;
		}
		
		currently_running_algorithm = true;
		
		
		
		let array = arrays[index];
		
		if (array.type !== "pp")
		{
			display_error(`Array at index ${index} is not a plane partition!`);
			
			currently_running_algorithm = false;
			
			return;
		}
		
		let plane_partition = JSON.parse(JSON.stringify(array.numbers));
		
		
		
		let coordinates = [];
		
		//Remove any color that's here.
		for (let i = 0; i < plane_partition.length; i++)
		{
			for (let j = 0; j < plane_partition.length; j++)
			{
				for (let k = 0; k < plane_partition[i][j]; k++)
				{
					coordinates.push([i, j, k]);
				}
			}
		}
		
		uncolor_cubes(array, coordinates);
		
		
		
		let zigzag_paths = [];
		
		while (true)
		{
			//Find the right-most nonzero entry in the top row.
			let starting_col = plane_partition[0].length - 1;
			
			while (starting_col >= 0 && plane_partition[0][starting_col] === 0)
			{
				starting_col--;
			}
			
			if (starting_col < 0)
			{
				break;
			}
			
			
			
			let current_row = 0;
			let current_col = starting_col;
			
			let path = [[current_row, current_col, plane_partition[current_row][current_col] - 1]];
			
			while (true)
			{
				if (current_row < plane_partition.length - 1 && plane_partition[current_row + 1][current_col] === plane_partition[current_row][current_col])
				{
					current_row++;
				}
				
				else if (current_col > 0)
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
				empty_array[i][j] = 0;
			}
		}
		
		let output_array = await add_new_array(index + 1, empty_array, "tableau");
		
		await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
		
		
		
		//Now we'll animate those paths actually decrementing, one-by-one.
		for (let i = 0; i < zigzag_paths.length; i++)
		{
			let hue = i / zigzag_paths.length * 6/7;
			
			await color_cubes(array, zigzag_paths[i], hue);
			
			
			
			//Lift all the cubes up. There's no need to do this if we're in the 2d view.
			await raise_cubes(array, zigzag_paths[i], array.numbers[0][0]);
			
			
			
			let top = total_array_footprint - array.partial_footprint_sum - 1;
			let left = array.partial_footprint_sum - array.footprint;
			
			//Now we actually delete the cubes.
			for (let j = 0; j < zigzag_paths[i].length; j++)
			{
				array.numbers[zigzag_paths[i][j][0]][zigzag_paths[i][j][1]]--;
				
				if (in_2d_view)
				{
					draw_single_cell_2d_view_text(array, zigzag_paths[i][j][0], zigzag_paths[i][j][1], top, left);
				}	
			}
			
			recalculate_heights(array);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 5));
			
			//Find the pivot and rearrange the shape into a hook.
			let pivot = [zigzag_paths[i][zigzag_paths[i].length - 1][0], zigzag_paths[i][0][1]];
			
			let target_coordinates = new Array(zigzag_paths[i].length);
			
			let target_height = output_array.height + 1;
			
			for (let j = 0; j <= pivot[0]; j++)
			{
				target_coordinates[j] = [j, pivot[1], target_height];
			}
			
			for (let j = pivot[0] + 1; j < zigzag_paths[i].length; j++)
			{
				target_coordinates[j] = [pivot[0], pivot[1] - (j - pivot[0]), target_height];
			}
			
			let pivot_coordinates = target_coordinates[pivot[0]];
			
			await move_cubes(array, zigzag_paths[i], output_array, target_coordinates);
			
			
			
			//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
			target_coordinates = [];
			
			for (let j = 1; j <= pivot[0]; j++)
			{
				target_coordinates.push([pivot[0] - j, pivot[1], target_height]);
			}
			
			delete_cubes(output_array, target_coordinates);
			
			target_coordinates = [];
			
			for (let j = 1; j <= pivot[1]; j++)
			{
				target_coordinates.push([pivot[0], pivot[1] - j, target_height]);
			}
			
			delete_cubes(output_array, target_coordinates);
			
			
			
			await lower_cubes(output_array, [pivot_coordinates]);
			
			
			
			top = total_array_footprint - output_array.partial_footprint_sum - 1;
			left = output_array.partial_footprint_sum - output_array.footprint;
			
			output_array.numbers[pivot_coordinates[0]][pivot_coordinates[1]]++;
			
			recalculate_heights(output_array);
			
			if (in_2d_view)
			{
				draw_single_cell_2d_view_text(output_array, pivot_coordinates[0], pivot_coordinates[1], top, left);
			}
			
			output_array.height = Math.max(output_array.height, output_array.numbers[pivot_coordinates[0]][pivot_coordinates[1]]);
			
			output_array.size = Math.max(output_array.size, output_array.height);
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
		}
		
		
		
		remove_array(index);
		
		currently_running_algorithm = false;
	}
	
	
	
	async function hillman_grassl_inverse(index)
	{
		if (currently_running_algorithm)
		{
			return;
		}
		
		currently_running_algorithm = true;
		
		
		
		let array = arrays[index];
		
		if (array.type !== "tableau")
		{
			display_error(`Array at index ${index} is not a tableau!`);
			
			currently_running_algorithm = false;
			
			return;
		}
		
		let tableau = JSON.parse(JSON.stringify(array.numbers));
		
		let zigzag_paths = [];
		
		
		
		let coordinates = [];
		
		//Remove any color that's here.
		for (let i = 0; i < tableau.length; i++)
		{
			for (let j = 0; j < tableau.length; j++)
			{
				for (let k = 0; k < tableau[i][j]; k++)
				{
					coordinates.push([i, j, k]);
				}
			}
		}
		
		uncolor_cubes(array, coordinates);
			
		
		
		let empty_array = new Array(tableau.length);
		
		for (let i = 0; i < tableau.length; i++)
		{
			empty_array[i] = new Array(tableau.length);
			
			for (let j = 0; j < tableau.length; j++)
			{
				empty_array[i][j] = 0;
			}
		}
		
		let plane_partition = JSON.parse(JSON.stringify(empty_array));
		
		let output_array = await add_new_array(index + 1, empty_array, "pp");
		
		
		
		//Loop through the tableau in weirdo lex order and reassemble the paths.
		for (let j = 0; j < tableau.length; j++)
		{
			for (let i = tableau[j].length - 1; i >= 0; i--)
			{
				while (tableau[i][j] !== 0)
				{
					let path = [];
					
					let current_row = i;
					let current_col = 0;
					
					while (current_row >= 0)
					{
						//Go up at the last possible place with a matching entry.
						let k = current_col;
						
						if (current_row !== 0)
						{
							while (plane_partition[current_row][k] !== plane_partition[current_row - 1][k])
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
						
						current_row--;
						current_col = k;
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
		
		
		
		await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
		
		
		
		//Now we'll animate those paths actually incrementing, one-by-one.
		for (let i = 0; i < zigzag_paths.length; i++)
		{
			let hue = i / zigzag_paths.length * 6/7;
			
			await color_cubes(array, [zigzag_paths[i][1]], hue);
			
			
			
			let row = zigzag_paths[i][1][0];
			let col = zigzag_paths[i][1][1];
			let height = array.size;
			
			//Add a bunch of cubes corresponding to the hook that this thing is a part of.
			for (let j = 0; j < row; j++)
			{
				array.cubes[j][col][height] = add_cube(array, col, height, j);
				array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, .5));
			}
			
			for (let j = 0; j < col; j++)
			{
				array.cubes[row][j][height] = add_cube(array, j, height, row);
				array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, .5));
			}
			
			
			
			await raise_cubes(array, [zigzag_paths[i][1]], height);
			
			
			
			let coordinates = [];
			
			for (let j = 1; j <= row; j++)
			{
				coordinates.push([row - j, col, height]);
			}
			
			let promise_1 = reveal_cubes(array, coordinates);
			
			coordinates = [];
			
			for (let j = 1; j <= col; j++)
			{
				coordinates.push([row, col - j, height]);
			}
			
			let promise_2 = reveal_cubes(array, coordinates);
			
			await Promise.all([promise_1, promise_2]);
			
			
			
			//The coordinates now need to be in a different order to match the zigzag path.
			coordinates = [];
			
			for (let j = 0; j < col; j++)
			{
				coordinates.push([row, j, height]);
			}
			
			coordinates.push([row, col, array.numbers[row][col] - 1]);
			
			for (let j = row - 1; j >= 0; j--)
			{
				coordinates.push([j, col, height]);
			}
			
			let target_coordinates = zigzag_paths[i][0];
			
			let target_height = output_array.height + 1;
			
			target_coordinates.forEach(entry => entry[2] = target_height);
			
			array.numbers[row][col]--;
			
			recalculate_heights(array);
			
			if (in_2d_view)
			{
				let top = total_array_footprint - array.partial_footprint_sum - 1;
				let left = array.partial_footprint_sum - array.footprint;
				
				draw_single_cell_2d_view_text(array, row, col, top, left);
			}
			
			await move_cubes(array, coordinates, output_array, target_coordinates);
			
			
			
			await lower_cubes(output_array, target_coordinates);
			
			target_coordinates.forEach((entry) =>
			{
				output_array.numbers[entry[0]][entry[1]]++;
			});
			
			recalculate_heights(output_array);
			
			if (in_2d_view)
			{
				let top = total_array_footprint - output_array.partial_footprint_sum - 1;
				let left = output_array.partial_footprint_sum - output_array.footprint;
				
				target_coordinates.forEach((entry) =>
				{
					draw_single_cell_2d_view_text(output_array, entry[0], entry[1], top, left)
				});
			}
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
		}
		
		
		
		remove_array(index);
		
		currently_running_algorithm = false;
	}
}()