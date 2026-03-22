import { Boids } from "/applets/boids/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new Boids({
		canvas,
	});

	applet.run({
		numBoids: 2000,
		numBoidsOfPrey: 1,
		alignmentFactor: 0.006,
		avoidFactor: 0.15
	});
}

function unload()
{
	applet?.pause?.();
}

export const thankYouBuilds =
{
	load,
	unload
};