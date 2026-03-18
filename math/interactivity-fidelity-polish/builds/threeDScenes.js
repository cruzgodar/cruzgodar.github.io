import { Mandelbulb } from "/applets/mandelbulb/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new Mandelbulb({
		canvas,
		resolution: 1000,
	});
}

function unload()
{
	applet?.pause?.();
}

export const threeDScenesBuilds =
{
	load,
	unload
};