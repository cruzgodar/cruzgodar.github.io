import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

const resolution = 1000;
const maxDepth = 250;
const maxPixelBrightness = 50;

async function reset({ slide, duration })
{
	if (!slide.contains(canvasBundle))
	{
		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: duration / 2
		});

		slide.appendChild(canvasBundle);
	}

	applet.changeRecipe("grandma");
	applet.bakeCoefficients([1.75, -.3719], [1.8638, .2691]);

	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const titleBuilds =
{
	reset,
};