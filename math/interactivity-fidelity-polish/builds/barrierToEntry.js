import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let applet;

async function reset({ forward })
{
	applet.run({
		generatingCode: forward ? "cmul(z, z) + c" : "csin(cmul(z, c))",
		worldAdjust: forward ? [-0.75, 0] : [0, 0],
		animate: false,
	});
}

async function build1({ forward })
{
	applet.run({
		generatingCode: forward ? "csin(cmul(z, c))" : "cmul(z, z) + c",
		worldAdjust: forward ? [0, 0] : [-0.75, 0],
	});
}

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new JuliaSetExplorer({
		canvas,
		generatingCode: "cmul(z, z) + c",
		worldAdjust: [-0.75, 0]
	});
}

function unload()
{
	applet?.pause?.();
}

export const barrierToEntryBuilds =
{
	reset,
	1: build1,
	load,
	unload
};