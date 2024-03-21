import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";

async function reset({ lapsa, slide, duration })
{
	if (slide.contains(canvasBundle))
	{
		return;
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet.wilson.draggables.worldCoordinates = [[2, 0], [2, 0], [2, -2]];
	applet.wilson.draggables.onResize();

	applet.changeRecipe(0);



	applet.resolutionSmall = 500;
	applet.resolutionLarge = 1500;
	applet.changeAspectRatio();



	let lastTimestamp = 0;

	const numKeyframes = 100;
	const framesPerKeyframe = 300;

	const keyFrames1 = Array(numKeyframes)
		.fill(0)
		.map(() => [Math.random() * .15 + 1.95, Math.random() * 2 - 1]);

	const keyFrames2 = Array(numKeyframes)
		.fill(0)
		.map(() => [Math.random() * .15 + 1.95, Math.random() * 2 - 1]);

	keyFrames1[5] = [2, 0];
	keyFrames2[5] = [2, 0];

	let frame = 5 * framesPerKeyframe;

	const animationFrame = (timestamp) =>
	{
		const timeElapsed = timestamp - lastTimestamp;

		lastTimestamp = timestamp;

		if (timeElapsed === 0)
		{
			return;
		}


		const coordinate1 = [0, 0];
		const coordinate2 = [0, 0];
		const keyframe = frame / framesPerKeyframe;
		
		for (let i = Math.floor(keyframe - 5); i < Math.floor(keyframe + 5); i++)
		{
			const scale = Math.exp(-((keyframe - i) ** 2) * 2.85);

			coordinate1[0] += keyFrames1[i][0] * scale;
			coordinate1[1] += keyFrames1[i][1] * scale;
			coordinate2[0] += keyFrames2[i][0] * scale;
			coordinate2[1] += keyFrames2[i][1] * scale;
		}

		applet.wilson.draggables.worldCoordinates = [coordinate1, coordinate2, [2, -2]];

		frame++;

		if (frame >= framesPerKeyframe * numKeyframes)
		{
			return;
		}

		// Extremely gross and hard-coded --- I'll add a solution
		// for this sort of thing eventually.
		if (lapsa.currentSlide === 17)
		{
			applet.onDragDraggable();

			window.requestAnimationFrame(animationFrame);
		}
	};

	window.requestAnimationFrame(animationFrame);



	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

export const animationBuilds =
{
	reset,
};