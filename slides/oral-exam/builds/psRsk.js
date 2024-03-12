
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity(canvasBundle, 0, duration / 2);

	slide.appendChild(canvasBundle);

	applet.wilsonNumbers.draggables.onResize();

	const rpp =
	[
		[4, 4, 4],
		[4, 3, 2],
		[4, 1, 1]
	];

	const rpp2 =
	[
		[4, 4, 4],
		[4, 3, 2],
		[4, 1, 1]
	];

	applet.animationTime = 0;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, rpp, false, false);

	await applet.addNewArray(1, rpp2, false, false);

	if (!applet.inExactHexView)
	{
		await applet.showHexView();
	}

	if (!forward)
	{
		await build1({ forward: true, duration: 0 });
		await build2({ forward: true, duration: 0 });
		await build3({ forward: true, duration: 0 });
		await build4({ forward: true, duration: 0 });
		await build5({ forward: true, duration: 0 });
	}

	await changeOpacity(canvasBundle, 1, duration / 2);
}

async function build1({
	forward,
	duration = 600
}) {
	if (forward)
	{
		applet.animationTime = duration;

		await applet.showHexView();

		await applet.runAlgorithm("sulzgruber", 1);

		await applet.show2dView();
	}

	else
	{
		applet.animationTime = duration / 3;

		await applet.showHexView();

		await applet.runAlgorithm("sulzgruberInverse", 1);
	}
}

async function build2({
	forward,
	duration = 600
}) {
	applet.animationTime = duration;

	if (forward)
	{
		await applet.removeArray(1);

		const tableau =
		[
			[1, 1, 2],
			[0, 1, 0],
			[3, 0, 0]
		];

		await applet.addNewArray(1, tableau, false, false);
	}

	else
	{
		await applet.removeArray(1);

		const tableau =
		[
			[0, 0, 3],
			[0, 1, 0],
			[2, 1, 1]
		];

		await applet.addNewArray(1, tableau, false, false);
	}
}

async function build3({
	forward,
	duration = 600
}) {
	applet.animationTime = duration;

	if (forward)
	{
		await applet.runAlgorithm("rskInverse", 1);

		const cubes1 = [
			[0, 0, 0],
			[0, 1, 0],
			[0, 2, 0],
			[0, 3, 0],
			[1, 0, 1],
			[1, 1, 1],
			[1, 2, 2],
			[2, 0, 2]
		];
		
		const cubes2 = [
			[0, 0, 0],
			[0, 1, 0],
			[0, 2, 0],
			[0, 3, 0],
			[1, 0, 1],
			[1, 1, 2],
			[1, 2, 2],
			[2, 0, 2]
		];

		await applet.uncolorCubes(applet.arrays[1], cubes1);
		await applet.uncolorCubes(applet.arrays[2], cubes2);
	}

	else
	{
		await applet.runAlgorithm("rsk", 1);
	}
}

async function build4({
	forward,
	duration = 600
}) {
	applet.animationTime = duration;

	const cubes0 = [[0, 1, 3], [1, 2, 1]];
	const cubes1 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0], [1, 0, 1], [1, 1, 1]];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes0, 0);
		await applet.colorCubes(applet.arrays[1], cubes1, 0);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes0);
		await applet.uncolorCubes(applet.arrays[1], cubes1);
	}
}

async function build5({
	forward,
	duration = 600
}) {
	applet.animationTime = duration;

	const cubes0 = [[2, 0, 3]];
	const cubes2 = [[0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 0]];

	if (forward)
	{
		await applet.colorCubes(applet.arrays[0], cubes0, .6);
		await applet.colorCubes(applet.arrays[2], cubes2, .6);
	}

	else
	{
		await applet.uncolorCubes(applet.arrays[0], cubes0);
		await applet.uncolorCubes(applet.arrays[2], cubes2);
	}
}

export const psRskBuilds =
{
	reset,
	1: build1,
	2: build2,
	3: build3,
	4: build4,
	5: build5
};