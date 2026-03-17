import { KaleidoscopicIFSFractals } from "/applets/kaleidoscopic-ifs-fractals/scripts/class.js";

let applet;

async function reset({ forward })
{
	applet.wilson.resizeCanvas({
		width: forward ? 100 : 500
	});
}

async function build2({ forward })
{
	applet.wilson.resizeCanvas({
		width: forward ? 500 : 100
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

	applet = new KaleidoscopicIFSFractals({
		canvas,
		epsilonScaling: 100,
		minEpsilon: 0.0075,
	});
}

function unload()
{
	applet?.pause?.();
}

export const fidelityBuilds =
{
	reset,
	2: build2,
	load,
	unload
};