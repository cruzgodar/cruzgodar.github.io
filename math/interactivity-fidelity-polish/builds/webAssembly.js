import { WilsonsAlgorithm } from "/applets/wilsons-algorithm/scripts/class.js";

let applet;

function load({ slide })
{
	const canvas = slide.querySelector("canvas");

	applet = new WilsonsAlgorithm({
		canvas,
	});

	applet.run({
		gridSize: 200,
		animateMaze: false,
		animateColoring: true,
	});
}

function unload()
{
	applet.de
}

export const webAssemblyBuilds =
{
	load,
	unload
};