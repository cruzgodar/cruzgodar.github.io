
import { applet, canvasBundle } from "../index.js";

export function getExampleBuilds(expression, animationTime = 500)
{
	async function reset({ slide })
	{
		slide.appendChild(canvasBundle);

		applet.animationRunning = false;

		applet.run({
			expression,
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