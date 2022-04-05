!async function()
{
	"use strict";
	
	
	
	let options_numbers =
	{
		renderer: "cpu",
		
		canvas_width: 1000,
		canvas_height: 1000,
		
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
		canvas_width: 1000,
		canvas_height: 1000
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
	
	run_hillman_grassl_button_element.addEventListener("click", hillman_grassl);
	
	
	
	const scene = new THREE.Scene();
	
	const orthographic_camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);
	
	
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(1000, 1000, false);
	
	
	
	const loader = new THREE.TextureLoader();
	
	const cube_texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
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
	
	let currently_animating = false;
	
	let font_size = 10;
	
	//A 1D list of the plane partitions, etc, that are stored.
	let arrays = [];
	
	let total_array_footprint = 0;
	let total_array_height = 0;
	let total_array_size = 0;
	
	let hex_view_camera_pos = [0, 0, 0];
	
	add_new_array(generate_random_plane_partition());
	
	setTimeout(() => add_new_array(generate_random_plane_partition()), 3000);
	
	
	
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
		
		arrays.forEach(array => array.cube_group.rotation.y = rotation_y);
		
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
			
			arrays.forEach(array => array.cube_group.rotation.y = rotation_y);
			
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
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function generate_random_plane_partition()
	{
		let side_length = Math.floor(Math.random() * 3) + 5;
		
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
	
	
	
	function add_new_array(numbers)
	{
		arrays.push({
			numbers: numbers,
			cubes: [],
			floor: [],
			
			cube_group: null,
			parent_object: null,
			
			center_offset: 0,
			
			footprint: 0,
			height: 0,
			size: 0
		});
		
		let array = arrays[arrays.length - 1];
		
		array.footprint = array.numbers.length;
		
		if (arrays.length !== 1)
		{
			array.center_offset = arrays[arrays.length - 2].center_offset + arrays[arrays.length - 2].footprint / 2 + array.footprint / 2 + 1;
		}	
		
		
		
		array.cube_group = new THREE.Object3D();
		scene.add(array.cube_group);
		
		array.cube_group.position.set(array.center_offset, 0, -array.center_offset);
		
		
		
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
		
		
		
		total_array_footprint += array.footprint + .5;
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
		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshStandardMaterial({map: cube_texture, transparent: true});
		
		material.color.setHSL(0, 0, .5);
		
		const cube = new THREE.Mesh(geometry, material);
		
		array.cube_group.add(cube);
		
		cube.position.set(x - (array.footprint - 1) / 2, y, z - (array.footprint - 1) / 2);
		
		return cube;
	}
	
	
	
	function add_floor(array, x, z)
	{
		const geometry = new THREE.BoxGeometry(1, .001, 1);
		const material = new THREE.MeshStandardMaterial({map: cube_texture, transparent: true});
		
		material.color.setHSL(0, 0, .2);
		
		const cube = new THREE.Mesh(geometry, material);
		
		array.cube_group.add(cube);
		
		//This aligns the thing correctly.
		cube.position.set(x - (array.footprint - 1) / 2, -.5 - .0005, z - (array.footprint - 1) / 2);
		
		return cube;
	}
	
	
	
	async function show_hex_view()
	{
		if (currently_animating)
		{
			return;
		}
		
		currently_animating = true;
		
		
		
		rotation_y_velocity = 0;
		
		next_rotation_y_velocity = 0;
		
		
			
		if (in_2d_view)
		{
			await Page.Animate.change_opacity(numbers_canvas_container_element, 0, 100);
		}	
		
		
		
		anime({
			targets: orthographic_camera.position,
			x: hex_view_camera_pos[0],
			y: hex_view_camera_pos[1],
			z: hex_view_camera_pos[2],
			duration: 500,
			easing: "easeInOutQuad"
		});
		
		anime({
			targets: orthographic_camera.rotation,
			x: -0.785398163,
			y: 0.615479709,
			z: 0.523598775,
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
		
		in_2d_view = false;
		
		currently_animating = false;
	}
	
	function show_2d_view()
	{
		if (currently_animating || in_2d_view)
		{
			return;
		}
		
		currently_animating = true;
		
		
		
		rotation_y_velocity = 0;
		
		next_rotation_y_velocity = 0;
		
		
		
		anime({
			targets: orthographic_camera.position,
			x: 0,
			y: total_array_size,
			z: 0,
			duration: 500,
			easing: "easeInOutQuad"
		});
		
		anime({
			targets: orthographic_camera.rotation,
			x: -1.570796327,
			y: 0,
			z: 0,
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
				currently_animating = false;
			
				in_2d_view = true;
			});
		}, 500);
	}
	
	
	//Needs updating to work with
	function draw_all_2d_view_text()
	{
		wilson_numbers.ctx.clearRect(0, 0, wilson_numbers.canvas_width, wilson_numbers.canvas_height);
		
		arrays.forEach(array =>
		{
			//Show the numbers in the right places.
			for (let i = 0; i < array.footprint; i++)
			{
				for (let j = 0; j < array.footprint; j++)
				{
					draw_single_cell_2d_view_text(array, i, j);
				}
			}
		});
	}
	
	function draw_single_cell_2d_view_text(array, row, col)
	{
		wilson_numbers.ctx.clearRect(font_size * (col + 1), font_size * (row + 1), font_size, font_size);
		
		let text_metrics = wilson_numbers.ctx.measureText(array.numbers[row][col]);
		
		//The height adjustment is an annoying spacing computation.
		wilson_numbers.ctx.fillText(array.numbers[row][col], font_size * (col + 1) + (font_size - text_metrics.width) / 2, font_size * (row + 1) + (font_size + text_metrics.actualBoundingBoxAscent - text_metrics.actualBoundingBoxDescent) / 2);
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	function color_cubes(coordinates, hue)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < coordinates.length - 1; i++)
			{
				let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material.color;
				
				let temp_object = {s: 0};
				
				setTimeout(() =>
				{
					anime({
						targets: temp_object,
						s: 1,
						duration: 500,
						easing: "easeOutQuad",
						update: () => {target.setHSL(hue, temp_object.s, .5)}
					});
				}, 50 * i);	
			}
			
			
			
			let i = coordinates.length - 1;
			
			let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material.color;
			
			let temp_object = {s: 0};
			
			setTimeout(() =>
			{
				anime({
					targets: temp_object,
					s: 1,
					duration: 500,
					easing: "easeOutQuad",
					update: () => {target.setHSL(hue, temp_object.s, .5)},
					complete: resolve
				});
			}, 50 * i);
		});
	}
	
	
	
	//Lifts the specified cubes to the specified height.
	function raise_cubes(coordinates, height)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < coordinates.length - 1; i++)
			{
				let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].position;
				
				anime({
					targets: target,
					y: height,
					duration: 500,
					easing: "easeInOutQuad"
				});
			}
			
			
			
			let i = coordinates.length - 1;
			
			let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].position;
			
			anime({
				targets: target,
				y: height,
				duration: 500,
				easing: "easeInOutQuad",
				complete: resolve
			});
		});	
	}
	
	
	
	//Fades the specified cubes' opacity to zero, and then deletes them.
	function delete_cubes(coordinates)
	{
		return new Promise((resolve, reject) =>
		{
			for (let i = 0; i < coordinates.length - 1; i++)
			{
				let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material;
				
				anime({
					targets: target,
					opacity: 0,
					duration: 250,
					easing: "easeOutQuad"
				});
			}
			
			
			
			let i = coordinates.length - 1;
			
			let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material;
			
			anime({
				targets: target,
				opacity: 0,
				duration: 250,
				easing: "easeOutQuad",
				complete: resolve
			});
		});
	}
	
	
	
	async function hillman_grassl()
	{
		let plane_partition_copy = JSON.parse(JSON.stringify(plane_partition));
		
		let zigzag_paths = [];
		
		while (true)
		{
			//Find the right-most nonzero entry in the top row.
			let starting_col = plane_partition_copy[0].length - 1;
			
			while (starting_col >= 0 && plane_partition_copy[0][starting_col] === 0)
			{
				starting_col--;
			}
			
			if (starting_col < 0)
			{
				break;
			}
			
			
			
			let current_row = 0;
			let current_col = starting_col;
			
			let path = [[current_row, current_col, plane_partition_copy[current_row][current_col] - 1]];
			
			while (true)
			{
				if (current_row < plane_partition_copy.length - 1 && plane_partition_copy[current_row + 1][current_col] === plane_partition_copy[current_row][current_col])
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
				
				path.push([current_row, current_col, plane_partition_copy[current_row][current_col] - 1]);
			}
			
			
			
			for (let i = 0; i < path.length; i++)
			{
				plane_partition_copy[path[i][0]][path[i][1]]--;
			}
			
			zigzag_paths.push(path);
		}
		
		
		
		//Now we'll animate those paths actually decrementing, one-by-one.
		for (let i = 0; i < zigzag_paths.length; i++)
		{
			let hue = i / zigzag_paths.length * 6/7;
			
			await color_cubes(zigzag_paths[i], hue);
			
			if (!in_2d_view)
			{
				//Lift all the cubes up.
				await raise_cubes(zigzag_paths[i], plane_partition[0][0]);
			}
			
			//Now we actually delete the cubes.
			for (let j = 0; j < zigzag_paths[i].length; j++)
			{
				plane_partition[zigzag_paths[i][j][0]][zigzag_paths[i][j][1]]--;
				
				draw_single_cell_2d_view_text(zigzag_paths[i][j][0], zigzag_paths[i][j][1]);
			}
			
			await delete_cubes(zigzag_paths[i]);
		}
	}
}()