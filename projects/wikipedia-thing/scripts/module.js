"use strict";



import * as THREE from "/scripts/three.min.js";

let options =
{
	renderer: "hybrid",
	
	canvas_width: 1000,
	canvas_height: 1000,
	
	
	
	use_fullscreen: true,

	use_fullscreen_button: true,
	
	enter_fullscreen_button_icon_path: "/graphics/general-icons/enter-fullscreen.png",
	exit_fullscreen_button_icon_path: "/graphics/general-icons/exit-fullscreen.png",
	
	
	
	touchmove_callback: on_drag_canvas,
	mousemove_callback: on_hover_canvas
};

let wilson = new Wilson(document.querySelector("#output-canvas"), options);



const canvas = wilson.canvas;
const renderer = new THREE.WebGLRenderer({canvas});



let camera_x = 2;
let camera_y = 0;
let camera_z = 0;

let camera_theta = 3.14;
let camera_phi = 1.57;



const fov = 75;
const aspect_ratio = 1;
const near_clip = 0.1;
const far_clip = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect_ratio, near_clip, far_clip);

camera.position.set(2, 0, 0);
camera.up = new THREE.Vector3(0, 0, 1);

let camera_target = new THREE.Vector3(0, 0, 0);

camera.lookAt(camera_target);



const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);



const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({color: 0x44aa88}));

scene.add(cube);



const light = new THREE.DirectionalLight(0xFFFFFF, 1); //color, intensity

light.position.set(3, 3, 3);

scene.add(light);



window.requestAnimationFrame(draw_frame);



function draw_frame(timestamp)
{
	let rotation = timestamp / 1000;
	
	cube.rotation.x = rotation;
	cube.rotation.y = rotation;
	
	renderer.render(scene, camera);
	
	window.requestAnimationFrame(draw_frame);
}



function on_drag_canvas(x, y, x_delta, y_delta, event)
{
	camera_theta += x_delta * Math.PI;
		
	camera_phi += y_delta * Math.PI;
	
	camera_phi = Math.min(Math.max(camera_phi, .01), Math.PI - .01);
	
	camera_target.x = Math.cos(camera_theta) * Math.sin(camera_phi) + camera_x;
	camera_target.y = Math.sin(camera_theta) * Math.sin(camera_phi) + camera_y;
	camera_target.z = Math.cos(camera_phi) + camera_z;
	
	camera.lookAt(camera_target);
}

function on_hover_canvas(x, y, x_delta, y_delta, event)
{
	camera_theta -= x_delta * Math.PI;
		
	camera_phi -= y_delta * Math.PI;
	
	camera_phi = Math.min(Math.max(camera_phi, .01), Math.PI - .01);
	
	camera_target.x = Math.cos(camera_theta) * Math.sin(camera_phi) + camera_x;
	camera_target.y = Math.sin(camera_theta) * Math.sin(camera_phi) + camera_y;
	camera_target.z = Math.cos(camera_phi) + camera_z;
	
	camera.lookAt(camera_target);
}