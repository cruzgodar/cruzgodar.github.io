import { applet, canvasBundle } from "../index.js";
import { NilRooms } from "/applets/thurston-geometries/scripts/geometries/nil.js";
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

	geometryData = new NilRooms();
	geometryData.sliderValues.wallThickness = .78;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });
	applet.moveForever({
		speed: .5,
		direction: forward ? () => [0, -1, 0, 0] : () => [0, 0, 1, 0]
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

				return [
					0,
					-1 * (1 - t) + 0 * t,
					0 * (1 - t) + 1 * t,
					0,
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
				geometryData.cameraPos[2] *= .99;

				return [
					0,
					0 * (1 - t) - 1 * t,
					1 * (1 - t) + 0 * t,
					0,
				];
			};
		}, 1000);
	}
}

async function build1({ forward })
{
	if (forward)
	{
		applet.automovingDirection = () =>
		{
			geometryData.cameraPos[0] += .01 * Math.abs(geometryData.cameraPos[0] - .45);
			geometryData.cameraPos[1] += .01 * Math.abs(geometryData.cameraPos[1] - .45);

			return [0, 0, 1, 0];
		};
	}

	else
	{
		applet.automovingDirection = () =>
		{
			geometryData.cameraPos[0] *= .99;
			geometryData.cameraPos[1] *= .99;

			return [0, 0, 1, 0];
		};
	}

	await applet.switchScene();
}

export const nilBuilds =
{
	reset,
	0: build0,
	1: build1,
};