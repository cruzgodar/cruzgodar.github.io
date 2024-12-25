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
			includeKIFS: true,
		},
		slide,
		duration,
	});

	applet.setUniforms({ kIFSWeight: 1 });
}

export const kIFSBuilds =
{
	reset,
};