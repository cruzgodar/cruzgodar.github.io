!async function()
{
	"use strict";
	
	
	
	let options =
	{
		canvas_width: 1000,
		canvas_height: 1000,
		
		mousedown_callback: on_grab_canvas,
		touchstart_callback: on_grab_canvas,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas,
		
		mouseup_callback: on_release_canvas,
		touchend_callback: on_release_canvas
	};
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), options);
	
	
	
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
	
	
	
	let show_hex_view_button_element = Page.element.querySelector("#show-hex-view-button");
	
	show_hex_view_button_element.addEventListener("click", show_hex_view);
	
	
	
	let show_2d_view_button_element = Page.element.querySelector("#show-2d-view-button");
	
	show_2d_view_button_element.addEventListener("click", show_2d_view);
	
	
	
	const scene = new THREE.Scene();
	
	const orthographic_camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 1000);
	orthographic_camera.position.set(5, 5, 5);
	orthographic_camera.lookAt(0, 0, 0);
	
	
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(1000, 1000, false);
	
	
	
	const loader = new THREE.TextureLoader();
	
	const cube_texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 1, 1000);
	point_light.position.set(75, 100, 50);
	scene.add(point_light);
	
	const cube_group = new THREE.Object3D();
	scene.add(cube_group);
	
	
	
	let rotation_y_velocity = 0;
	let next_rotation_y_velocity = 0;
	
	const rotation_y_velocity_friction = .94;
	const rotation_y_velocity_start_threshhold = .005;
	const rotation_y_velocity_stop_threshhold = .0005;
	
	
	
	let in_2d_view = false;
	
	
	
	let plane_partition = 
	[
		[5, 3, 2, 1],
		[4, 3, 1, 0],
		[4, 2, 1, 0],
		[3, 1, 0, 0]
	];
	
	let plane_partition_size = 1;
	let plane_partition_flat_size = 1;
	
	let cubes = [];
	
	construct_plane_partition();
	
	
	
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
		
		
		cube_group.rotation.y += x_delta;
		
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
			cube_group.rotation.y += rotation_y_velocity;
			
			rotation_y_velocity *= rotation_y_velocity_friction;
			
			if (Math.abs(rotation_y_velocity) < rotation_y_velocity_stop_threshhold)
			{
				rotation_y_velocity = 0;
			}
		}
		
		
		
		if (cube_group.rotation.y > 3.14159265)
		{
			cube_group.rotation.y -= 6.283185301;
		}
		
		else if (cube_group.rotation.y < -3.14159265)
		{
			cube_group.rotation.y += 6.283185301;
		}
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function construct_plane_partition()
	{
		let max_entry = 0;
		let max_row_length = 0;
		
		cubes = new Array(plane_partition.length);
		
		for (let i = 0; i < plane_partition.length; i++)
		{
			cubes[i] = new Array(plane_partition[i].length);
			
			if (plane_partition[i].length > max_row_length)
			{
				max_row_length = plane_partition[i].length;
			}
			
			for (let j = 0; j < plane_partition[i].length; j++)
			{
				cubes[i][j] = new Array(plane_partition[i][j]);
				
				if (plane_partition[i][j] > max_entry)
				{
					max_entry = plane_partition[i][j];
				}
				
				for (let k = 0; k < plane_partition[i][j]; k++)
				{
					cubes[i][j][k] = add_cube(j, k, i);
				}
			}
		}
		
		plane_partition_flat_size = Math.max(plane_partition.length, max_row_length);
		
		plane_partition_size = Math.max(plane_partition_flat_size, max_entry);
		
		orthographic_camera.left = -plane_partition_size;
		orthographic_camera.right = plane_partition_size;
		orthographic_camera.top = plane_partition_size;
		orthographic_camera.bottom = -plane_partition_size;
		orthographic_camera.position.set(plane_partition_size, plane_partition_size, plane_partition_size);
		orthographic_camera.lookAt(0, 0, 0);
		orthographic_camera.updateProjectionMatrix();
	}
	
	function add_cube(x, y, z)
	{
		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshStandardMaterial({map: cube_texture});
		
		const cube = new THREE.Mesh(geometry, material);
		
		cube_group.add(cube);
		
		cube.position.set(x, y, z);
		
		return cube;
	}
	
	
	
	function show_hex_view()
	{
		highlight_cubes([[0, 0, 4]], [0, 1, .5]);
		
		anime({
			targets: orthographic_camera.position,
			x: plane_partition_size,
			y: plane_partition_size,
			z: plane_partition_size,
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
			left: -plane_partition_size,
			right: plane_partition_size,
			top: plane_partition_size,
			bottom: -plane_partition_size,
			duration: 500,
			easing: "easeInOutQuad",
			update: () => orthographic_camera.updateProjectionMatrix()
		});
		
		anime({
			targets: cube_group.rotation,
			y: 0,
			duration: 500,
			easing: "easeInOutQuad"
		});
		
		in_2d_view = false;
	}
	
	function show_2d_view()
	{
		anime({
			targets: orthographic_camera.position,
			x: (plane_partition_flat_size - 1) / 2,
			y: plane_partition_size,
			z: (plane_partition_flat_size - 1) / 2,
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
			left: -(plane_partition_flat_size - 1),
			right: plane_partition_flat_size - 1,
			top: plane_partition_flat_size - 1,
			bottom: -(plane_partition_flat_size - 1),
			duration: 500,
			easing: "easeInOutQuad",
			update: () => orthographic_camera.updateProjectionMatrix()
		});
		
		anime({
			targets: cube_group.rotation,
			y: 0,
			duration: 500,
			easing: "easeInOutQuad"
		});
		
		in_2d_view = true;
	}
	
	
	
	//coordinates is a list of length-3 arrays [i, j, k] containing the coordinates of the cubes to highlight.
	function highlight_cubes(coordinates, hsl)
	{
		for (let i = 0; i < coordinates.length; i++)
		{
			let target = cubes[coordinates[i][0]][coordinates[i][1]][coordinates[i][2]].material.color;
			
			let temp_object = {};
			
			target.getHSL(temp_object);
			
			anime({
				targets: temp_object,
				h: hsl[0],
				s: hsl[1],
				l: hsl[2],
				duration: 500,
				easing: "easeOutQuad",
				update: () => {target.setHSL(temp_object.h, temp_object.s, temp_object.l)}
			});
		}
	}
}()