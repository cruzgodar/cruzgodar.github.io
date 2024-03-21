
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet.wilsonNumbers.draggables.onResize();

	const rpp =
	[
		[0, 2, 2, 4],
		[1, 2, 3, 0],
		[1, 3, 3, 0],
		[2, 3, 0, 0],
	];

	applet.animationTime = 0;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}



	const array = await applet.addNewArray(0, rpp, false, false);

	applet.removeOutsideFloor(array);

	if (!applet.in2dView)
	{
		await applet.show2dView();
	}



	if (!forward)
	{
		await build0({ slide, forward: true, duration: 0 });
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0({
	forward,
	duration = 600
}) {
	applet.animationTime = duration;

	const cubes = [[3, 0, 1], [2, 0, 0], [1, 0, 0], [1, 1, 1], [1, 2, 2]];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, .75);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes);
	}
}

export const hooksBuilds =
{
	reset,
	0: build0,
};