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
			includeMandelbulb: true,
		},
		slide,
		duration,
	});

	applet.setUniforms({ mandelbulbWeight: 1 });
}

export const mandelbulbBuilds =
{
	reset,
};