
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
		[5, 4, 3, 0, 0],
		[0, 3, 3, 2, 0],
		[0, 0, 1, 1, 0],
		[0, 0, 0, 1, 0],
		[0, 0, 0, 0, 0]
	];

	const planePartition2 = [
		[5, 4, 3, 0, 0],
		[0, 3, 2, 2, 0],
		[0, 0, 1, 1, 0],
		[0, 0, 0, 1, 0],
		[0, 0, 0, 0, 0]
	];

	await applet.removeAllArrays();

	await applet.addNewArray({
		index: 0,
		numbers: planePartition,
		horizontalLegs: false
	});

	await applet.addNewArray({
		index: 1,
		numbers: planePartition2,
		horizontalLegs: false
	});

	await applet.hideFloor();

	const floors = [
		applet.arrays[0].floor[2][4],
		applet.arrays[0].floor[3][4],
		applet.arrays[0].floor[4][4],
		applet.arrays[1].floor[2][4],
		applet.arrays[1].floor[3][4],
		applet.arrays[1].floor[4][4],
	];

	for (const floor of floors)
	{
		for (const material of floor.material)
		{
			material.opacity = 1;
		}
	}

	await applet.showHexView();
	await applet.show2dView();

	applet.drawAll2dViewText();

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const togglesBuilds =
{
	reset,
};