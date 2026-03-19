import { FractalSounds } from "/applets/fractal-sounds/scripts/class.js";

let applet;

async function build2({ forward })
{
	if (!forward)
	{
		return;
	}

	applet.run({
		resolution: 2000,
		algorithm: "merge",
		dataLength: 512,
		doPlaySound: true,
	});
}

function load({ slide })
{
	if (applet)
	{
		applet.run({
			resolution: 2000,
			algorithm: "merge",
			dataLength: 512,
			shuffle: false,
		});

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
	2: build2,
	load,
	unload
};