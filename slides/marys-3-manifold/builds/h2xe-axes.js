import { applet, canvasBundle } from "../index.js";
import { H2xEAxes } from "/applets/thurston-geometries/scripts/geometries/h2xe.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new H2xEAxes();

	applet.run(geometryData);
	applet.changeResolution(1000);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const h2xeAxesBuilds =
{
	reset,
};