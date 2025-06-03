
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

export function getExampleBuilds(expression, animationTime = 500)
{
	async function reset({ slide, duration })
	{
		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: duration / 2
		});

		slide.appendChild(canvasBundle);

		applet.run({
			expression,
		});

		await changeOpacity({
			element: canvasBundle,
			opacity: 1,
			duration: duration / 2
		});
	}

	async function build0({ forward })
	{
		if (!forward)
		{
			return;
		}

		applet.animationTime = animationTime;

		applet.run({
			expression,
			betaReduce: true
		});
	}

	return {
		reset,
		0: build0,
	};
}