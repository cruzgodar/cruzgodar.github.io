import { applet, canvasBundle } from "../index.js";
import { NilRooms } from "/applets/thurston-geometries/scripts/geometries/nil.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new NilRooms();
	geometryData.sliderValues.wallThickness = .7;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: .25,
		direction: () => [0, 0, -1, 0]
	});

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const titleBuilds =
{
	reset,
};