import { applet, canvasBundle, demoApplet } from "../index.js";
import { rotateVectors } from "/applets/thurston-geometries/scripts/class.js";
import { E3S2Demo, S2xES2Demo } from "/applets/thurston-geometries/scripts/geometries/s2.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ slide, duration })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	const geometryDataE3 = new E3S2Demo();
	geometryDataE3.aspectRatio = 1;

	geometryDataE3.handleMovingCallback = (movingAmount, timeElapsed) =>
	{
		demoApplet.handleMoving(movingAmount, timeElapsed);
		demoApplet.needNewFrame = true;
	};

	applet.run(geometryDataE3);
	applet.changeResolution(1000);

	applet.restrictCamera = false;
	applet.wilson.worldCenterY = Math.PI / 4.5;
	applet.wilson.worldCenterX = 3 * Math.PI / 4;



	const geometryDataS2xE = new S2xES2Demo();

	geometryDataS2xE.drawFrameCallback = () =>
	{
		applet.geometryData.cameraDotPos = [...demoApplet.geometryData.cameraPos];

		for (let i = 0; i < applet.geometryData.numRays; i++)
		{
			const angle = (i - Math.floor(applet.geometryData.numRays / 2))
				/ applet.geometryData.numRays * 1.87;

			[
				applet.geometryData.rayDirs[i],
				applet.geometryData.testVecs[i]
			] = rotateVectors(
				demoApplet.geometryData.forwardVec,
				demoApplet.geometryData.rightVec,
				angle
			);

			[
				applet.geometryData.rayLengths,
				applet.geometryData.rayColors
			] = demoApplet.geometryData.getRayData(applet.geometryData.rayDirs);
		}

		applet.needNewFrame = true;
	};

	demoApplet.run(geometryDataS2xE);

	demoApplet.wilson.worldCenterX = Math.PI / 4;

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const s2Builds =
{
	reset,
};