!async function()
{
	"use strict";
	
	
	
	if (!Site.scripts_loaded["lodash"])
	{
		Site.load_script("/scripts/lodash.min.js")
		
		.then(() =>
		{
			Site.scripts_loaded["lodash"] = true;
		})
		
		.catch((error) =>
		{
			console.error("Could not load Lodash");
		});
	}
	
	
	
	let resolution = 2000;
	
	let animation_time = 600;
	
	const asymptote_lightness = .6;
	const cube_lightness = .4;
	const floor_lightness = .4;
	
	const infinite_height = 100;
	
	const add_walls = false;
	const wall_size = 30;
	
	
	
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
	
	wilson_hidden.ctx.strokeStyle = "rgb(255, 255, 255)";
	wilson_hidden.ctx._alpha = 1;
	
	wilson_hidden.ctx.fillStyle = "rgba(64, 64, 64, 1)"
	wilson_hidden.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden.ctx.fillStyle = "rgba(128, 128, 128, 1)"
	wilson_hidden.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden.ctx.lineWidth = 6;
	
	
	
	let wilson_hidden_2 = new Wilson(Page.element.querySelector("#hidden-canvas-2"), {renderer: "cpu", canvas_width: 64, canvas_height: 64});
	
	wilson_hidden_2.ctx.strokeStyle = "rgb(255, 255, 255)";
	wilson_hidden_2.ctx._alpha = 1;
	
	wilson_hidden_2.ctx.fillStyle = "rgba(64, 64, 64, 1)"
	wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden_2.ctx.fillStyle = "rgba(128, 128, 128, 1)"
	wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden_2.ctx.lineWidth = 6;
	
	
	
	let wilson_hidden_3 = new Wilson(Page.element.querySelector("#hidden-canvas-3"), {renderer: "cpu", canvas_width: 64, canvas_height: 64});
	
	wilson_hidden_3.ctx.strokeStyle = "rgb(255, 255, 255)";
	wilson_hidden_3.ctx._alpha = 1;
	
	wilson_hidden_3.ctx.fillStyle = "rgba(32, 32, 32, 1)"
	wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden_3.ctx.fillStyle = "rgba(64, 64, 64, 1)"
	wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden_3.ctx.lineWidth = 6;
	
	
	
	let wilson_hidden_4 = new Wilson(Page.element.querySelector("#hidden-canvas-4"), {renderer: "cpu", canvas_width: 64, canvas_height: 64});
	
	wilson_hidden_4.ctx.strokeStyle = "rgb(255, 255, 255)";
	wilson_hidden_4.ctx._alpha = 1;
	
	wilson_hidden_4.ctx.fillStyle = "rgb(32, 32, 32)"
	wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
	
	wilson_hidden_4.ctx.fillStyle = "rgb(64, 64, 64)";
	wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
	
	wilson_hidden_4.ctx.lineWidth = 6;
	
	
	
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
	
	
	
	const section_names = ["view-controls", "add-array", "edit-array", "remove-array", "algorithms"];
	
	const section_elements = 
	{
		"view-controls": Page.element.querySelectorAll(".view-controls-section"),
		"add-array": Page.element.querySelectorAll(".add-array-section"),
		"edit-array": Page.element.querySelectorAll(".edit-array-section"),
		"remove-array": Page.element.querySelectorAll(".remove-array-section"),
		"algorithms": Page.element.querySelectorAll(".algorithms-section"),
		"examples": Page.element.querySelectorAll(".examples-section")
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
	
	if (Page.Layout.aspect_ratio > 1)
	{
		Page.Layout.AppletColumns.equalize();
	}
	
	
	
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
		
		if (Page.Layout.aspect_ratio > 1)
		{
			Page.Layout.AppletColumns.equalize();
		}
		
		if (visible_section === "edit-array")
		{
			let index = parseInt(edit_array_index_input_element.value || 0);
		
			if (index < arrays.length && index >= 0)
			{
				edit_array_textarea_element.value = array_to_ascii(arrays[index].numbers);
			}
		}
		
		section_elements[visible_section].forEach(element => Page.Animate.change_opacity(element, 1, Site.opacity_animation_time))
	});
	
	
	
	let resolution_input_element = Page.element.querySelector("#resolution-input");
	
	resolution_input_element.addEventListener("input", () =>
	{
		resolution = parseInt(resolution_input_element.value || 2000);
		
		renderer.setSize(resolution, resolution, false);
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
	
	
	
	let maximum_speed_checkbox_element = Page.element.querySelector("#maximum-speed-checkbox");
	
	maximum_speed_checkbox_element.addEventListener("input", () =>
	{
		animation_time = maximum_speed_checkbox_element.checked ? 60 : 600;
	});
	
	
	
	let array_data_textarea_element = Page.element.querySelector("#array-data-textarea");
	
	array_data_textarea_element.value = generate_random_plane_partition();
	
	
	
	let add_array_button_element = Page.element.querySelector("#add-array-button");
	
	add_array_button_element.addEventListener("click", () =>
	{
		add_new_array(arrays.length, parse_array(array_data_textarea_element.value));
	});
	
	
	
	let edit_array_textarea_element = Page.element.querySelector("#edit-array-textarea");
	
	
	
	let edit_array_index_input_element = Page.element.querySelector("#edit-array-index-input");
	
	edit_array_index_input_element.addEventListener("input", () =>
	{
		let index = parseInt(edit_array_index_input_element.value || 0);
		
		if (index >= arrays.length || index < 0)
		{
			return;
		}
		
		edit_array_textarea_element.value = array_to_ascii(arrays[index].numbers);
	});
	
	
	
	let edit_array_button_element = Page.element.querySelector("#edit-array-button");
	
	edit_array_button_element.addEventListener("click", edit_array);
	
	
	
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
	
	
	
	let pak_button_element = Page.element.querySelector("#pak-button");
	
	pak_button_element.addEventListener("click", () =>
	{
		pak(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let pak_inverse_button_element = Page.element.querySelector("#pak-inverse-button");
	
	pak_inverse_button_element.addEventListener("click", () =>
	{
		pak_inverse(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let sulzgruber_button_element = Page.element.querySelector("#sulzgruber-button");
	
	sulzgruber_button_element.addEventListener("click", () =>
	{
		sulzgruber(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let sulzgruber_inverse_button_element = Page.element.querySelector("#sulzgruber-inverse-button");
	
	sulzgruber_inverse_button_element.addEventListener("click", () =>
	{
		sulzgruber_inverse(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let rsk_button_element = Page.element.querySelector("#rsk-button");
	
	rsk_button_element.addEventListener("click", () =>
	{
		rsk(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let rsk_inverse_button_element = Page.element.querySelector("#rsk-inverse-button");
	
	rsk_inverse_button_element.addEventListener("click", () =>
	{
		rsk_inverse(parseInt(algorithm_index_input_element.value));
	});
	
	
	
	let example_1_button_element = Page.element.querySelector("#example-1-button");
	
	example_1_button_element.addEventListener("click", () =>
	{
		run_example(1);
	});
	
	let example_2_button_element = Page.element.querySelector("#example-2-button");
	
	example_2_button_element.addEventListener("click", () =>
	{
		run_example(2);
	});
	
	let example_3_button_element = Page.element.querySelector("#example-3-button");
	
	example_3_button_element.addEventListener("click", () =>
	{
		run_example(3);
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
	
	const cube_texture = new THREE.CanvasTexture(wilson_hidden.canvas);
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
	const cube_texture_2 = new THREE.CanvasTexture(wilson_hidden_2.canvas);
	cube_texture_2.minFilter = THREE.LinearFilter;
	cube_texture_2.magFilter = THREE.NearestFilter;
	
	const floor_texture = new THREE.CanvasTexture(wilson_hidden_3.canvas);
	floor_texture.minFilter = THREE.LinearFilter;
	floor_texture.magFilter = THREE.NearestFilter;
	
	const floor_texture_2 = new THREE.CanvasTexture(wilson_hidden_4.canvas);
	floor_texture_2.minFilter = THREE.LinearFilter;
	floor_texture_2.magFilter = THREE.NearestFilter;
	
	const cube_geometry = new THREE.BoxGeometry();
	
	
	
	let dimers_shown = false;
	
	
	
	const floor_geometry = new THREE.BoxGeometry(1, .001, 1);
	const wall_left_geometry = new THREE.BoxGeometry(.001, 1, 1);
	const wall_right_geometry = new THREE.BoxGeometry(1, 1, .001);
	
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 3, 10000);
	point_light.position.set(750, 1000, 500);
	scene.add(point_light);
	
	
	
	let rotation_y = 0;
	let rotation_y_velocity = 0;
	let next_rotation_y_velocity = 0;
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
	
	let hex_view_camera_pos = [15, 15, 15];
	let _2d_view_camera_pos = [0, 20, 0];
	
	
	
	let plane_partition = parse_array(array_data_textarea_element.value);
	edit_array_textarea_element.value = array_data_textarea_element.value;
	add_new_array(arrays.length, plane_partition, "pp");
	
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
		
		next_rotation_y_velocity = x_delta;
	}
	
	function on_release_canvas(x, y, event)
	{
		if (!in_2d_view)
		{
			let max_index = 0;
			
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
		
		last_rotation_y_velocities = [0, 0, 0, 0];
	}
	
	
	
	function draw_frame()
	{
		renderer.render(scene, orthographic_camera);
		
		
		
		last_rotation_y_velocities.push(next_rotation_y_velocity);
		last_rotation_y_velocities.shift();
		
		next_rotation_y_velocity = 0;
		
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
		
		//Now convert to a string.
		
		let output_string = "";
		
		for (let i = 0; i < side_length; i++)
		{
			for (let j = 0; j < side_length; j++)
			{
				let entry = plane_partition[i][j];
				
				if (entry === 0)
				{
					output_string += "   ";
				}
				
				else if (entry < 10)
				{
					output_string += ` ${entry} `;
				}
				
				else
				{
					output_string += `${entry} `;
				}
			}
			
			if (i !== side_length - 1)
			{
				output_string += "\n";
			}	
		}
		
		return output_string;
	}
	
	
	
	//Does not return a string, unlike the previous function.
	function generate_random_tableau()
	{
		let side_length = Math.floor(Math.random() * 3) + 4;
		
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
		
		return tableau;
	}
	
	
	
	//Also doesn't return a string.
	function generate_random_ssyt()
	{
		let side_length = Math.floor(Math.random() * 3) + 2;
		
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
				if (split_rows[i][j] === "^")
				{
					array[i][j] = Infinity;
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
	
	
	
	function array_to_ascii(numbers)
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
		
		for (let i = 0; i < numbers.length; i++)
		{
			for (let j = 0; j < numbers.length; j++)
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
			
			if (i !== numbers.length - 1)
			{
				text += "\n";
			}	
		}
		
		return text;
	}
	
	
	
	function verify_pp(plane_partition)
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
	
	
	
	function verify_ssyt(ssyt)
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
	
	
	
	function display_error(message)
	{
		Page.Footer.Floating.show_settings_text(message);
	}
	
	
	
	function add_new_array(index, numbers)
	{
		return new Promise(async (resolve, reject) =>
		{
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
			
			if (in_2d_view)
			{
				await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 5);
			}
			
			
			
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
			
			if (!add_walls)
			{
				array.cube_group.position.set(array.center_offset, 0, -array.center_offset);
			}
			
			array.cube_group.rotation.y = rotation_y;
			
			
			
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
						
						array.floor[i][j] = add_floor(array, j, i);
						
						for (let k = 0; k < array.numbers[i][j]; k++)
						{
							array.cubes[i][j][k] = add_cube(array, j, k, i);
						}
					}
					
					
					else
					{
						array.cubes[i][j] = new Array(infinite_height);
						
						array.floor[i][j] = add_floor(array, j, i);
						
						for (let k = 0; k < infinite_height; k++)
						{
							array.cubes[i][j][k] = add_cube(array, j, k, i, 0, 0, asymptote_lightness);
						}
					}	
				}
			}
			
			
			
			//Add walls. Disabled by default.
			if (add_walls)
			{
				array.left_wall = new Array(wall_size);
				array.right_wall = new Array(wall_size);
				
				for (let i = 0; i < wall_size; i++)
				{
					array.left_wall[i] = new Array(wall_size);
					array.right_wall[i] = new Array(wall_size);
				}
					
				for (let i = 0; i < wall_size; i++)
				{
					for (let j = 0; j < wall_size; j++)
					{
						array.left_wall[i][j] = add_left_wall(array, j, i);
						array.right_wall[i][j] = add_right_wall(array, i, j);
						
						if (i >= array.footprint || j >= array.footprint)
						{
							add_floor(array, i, j);
						}
					}
				}
			}
			
			
			array.size = Math.max(array.footprint, array.height);
			
			total_array_footprint += array.footprint + 1;
			total_array_height = Math.max(total_array_height, array.height);
			total_array_size = Math.max(total_array_footprint, total_array_height);
			
			
			
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
			
			else if (!add_walls)
			{
				update_camera_height(true);
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
			
			await new Promise(async (resolve, reject) =>
			{
				anime({
					targets: things_to_animate,
					opacity: 1,
					duration: animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve
				});
			});
			
			
			
			if (in_2d_view)
			{
				draw_all_2d_view_text();
			}
			
			resolve(array);
		});	
	}
	
	
	
	function edit_array()
	{
		return new Promise(async (resolve, reject) =>
		{
			let index = parseInt(edit_array_index_input_element.value);
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				return;
			}
			
			let array = arrays[index];
			
			let new_numbers = parse_array(edit_array_textarea_element.value);
			
			
			
			await remove_array(index);
			
			await add_new_array(index, new_numbers);
			
			update_camera_height();
			
			resolve();
		});	
	}
	
	
	
	function remove_array(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				return;
			}
			
			
			
			if (in_2d_view)
			{
				await Page.Animate.change_opacity(numbers_canvas_container_element, 0, animation_time / 5);
			}
			
			
			
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
					if (arrays[index].cubes[i][j])
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
			
			
			if (arrays.length !== 0)
			{
				update_camera_height(true);
			}	
			
			resolve();
		});	
	}
	
	
	
	function add_cube(array, x, y, z, h = 0, s = 0, v = cube_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: cube_texture_2, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const cube = new THREE.Mesh(cube_geometry, materials);
		
		array.cube_group.add(cube);
		
		if (add_walls)
		{
			cube.position.set(x, y, z);
		}
		
		else
		{
			cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}	
		
		return cube;
	}
	
	
	
	function add_floor(array, x, z, h = 0, s = 0, v = floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const floor = new THREE.Mesh(floor_geometry, materials);
		
		array.cube_group.add(floor);
		
		//This aligns the thing correctly.
		if (add_walls)
		{
			floor.position.set(x, -.5 - .0005, z);
		}
		
		else
		{
			floor.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		}
		
		return floor;
	}
	
	
	
	function add_left_wall(array, y, z, h = 0, s = 0, v = floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(wall_left_geometry, materials);
		
		array.cube_group.add(wall);
		
		//This aligns the thing correctly.
		if (add_walls)
		{
			wall.position.set(-.5 - .0005, y, z);
		}
		
		else
		{
			wall.position.set(-.5 - .0005 - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		}
		
		return wall;
	}
	
	
	
	function add_right_wall(array, x, y, h = 0, s = 0, v = floor_lightness)
	{
		const materials = [
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0}),
			new THREE.MeshStandardMaterial({map: floor_texture_2, transparent: true, opacity: 0})
		];

		materials.forEach(material => material.color.setHSL(h, s, v));
		
		const wall = new THREE.Mesh(wall_right_geometry, materials);
		
		array.cube_group.add(wall);
		
		//This aligns the thing correctly.
		if (add_walls)
		{
			wall.position.set(x, y, -.5 - .0005);
		}
		
		else
		{
			wall.position.set(x - (array.footprint - 1) / 2, y, -.5 - .0005 - (array.footprint - 1) / 2);
		}	
		
		return wall;
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
					
					rotation_y = 0;
					
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
		
		
		
		total_array_height = 0;
		
		for (let i = 0; i < arrays.length; i++)
		{
			total_array_height = Math.max(total_array_height, arrays[i].height);
		}
		
		total_array_size = Math.max(total_array_footprint, total_array_height);
		
		
		
		let hex_view_camera_offset = (-arrays[0].footprint / 2 + arrays[arrays.length - 1].center_offset + arrays[arrays.length - 1].footprint / 2) / 2;
		
		hex_view_camera_pos = [total_array_size + hex_view_camera_offset, total_array_size + total_array_height / 3, total_array_size - hex_view_camera_offset];
		
		_2d_view_camera_pos = [hex_view_camera_offset, total_array_size + 10, -hex_view_camera_offset];	
		
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
				complete: () => currently_animating_camera = false
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
				update: () => orthographic_camera.updateProjectionMatrix(),
				complete: () => currently_animating_camera = false
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
			
			
			
			let targets = [];
			
			//Hide everything not visible by the camera.
			arrays.forEach(array =>
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
				
				
				
				if (add_walls)
				{
					for (let i = 0; i < array.footprint; i++)
					{
						let j = 0;
						
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							targets.push(array.left_wall[i][k].material[0]);
						}
					}
					
					
					
					for (let j = 0; j < array.footprint; j++)
					{
						let i = 0;
						
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							targets.push(array.right_wall[j][k].material[4]);
						}
					}
				}	
			});
			
			targets.forEach(material => material.opacity = 0);
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [wilson_hidden.ctx, wilson_hidden_2.ctx, wilson_hidden_3.ctx, wilson_hidden_4.ctx],
					strokeStyle: "rgba(255, 255, 255, 1)",
					_alpha: 0,
					duration: animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						wilson_hidden.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden.ctx._alpha})`;
						wilson_hidden.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden.ctx.fillStyle = `rgba(128, 128, 128, ${wilson_hidden.ctx._alpha})`;
						wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden.ctx.moveTo(42.7, 21.3);
						wilson_hidden.ctx.lineTo(21.3, 42.7);
						wilson_hidden.ctx.stroke();
						
						cube_texture.needsUpdate = true;
						
						
						
						wilson_hidden_2.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_2.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_2.ctx._alpha})`;
						wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_2.ctx.fillStyle = `rgba(128, 128, 128, ${wilson_hidden_2.ctx._alpha})`;
						wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						wilson_hidden_2.ctx.stroke();
						
						cube_texture_2.needsUpdate = true;
						
						
						
						wilson_hidden_3.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_3.ctx.fillStyle = `rgba(32, 32, 32, ${wilson_hidden_3.ctx._alpha})`;
						wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_3.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_3.ctx._alpha})`;
						wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_3.ctx.moveTo(42.7, 21.3);
						wilson_hidden_3.ctx.lineTo(21.3, 42.7);
						wilson_hidden_3.ctx.stroke();
						
						floor_texture.needsUpdate = true;
						
						
						
						wilson_hidden_4.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_4.ctx.fillStyle = `rgba(32, 32, 32, ${wilson_hidden_4.ctx._alpha})`;
						wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_4.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_4.ctx._alpha})`;
						wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_4.ctx.moveTo(21.3, 21.3);
						wilson_hidden_4.ctx.lineTo(42.7, 42.7);
						wilson_hidden_4.ctx.stroke();
						
						floor_texture_2.needsUpdate = true;
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
			
			
			
			let targets = [];
			
			//Show everything not visible by the camera.
			arrays.forEach(array =>
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
				
				
				
				if (add_walls)
				{
					for (let i = 0; i < array.footprint; i++)
					{
						let j = 0;
						
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							targets.push(array.left_wall[i][k].material[0]);
						}
					}
					
					
					
					for (let j = 0; j < array.footprint; j++)
					{
						let i = 0;
						
						for (let k = 0; k < array.cubes[i][j].length; k++)
						{
							targets.push(array.right_wall[j][k].material[4]);
						}
					}
				}
			});
			
			
			
			await new Promise((resolve, reject) =>
			{
				anime({
					targets: [wilson_hidden.ctx, wilson_hidden_2.ctx, wilson_hidden_3.ctx, wilson_hidden_4.ctx],
					strokeStyle: "rgba(255, 255, 255, 0)",
					_alpha: 1,
					duration: animation_time / 2,
					easing: "easeOutQuad",
					complete: resolve,
					update: () =>
					{
						wilson_hidden.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden.ctx._alpha})`;
						wilson_hidden.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden.ctx.fillStyle = `rgba(128, 128, 128, ${wilson_hidden.ctx._alpha})`;
						wilson_hidden.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden.ctx.moveTo(42.7, 21.3);
						wilson_hidden.ctx.lineTo(21.3, 42.7);
						wilson_hidden.ctx.stroke();
						
						cube_texture.needsUpdate = true;
						
						
						
						wilson_hidden_2.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_2.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_2.ctx._alpha})`;
						wilson_hidden_2.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_2.ctx.fillStyle = `rgba(128, 128, 128, ${wilson_hidden_2.ctx._alpha})`;
						wilson_hidden_2.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_2.ctx.moveTo(21.3, 21.3);
						wilson_hidden_2.ctx.lineTo(42.7, 42.7);
						wilson_hidden_2.ctx.stroke();
						
						cube_texture_2.needsUpdate = true;
						
						
						
						wilson_hidden_3.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_3.ctx.fillStyle = `rgba(32, 32, 32, ${wilson_hidden_3.ctx._alpha})`;
						wilson_hidden_3.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_3.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_3.ctx._alpha})`;
						wilson_hidden_3.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_3.ctx.moveTo(42.7, 21.3);
						wilson_hidden_3.ctx.lineTo(21.3, 42.7);
						wilson_hidden_3.ctx.stroke();
						
						floor_texture.needsUpdate = true;
						
						
						
						wilson_hidden_4.ctx.clearRect(0, 0, 64, 64);
						
						wilson_hidden_4.ctx.fillStyle = `rgba(32, 32, 32, ${wilson_hidden_4.ctx._alpha})`;
						wilson_hidden_4.ctx.fillRect(0, 0, 64, 64);
						
						wilson_hidden_4.ctx.fillStyle = `rgba(64, 64, 64, ${wilson_hidden_4.ctx._alpha})`;
						wilson_hidden_4.ctx.fillRect(4, 4, 56, 56);
						
						wilson_hidden_4.ctx.moveTo(21.3, 21.3);
						wilson_hidden_4.ctx.lineTo(42.7, 42.7);
						wilson_hidden_4.ctx.stroke();
						
						floor_texture_2.needsUpdate = true;
					}
				});
			});
			
			targets.forEach(material => material.opacity = 1);
			
			currently_animating_camera = false;
			
			resolve();
		});	
	}
	
	
	
	//Goes through and recomputes the sizes of array and then the total array sizes.
	function recalculate_heights(array)
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
		
		
		
		let old_total_array_height = total_array_height;
		
		total_array_height = 0;
		
		arrays.forEach(array => total_array_height = Math.max(array.height, total_array_height));
		
		
		
		total_array_size = Math.max(total_array_footprint, total_array_height);
		
		if (total_array_height !== old_total_array_height)
		{
			update_camera_height();
		}
	}
	
	
	
	function draw_all_2d_view_text()
	{
		font_size = wilson_numbers.canvas_width / (total_array_footprint + 1);
		
		let num_characters = Math.max(`${total_array_height}`.length, 2);
		
		wilson_numbers.ctx.font = `${font_size / num_characters}px monospace`;
		
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
		
		if (array.numbers[row][col] !== Infinity)
		{
			let text_metrics = wilson_numbers.ctx.measureText(array.numbers[row][col]);
			
			//The height adjustment is an annoying spacing computation.
			wilson_numbers.ctx.fillText(array.numbers[row][col], font_size * (col + left + 1) + (font_size - text_metrics.width) / 2, font_size * (row + top + 1) + (font_size + text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent) / 2);
		}	
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	function color_cubes(array, coordinates, hue)
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
			let v = cube_lightness + 1 * Math.min(cube_lightness, 1 - cube_lightness);
			let s = v === 0 ? 0 : 2 * (1 - cube_lightness / v);
			
			let target_colors = targets.map(color => wilson.utils.hsv_to_rgb(hue, s, v));
			
			
			
			anime({
				targets: targets,
				r: (element, index) => target_colors[index][0] / 255,
				g: (element, index) => target_colors[index][1] / 255,
				b: (element, index) => target_colors[index][2] / 255,
				duration: animation_time,
				delay: (element, index) => Math.floor(index / 6) * animation_time / 10,
				easing: "easeOutQuad",
				update: () => targets.forEach(color => color.setRGB(color.r, color.g, color.b)),
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
				update: () => targets.forEach(color => color.setHSL(color.h, color.s, cube_lightness)),
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
	function lower_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = in_2d_view ? 0 : animation_time;
			
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
	function move_cubes(source_array, source_coordinates, target_array, target_coordinates, update_cube_array = true)
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
				duration: animation_time,
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
				
				if (array.numbers[xyz[0]][xyz[1]] === Infinity)
				{
					console.error("Cannot reveal cubes at an infinite height");
				}
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
	function delete_cubes(array, coordinates, instant = false, no_animation = false)
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
				duration: animation_time / 2 * !no_animation,
				delay: (element, index) => (!instant) * Math.floor(index / 6) * animation_time / 10,
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
	function delete_floor(array, coordinates)
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
				duration: animation_time / 2,
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
	
	
	
	function run_example(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (index === 1 || index === 2)
			{
				while (arrays.length > 1)
				{
					await remove_array(1);
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
				}
				
				if (arrays.length === 0)
				{
					let plane_partition = parse_array(generate_random_plane_partition());
					await add_new_array(arrays.length, plane_partition);
				}
				
				else if (!verify_pp(arrays[0].numbers))
				{
					await remove_array(0);
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
					
					let plane_partition = parse_array(generate_random_plane_partition());
					await add_new_array(arrays.length, plane_partition);
				}
				
				
				
				if (index === 1)
				{
					await hillman_grassl(0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * animation_time));
					
					await hillman_grassl_inverse(0);
				}
				
				else
				{
					await pak(0);
					
					await new Promise((resolve, reject) => setTimeout(resolve, 3 * animation_time));
					
					await show_hex_view();
					
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
					
					await sulzgruber_inverse(0);
				}	
				
				resolve();
			}
			
			
			
			else if (index === 3)
			{
				while (arrays.length > 0)
				{
					await remove_array(0);
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
				}
				
				await add_new_array(arrays.length, generate_random_tableau());
				
				
				
				await show_2d_view();
				
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
				
				await rsk_inverse(0);
				
				await new Promise((resolve, reject) => setTimeout(resolve, 3 * animation_time));
				
				await rsk(0);
				
				resolve();
			}
		});
	}
	
	
	
	function hillman_grassl(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			if (!verify_pp(array.numbers))
			{
				display_error(`Array at index ${index} is not a plane partition!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let plane_partition = _.cloneDeep(array.numbers);
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < plane_partition.length; i++)
			{
				for (let j = 0; j < plane_partition.length; j++)
				{
					if (plane_partition[i][j] !== Infinity)
					{
						for (let k = 0; k < plane_partition[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			uncolor_cubes(array, coordinates);
			
			
			
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
			
			let output_array = await add_new_array(index + 1, empty_array);
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one.
			for (let i = 0; i < zigzag_paths.length; i++)
			{
				let hue = i / zigzag_paths.length * 6/7;
				
				await color_cubes(array, zigzag_paths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await raise_cubes(array, zigzag_paths[i], array.height);
				
				
				
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
				
				await move_cubes(array, zigzag_paths[i], output_array, target_coordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				target_coordinates = [];
				
				for (let j = pivot[0] - 1; j >= column_starts[pivot[1]]; j--)
				{
					target_coordinates.push([j, pivot[1], target_height]);
				}
				
				delete_cubes(output_array, target_coordinates);
				
				target_coordinates = [];
				
				for (let j = pivot[1] - 1; j >= row_starts[pivot[0]]; j--)
				{
					target_coordinates.push([pivot[0], j, target_height]);
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
			
			
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function hillman_grassl_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			let tableau = _.cloneDeep(array.numbers);
			
			let zigzag_paths = [];
			
			
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < tableau.length; i++)
			{
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] !== Infinity)
					{
						for (let k = 0; k < tableau[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}
				}
			}
			
			uncolor_cubes(array, coordinates);
			
			
			
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
			
			let output_array = await add_new_array(index + 1, empty_array);
			
			
			
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
				for (let j = column_starts[col]; j < row; j++)
				{
					array.cubes[j][col][height] = add_cube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
				}
				
				for (let j = row_starts[row]; j < col; j++)
				{
					array.cubes[row][j][height] = add_cube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
				}
				
				
				
				await raise_cubes(array, [zigzag_paths[i][1]], height);
				
				
				
				let coordinates = [];
				
				for (let j = row - 1; j >= column_starts[col]; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise_1 = reveal_cubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = col - 1; j >= row_starts[row]; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise_2 = reveal_cubes(array, coordinates);
				
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
			
			
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function pak(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			if (!verify_pp(array.numbers))
			{
				display_error(`Array at index ${index} is not a plane partition!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			let plane_partition = array.numbers;
			
			
			
			if (!in_2d_view)
			{
				await show_2d_view();
			}
			
			
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < plane_partition.length; i++)
			{
				for (let j = 0; j < plane_partition.length; j++)
				{
					if (plane_partition[i][j] !== Infinity)
					{
						for (let k = 0; k < plane_partition[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			await uncolor_cubes(array, coordinates);
			
			
			
			let num_corners = array.footprint * array.footprint;
			
			
			
			let hue_index = 0;
			
			//Get outer corners by just scanning through the array forwards.
			for (let row = 0; row < array.footprint; row++)
			{
				for (let col = 0; col < array.footprint; col++)
				{
					if (plane_partition[row][col] === Infinity)
					{
						let coordinates = array.cubes[row][col].map((cube, index) => [row, col, index]);
						
						await delete_cubes(array, coordinates, true);
						
						delete_floor(array, [[row, col]]);
						
						array.cubes[row][col] = [];
						
						await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
						
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
					
					color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					
					
					
					coordinates_to_color = [];
					
					diagonal_coordinates.forEach(coordinate =>
					{
						if (coordinate[2] >= 0)
						{
							coordinates_to_color.push(coordinate);
						}
					});
					
					await color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					
					
					
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
								array.cubes[i][j][k] = add_cube(array, j, k, i);
								
								coordinates_to_reveal.push([i, j, k]);
							}
							
							if (in_2d_view)
							{
								reveal_cubes(array, coordinates_to_reveal);
							}
							
							else
							{
								await reveal_cubes(array, coordinates_to_reveal);
							}	
						}
						
						
						
						else if (new_diagonal_height[index] < plane_partition[i][j])
						{
							let coordinates_to_delete = [];
							
							for (let k = plane_partition[i][j] - 1; k >= new_diagonal_height[index]; k--)
							{
								coordinates_to_delete.push([i, j, k]);
							}
							
							if (in_2d_view)
							{
								delete_cubes(array, coordinates_to_delete);
							}
							
							else
							{
								await delete_cubes(array, coordinates_to_delete);
							}
						}
						
						
						
						plane_partition[i][j] = new_diagonal_height[index];
						
						if (in_2d_view)
						{
							let top = total_array_footprint - array.partial_footprint_sum - 1;
							let left = array.partial_footprint_sum - array.footprint;
							
							draw_single_cell_2d_view_text(array, i, j, top, left);
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
					
					if (in_2d_view)
					{
						uncolor_cubes(array, coordinates_to_uncolor);
					}
					
					else
					{
						await uncolor_cubes(array, coordinates_to_uncolor);
					}		
					
					
					
					hue_index++;
					
					recalculate_heights(array);
					
					if (coordinates_to_color.length !== 0)
					{
						await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
					}
				}
			}
			
			
			
			update_camera_height(true);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function pak_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			let tableau = array.numbers;
			
			
			
			if (!in_2d_view)
			{
				await show_2d_view();
			}
			
			
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < tableau.length; i++)
			{
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] !== Infinity)
					{
						for (let k = 0; k < tableau[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}
				}
			}
			
			await uncolor_cubes(array, coordinates);
			
			
			
			let num_corners = array.footprint * array.footprint;
			
			
			
			let hue_index = 0;
			
			//Get outer corners by just scanning through the array backwards.
			for (let row = array.footprint - 1; row >= 0; row--)
			{
				for (let col = array.footprint - 1; col >= 0; col--)
				{
					if (tableau[row][col] === Infinity)
					{
						array.cubes[row][col] = new Array(infinite_height);
						
						let things_to_animate = [];
						
						for (let i = 0; i < infinite_height; i++)
						{
							array.cubes[row][col][i] = add_cube(array, col, i, row, 0, 0, asymptote_lightness);
							
							array.cubes[row][col][i].material.forEach(material => things_to_animate.push(material));
						}
						
						array.floor[row][col] = add_floor(array, col, row);
						
						array.floor[row][col].material.forEach(material => things_to_animate.push(material));
						
						
						
						await new Promise((resolve, reject) =>
						{
							anime({
								targets: things_to_animate,
								opacity: 1,
								duration: animation_time,
								easing: "easeOutQuad",
								complete: resolve
							});
						});
						
						await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
						
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
						
						color_cubes(array, coordinates_to_color, hue_index / num_corners * 6/7);
					}
					
					else if (new_diagonal_height[0] !== 0)
					{
						array.cubes[i][j][0] = add_cube(array, j, 0, i, hue_index / num_corners * 6/7, 1, cube_lightness);
						
						tableau[i][j] = 1;
						
						reveal_cubes(array, [[i, j, 0]]);
					}
					
					else if (!any_change)
					{
						hue_index++;
						continue;
					}
					
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
					
					
					
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
								array.cubes[i][j][k] = add_cube(array, j, k, i, hue_index / num_corners * 6/7, 1, cube_lightness);
								
								coordinates_to_reveal.push([i, j, k]);
							}
							
							if (in_2d_view)
							{
								reveal_cubes(array, coordinates_to_reveal);
							}
							
							else
							{
								await reveal_cubes(array, coordinates_to_reveal);
							}
						}
						
						
						
						else if (new_diagonal_height[index] < tableau[i][j])
						{
							let coordinates_to_delete = [];
							
							for (let k = tableau[i][j] - 1; k >= new_diagonal_height[index]; k--)
							{
								coordinates_to_delete.push([i, j, k]);
							}
							
							if (in_2d_view)
							{
								delete_cubes(array, coordinates_to_delete);
							}
							
							else
							{
								await delete_cubes(array, coordinates_to_delete);
							}
						}
						
						
						
						tableau[i][j] = new_diagonal_height[index];
						
						if (in_2d_view)
						{
							let top = total_array_footprint - array.partial_footprint_sum - 1;
							let left = array.partial_footprint_sum - array.footprint;
							
							draw_single_cell_2d_view_text(array, i, j, top, left);
						}
					}
					
					
					
					hue_index++;
					
					recalculate_heights(array);
					
					await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
				}
			}
			
			
			
			update_camera_height(true);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function sulzgruber(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			if (!verify_pp(array.numbers))
			{
				display_error(`Array at index ${index} is not a plane partition!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			let plane_partition = _.cloneDeep(array.numbers);
			
			
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < plane_partition.length; i++)
			{
				for (let j = 0; j < plane_partition.length; j++)
				{
					if (plane_partition[i][j] !== Infinity)
					{
						for (let k = 0; k < plane_partition[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			uncolor_cubes(array, coordinates);
			
			
			
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
			
			let output_array = await add_new_array(index + 1, empty_array, "tableau");
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
			
			
			
			//Now we'll animate those paths actually decrementing, one-by-one. We're using a for loop because we need to await.
			for (let i = 0; i < q_paths.length; i++)
			{
				let hue = i / q_paths.length * 6/7;
				
				await color_cubes(array, q_paths[i], hue);
				
				
				
				//Lift all the cubes up. There's no need to do this if we're in the 2d view.
				await raise_cubes(array, q_paths[i], array.height + 1);
				
				
				
				let top = total_array_footprint - array.partial_footprint_sum - 1;
				let left = array.partial_footprint_sum - array.footprint;
				
				//Now we actually delete the cubes.
				q_paths[i].forEach(box =>
				{
					array.numbers[box[0]][box[1]]--;
					
					if (in_2d_view)
					{
						draw_single_cell_2d_view_text(array, box[0], box[1], top, left);
					}	
				});
				
				recalculate_heights(array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 5));
				
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
				
				await move_cubes(array, q_paths[i], output_array, target_coordinates);
				
				
				
				//Now delete everything but the pivot and move that down. To make the deletion look nice, we'll put these coordinates in a different order and send two lists total.
				target_coordinates = [];
				
				for (let j = row - 1; j >= column_starts[col]; j--)
				{
					target_coordinates.push([j, col, target_height]);
				}
				
				delete_cubes(output_array, target_coordinates);
				
				target_coordinates = [];
				
				for (let j = col - 1; j >= row_starts[row]; j--)
				{
					target_coordinates.push([row, j, target_height]);
				}
				
				delete_cubes(output_array, target_coordinates);
				
				
				
				await lower_cubes(output_array, [[row, col, target_height]]);
				
				
				
				top = total_array_footprint - output_array.partial_footprint_sum - 1;
				left = output_array.partial_footprint_sum - output_array.footprint;
				
				output_array.numbers[row][col]++;
				
				if (in_2d_view)
				{
					draw_single_cell_2d_view_text(output_array, row, col, top, left);
				}
				
				recalculate_heights(output_array);
				
				
				
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
			}
			
			
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function sulzgruber_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
			let tableau = array.numbers;
			
			let q_paths = [];
			
			
			
			let coordinates = [];
			
			//Remove any color that's here.
			for (let i = 0; i < tableau.length; i++)
			{
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] !== Infinity)
					{
						for (let k = 0; k < tableau[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}	
				}
			}
			
			uncolor_cubes(array, coordinates);
			
			
			
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
			
			let output_array = await add_new_array(index + 1, empty_array);
			
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
						
						await color_cubes(array, [[i, j, tableau[i][j] - 1]], hue);
						
						await raise_cubes(array, [[i, j, tableau[i][j] - 1]], height);
						
						
						
						let row = i;
						let col = j;
						
						//Add a bunch of cubes corresponding to the hook that this thing is a part of.
						for (let k = column_starts[col]; k < row; k++)
						{
							array.cubes[k][col][height] = add_cube(array, col, height, k);
							array.cubes[k][col][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
						}
						
						for (let k = row_starts[row]; k < col; k++)
						{
							array.cubes[row][k][height] = add_cube(array, k, height, row);
							array.cubes[row][k][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
						}
						
						
						
						let coordinates = [];
						
						for (let k = row - 1; k >= column_starts[col]; k--)
						{
							coordinates.push([k, col, height]);
						}
						
						let promise_1 = reveal_cubes(array, coordinates);
						
						coordinates = [];
						
						for (let k = col - 1; k >= row_starts[row]; k--)
						{
							coordinates.push([row, k, height]);
						}
						
						let promise_2 = reveal_cubes(array, coordinates);
						
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
						
						recalculate_heights(array);
						
						if (in_2d_view)
						{
							let top = total_array_footprint - array.partial_footprint_sum - 1;
							let left = array.partial_footprint_sum - array.footprint;
							
							draw_single_cell_2d_view_text(array, row, col, top, left);
						}
						
						await move_cubes(array, coordinates, output_array, target_coordinates);
						
						
						
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
								await lower_cubes(output_array, coordinates);
								
								coordinates.forEach(coordinate => output_array.numbers[coordinate[0]][coordinate[1]]++);
								
								recalculate_heights(output_array);
								
								if (in_2d_view)
								{
									let top = total_array_footprint - output_array.partial_footprint_sum - 1;
									let left = output_array.partial_footprint_sum - output_array.footprint;
									
									coordinates.forEach(entry =>
									{
										draw_single_cell_2d_view_text(output_array, entry[0], entry[1], top, left)
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
								
								await move_cubes(output_array, old_target_coordinates, output_array, new_target_coordinates);
								
								current_height = output_array.numbers[target_coordinates[current_index][0]][target_coordinates[current_index][1]];
							}
							
							
							
							if (current_index === target_coordinates.length)
							{
								break;
							}
						}
						
						
						
						current_hue_index++;
						
						await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
					}	
				}
			}	
			
			
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function rsk(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			if (index === arrays.length - 1)
			{
				display_error(`No second array at index ${index + 1} (RSK requires two adjacent SSYT of the same shape)`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let p_array = arrays[index];
			let q_array = arrays[index + 1];
			
			if (!verify_ssyt(p_array.numbers))
			{
				display_error(`Array at index ${index} is not an SSYT!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			if (!verify_ssyt(q_array.numbers))
			{
				display_error(`Array at index ${index + 1} is not an SSYT!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let p_ssyt = p_array.numbers;
			let q_ssyt = q_array.numbers;
			
			if (p_ssyt.length !== q_ssyt.length)
			{
				display_error(`The SSYT do not have the same shape!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			for (let i = 0; i < p_ssyt.length; i++)
			{
				for (let j = 0; j < p_ssyt.length; j++)
				{
					if ((p_ssyt[i][j] === 0 && q_ssyt[i][j] !== 0) || (p_ssyt[i][j] !== 0 && q_ssyt[i][j] === 0))
					{
						display_error(`The SSYT do not have the same shape!`);
						
						currently_running_algorithm = false;
						
						reject();
						return;
					}
				}	
			}
			
			
			
			let p_coordinates = [];
			let q_coordinates = [];
			
			let array_size = 0;
			
			let num_hues = 0;
			
			//Remove any color that's here.
			for (let i = 0; i < p_ssyt.length; i++)
			{
				for (let j = 0; j < p_ssyt.length; j++)
				{
					if (p_ssyt[i][j] === Infinity || q_ssyt[i][j] === Infinity)
					{
						display_error(`The SSYT contain infinite values, which is not allowed in RSK!`);
						
						currently_running_algorithm = false;
						
						reject();
						return;
					}
					
					if (p_ssyt[i][j] !== 0)
					{
						num_hues++;
					}
					
					for (let k = 0; k < p_ssyt[i][j]; k++)
					{
						p_coordinates.push([i, j, k]);
					}
					
					for (let k = 0; k < q_ssyt[i][j]; k++)
					{
						q_coordinates.push([i, j, k]);
					}
					
					array_size = Math.max(Math.max(array_size, p_ssyt[i][j]), q_ssyt[i][j]);
				}
			}
			
			if (array_size === 0)
			{
				display_error(`The SSYT are empty!`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			uncolor_cubes(p_array, p_coordinates);
			uncolor_cubes(q_array, q_coordinates);
			
			
			
			let empty_array = new Array(array_size);
			
			for (let i = 0; i < array_size; i++)
			{
				empty_array[i] = new Array(array_size);
				
				for (let j = 0; j < array_size; j++)
				{
					empty_array[i][j] = 0;
				}
			}
			
			let output_array = await add_new_array(index + 2, empty_array);
			
			
			
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
				
				
				
				color_cubes(q_array, q_source_coordinates_external.concat([[row, col, q_entry - 1]]), hue);
				color_cubes(p_array, p_source_coordinates_local, hue);
				await color_cubes(p_array, p_source_coordinates_external, hue);
				
				
				
				//Update all the numbers.
				q_ssyt[row][col] = 0;
				
				for (let k = p_coordinate_path.length - 1; k > 0; k--)
				{
					p_ssyt[p_coordinate_path[k][0]][p_coordinate_path[k][1]] = p_ssyt[p_coordinate_path[k - 1][0]][p_coordinate_path[k - 1][1]];
				}
				
				p_ssyt[row][col] = 0;
				
				if (in_2d_view)
				{
					let top = total_array_footprint - p_array.partial_footprint_sum - 1;
					let left = p_array.partial_footprint_sum - p_array.footprint;
					
					draw_single_cell_2d_view_text(p_array, row, col, top, left);
					
					for (let k = p_coordinate_path.length - 1; k > 0; k--)
					{
						draw_single_cell_2d_view_text(p_array, p_coordinate_path[k][0], p_coordinate_path[k][1], top, left);
					}
					
					
					
					top = total_array_footprint - q_array.partial_footprint_sum - 1;
					left = q_array.partial_footprint_sum - q_array.footprint;
					
					draw_single_cell_2d_view_text(q_array, row, col, top, left);
				}
				
				
				
				move_cubes(q_array, q_source_coordinates_external, output_array, q_target_coordinates_external);
				move_cubes(p_array, p_source_coordinates_external, output_array, p_target_coordinates_external);
				move_cubes(p_array, p_source_coordinates_local, p_array, p_target_coordinates_local);
				await move_cubes(q_array, [[row, col, q_entry - 1]], output_array, [[q_entry - 1, p_entry - 1, height]], false);
				
				
				
				uncolor_cubes(p_array, p_target_coordinates_local);
				
				
				
				//Delete the non-corner parts of the hook (animated), delete one of the overlapping corner cubes (instantly), and drop the other.
				
				//Gross but necessary. delete_cubes() needs to detach the object from its parent cube group, but what we pass isn't actually its parent, so we have to do it manually.
				output_array.cube_group.remove(q_array.cubes[row][col][q_entry - 1]);
				delete_cubes(q_array, [[row, col, q_entry - 1]], true, true);
				
				p_target_coordinates_external.reverse();
				q_target_coordinates_external.reverse();
				
				delete_cubes(output_array, p_target_coordinates_external.slice(1));
				delete_cubes(output_array, q_target_coordinates_external);
				
				await lower_cubes(output_array, [[q_entry - 1, p_entry - 1, height]]);
				
				empty_array[q_entry - 1][p_entry - 1]++;
				
				if (in_2d_view)
				{
					let top = total_array_footprint - output_array.partial_footprint_sum - 1;
					let left = output_array.partial_footprint_sum - output_array.footprint;
					
					draw_single_cell_2d_view_text(output_array, q_entry - 1, p_entry - 1, top, left);
				}
				
				recalculate_heights(output_array);
				
				
				
				hue_index++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
			}
			
			
			
			
			await remove_array(index);
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time));
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
	
	
	
	function rsk_inverse(index)
	{
		return new Promise(async (resolve, reject) =>
		{
			if (currently_running_algorithm)
			{
				reject();
				return;
			}
			
			currently_running_algorithm = true;
			
			
			
			if (index >= arrays.length || index < 0)
			{
				display_error(`No array at index ${index}`);
				
				currently_running_algorithm = false;
				
				reject();
				return;
			}
			
			
			
			let array = arrays[index];
			
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
			
			
			
			let coordinates = [];
			
			for (let i = 0; i < tableau.length; i++)
			{
				for (let j = 0; j < tableau.length; j++)
				{
					if (tableau[i][j] !== Infinity)
					{
						for (let k = 0; k < tableau[i][j]; k++)
						{
							coordinates.push([i, j, k]);
						}
					}
				}
			}
			
			uncolor_cubes(array, coordinates);
			
			
			
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
			
			let p_array = await add_new_array(index + 1, p_ssyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
			
			let q_array = await add_new_array(index + 2, q_ssyt);
			
			await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
			
			
			
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
					array.cubes[row][j][height] = add_cube(array, j, height, row);
					array.cubes[row][j][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
				}
				
				for (let j = row - 1; j >= 0; j--)
				{
					array.cubes[j][col][height] = add_cube(array, col, height, j);
					array.cubes[j][col][height].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
				}
				
				//This is the duplicate cube. As usual, we need to store it somewhere else in the array -- here, we're going to place it one space vertically above its actual location.
				
				array.cubes[row][col][height + 1] = add_cube(array, col, height, row);
				array.cubes[row][col][height + 1].material.forEach(material => material.color.setHSL(hue, 1, cube_lightness));
				
				
				
				await color_cubes(array, [[row, col, array.numbers[row][col] - 1]], hue);
				
				await raise_cubes(array, [[row, col, array.numbers[row][col] - 1]], height);
				
				
				
				let promise_1 = reveal_cubes(array, [[row, col, height + 1]]);
				
				let coordinates = [];
				
				for (let j = col - 1; j >= 0; j--)
				{
					coordinates.push([row, j, height]);
				}
				
				let promise_2 = reveal_cubes(array, coordinates);
				
				coordinates = [];
				
				for (let j = row - 1; j >= 0; j--)
				{
					coordinates.push([j, col, height]);
				}
				
				let promise_3 = reveal_cubes(array, coordinates);
				
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
				
				await color_cubes(p_array, p_source_coordinates_local, hue);
				
				
				
				for (let j = path.length - 1; j > 0; j--)
				{
					p_ssyt[path[j][0]][path[j][1]] = p_ssyt[path[j - 1][0]][path[j - 1][1]];
				}
				
				if (path.length !== 0)
				{
					p_ssyt[path[0][0]][path[0][1]] = 0;
				}
				
				if (in_2d_view)
				{
					draw_all_2d_view_text();
				}
				
				if (p_source_coordinates_local.length !== 0)
				{
					await move_cubes(p_array, p_source_coordinates_local, p_array, p_target_coordinates_local);	
				}	
				
				
				
				array.numbers[row][col]--;
				
				if (in_2d_view)
				{
					draw_all_2d_view_text();
				}
				
				move_cubes(array, p_source_coordinates_external, p_array, p_target_coordinates_external);
				
				await move_cubes(array, q_source_coordinates_external, q_array, q_target_coordinates_external);
				
				
				
				p_ssyt[path[0][0]][path[0][1]] = col + 1;
				
				q_ssyt[q_insertion_locations[hue_index][0]][q_insertion_locations[hue_index][1]] = row + 1;
				
				if (in_2d_view)
				{
					draw_all_2d_view_text();
				}
				
				
				
				recalculate_heights(array);
				recalculate_heights(p_array);
				recalculate_heights(q_array);
				
				
				
				hue_index++;
				
				await new Promise((resolve, reject) => setTimeout(resolve, animation_time / 2));
			}
			
			
			
			await remove_array(index);
			
			currently_running_algorithm = false;
			
			resolve();
		});	
	}
}()