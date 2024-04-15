import { titleBuilds } from "./builds/title.js";
import { ThurstonGeometry } from "/applets/thurston-geometries/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new ThurstonGeometry({
	canvas: document.body.querySelector("#output-canvas")
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		title: titleBuilds,
	},

	setupBuild: () => applet.animationPaused = true,

	startingSlide: document.body.querySelectorAll("#lapsa-slide-container > div").length - 1
};

new Lapsa(options);