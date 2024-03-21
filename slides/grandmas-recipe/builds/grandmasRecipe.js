import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

const resolution = 1500;
const maxDepth = 250;
const maxPixelBrightness = 50;

async function reset({ slide, duration })
{
	if (slide.contains(canvasBundle))
	{
		return;
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet.wilson.draggables.worldCoordinates = [[2, 0], [2, 0], [2, -2]];
	applet.wilson.draggables.onResize();

	applet.changeRecipe(0);
	applet.grandmaCoefficients(2, 0, 2, 0);

	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const grandmasRecipeBuilds =
{
	reset,
};