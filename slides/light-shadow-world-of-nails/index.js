import { cubeAndSpongeBuilds } from "./builds/cubeAndSponge.js";
import { foldingSpaceBuilds } from "./builds/foldingSpace.js";
import { groundAndSphereBuilds } from "./builds/groundAndSphere.js";
import { kIFSBuilds } from "./builds/kIFS.js";
import { lightingBuilds } from "./builds/lighting.js";
import { mandelbulbAndQJuliaBuilds } from "./builds/mandelbulbAndQJulia.js";
import { shadowsBuilds } from "./builds/shadows.js";
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
	applet.changeResolution(resolution);

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
		"mandelbulb-and-qjulia": mandelbulbAndQJuliaBuilds,
	},

	setupBuild: () =>
	{
		uniformLoop.forEach(uniformLoop => uniformLoop?.pause && uniformLoop.pause());
		uniformLoop = [];
		applet?.pause && applet.pause();
	}
};

new Lapsa(options);