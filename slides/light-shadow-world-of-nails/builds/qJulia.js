import {
	ComposedFractals
} from "../../../applets/raymarching-fundamentals/scripts/composedFractals.js";
import { applet, initializeApplet } from "../index.js";

async function reset({ slide, duration })
{
	await initializeApplet({
		Class: ComposedFractals,
		parameters: {
			useShadows: false,
			useReflections: false,
			includeQJulia: true
		},
		slide,
		duration,
	});

	applet.setUniform("qJuliaWeight", 1);

	applet.wilson.worldCenterY = -Math.PI / 2;
}

export const qJuliaBuilds =
{
	reset,
};