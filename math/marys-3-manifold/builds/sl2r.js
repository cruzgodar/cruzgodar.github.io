import { applet, canvasBundle } from "../index.js";
import { SL2RRooms } from "/applets/thurston-geometries/scripts/geometries/sl2r.js";
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

	geometryData = new SL2RRooms();
	geometryData.sliderValues.wallThickness = forward ? .125 : -.05;
	geometryData.aspectRatio = 95 / 55.625;

	geometryData.forwardVec = [1, 0, 0, 0];
	geometryData.rightVec = [0, 1, 0, 0];

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });
	applet.moveForever({
		speed: .5,
		direction: forward ? () => [1, 0, 0, 0] : () => [0, 0, 0, 1]
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
				geometryData.cameraPos[2] *= .99;
				geometryData.cameraPos[3] *= .99;

				if (Math.abs(geometryData.cameraPos[2]) < .0005)
				{
					geometryData.cameraPos[2] = Math.sign(geometryData.cameraPos[2]) * .0005;
				}

				if (Math.abs(geometryData.cameraPos[3]) < .0005)
				{
					geometryData.cameraPos[3] = Math.sign(geometryData.cameraPos[3]) * .0005;
				}

				return [
					1 * (1 - t) + 0 * t,
					0,
					0,
					0 * (1 - t) + 1 * t,
				];
			};
		}, 1000);
	}

	else
	{
		applet.automoving = false;

		await animate(() =>
		{
			geometryData.cameraPos[0] += .05 * (geometryData.cameraPos[0] - 1);
			geometryData.cameraPos[1] *= .95;
			geometryData.cameraPos[2] *= .95;
			geometryData.cameraPos[3] *= .95;
			geometryData.cameraFiber *= .95;

			geometryData.cameraPos = geometryData.correctPosition(geometryData.cameraPos);

			applet.needNewFrame = true;
		}, 1000);

		geometryData.cameraPos = [1, 0, 0, 0];
		geometryData.cameraFiber = 0;

		applet.moveForever({
			speed: .4,
			direction: () => [1, 0, 0, 0],
			rampStart: true
		});
	}
}

async function build1({ forward })
{
	await animate((t) =>
	{
		geometryData.sliderValues.wallThickness = forward
			? (1 - t) * .125 + t * (-.05)
			: (1 - t) * (-.05) + t * .125;
	}, 500, "easeOutCubic");
}

export const sl2rBuilds =
{
	reset,
	0: build0,
	1: build1
};