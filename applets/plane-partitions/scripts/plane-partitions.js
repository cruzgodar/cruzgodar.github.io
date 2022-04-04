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
	
	
	
	let plane_partition = 
	[
		[5, 3, 2, 1],
		[4, 3, 1, 0],
		[4, 2, 1, 0],
		[3, 1, 0, 0]
	];
	
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
		cube_group.rotation.y += x_delta;
		
		next_rotation_y_velocity = x_delta;
	}
	
	function on_release_canvas(x, y, event)
	{
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
		
		
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function construct_plane_partition()
	{
		let max_entry = 0;
		let max_row_length = 0;
		
		for (let i = 0; i < plane_partition.length; i++)
		{
			if (plane_partition[i].length > max_row_length)
			{
				max_row_length = plane_partition[i].length;
			}
			
			for (let j = 0; j < plane_partition[i].length; j++)
			{
				if (plane_partition[i][j] > max_entry)
				{
					max_entry = plane_partition[i][j];
				}
				
				for (let k = 0; k < plane_partition[i][j]; k++)
				{
					add_cube(j, k, i);
				}
			}
		}
		
		let size = Math.max(Math.max(plane_partition.length, max_row_length), max_entry);
		
		orthographic_camera.left = -size;
		orthographic_camera.right = size;
		orthographic_camera.top = size;
		orthographic_camera.bottom = -size;
		orthographic_camera.position.set(size, size, size);
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
}()