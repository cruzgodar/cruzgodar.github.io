
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

	const rpp =
	[
		[0, 2, 2, 4],
		[1, 2, 3, 0],
		[1, 3, 3, 0],
		[2, 3, 0, 0],
	];

	applet.animationTime = 0;

	await applet.removeAllArrays();



	const array = await applet.addNewArray({
		index: 0,
		numbers: rpp,
		horizontalLegs: false
	});

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
	duration = 400
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