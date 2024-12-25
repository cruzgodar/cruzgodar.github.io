import {
	ComposedFractals
} from "../../../applets/raymarching-fundamentals/scripts/composedFractals.js";
import { addUniformLoop, applet, canvasBundle, initializeApplet } from "../index.js";

async function reset({ slide, duration })
{
	if (applet && slide.contains(canvasBundle))
	{
		applet.resume();
	}

	await initializeApplet({
		Class: ComposedFractals,
		parameters: {
			useShadows: false,
			useReflections: false,
			includeExtrudedCube: true,
		},
		slide,
		duration
	});

	applet.setUniforms({
		extrudedCubeWeight: 1,
	});

	applet.wilson.worldCenterY = -Math.PI / 2;

	addUniformLoop(
		applet.loopUniform({
			name: "extrudedCubeSeparation",
			startValue: 1,
			endValue: 1.75,
			duration: 3000
		})
	);
}

export const titleBuilds =
{
	reset,
};