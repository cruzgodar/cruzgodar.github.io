import {
	ComposedFractals
} from "../../../applets/raymarching-fundamentals/scripts/composedFractals.js";
import { applet, initializeApplet } from "../index.js";

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: ComposedFractals,
		parameters: {
			useShadows: false,
			useReflections: false,
			includeMandelbulb: true,
			includeQJulia: true,
		},
		slide,
		duration,
	});

	applet.setUniform("mandelbulbWeight", 1);

	if (!forward)
	{
		applet.setUniform("mandelbulbWeight", 0);
		applet.setUniform("qJuliaWeight", 1);
	}

	applet.wilson.worldCenterY = -Math.PI / 2;
}

function showQJulia({ forward, duration })
{
	applet.animateUniform({
		name: "mandelbulbWeight",
		value: forward ? 0 : 1,
		duration
	});

	applet.animateUniform({
		name: "qJuliaWeight",
		value: forward ? 1 : 0,
		duration
	});
}

export const mandelbulbAndQJuliaBuilds =
{
	reset,
	0: showQJulia,
};