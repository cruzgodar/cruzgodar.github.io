import { WilsonsAlgorithm } from "/applets/wilsons-algorithm/scripts/class.js";

let applet;

async function reset({ forward })
{
	if (!forward)
	{
		build3({ forward: true });
	}
}

function load({ slide })
{
	if (applet)
	{
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new WilsonsAlgorithm({
		canvas,
	});
}

async function build3({ forward })
{
	if (!forward)
	{
		return;
	}

	applet.run({
		gridSize: 200,
		animateMaze: false,
		animateColoring: true,
	});
}

function unload()
{
	applet.destroy();
	applet = undefined;
}

export const webAssemblyBuilds =
{
	reset,
	3: build3,
	load,
	unload
};