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
		applet.setUniforms({
			c0: 0,
			c4: 1
		});
	}
}

function changeCurvature({ forward, duration = 1000, newC })
{
	if (!forward)
	{
		newC--;
	}

	const oldCValues = [0, 1, 2, 3, 4, 5].map(index => applet.uniforms[`c${index}`]);
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
			applet.setUniforms({
				c0: dummy.t * newCValues[0] + (1 - dummy.t) * oldCValues[0],
				c1: dummy.t * newCValues[1] + (1 - dummy.t) * oldCValues[1],
				c2: dummy.t * newCValues[2] + (1 - dummy.t) * oldCValues[2],
				c3: dummy.t * newCValues[3] + (1 - dummy.t) * oldCValues[3],
				c4: dummy.t * newCValues[4] + (1 - dummy.t) * oldCValues[4],
				c5: dummy.t * newCValues[5] + (1 - dummy.t) * oldCValues[5],
			});

			applet.needNewFrame = true;
		},
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