import { KaleidoscopicIFSFractals } from "/applets/kaleidoscopic-ifs-fractals/scripts/class.js";

let applet;

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
		shape: "tetrahedron",
		theta: 6.7483,
		phi: 2.4012,
		resolution: 750,
	});
	
	applet.changeScale(1.1679);
	applet.changeRotationAngles(1.762, 1.377, 3.845);
}

function unload()
{
	applet?.pause?.();
}

export const beautyBuilds =
{
	load,
	unload
};