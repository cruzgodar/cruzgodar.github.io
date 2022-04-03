!async function()
{
	"use strict";
	
	
	
	let options =
	{
		canvas_width: 1000,
		canvas_height: 1000,
		
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
	
	//FOV, aspect ratio, near clip, far clip
	const camera = new THREE.PerspectiveCamera(90, 1, .1, 1000);
	camera.position.set(5, 5, 5);
	camera.lookAt(0, 0, 0);
	
	let theta = camera.rotation.y;
	let phi = .75 * Math.PI;
	
	
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(1000, 1000, false);
	
	
	
	const loader = new THREE.TextureLoader();
	
	const cube_texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	cube_texture.minFilter = THREE.LinearFilter;
	cube_texture.magFilter = THREE.NearestFilter;
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 5, 100);
	point_light.position.set(50, 50, 50);
	scene.add(point_light);
	
	const cube_group = new THREE.Object3D();
	scene.add(cube_group);
	
	
	
	let rotation_y_velocity = 0;
	let next_rotation_y_velocity = 0;
	
	const rotation_y_velocity_friction = .94;
	const rotation_y_velocity_start_threshhold = .005;
	const rotation_y_velocity_stop_threshhold = .0005;
	
	
	
	add_cube(0, 0, 0);
	add_cube(0, 1, 0);
	add_cube(0, 0, 1);
	add_cube(1, 0, 0);
	add_cube(1, 0, 1);
	
	draw_frame();
	
	setTimeout(() => Page.show(), 500);
	
	
	
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
		renderer.render(scene, camera);
		
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