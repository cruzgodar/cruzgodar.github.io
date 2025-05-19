
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const rpp =
	[
		[0, 0, 0, 0, 1],
		[0, 0, 1, 1, 1],
		[0, 1, 1, 1, 1],
		[1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1],
	];

	applet.animationTime = 0;

	await applet.removeAllArrays();

	const array = await applet.addNewArray({
		index: 0,
		numbers: rpp,
		horizontalLegs: false
	});

	applet.hideFloor(array);

	if (!applet.in2dView)
	{
		await applet.show2dView();
	}

	await applet.hideNumbersCanvas();



	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const edgeSequencesBuilds =
{
	reset,
};