import { addUniformLoop, applet, initializeApplet } from "../index.js";
import { CubeAndSponge } from "/applets/raymarching-fundamentals/scripts/cubeAndSponge.js";

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: CubeAndSponge,
		parameters: {
			useShadows: false,
			useReflections: false,
			includeExtrudedCube: true,
			includeMengerSponge: true,
		},
		slide,
		duration,
	});

	applet.setUniform("extrudedCubeWeight", 1);
	applet.setUniform("mengerSpongeScale", 2.25);

	if (!forward)
	{
		applet.setUniform("extrudedCubeWeight", 0);
		applet.setUniform("mengerSpongeWeight", 1);
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