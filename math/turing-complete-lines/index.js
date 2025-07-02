import { betaReductionBuilds } from "./builds/betaReduction.js";
import { diagramsBuilds } from "./builds/diagrams.js";
import { getExampleBuilds } from "./builds/example.js";
import { titleBuilds } from "./builds/title.js";
import { LambdaCalculus } from "/applets/lambda-calculus/scripts/class.js";
import Lapsa from "/scripts/lapsa.js";

export const applet = new LambdaCalculus({
	canvas: document.body.querySelector("#output-canvas"),
});

export const canvasBundle = document.body.querySelector("#canvas-bundle");

function setup()
{
	applet.animationTime = 500;
}

const options =
{
	shelfIconPaths: "/graphics/lapsa-icons/",

	setupBuild: setup,

	builds:
	{
		title: titleBuilds,
		diagrams: diagramsBuilds,
		betaReduction: betaReductionBuilds,
		booleans: getExampleBuilds("&T(|(!F)F)"),
		addition: getExampleBuilds("+34"),
		multiplication: getExampleBuilds("*34"),
		exponentiation: getExampleBuilds("^34"),
		factorial: getExampleBuilds("(Yλf.λn._(<n)1(*n(f(<n))))3", 150),
		betterFactorial: getExampleBuilds("(λn.n(λg.λa.λb.g(>a)(*ab))(λa.λb.b)11)4", 300),
		// eslint-disable-next-line max-len
		upArrows: getExampleBuilds("(Yλf.λn.λa.λb.(_(<n)(ba)(((<b)(λg.λc.λd.gc(f(<n)cd)))(λc.λd.d)aa)))223", 75),
	}
};

new Lapsa(options);