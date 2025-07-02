
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

	const spp =
	[
		[Infinity, Infinity, Infinity, Infinity, 7, 4, 2],
		[Infinity, Infinity, 10, 8, 6, 4, 2],
		[Infinity, 11, 7, 5, 4, 3, 2],
		[10, 9, 4, 3, 2, 1, 0],
		[3, 3, 2, 1, 0, 0, 0],
		[1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
	];

	applet.animationTime = 0;

	await applet.removeAllArrays();

	await applet.addNewArray({
		index: 0,
		numbers: spp,
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

async function build0({ slide, forward, duration = 400 })
{
	if (forward)
	{
		applet.animationTime = duration;

		await applet.runAlgorithm("godar1", 0);
	}

	else
	{

		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: duration / 2
		});
		
		await reset({ slide, duration: 0, forward: true });

		await changeOpacity({
			element: canvasBundle,
			opacity: 1,
			duration: duration / 2
		});
	}
}

export const oneLegBijectionBuilds =
{
	reset,
	0: build0,
};