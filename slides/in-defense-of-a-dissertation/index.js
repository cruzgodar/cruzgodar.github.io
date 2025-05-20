import { appBuilds } from "./builds/app.js";
import { edgeSequencesBuilds } from "./builds/edgeSequences.js";
import { garverPatriasBuilds } from "./builds/garverPatrias.js";
import { garverPatrias2Builds } from "./builds/garverPatrias2.js";
import { garverPatrias3Builds } from "./builds/garverPatrias3.js";
import { garverPatrias4Builds } from "./builds/garverPatrias4.js";
import { hillmanGrasslBuilds } from "./builds/hillmanGrassl.js";
import { hooksBuilds } from "./builds/hooks.js";
import { hooks2Builds } from "./builds/hooks2.js";
import { interlacingBuilds } from "./builds/interlacing.js";
import { oneLegBijectionBuilds } from "./builds/oneLegBijection.js";
import { planePartitionExampleBuilds } from "./builds/planePartitionExample.js";
import { psRskBuilds } from "./builds/psRsk.js";
import { regionsExampleBuilds } from "./builds/regionsExample.js";
import { sulzgruberBuilds } from "./builds/sulzgruber.js";
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

document.body.querySelectorAll(".WILSON_draggables-container")
	.forEach(element => element.classList.add("lapsa-interactable"));

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
		"interlacing": interlacingBuilds,
		"toggles": togglesBuilds,
		"toggles2": toggles2Builds,
		"zeroLeg": zeroLegBuilds,
		"edgeSequences": edgeSequencesBuilds,
		"app": appBuilds,
		"oneLegBijection": oneLegBijectionBuilds,
		"twoLegBijection": twoLegBijectionBuilds,

		"hillman-grassl": hillmanGrasslBuilds,
		"regions-example": regionsExampleBuilds,
		"sulzgruber": sulzgruberBuilds,
		"ps-rsk": psRskBuilds,
		"garver-patrias": garverPatriasBuilds,
		"garver-patrias-2": garverPatrias2Builds,
		"garver-patrias-3": garverPatrias3Builds,
		"garver-patrias-4": garverPatrias4Builds,
	}
};

new Lapsa(options);