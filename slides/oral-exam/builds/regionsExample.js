
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	applet.animationTime = 0;

	slide.appendChild(canvasBundle);

	const planePartition = [
		[1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 0, 0],
		[1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0, 0, 0]
	];

	applet.animationTime = duration;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, planePartition, false, false);

	await applet.hideFloor();

	if (!applet.in2dView)
	{
		await applet.show2dView();
	}

	if (!forward)
	{
		await build0({ forward: true, duration: 0 });
		await build1({ forward: true, duration: 0 });
		await build2({ forward: true, duration: 0 });
		await build3({ forward: true, duration: 0 });
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
		[0, 5, 0],
		[1, 6, 0],
		[2, 7, 0],
		[0, 2, 0],
		[1, 3, 0],
		[2, 4, 0],
		[3, 5, 0],
		[1, 0, 0],
		[2, 1, 0],
		[3, 2, 0],
		[4, 3, 0],
		[5, 4, 0],
		[3, 0, 0],
		[4, 1, 0],
		[5, 2, 0],
		[6, 3, 0],
		[6, 0, 0],
		[7, 1, 0]
	];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, .6);
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

	const cubes = [
		[0, 3, 0],
		[1, 4, 0],
		[2, 5, 0],
		[0, 1, 0],
		[1, 2, 0],
		[2, 3, 0],
		[3, 4, 0],
		[2, 0, 0],
		[3, 1, 0],
		[4, 2, 0],
		[5, 3, 0],
		[5, 0, 0],
		[6, 1, 0]
	];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, .16);
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
		[0, 4, 0],
		[1, 5, 0],
		[2, 6, 0],
		[4, 0, 0],
		[5, 1, 0],
		[6, 2, 0],
		[7, 0, 0]
	];


	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, 0);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes);
	}
}

async function build3({
	forward,
	duration = 400
}) {
	applet.animationTime = duration;

	const cubes = [
		[0, 7, 0],
		[0, 6, 0],
		[1, 7, 0],
		[0, 0, 0],
		[1, 1, 0],
		[2, 2, 0],
		[3, 3, 0],
		[4, 4, 0]
	];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes, .33);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes);
	}
}

export const regionsExampleBuilds =
{
	reset,
	0: build0,
	1: build1,
	2: build2,
	3: build3
};