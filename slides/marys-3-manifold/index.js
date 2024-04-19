import { e3AxesBuilds } from "./builds/e3-axes.js";
import { e3Builds } from "./builds/e3.js";
import { h2xeAxesBuilds } from "./builds/h2xe-axes.js";
import { h2xeBuilds } from "./builds/h2xe.js";
import { h3AxesBuilds } from "./builds/h3-axes.js";
import { h3Builds } from "./builds/h3.js";
import { nilAxesBuilds } from "./builds/nil-axes.js";
import { nilBuilds } from "./builds/nil.js";
import { s2Builds } from "./builds/s2.js";
import { s2xeAxesBuilds } from "./builds/s2xe-axes.js";
import { s2xeBuilds } from "./builds/s2xe.js";
import { s3AxesBuilds } from "./builds/s3-axes.js";
import { s3HopfFibrationBuilds } from "./builds/s3-hopf-fibration.js";
import { s3Builds } from "./builds/s3.js";
import { sl2rAxesBuilds } from "./builds/sl2r-axes.js";
import { sl2rBuilds } from "./builds/sl2r.js";
import { solAxesBuilds } from "./builds/sol-axes.js";
import { solBuilds } from "./builds/sol.js";
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
		"h3": h3Builds,

		"s2xe-axes": s2xeAxesBuilds,
		"s2xe": s2xeBuilds,

		"h2xe-axes": h2xeAxesBuilds,
		"h2xe": h2xeBuilds,

		"nil-axes": nilAxesBuilds,
		"nil": nilBuilds,

		"sl2r-axes": sl2rAxesBuilds,
		"sl2r": sl2rBuilds,

		"sol-axes": solAxesBuilds,
		"sol": solBuilds,
	},

	setupBuild: () =>
	{
		applet.fov = Math.tan(100 / 2 * Math.PI / 180);
		applet.restrictCamera = true;
		applet.animationPaused = true;
		applet.automoving = false;
	},
};

new Lapsa(options);