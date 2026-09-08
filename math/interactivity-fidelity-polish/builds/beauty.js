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
		theta: 1.5393,
		phi: 2.4907,
		sceneOrigin: [-0.0072, -1.3808, 1.9211],
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