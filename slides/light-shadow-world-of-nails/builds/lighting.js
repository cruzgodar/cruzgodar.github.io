import { applet, initializeApplet } from "../index.js";
import { GroundAndSphere } from "/applets/raymarching-fundamentals/scripts/groundAndSphere.js";

const uniforms = [
	"lightAmount",
	"ambientOcclusionAmount",
	"groundTextureAmount",
	"fogAmount",
];

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: GroundAndSphere,
		slide,
		duration
	});

	[
		"showSphereAmount",
	].forEach(name => applet.setUniform(name, 1));

	if (!forward)
	{
		for (const name of uniforms)
		{
			applet.setUniform(name, 1);
		}
	}

	applet.wilson.worldCenterY = -Math.PI / 2;
}

const builds = Object.fromEntries(
	uniforms.map(
		(name, index) => [
			index,
			({ forward, duration }) => applet.animateUniform({
				name,
				value: forward ? 1 : 0,
				duration
			})
		]
	)
);

export const lightingBuilds =
{
	reset,
	...builds
};