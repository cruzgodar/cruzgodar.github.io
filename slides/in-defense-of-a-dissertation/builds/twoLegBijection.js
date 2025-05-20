
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

let steps;

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
		[6, 5, 3, 3, 3, 3],
		[5, 3, 3, 1, 1, 1],
		[3, 3, 2, 0, 0, 0],
		[2, 2, 0, 0, 0, 0],
		[2, 2, 0, 0, 0, 0],
		[2, 2, 0, 0, 0, 0]
	];

	applet.animationTime = 0;

	await applet.removeAllArrays();

	await applet.addNewArray({
		index: 0,
		numbers: spp,
		horizontalLegs: true
	});

	if (applet.in2dView)
	{
		await applet.showHexView();
	}

	steps = applet.godar2(0);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build({ slide, forward, duration = 400, stepIndex })
{
	if (forward)
	{
		applet.animationTime = duration;

		await steps[stepIndex]();
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

export const twoLegBijectionBuilds =
{
	reset,
	0: ({ slide, forward, duration = 400 }) => build({ slide, forward, duration, stepIndex: 0 }),
	1: ({ slide, forward, duration = 400 }) => build({ slide, forward, duration, stepIndex: 1 }),
	2: ({ slide, forward, duration = 400 }) => build({ slide, forward, duration, stepIndex: 2 }),
	3: ({ slide, forward, duration = 400 }) => build({ slide, forward, duration, stepIndex: 3 }),
};