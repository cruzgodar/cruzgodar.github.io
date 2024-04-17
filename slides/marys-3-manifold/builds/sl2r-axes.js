import { applet, canvasBundle } from "../index.js";
import { SL2RAxes } from "/applets/thurston-geometries/scripts/geometries/sl2r.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new SL2RAxes();

	applet.run(geometryData);
	applet.changeResolution(1000);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const sl2rAxesBuilds =
{
	reset,
};