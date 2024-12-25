import { applet, canvasBundle } from "../index.js";
import { E3Rooms } from "/applets/thurston-geometries/scripts/geometries/e3.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new E3Rooms();
	geometryData.sliderValues.wallThickness = 1;
	geometryData.aspectRatio = 95 / 55.625;
	geometryData.cameraPos = [1, 1, 1, 1];

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1500 });
	applet.moveForever({
		speed: .5,
		direction: () => [0, 1, 0, 0]
	});

	if (!forward)
	{
		applet.switchScene({ duration: 10 });
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0()
{
	await applet.switchScene();
}

export const e3Builds =
{
	reset,
	0: build0
};