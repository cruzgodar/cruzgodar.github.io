import { appBuilds } from "./builds/app.js";
import { garverPatriasBuilds } from "./builds/garverPatrias.js";
import { garverPatrias2Builds } from "./builds/garverPatrias2.js";
import { garverPatrias3Builds } from "./builds/garverPatrias3.js";
import { garverPatrias4Builds } from "./builds/garverPatrias4.js";
import { hillmanGrasslBuilds } from "./builds/hillmanGrassl.js";
import { hooksBuilds } from "./builds/hooks.js";
import { pakBuilds } from "./builds/pak.js";
import { planePartitionExampleBuilds } from "./builds/planePartitionExample.js";
import { psRskBuilds } from "./builds/psRsk.js";
import { regionsExampleBuilds } from "./builds/regionsExample.js";
import { sulzgruberBuilds } from "./builds/sulzgruber.js";
import { titleBuilds } from "./builds/title.js";
import { youngDiagramExampleBuilds } from "./builds/youngDiagramExample.js";
import { zigzagPathsBuilds } from "./builds/zigzagPaths.js";
import { PlanePartitions } from "/applets/plane-partitions/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new PlanePartitions({
	canvas: document.body.querySelector("#output-canvas"),
	numbersCanvas: document.body.querySelector("#numbers-canvas"),
	useFullscreenButton: false
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

document.body.querySelectorAll(".WILSON_draggables-container")
	.forEach(element => element.classList.add("lapsa-interactable"));



const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	builds:
	{
		"title": titleBuilds,
		"young-diagram-example": youngDiagramExampleBuilds,
		"plane-partition-example": planePartitionExampleBuilds,
		"hooks": hooksBuilds,
		"zigzag-paths": zigzagPathsBuilds,
		"hillman-grassl": hillmanGrasslBuilds,
		"pak": pakBuilds,
		"regions-example": regionsExampleBuilds,
		"sulzgruber": sulzgruberBuilds,
		"ps-rsk": psRskBuilds,
		"garver-patrias": garverPatriasBuilds,
		"garver-patrias-2": garverPatrias2Builds,
		"garver-patrias-3": garverPatrias3Builds,
		"garver-patrias-4": garverPatrias4Builds,
		"app": appBuilds
	}
};

new Lapsa(options);