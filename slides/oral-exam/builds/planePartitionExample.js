
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
		[6, 4, 3, 1, 1],
		[4, 3, 2, 0, 0],
		[3, 2, 0, 0, 0],
		[2, 1, 0, 0, 0],
		[1, 0, 0, 0, 0]
	];

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, planePartition, false, false);

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

async function build0({ forward, duration = 400 })
{
	applet.animationTime = duration;

	if (forward)
	{
		await applet.showHexView();
	}

	else
	{
		await applet.show2dView();
	}
}

async function build1({ forward, duration = 400 })
{
	applet.animationTime = duration;

	if (forward)
	{
		await applet.show2dView();
	}

	else
	{
		await applet.showHexView();
	}
}

export const planePartitionExampleBuilds =
{
	reset,
	0: build0,
	1: build1
};