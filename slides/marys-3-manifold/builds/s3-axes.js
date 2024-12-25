import { applet, canvasBundle } from "../index.js";
import { S3Axes } from "/applets/thurston-geometries/scripts/geometries/s3.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new S3Axes();

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 2000 });

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const s3AxesBuilds =
{
	reset,
};