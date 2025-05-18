
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

	const app =
	[
		[Infinity, Infinity, Infinity, 9, 5, 5, 5, 5, 5, 5, 5, 5],
		[Infinity, Infinity, 5,        4, 1, 1, 1, 1, 1, 1, 1, 1],
		[6,        4,        4,        3, 0, 0, 0, 0, 0, 0, 0, 0],
		[6,        3,        2,        1, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
		[4,        1,        1,        0, 0, 0, 0, 0, 0, 0, 0, 0],
	];

	applet.animationTime = 0;
	applet.infiniteHeight = 12;
	applet.addWalls = true;
	applet.wallWidth = 12;
	applet.wallHeight = 12;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray({
		index: 0,
		numbers: app,
		horizontalLegs: true
	});

	if (!applet.inExactHexView)
	{
		await applet.showHexView();
	}

	applet.showWalls();

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const appBuilds =
{
	reset,
};