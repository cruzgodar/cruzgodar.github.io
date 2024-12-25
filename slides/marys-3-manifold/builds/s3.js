import { applet, canvasBundle } from "../index.js";
import { S3Rooms } from "/applets/thurston-geometries/scripts/geometries/s3.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new S3Rooms();
	geometryData.sliderValues.wallThickness = .35;
	geometryData.aspectRatio = 95 / 55.625;
	geometryData.cameraPos = [0, 0, 0, -1];
	geometryData.forwardVec = [0, -1, 0, 0];

	if (!forward)
	{
		geometryData.sliderValues.sceneTransition = 1;
	}

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1500 });
	
	applet.moveForever({
		speed: .5,
		direction: () =>
		{
			return [
				0,
				geometryData.cameraPos[3],
				0,
				-geometryData.cameraPos[1]
			];
		}
	});

	if (!forward)
	{
		applet.automoving = false;
		
		setTimeout(() => applet.handleMoving([0, 0, .01], 1), 10);
		setTimeout(() => applet.wilson.worldCenterX = .01, 10);
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

async function build1({ forward })
{
	if (forward)
	{
		applet.automoving = false;

		await applet.moveCameraTo({
			newCameraPos: [0, 0, 0, -1],
			duration: 500
		});
	}

	else
	{
		await applet.moveCameraTo({
			newCameraPos: [-.5, -.5, -.5, -.5],
			duration: 500
		});

		applet.automoving = true;
	}
}

export const s3Builds =
{
	reset,
	0: build0,
	1: build1
};