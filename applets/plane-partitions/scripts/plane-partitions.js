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
	}
	
	
	
	const scene = new THREE.Scene();
	
	//FOV, aspect ratio, near clip, far clip
	const camera = new THREE.PerspectiveCamera(90, 1, .1, 1000);
	
	const renderer = new THREE.WebGLRenderer({canvas: wilson.canvas, antialias: true});
	
	renderer.setSize(1000, 1000, false);
	
	
	
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
	const cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	camera.position.z = 5;
	
	
	
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