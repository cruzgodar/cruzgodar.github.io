
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
		[0, 0, 2, 3, 3],
		[1, 1, 3, 6, 9],
		[1, 2, 4, 8, 9],
		[2, 6, 7, 8, 9],
		[5, 6, 8, 8, 9]
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



	if (!forward)
	{
		await build0({ slide, forward: true, duration: 0 });
		await build1({ slide, forward: true, duration: 0 });
		await build2({ slide, forward: true, duration: 0 });
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

	const cubes = [
		[4, 0, 4],
		[4, 1, 5],
		[3, 1, 5],
		[3, 2, 6],
		[3, 3, 7],
		[2, 3, 7],
		[2, 4, 8],
		[1, 4, 8]
	];

	if (forward)
	{
		for (let i = 0; i < cubes.length; i++)
		{
			setTimeout(
				() => applet.colorCubes(applet.arrays[0], [cubes[i]], 0),
				i * applet.animationTime / 2
			);
		}
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes);
	}
}

async function build1({
	forward,
	duration = 400
}) {
	applet.animationTime = duration;

	const cubes = [[1, 0, 0]];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, .6);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes);
	}
}

async function build2({
	forward,
	duration = 400
}) {
	applet.animationTime = duration;

	const cubes = [
		[4, 0, 4],
		[4, 1, 5],
		[3, 1, 5],
		[3, 2, 6],
		[3, 3, 7],
		[2, 3, 7],
		[2, 4, 8],
		[1, 4, 8]
	];

	const targets = [
		[4, 0, 4],
		[3, 0, 5],
		[2, 0, 5],
		[1, 0, 6],
		[1, 1, 7],
		[1, 2, 7],
		[1, 3, 8],
		[1, 4, 8]
	];


	if (forward)
	{
		await applet.moveCubes(applet.arrays[0], cubes, applet.arrays[0], targets);
	}

	else
	{
		await applet.moveCubes(applet.arrays[0], targets, applet.arrays[0], cubes);
	}
}

export const zigzagPathsBuilds =
{
	reset,
	0: build0,
	1: build1,
	2: build2
};