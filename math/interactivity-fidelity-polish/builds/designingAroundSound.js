import { FractalSounds } from "/applets/fractal-sounds/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new FractalSounds({
		canvas,
	});

	applet.run({
		resolution: 2000,
		algorithm: "merge",
		dataLength: 512,
		shuffle: false,
	});
}

function unload()
{
	applet?.pause?.();
}

export const designingAroundSoundBuilds =
{
	load,
	unload
};