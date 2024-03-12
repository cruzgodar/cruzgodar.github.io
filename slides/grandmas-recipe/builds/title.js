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

	applet.changeRecipe(0);
	applet.bakeCoefficients(1.75, -.3719, 1.8638, .2691);

	await applet.requestHighResFrame(resolution, maxDepth, maxPixelBrightness, 4);

	await changeOpacity(canvasBundle, 1, duration / 2);
}

export const titleBuilds =
{
	reset,
};