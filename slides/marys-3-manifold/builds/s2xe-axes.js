import { applet, canvasBundle } from "../index.js";
import { S2xEAxes } from "/applets/thurston-geometries/scripts/geometries/s2xe.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new S2xEAxes();

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const s2xeAxesBuilds =
{
	reset,
};