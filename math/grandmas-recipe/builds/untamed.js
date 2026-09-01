
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

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

	

	await applet.changeRecipe("grandma");
	applet.clearFrame();
	applet.bakeCoefficients([1.25, 0.1], [1.25, -0.1]);
	applet.needNewFrame = true;

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const untamedBuilds =
{
	reset,
};