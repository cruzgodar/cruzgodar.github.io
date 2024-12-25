import { applet, canvasBundle } from "../index.js";
import { S2xERooms } from "/applets/thurston-geometries/scripts/geometries/s2xe.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, forward, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryData = new S2xERooms();
	geometryData.sliderValues.wallThickness = .8;
	geometryData.aspectRatio = 95 / 55.625;

	if (!forward)
	{
		geometryData.sliderValues.sceneTransition = 1;
	}

	applet.run(geometryData);
	applet.wilson.resizeCanvas({ width: 1000 });
	
	applet.moveForever({
		speed: .5,
		direction: () =>
		{
			return [
				0,
				geometryData.cameraPos[2],
				-geometryData.cameraPos[1],
				0
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
			newCameraPos: [0, 0, -1, 0],
			duration: 500
		});
	}

	else
	{
		const oneOverRoot3 = 1 / Math.sqrt(3);
		await applet.moveCameraTo({
			newCameraPos: [oneOverRoot3, oneOverRoot3, -oneOverRoot3, 1.09],
			duration: 500
		});

		applet.automoving = true;
	}
}

export const s2xeBuilds =
{
	reset,
	0: build0,
	1: build1
};