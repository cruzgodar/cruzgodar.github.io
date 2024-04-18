import { applet, canvasBundle } from "../index.js";
import { SolRooms } from "/applets/thurston-geometries/scripts/geometries/sol.js";
import anime from "/scripts/anime.js";
import { changeOpacity } from "/scripts/src/animation.js";

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
	geometryData.cameraPos = [0, 0, 0, 1];
	geometryData.rightVec = [-0.850651, 0.525731, 0, 0];
	geometryData.forwardVec = [0.525731, 0.850651, 0, 0];

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: 1,
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
	const dummy = { t: 0 };

	if (forward)
	{
		await anime({
			targets: dummy,
			t: 1,
			duration: 500,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () => [
					0,
					-Math.min(
						Math.abs(geometryData.cameraPos[1]) * 3,
						1
					),
					dummy.t * Math.min(
						(1 - Math.abs(geometryData.cameraPos[1])) * 3,
						1
					),
					0,
				];
			}
		}).finished;
	}

	else
	{
		await anime({
			targets: dummy,
			t: 1,
			duration: 500,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () => [
					0,
					-dummy.t * Math.min(
						(1 - Math.abs(
							Math.abs((geometryData.cameraPos[2] + 1 / 2) % 1) - 1 / 2
						)) * 3,
						1
					),
					Math.min(
						Math.abs(
							Math.abs((geometryData.cameraPos[2] + 1 / 2) % 1) - 1 / 2
						) * 3,
						1
					),
					0,
				];
			}
		}).finished;
	}
}

async function build1()
{
	await applet.switchScene();
}

export const solBuilds =
{
	reset,
	0: build0,
	1: build1,
};