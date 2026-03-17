import { WilsonsAlgorithm } from "/applets/wilsons-algorithm/scripts/class.js";

let applet;

async function reset({ forward })
{
	if (!forward)
	{
		build2({ forward: true });
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

async function build2({ forward })
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
}

export const webAssemblyBuilds =
{
	reset,
	2: build2,
	load,
	unload
};