import { applet, canvasBundle } from "../index.js";
import { H2xERooms } from "/applets/thurston-geometries/scripts/geometries/h2xe.js";
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

	geometryData = new H2xERooms();
	geometryData.sliderValues.wallThickness = forward ? 1.2 : -.75;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: .4,
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
	const dummy = { t: 0 };

	if (forward)
	{
		await anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
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
						1 * (1 - dummy.t) + 0 * dummy.t,
						0,
						0 * (1 - dummy.t) + 1 * dummy.t,
					];
				};
			}
		}).finished;
	}

	else
	{
		await anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () =>
				{
					geometryData.cameraPos[3] += .01 * (
						Math.abs(((geometryData.cameraPos[3] + 1.875 / 2) % 1.875) - 1.875 / 2)
					);

					return [
						0,
						0 * (1 - dummy.t) + 1 * dummy.t,
						0,
						1 * (1 - dummy.t) + 0 * dummy.t,
					];
				};
			}
		}).finished;
	}
}

async function build1({ forward })
{
	const dummy = { t: 0 };

	await anime({
		targets: dummy,
		t: 1,
		duration: 500,
		easing: "easeOutCubic",
		update: () =>
		{
			geometryData.sliderValues.wallThickness = forward
				? (1 - dummy.t) * 1.2 + dummy.t * (-.75)
				: (1 - dummy.t) * (-.75) + dummy.t * 1.2;
		}
	}).finished;
}

export const h2xeBuilds =
{
	reset,
	0: build0,
	1: build1,
};