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
	
	let show_hex_view_button_element = Page.element.querySelector("#show-hex-view-button");
	
	show_hex_view_button_element.addEventListener("click", show_hex_view);
	
	
	
	let show_2d_view_button_element = Page.element.querySelector("#show-2d-view-button");
	
	show_2d_view_button_element.addEventListener("click", show_2d_view);
	
	
	
	let run_hillman_grassl_button_element = Page.element.querySelector("#run-hillman-grassl-button");
	
	run_hillman_grassl_button_element.addEventListener("click", () =>
	{
		if (currently_plane_partition)
		{
			hillman_grassl(0);
		}
		
		else
		{
			hillman_grassl_inverse(0);
		}
		
		currently_plane_partition = !currently_plane_partition;
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
	
	const cube_texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
	const cube_geometry = new THREE.BoxGeometry();
	
	const floor_geometry = new THREE.BoxGeometry(1, .001, 1);
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 1.75, 10000);
	point_light.position.set(750, 1000, 500);
	scene.add(point_light);
	
	
	
	let rotation_y = 0;
	let rotation_y_velocity = 0;
	let next_rotation_y_velocity = 0;
	
	const rotation_y_velocity_friction = .94;
	const rotation_y_velocity_start_threshhold = .005;
	const rotation_y_velocity_stop_threshhold = .0005;
	
	
	
	let in_2d_view = false;
	
	let currently_animating_camera = false;
	
	let currently_running_algorithm = false;
	
	let currently_plane_partition = true;
	
	let font_size = 10;
	
	//A 1D list of the plane partitions, etc, that are stored.
	let arrays = [];
	
	let total_array_footprint = 0;
	let total_array_height = 0;
	let total_array_size = 0;
	
	let hex_view_camera_pos = [0, 0, 0];
	let _2d_view_camera_pos = [0, 0, 0];
	
	
	
	add_new_array(0, generate_random_plane_partition());
	
	
	
	draw_frame();
	
	setTimeout(() => Page.show(), 500);
	
	
	
	function on_grab_canvas(x, y, event)
	{
		rotation_y_velocity = 0;
		
		next_rotation_y_velocity = 0;
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
		if (in_2d_view)
		{
			return;
		}
		
		
		if (Math.abs(next_rotation_y_velocity) >= rotation_y_velocity_start_threshhold)
		{
			rotation_y_velocity = next_rotation_y_velocity;
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
	
	
	
	async function add_new_array(index, numbers)
	{
		return new Promise(async (resolve, reject) =>
		{
			let array = {
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
						duration: 500,
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
			
			let num_characters = `${total_array_height}`.length;
			
			if (num_characters === 1)
			{
				wilson_numbers.ctx.font = `${font_size * .75}px monospace`;
			}
			
			else
			{
				wilson_numbers.ctx.font = `${font_size / num_characters}px monospace`;
			}
			
			
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
					await Page.Animate.change_opacity(numbers_canvas_container_element, 0, 100);
					
					anime({
						targets: orthographic_camera.position,
						x: _2d_view_camera_pos[0],
						y: _2d_view_camera_pos[1],
						z: _2d_view_camera_pos[2],
						duration: 500,
						easing: "easeInOutQuad"
					});
					
					anime({
						targets: orthographic_camera,
						left: -(total_array_footprint / 2 + .5),
						right: total_array_footprint / 2 + .5,
						top: total_array_footprint / 2 + .5,
						bottom: -(total_array_footprint / 2 + .5),
						duration: 500,
						easing: "easeInOutQuad",
						update: () => orthographic_camera.updateProjectionMatrix()
					});
					
					setTimeout(() =>
					{
						draw_all_2d_view_text();
						
						Page.Animate.change_opacity(numbers_canvas_container_element, 1, 100);
					}, 500);
				}
				
				else
				{
					anime({
						targets: orthographic_camera.position,
						x: hex_view_camera_pos[0],
						y: hex_view_camera_pos[1],
						z: hex_view_camera_pos[2],
						duration: 500,
						easing: "easeInOutQuad"
					});
					
					anime({
						targets: orthographic_camera,
						left: -total_array_size,
						right: total_array_size,
						top: total_array_size,
						bottom: -total_array_size,
						duration: 500,
						easing: "easeInOutQuad",
						update: () => orthographic_camera.updateProjectionMatrix()
					});
				}
			}
			
			
			
			if (index !== arrays.length - 1)
			{
				await new Promise((resolve, reject) => setTimeout(resolve, 500));
			}
			
			
			
			let things_to_animate = [];
			
			array.cube_group.traverse(node =>
			{
				if (node.material)
				{
					things_to_animate.push(node.material);
				}
			});
			
			anime({
				targets: things_to_animate,
				opacity: 1,
				duration: 250,
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
					things_to_animate.push(node.material);
				}
			});		
			
			anime({
				targets: things_to_animate,
				opacity: 0,
				duration: 250,
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
						arrays[index].cubes[i][j][k].material.dispose();
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
				duration: 500,
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
			await Page.Animate.change_opacity(numbers_canvas_container_element, 0, 100);
			
			anime({
				targets: orthographic_camera.position,
				x: _2d_view_camera_pos[0],
				y: _2d_view_camera_pos[1],
				z: _2d_view_camera_pos[2],
				duration: 500,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -(total_array_footprint / 2 + .5),
				right: total_array_footprint / 2 + .5,
				top: total_array_footprint / 2 + .5,
				bottom: -(total_array_footprint / 2 + .5),
				duration: 500,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix()
			});
			
			setTimeout(() =>
			{
				draw_all_2d_view_text();
				
				Page.Animate.change_opacity(numbers_canvas_container_element, 1, 100);
			}, 500);
		}
		
		else
		{
			anime({
				targets: orthographic_camera.position,
				x: hex_view_camera_pos[0],
				y: hex_view_camera_pos[1],
				z: hex_view_camera_pos[2],
				duration: 500,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -total_array_size,
				right: total_array_size,
				top: total_array_size,
				bottom: -total_array_size,
				duration: 500,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix()
			});
		}
	}
	
	
	
	function add_cube(array, x, y, z)
	{
		const cube_material = new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0});
		cube_material.color.setHSL(0, 0, .5);
		
		const cube = new THREE.Mesh(cube_geometry, cube_material);
		
		array.cube_group.add(cube);
		
		cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		
		return cube;
	}
	
	
	
	function add_floor(array, x, z)
	{
		const floor_material = new THREE.MeshStandardMaterial({map: cube_texture, transparent: true, opacity: 0});
		floor_material.color.setHSL(0, 0, .2);
		
		const floor = new THREE.Mesh(floor_geometry, floor_material);
		
		array.cube_group.add(floor);
		
		//This aligns the thing correctly.
		floor.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		
		return floor;
	}
	
	
	
	async function show_hex_view()
	{
		if (currently_animating_camera)
		{
			return;
		}
		
		currently_animating_camera = true;
		
		if (in_2d_view)
		{
			await Page.Animate.change_opacity(numbers_canvas_container_element, 0, 100);
		}
		
		in_2d_view = false;
		
		
		
		rotation_y_velocity = 0;
		
		next_rotation_y_velocity = 0;	
		
		
		
		update_camera_height(true);
		
		anime({
			targets: orthographic_camera.rotation,
			x: -0.785398163,
			y: 0.615479709,
			z: 0.523598775,
			duration: 500,
			easing: "easeInOutQuad",
			complete: () => currently_animating_camera = false
		});
		
		arrays.forEach(array =>
		{
			anime({
				targets: array.cube_group.rotation,
				y: 0,
				duration: 500,
				easing: "easeInOutQuad"
			});
		});
		
		rotation_y = 0;
	}
	
	function show_2d_view()
	{
		if (currently_animating_camera || in_2d_view)
		{
			return;
		}
		
		currently_animating_camera = true;
		
		in_2d_view = true;
		
		
		
		rotation_y_velocity = 0;
		
		next_rotation_y_velocity = 0;
		
		
		
		update_camera_height(true);
		
		anime({
			targets: orthographic_camera.rotation,
			x: -1.570796327,
			y: 0,
			z: 0,
			duration: 500,
			easing: "easeInOutQuad"
		});
		
		arrays.forEach(array =>
		{
			anime({
				targets: array.cube_group.rotation,
				y: 0,
				duration: 500,
				easing: "easeInOutQuad"
			});
		});
		
		
		
		setTimeout(() =>
		{
			draw_all_2d_view_text();
			
			Page.Animate.change_opacity(numbers_canvas_container_element, 1, 100)
			
			.then(() =>
			{
				currently_animating_camera = false;
			});
		}, 500);
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
				duration: 500,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -(total_array_footprint / 2 + .5),
				right: total_array_footprint / 2 + .5,
				top: total_array_footprint / 2 + .5,
				bottom: -(total_array_footprint / 2 + .5),
				duration: 500,
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
				duration: 500,
				easing: "easeInOutQuad"
			});
			
			anime({
				targets: orthographic_camera,
				left: -total_array_size,
				right: total_array_size,
				top: total_array_size,
				bottom: -total_array_size,
				duration: 500,
				easing: "easeInOutQuad",
				update: () => orthographic_camera.updateProjectionMatrix(),
				complete: () => {if (!force) {currently_animating_camera = false}}
			});
		}
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
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material.color;
				
				let temp_object = {s: 0};
				
				setTimeout(() =>
				{
					anime({
						targets: temp_object,
						s: 1,
						duration: 500,
						easing: "easeOutQuad",
						update: () => {target.setHSL(hue, temp_object.s, .5)},
						complete: () =>
						{
							if (i === coordinates.length - 1)
							{
								resolve();
							}
						}
					});
				}, 50 * i);	
			}
		});
	}
	
	
	
	function uncolor_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material.color;
				
				let temp_object = {};
				
				target.getHSL(temp_object);
				
				anime({
					targets: temp_object,
					s: 0,
					duration: 500,
					easing: "easeOutQuad",
					update: () => {target.setHSL(temp_object.h, temp_object.s, .5)},
					complete: () =>
					{
						if (i === coordinates.length - 1)
						{
							resolve();
						}
					}
				});
			}
		});
	}
	
	
	
	//Lifts the specified cubes to the specified height. The animation is skipped in 2d mode.
	function raise_cubes(array, coordinates, height)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = in_2d_view ? 0 : 500;
			
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].position;
				
				anime({
					targets: target,
					y: height,
					duration: duration,
					easing: "easeInOutQuad",
					complete: () =>
					{
						if (i === coordinates.length - 1)
						{
							resolve();
						}
					}
				});
			}
		});	
	}
	
	
	
	//Lowers the specified cubes onto the array. The animation is skipped in 2d mode.
	function lower_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			let duration = in_2d_view ? 0 : 500;
			
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].position;
				
				anime({
					targets: target,
					y: array.numbers[coordinates[i][0]][coordinates[i][1]],
					duration: duration,
					easing: "easeInOutQuad",
					complete: () =>
					{
						array.cubes[coordinates[i][0]][coordinates[i][1]][array.numbers[coordinates[i][0]][coordinates[i][1]]] = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]];
						
						array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]] = null;
						
						if (i === coordinates.length - 1)
						{
							resolve();
						}
					}
				});
			}
		});	
	}
	
	
	
	//Moves cubes from one array to another and changes their group.
	function move_cubes(source_array, source_coordinates, target_array, target_coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < source_coordinates.length; i++)
			{
				let cube = source_array.cubes[source_coordinates[i][0]][source_coordinates[i][1]][source_coordinates[i][2]];
				
				//Once its position is set relative to the target array, we detatch it to get its world coordinates.
				target_array.cube_group.attach(cube);
				
				anime({
					targets: cube.position,
					x: target_coordinates[i][1] - (target_array.footprint - 1) / 2,
					y: target_coordinates[i][2],
					z: target_coordinates[i][0] - (target_array.footprint - 1) / 2,
					duration: 500,
					easing: "easeInOutQuad",
					complete: () =>
					{
						//Now we just need to finish the bookkeeping and update the arrays correctly.
						if (target_array.cubes[target_coordinates[i][0]][target_coordinates[i][1]][target_coordinates[i][2]])
						{
							console.warn(`Moving a cube to a location that's already occupied: ${target_coordinates[i]}. This is probably not what you want to do.`);
						}
						
						target_array.cubes[target_coordinates[i][0]][target_coordinates[i][1]][target_coordinates[i][2]] = cube;
						
						source_array.cubes[source_coordinates[i][0]][source_coordinates[i][1]][source_coordinates[i][2]] = null;
						
						if (i === source_coordinates.length - 1)
						{
							resolve();
						}
					}
				});
			}
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
			
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material;
				
				setTimeout(() =>
				{
					anime({
						targets: target,
						opacity: 1,
						duration: 250,
						easing: "easeOutQuad",
						complete: () =>
						{
							if (i === coordinates.length - 1)
							{
								resolve();
							}	
						}
					});
				}, 50 * i);	
			}
		});
	}
	
	
	
	//Fades the specified cubes' opacity to zero, and then deletes them.
	function delete_cubes(array, coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < coordinates.length; i++)
			{
				let target = array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material;
				
				setTimeout(() =>
				{
					anime({
						targets: target,
						opacity: 0,
						duration: 250,
						easing: "easeOutQuad",
						complete: () =>
						{
							target.dispose();
							array.cube_group.remove(array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]]);
							array.cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]] = null;
							if (i === coordinates.length - 1)
							{
								resolve();
							}	
						}
					});
				}, 50 * i);	
			}
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
		
		let output_array = await add_new_array(index + 1, empty_array);
		
		await new Promise((resolve, reject) => setTimeout(resolve, 500));
		
		
		
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
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, 100));
			
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
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, 500));
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
		
		let output_array = await add_new_array(index + 1, empty_array);
		
		
		
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
		
		
		
		await new Promise((resolve, reject) => setTimeout(resolve, 250));
		
		
		
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
				array.cubes[j][col][height].material.color.setHSL(hue, 1, .5);
			}
			
			for (let j = 0; j < col; j++)
			{
				array.cubes[row][j][height] = add_cube(array, j, height, row);
				array.cubes[row][j][height].material.color.setHSL(hue, 1, .5);
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
			
			
			
			await new Promise((resolve, reject) => setTimeout(resolve, 250));
		}
		
		
		
		remove_array(index);
		
		currently_running_algorithm = false;
	}
}()