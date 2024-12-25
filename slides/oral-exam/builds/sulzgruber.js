
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

	const rpp =
	[
		[6, 6, 6, 2],
		[4, 2, 2, 0],
		[2, 1, 0, 0],
		[1, 1, 0, 0]
	];

	applet.animationTime = 0;

	for (let i = applet.arrays.length - 1; i >= 0; i--)
	{
		await applet.removeArray(0);
	}

	await applet.addNewArray(0, rpp, false, false);

	if (!applet.inExactHexView)
	{
		await applet.showHexView();
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0({ forward, duration = 400 })
{
	if (forward)
	{
		applet.animationTime = duration;

		await applet.runAlgorithm("sulzgruber", 0);
	}

	else
	{
		applet.animationTime = duration / 6;

		await applet.runAlgorithm("sulzgruberInverse", 0);
	}
}

async function build1({ forward, duration = 400 })
{
	applet.animationTime = duration;

	if (forward)
	{
		await applet.show2dView();
	}

	else
	{
		await applet.showHexView();
	}
}

async function build2({ forward, duration = 400 })
{
	applet.animationTime = duration;

	if (forward)
	{
		await applet.showHexView();
	}

	else
	{
		await applet.show2dView();
	}
}

async function build3({ forward, duration = 200 })
{
	if (forward)
	{
		applet.animationTime = duration;

		await applet.runAlgorithm("sulzgruberInverse", 0);
	}

	else
	{
		applet.animationTime = duration / 3;

		await applet.runAlgorithm("sulzgruber", 0);
	}
}

export const sulzgruberBuilds =
{
	reset,
	0: build0,
	1: build1,
	2: build2,
	3: build3
};