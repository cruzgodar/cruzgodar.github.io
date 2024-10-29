import {
	ComposedFractals
} from "../../../applets/raymarching-fundamentals/scripts/composedFractals.js";
import { addUniformLoop, applet, initializeApplet } from "../index.js";

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: ComposedFractals,
		parameters: {
			useShadows: false,
			useReflections: false,
			includeSphere: true,
			includeExtrudedCube: true,
		},
		slide,
		duration,
	});

	if (!forward)
	{
		applet.setUniform("sphereWeight", 0);
		applet.setUniform("extrudedCubeWeight", 1);
	}

	addUniformLoop(
		applet.loopUniform({
			name: "extrudedCubeSeparation",
			startValue: 1,
			endValue: 1.75,
			duration: 3000
		})
	);

	applet.wilson.worldCenterY = -Math.PI / 2;
}

function showCube({ forward, duration })
{
	applet.animateUniform({
		name: "sphereWeight",
		value: forward ? 0 : 1,
		duration
	});

	applet.animateUniform({
		name: "extrudedCubeWeight",
		value: forward ? 1 : 0,
		duration
	});
}

export const sphereAndCubeBuilds =
{
	reset,
	0: showCube,
};