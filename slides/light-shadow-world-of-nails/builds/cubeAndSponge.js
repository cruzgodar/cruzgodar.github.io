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
			includeExtrudedCube: true,
			includeMengerSponge: true,
		},
		slide,
		duration,
	});

	applet.setUniforms({
		extrudedCubeWeight: 1,
		mengerSpongeScale: 2.25,
	});

	if (!forward)
	{
		applet.setUniforms({
			extrudedCubeWeight: 0,
			mengerSpongeWeight: 1,
		});
	}

	addUniformLoop(
		applet.loopUniform({
			name: "extrudedCubeSeparation",
			startValue: 1,
			endValue: 1.75,
			duration: 3000
		})
	);
}

function showSponge({ forward, duration })
{
	applet.animateUniform({
		name: "extrudedCubeWeight",
		value: forward ? 0 : 1,
		duration
	});

	applet.animateUniform({
		name: "mengerSpongeWeight",
		value: forward ? 1 : 0,
		duration
	});
}

export const cubeAndSpongeBuilds =
{
	reset,
	0: showSponge,
};