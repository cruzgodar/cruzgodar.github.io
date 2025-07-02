import { applet, canvasBundle } from "../index.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { animate } from "/scripts/src/utils.js";

let geometryData;

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	geometryData = new H3Rooms();
	geometryData.sliderValues.wallThickness = forward ? .143 : -.357;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });
	applet.moveForever({
		speed: .5,
		direction: () => [-1, 0, 0, 0]
	});

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0({ forward })
{
	await animate((t) =>
	{
		geometryData.sliderValues.wallThickness = forward
			? (1 - t) * .143 + t * (-.357)
			: (1 - t) * (-.357) + t * (.143);
	}, 500, "easeOutCubic");
}

export const h3Builds =
{
	reset,
	0: build0
};