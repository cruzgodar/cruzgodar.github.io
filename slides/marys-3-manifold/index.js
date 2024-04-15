import { s2Builds } from "./builds/s2.js";
import { titleBuilds } from "./builds/title.js";
import { ThurstonGeometry } from "/applets/thurston-geometries/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new ThurstonGeometry({
	canvas: document.body.querySelector("#output-canvas")
});

export const demoApplet = new ThurstonGeometry({
	canvas: document.body.querySelector("#demo-canvas")
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

document.body.querySelectorAll(".wilson-draggables-container")
	.forEach(element => element.classList.add("lapsa-interactable"));

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		title: titleBuilds,
		s2: s2Builds
	},

	setupBuild: () => applet.animationPaused = true,

	startingSlide: document.body.querySelectorAll("#lapsa-slide-container > div").length - 1
};

new Lapsa(options);