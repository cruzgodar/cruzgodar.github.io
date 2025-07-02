
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
		[1, 1, 1, 1, 1],
		[1, 1, 1, 0, 0],
		[1, 1, 0, 0, 0],
		[1, 1, 0, 0, 0],
		[1, 0, 0, 0, 0]
	];

	applet.animationTime = duration;

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

export const youngDiagramExampleBuilds =
{
	reset
};