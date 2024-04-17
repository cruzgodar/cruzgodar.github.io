import { e3AxesBuilds } from "./builds/e3-axes.js";
import { e3Builds } from "./builds/e3.js";
import { h3AxesBuilds } from "./builds/h3-axes.js";
import { s2Builds } from "./builds/s2.js";
import { s3AxesBuilds } from "./builds/s3-axes.js";
import { s3HopfFibrationBuilds } from "./builds/s3-hopf-fibration.js";
import { s3Builds } from "./builds/s3.js";
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
		"title": titleBuilds,
		"s2": s2Builds,

		"e3-axes": e3AxesBuilds,
		"e3": e3Builds,

		"s3-axes": s3AxesBuilds,
		"s3": s3Builds,
		"s3-hopf-fibration": s3HopfFibrationBuilds,

		"h3-axes": h3AxesBuilds,
	},

	setupBuild: () =>
	{
		applet.animationPaused = true;
		applet.automoving = false;
	},

	startingSlide: document.body.querySelectorAll("#lapsa-slide-container > div").length - 1
};

new Lapsa(options);