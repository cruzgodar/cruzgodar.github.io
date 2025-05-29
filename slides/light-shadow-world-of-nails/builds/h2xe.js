import { applet, canvasBundle, initializeApplet } from "../index.js";
import { ThurstonGeometries } from "/applets/thurston-geometries/scripts/class.js";
import { H2xERooms } from "/applets/thurston-geometries/scripts/geometries/h2xe.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { animate } from "/scripts/src/utils.js";

let geometryData;

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: ThurstonGeometries,
		slide,
		duration,
	});

	geometryData = new H2xERooms();
	geometryData.sliderValues.wallThickness = forward ? 1.2 : -.75;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });
	applet.moveForever({
		speed: .5,
		direction: forward ? () => [0, 1, 0, 0] : () => [0, 0, 0, 1]
	});

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0({ forward })
{
	if (forward)
	{
		await animate((t) =>
		{
			applet.automovingDirection = () =>
			{
				geometryData.cameraPos[0] *= .99;
				geometryData.cameraPos[1] *= .99;
				geometryData.cameraPos[2] = Math.sqrt(
					geometryData.cameraPos[0] ** 2
					+ geometryData.cameraPos[1] ** 2
					+ 1
				);

				return [
					0,
					1 * (1 - t) + 0 * t,
					0,
					0 * (1 - t) + 1 * t,
				];
			};
		}, 1000);
	}

	else
	{
		await animate((t) =>
		{
			applet.automovingDirection = () =>
			{
				geometryData.cameraPos[3] += .01 * (
					Math.abs(((geometryData.cameraPos[3] + 1.875 / 2) % 1.875) - 1.875 / 2)
				);

				return [
					0,
					0 * (1 - t) + 1 * t,
					0,
					1 * (1 - t) + 0 * t,
				];
			};
		}, 1000);
	}
}

async function build1({ forward })
{
	await animate((t) =>
	{
		geometryData.sliderValues.wallThickness = forward
			? (1 - t) * 1.2 + t * (-.75)
			: (1 - t) * (-.75) + t * 1.2;
	}, 500, "easeOutCubic");
}

export const h2xeBuilds =
{
	reset,
	0: build0,
	1: build1,
};