!async function()
{
	"use strict";
	
	
	
	let wilson = new Wilson(document.querySelector("#output-canvas"), {canvas_width: 1000, canvas_height: 1000});
	
	
	
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
		
		
		
		await Site.load_script("/scripts/three-meshlines.min.js")
		
		.catch((error) =>
		{
			console.error("Could not load THREE.js");
		});
	}
	
	
	
	const scene = new THREE.Scene();
	
	//FOV, aspect ratio, near clip, far clip
	const camera = new THREE.PerspectiveCamera(90, 1, .1, 1000);
	camera.position.z = 5;
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(1000, 1000, false);
	
	
	
	const loader = new THREE.TextureLoader();
	
	const texture = loader.load("/applets/plane-partitions/graphics/cube-face.png");
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.NearestFilter;
	
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshStandardMaterial({map: texture});
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);
	
	
	
	const ambient_light = new THREE.AmbientLight(0xffffff, .2);
	scene.add(ambient_light);
	
	const point_light = new THREE.PointLight(0xffffff, 5, 100);
	point_light.position.set(50, 50, 50);
	scene.add(point_light);
	
	
	
	function draw_frame()
	{
		renderer.render(scene, camera);
		
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
		
		window.requestAnimationFrame(draw_frame);
	}
	
	draw_frame();
	
	
	
	setTimeout(() => Page.show(), 500);
}()