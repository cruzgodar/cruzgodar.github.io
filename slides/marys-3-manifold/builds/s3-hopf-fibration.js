import { applet, canvasBundle } from "../index.js";
import { S3HopfFibration } from "/applets/thurston-geometries/scripts/geometries/s3.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new S3HopfFibration();
	geometryData.sliderValues.fiberThickness = .0325;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.changeResolution(500);
	applet.fov = Math.tan(130 / 2 * Math.PI / 180);

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const s3HopfFibrationBuilds =
{
	reset,
};