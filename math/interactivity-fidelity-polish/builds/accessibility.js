import { LyapunovFractals } from "/applets/lyapunov-fractals/scripts/class.js";

let applet;

async function reset({ forward })
{
	applet.run({
		generatingString: forward ? "AB" : "ABA",
		instant: true,
	});
}

async function build3({ forward })
{
	applet.run({
		generatingString: forward ? "ABA" : "AB",
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

	applet = new LyapunovFractals({
		canvas,
	});
}

function unload()
{
	applet?.pause?.();
}

export const accessibilityBuilds =
{
	reset,
	3: build3,
	load,
	unload
};