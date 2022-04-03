!async function()
{
	"use strict";
	
	
	
	let options =
	{
		canvas_width: 1000,
		canvas_height: 1000,
		
		mousedrag_callback: on_drag_canvas,
		touchmove_callback: on_drag_canvas
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
	
	add_cube(0, 0, 0);
	add_cube(0, 1, 0);
	add_cube(0, 1, 1);
	
	draw_frame();
	
	setTimeout(() => Page.show(), 500);
	
	
	
	function on_drag_canvas(x, y, x_delta, y_delta, event)
	{
		wilson.world_center_x -= x_delta;
		wilson.world_center_y -= y_delta;
		
		wilson.world_center_x = Math.min(Math.max(wilson.world_center_x, wilson.world_width / 2), 4 - wilson.world_width / 2);
		wilson.world_center_y = Math.min(Math.max(wilson.world_center_y, wilson.world_height / 2), 4 - wilson.world_height / 2);
		
		
		
		next_pan_velocity_x = -x_delta;
		next_pan_velocity_y = -y_delta;
	}
	
	
	
	function draw_frame()
	{
		renderer.render(scene, camera);
		
		cube_group.rotation.z += .01;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	
	
	function add_cube(x, y, z)
	{
		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshStandardMaterial({map: cube_texture});
		const cube = new THREE.Mesh(geometry, material);
		
		cube.position.set(x, y, z);
		
		cube_group.add(cube);
		
		return cube;
	}
}()