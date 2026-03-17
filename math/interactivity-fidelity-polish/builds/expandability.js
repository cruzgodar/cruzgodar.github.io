import { VectorField } from "/applets/vector-fields/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		applet?.wilson?.reset?.();
		
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new VectorField({
		canvas,
	});

	applet.wilson.animateReset = false;

	applet.run({
		generatingCode: "(sin(1.5*y) * 0.9, -sin(1.5*x) * 0.9)",
	});
}

function unload()
{
	applet?.pause?.();
}

export const expandabilityBuilds =
{
	load,
	unload
};