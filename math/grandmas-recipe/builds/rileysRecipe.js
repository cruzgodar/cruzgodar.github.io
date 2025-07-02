
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

const resolution = 1000;
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

	applet.wilson.setDraggables({
		ta: [2, 0],
		tb: [2, 0],
		tc: [2, -2]
	});

	applet.changeRecipe("riley");
	applet.bakeCoefficients();

	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const rileysRecipeBuilds =
{
	reset,
};