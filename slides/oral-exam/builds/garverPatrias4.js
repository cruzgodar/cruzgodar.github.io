
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
		[0, 1, 2],
		[0, 1, 4],
		[2, 4, 5]
	];

	applet.animationTime = 0;

	await applet.removeAllArrays();

	await applet.addNewArray({
		index: 0,
		numbers: rpp,
		horizontalLegs: false
	});

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

export const garverPatrias4Builds =
{
	reset,
};