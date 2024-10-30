import { applet, initializeApplet } from "../index.js";
import { CurvedLight } from "/applets/curved-light/scripts/class.js";
import anime from "/scripts/anime.js";

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: CurvedLight,
		slide,
		duration,
		resolution: 750
	});

	if (!forward)
	{
		applet.setUniform("c0", 0);
		applet.setUniform("c4", 1);
	}
}

function changeCurvature({ forward, duration = 1000, newC })
{
	if (!forward)
	{
		newC--;
	}

	const oldCValues = [0, 1, 2, 3, 4, 5].map(index => applet.uniforms[`c${index}`][1]);
	const newCValues = Array(6).fill(0);
	newCValues[newC] = 1;

	const dummy = { t: 0 };

	anime({
		targets: dummy,
		t: 1,
		duration,
		easing: "easeOutQuad",
		update: () =>
		{
			for (let i = 0; i < 6; i++)
			{
				applet.setUniform(`c${i}`, dummy.t * newCValues[i] + (1 - dummy.t) * oldCValues[i]);
			}
			
			applet.needNewFrame = true;
		}
	});
}

export const curvedSpaceBuilds =
{
	reset,
	0: ({ forward, duration }) => changeCurvature({ forward, duration, newC: 1 }),
	1: ({ forward, duration }) => changeCurvature({ forward, duration, newC: 2 }),
	2: ({ forward, duration }) => changeCurvature({ forward, duration, newC: 3 }),
	3: ({ forward, duration }) => changeCurvature({ forward, duration, newC: 4 }),
};