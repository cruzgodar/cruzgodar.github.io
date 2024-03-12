
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	if (slide.contains(canvasBundle))
	{
		return;
	}

	await changeOpacity(canvasBundle, 0, duration / 2);

	applet.animationTime = 0;

	slide.appendChild(canvasBundle);

	applet.wilsonNumbers.draggables.onResize();

	const planePartition = [
		[1, 1, 1, 1, 1],
		[1, 1, 1, 0, 0],
		[1, 1, 0, 0, 0],
		[1, 1, 0, 0, 0],
		[1, 0, 0, 0, 0]
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

	await changeOpacity(canvasBundle, 1, duration / 2);
}

export const youngDiagramExampleBuilds =
{
	reset
};