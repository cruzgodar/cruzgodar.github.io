import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

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

	applet.wilson.setDraggables({
		ta: [2, 0],
		tb: [2, 0],
		tc: [2, -2]
	});

	await applet.changeRecipe("grandma");
	applet.clearFrame();
	applet.bakeCoefficients([2, 0], [2, 0]);
	applet.needNewFrame = true;

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