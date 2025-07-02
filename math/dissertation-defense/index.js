import { appBuilds } from "./builds/app.js";
import { hillmanGrasslBuilds } from "./builds/hillmanGrassl.js";
import { hooksBuilds } from "./builds/hooks.js";
import { hooks2Builds } from "./builds/hooks2.js";
import { interlacingBuilds } from "./builds/interlacing.js";
import { oneLegBijectionBuilds } from "./builds/oneLegBijection.js";
import { planePartitionExampleBuilds } from "./builds/planePartitionExample.js";
import { titleBuilds } from "./builds/title.js";
import { togglesBuilds } from "./builds/toggles.js";
import { toggles2Builds } from "./builds/toggles2.js";
import { twoLegBijectionBuilds } from "./builds/twoLegBijection.js";
import { zeroLegBuilds } from "./builds/zeroLeg.js";
import { PlanePartitions } from "/applets/plane-partitions/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new PlanePartitions({
	canvas: document.body.querySelector("#output-canvas"),
	numbersCanvas: document.body.querySelector("#numbers-canvas"),
	useFullscreenButton: false,
	backgroundColor: null
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

for (const element of document.body.querySelectorAll(".WILSON_draggables-container"))
{
	element.classList.add("lapsa-interactable");
}

function setup()
{
	applet.addWalls = false;
	applet.wallWidth = 16;
	applet.wallHeight = 16;
	applet.infiniteHeight = 50;
}

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	setupBuild: setup,

	builds:
	{
		"title": titleBuilds,
		"hooks": hooksBuilds,
		"hooks2": hooks2Builds,
		"plane-partition-example": planePartitionExampleBuilds,
		"hillman-grassl": hillmanGrasslBuilds,
		"interlacing": interlacingBuilds,
		"toggles": togglesBuilds,
		"toggles2": toggles2Builds,
		"zeroLeg": zeroLegBuilds,
		"app": appBuilds,
		"oneLegBijection": oneLegBijectionBuilds,
		"twoLegBijection": twoLegBijectionBuilds,
	}
};

new Lapsa(options);