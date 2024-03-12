
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

	await changeOpacity(canvasBundle, 0, duration / 2);

	slide.appendChild(canvasBundle);

	applet.wilson.draggables.worldCoordinates = [
		[1.737, -0.224],
		[2.337, 0.987],
		[2.329, -1.673]
	];
	applet.wilson.draggables.onResize();

	applet.changeRecipe(2);
	applet.grandmaSpecialCoefficients(1.737, -0.224, 2.337, 0.987, 2.329, -1.673);

	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity(canvasBundle, 1, duration / 2);
}

export const specialRecipeBuilds =
{
	reset,
};