import { applet, canvasBundle, initializeApplet } from "../index.js";
import { CubeAndSponge } from "/applets/raymarching-fundamentals/scripts/cubeAndSponge.js";



async function reset({ slide, duration })
{
	if (applet && slide.contains(canvasBundle))
	{
		applet.resume();
		return;
	}

	await initializeApplet(CubeAndSponge, slide, duration);

	applet.wilson.worldCenterY = -Math.PI / 2;

	applet.loopUniform({
		name: "extrudedCubeSeparation",
		startValue: 1,
		endValue: 1.75,
		duration: 3000
	});
}

export const titleBuilds =
{
	reset,
};