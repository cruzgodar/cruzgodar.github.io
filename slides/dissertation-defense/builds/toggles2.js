
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
		[5, 3, 0, 0, 0],
		[4, 3, 2, 0, 0],
		[0, 2, 1, 1, 0],
		[0, 0, 1, 1, 0],
		[0, 0, 0, 0, 0]
	];

	const planePartition2 = [
		[1, 3, 0, 0, 0],
		[4, 2, 2, 0, 0],
		[0, 2, 2, 1, 0],
		[0, 0, 1, 0, 0],
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

	await applet.colorCubes(
		applet.arrays[1],
		[[0, 0, 0]],
		0.75
	);

	await applet.hideFloor();

	const floors = [
		applet.arrays[0].floor[3][4],
		applet.arrays[0].floor[4][4],
		applet.arrays[0].floor[4][3],
		applet.arrays[1].floor[3][4],
		applet.arrays[1].floor[3][3],
		applet.arrays[1].floor[4][4],
		applet.arrays[1].floor[4][3],
	];

	for (const floor of floors)
	{
		floor.material.forEach(material => material.opacity = 1);
	}

	await applet.showHexView();
	await applet.show2dView();

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const toggles2Builds =
{
	reset,
};