import { groundAndSphereBuilds } from "./builds/groundAndSphere.js";
import { titleBuilds } from "./builds/title.js";
import Lapsa from "/scripts/lapsa.js";
import { changeOpacity } from "/scripts/src/animation.js";

export const canvasBundle = document.body.querySelector("#canvas-bundle");
const outputCanvas = document.body.querySelector("#output-canvas");

export let useShadows = false;
export function setUseShadows(newUseShadows)
{
	useShadows = newUseShadows;
}

export let useReflections = false;
export function setUseReflections(newUseReflections)
{
	useReflections = newUseReflections;
}

export let uniformLoop;
export function setUniformLoop(newUniformLoop)
{
	uniformLoop = newUniformLoop;
}

export let applet;
export async function initializeApplet(Class, slide, duration)
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet?.destroy && applet.destroy();

	applet = new Class({
		canvas: outputCanvas,
		useShadows,
		useReflections
	});
	applet.nonFullscreenAspectRatio = 16 / 9;
	applet.changeResolution(1000);

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
	},

	setupBuild: () =>
	{
		uniformLoop?.pause && uniformLoop.pause();
		applet?.pause && applet.pause();
	}
};

new Lapsa(options);