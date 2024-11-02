import { cubeAndSpongeBuilds } from "./builds/cubeAndSponge.js";
import { curvedSpaceBuilds } from "./builds/curvedSpace.js";
import { e3Builds } from "./builds/e3.js";
import { foldingSpaceBuilds } from "./builds/foldingSpace.js";
import { groundAndSphereBuilds } from "./builds/groundAndSphere.js";
import { h2xeBuilds } from "./builds/h2xe.js";
import { kIFSBuilds } from "./builds/kIFS.js";
import { lightingBuilds } from "./builds/lighting.js";
import { mandelbulbBuilds } from "./builds/mandelbulb.js";
import { qJuliaBuilds } from "./builds/qJulia.js";
import { shadowsBuilds } from "./builds/shadows.js";
import { sl2rBuilds } from "./builds/sl2r.js";
import { sphereAndCubeBuilds } from "./builds/sphereAndCube.js";
import { titleBuilds } from "./builds/title.js";
import Lapsa from "/scripts/lapsa.js";
import { changeOpacity } from "/scripts/src/animation.js";

export const canvasBundle = document.body.querySelector("#canvas-bundle");
const outputCanvas = document.body.querySelector("#output-canvas");

export let uniformLoop = [];
export function addUniformLoop(newUniformLoop)
{
	uniformLoop.push(newUniformLoop);
}

export let applet;
export async function initializeApplet({
	Class,
	parameters = {},
	slide,
	duration,
	resolution = 1000
}) {
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet?.destroy && applet.destroy();

	applet = new Class({
		canvas: outputCanvas,
		...parameters
	});
	applet.nonFullscreenAspectRatio = 16 / 9;

	try {applet.changeResolution(resolution);}
	// eslint-disable-next-line no-unused-vars
	catch(ex) {/* Thurston Geometries don't have this */}

	document.body.querySelectorAll(".wilson-draggables-container")
		.forEach(element => element.classList.add("lapsa-interactable"));

	changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		"title": titleBuilds,
		"ground-and-sphere": groundAndSphereBuilds,
		"lighting": lightingBuilds,
		"shadows": shadowsBuilds,
		"folding-space": foldingSpaceBuilds,
		"sphere-and-cube": sphereAndCubeBuilds,
		"cube-and-sponge": cubeAndSpongeBuilds,
		"kifs": kIFSBuilds,
		"mandelbulb": mandelbulbBuilds,
		"qjulia": qJuliaBuilds,
		"curved-space": curvedSpaceBuilds,
		"e3": e3Builds,
		"h2xe": h2xeBuilds,
		"sl2r": sl2rBuilds,
	},

	setupBuild: () =>
	{
		uniformLoop.forEach(uniformLoop => uniformLoop?.pause && uniformLoop.pause());
		uniformLoop = [];
		applet?.pause && applet.pause();
		if (applet)
		{
			applet.animationPaused = true;
		}
	}
};

new Lapsa(options);