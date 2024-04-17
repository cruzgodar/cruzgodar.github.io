import { applet, canvasBundle } from "../index.js";
import { SL2RRooms } from "/applets/thurston-geometries/scripts/geometries/sl2r.js";
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

	geometryData = new SL2RRooms();
	geometryData.sliderValues.wallThickness = forward ? .175 : -.05;
	geometryData.aspectRatio = 95 / 55.625;

	geometryData.forwardVec = [1, 0, 0, 0];
	geometryData.rightVec = [0, 1, 0, 0];

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: .4,
		direction: () => [1, 0, 0, 0]
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
				? (1 - dummy.t) * .175 + dummy.t * (-.05)
				: (1 - dummy.t) * (-.05) + dummy.t * .175;
		}
	}).finished;
}

export const sl2rBuilds =
{
	reset,
	0: build0,
};