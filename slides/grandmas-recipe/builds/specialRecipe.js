
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

	applet.wilson.setDraggables({
		ta: [1.737, -0.224],
		tb: [2.337, 0.987],
		tc: [2.329, -1.673]
	});

	applet.changeRecipe("grandmaSpecial");
	applet.bakeCoefficients();


	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const specialRecipeBuilds =
{
	reset,
};