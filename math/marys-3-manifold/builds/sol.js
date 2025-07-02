import { applet, canvasBundle } from "../index.js";
import { SolRooms } from "/applets/thurston-geometries/scripts/geometries/sol.js";
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

	geometryData = new SolRooms();
	geometryData.sliderValues.wallThickness = .3;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: forward ? 800 : 400 });
	applet.moveForever({
		speed: .5,
		direction: forward ? () => [0.525731, 0.850651, 0, 0] : () => [0, 0, 1, 0]
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
	applet.automoving = false;

	await animate(() =>
	{
		geometryData.cameraPos[0] += .075 * (-geometryData.cameraPos[0]);
		geometryData.cameraPos[1] += .075 * ((forward ? -.1 : 0) - geometryData.cameraPos[1]);
		geometryData.cameraPos[2] += .075 * (-geometryData.cameraPos[2]);

		applet.needNewFrame = true;
	}, 1000);

	geometryData.cameraPos = forward ? [0, -.1, 0, 1] : [0, 0, 0, 1];

	applet.moveForever({
		speed: .4,
		direction: forward ? () => [1, 0, 0, 0] : () => [0.525731, 0.850651, 0, 0],
		rampStart: true
	});
}

async function build1({ forward })
{
	applet.automoving = false;

	await animate(() =>
	{
		geometryData.cameraPos[0] += .075 * ((forward ? .1 : 0) - geometryData.cameraPos[0]);
		geometryData.cameraPos[1] += .075 * ((forward ? 0 : -.1) - geometryData.cameraPos[1]);
		geometryData.cameraPos[2] += .075 * (-geometryData.cameraPos[2]);

		applet.needNewFrame = true;
	}, 1000);

	geometryData.cameraPos = forward ? [.1, 0, 0, 1] : [0, -.1, 0, 1];

	applet.moveForever({
		speed: .4,
		direction: forward ? () => [0, 1, 0, 0] : () => [1, 0, 0, 0],
		rampStart: true
	});
}

async function build2({ forward })
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
					1 * (1 - t) + 0 * t,
					0 * (1 - t) + 1 * t,
					0,
				];
			};
		}, 1000);
	}

	else
	{
		applet.automoving = false;

		await animate(() =>
		{
			geometryData.cameraPos[0] += .075 * (.1 - geometryData.cameraPos[0]);
			geometryData.cameraPos[1] += .075 * (-geometryData.cameraPos[1]);
			geometryData.cameraPos[2] += .075 * (-geometryData.cameraPos[2]);

			applet.needNewFrame = true;
		}, 1000);

		geometryData.cameraPos = [.1, 0, 0, 1];

		applet.moveForever({
			speed: .4,
			direction: () => [0, 1, 0, 0],
			rampStart: true
		});
	}
}

async function build3({ forward })
{
	await applet.switchScene();

	geometryData = applet.geometryData;

	applet.wilson.resizeCanvas({ width: forward ? 400 : 800 });

	applet.moveForever({
		speed: .4,
		direction: () => [0, 0, 1, 0]
	});
}

export const solBuilds =
{
	reset,
	0: build0,
	1: build1,
	2: build2,
	3: build3
};