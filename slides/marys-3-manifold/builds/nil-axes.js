import { applet, canvasBundle } from "../index.js";
import { NilAxes } from "/applets/thurston-geometries/scripts/geometries/nil.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new NilAxes();

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const nilAxesBuilds =
{
	reset,
};