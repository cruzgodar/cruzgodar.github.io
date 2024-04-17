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
			duration: 500,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () => [
					0,
					Math.min(
						Math.abs(geometryData.cameraPos[1]) * 5,
						1
					),
					0,
					dummy.t * Math.min(
						(1 - Math.abs(geometryData.cameraPos[1])) * 5,
						1
					),
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
					dummy.t * Math.min(
						(1 - Math.abs(
							Math.abs((geometryData.cameraPos[3] + 1.875 / 2) % 1.875) - 1.875 / 2
						)) * 5,
						1
					),
					0,
					Math.min(
						Math.abs(
							Math.abs((geometryData.cameraPos[3] + 1.875 / 2) % 1.875) - 1.875 / 2
						) * 5,
						1
					),
				];
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