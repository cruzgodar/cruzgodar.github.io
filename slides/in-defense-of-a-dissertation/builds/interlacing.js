
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

	applet.animationTime = 0;

	slide.appendChild(canvasBundle);

	const planePartition = [
		[5, 3, 3, 0, 0],
		[0, 3, 2, 2, 0],
		[0, 0, 1, 1, 0],
		[0, 0, 0, 1, 0],
		[0, 0, 0, 0, 0]
	];

	await applet.removeAllArrays();

	await applet.addNewArray({
		index: 0,
		numbers: planePartition,
		horizontalLegs: false
	});

	await applet.hideFloor();

	if (!applet.in2dView)
	{
		await applet.show2dView();
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const interlacingBuilds =
{
	reset,
};