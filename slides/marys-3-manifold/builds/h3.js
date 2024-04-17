import { applet, canvasBundle } from "../index.js";
import { H3Rooms } from "/applets/thurston-geometries/scripts/geometries/h3.js";
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

	geometryData = new H3Rooms();
	geometryData.sliderValues.wallThickness = forward ? .143 : -.357;
	geometryData.aspectRatio = 95 / 55.625;

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: .35,
		direction: () => [-1, 0, 0, 0]
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

	await anime({
		targets: dummy,
		t: 1,
		duration: 500,
		easing: "easeOutCubic",
		update: () =>
		{
			geometryData.sliderValues.wallThickness = forward
				? (1 - dummy.t) * .143 + dummy.t * (-.357)
				: (1 - dummy.t) * (-.357) + dummy.t * (.143);
		}
	}).finished;
}

export const h3Builds =
{
	reset,
	0: build0
};