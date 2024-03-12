
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity(canvasBundle, 0, duration / 2);

	slide.appendChild(canvasBundle);

	applet.wilsonNumbers.draggables.onResize();

	const rpp =
	[
		[1, 0, 1],
		[1, 2, 0],
		[0, 0, 1]
	];

	applet.animationTime = 0;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, rpp, false, false);

	if (!applet.in2dView)
	{
		await applet.show2dView();
	}

	await changeOpacity(canvasBundle, 1, duration / 2);
}

export const garverPatrias2Builds =
{
	reset,
};