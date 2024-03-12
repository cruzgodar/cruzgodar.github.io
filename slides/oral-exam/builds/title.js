
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
		[6, 5, 4, 3, 2, 1],
		[5, 4, 3, 2, 1, 0],
		[4, 3, 2, 1, 0, 0],
		[3, 2, 1, 0, 0, 0],
		[2, 1, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0]
	];

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, planePartition, false, false);

	if (!applet.inExactHexView)
	{
		await applet.showHexView();
	}



	let hue = 0;

	for (let i = 0; i < 6; i++)
	{
		for (let j = 0; j <= i; j++)
		{
			for (let k = 0; k < 6 - i; k++)
			{
				applet.colorCubes(
					applet.arrays[0],
					[[i - j, j, k]],
					((hue + 2.5 * (5 - i - k)) % 21) / 21 * 6 / 7
				);
			}

			hue++;
		}
	}

	await changeOpacity(canvasBundle, 1, duration / 2);
}

export const titleBuilds =
{
	reset
};