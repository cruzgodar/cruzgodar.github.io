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

	applet.run(geometryData);
	applet.changeResolution(750);
	applet.moveForever({
		speed: .5,
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

	applet.automoving = false;

	applet.automovingDirection = () =>
	{
		const magnitude = Math.min(Math.sqrt(
			(geometryData.cameraPos[0] + 0.0525731) ** 2
			+ (geometryData.cameraPos[0] + 0.0850651) ** 2
		) * 3, 1);
		
		return [0.525731 * magnitude, 0.850651 * magnitude, 0, 0];
	};

	await new Promise(resolve =>
	{
		// Ew
		const intervalId = setInterval(() =>
		{
			clearInterval(intervalId);
		}, 100);
	});

	applet.moveForever({
		speed: .5,
		direction: forward ? () => [1, 0, 0, 0] : () => [0.525731, 0.850651, 0, 0],
		rampStart: true
	});
}

async function build1({ forward })
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
				applet.automovingDirection = () => [
					1 * (1 - dummy.t) + 0 * dummy.t,
					0 * (1 - dummy.t) + 1 * dummy.t,
					0,
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
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () => [
					0 * (1 - dummy.t) + 1 * dummy.t,
					1 * (1 - dummy.t) + 0 * dummy.t,
					0,
					0,
				];
			}
		}).finished;
	}
}

async function build2({ forward })
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
				applet.automovingDirection = () => [
					0,
					1 * (1 - dummy.t) + 0 * dummy.t,
					0 * (1 - dummy.t) + 1 * dummy.t,
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
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				applet.automovingDirection = () => [
					0,
					0 * (1 - dummy.t) + 1 * dummy.t,
					1 * (1 - dummy.t) + 0 * dummy.t,
					0,
				];
			}
		}).finished;
	}
}

async function build3()
{
	await applet.switchScene();
}

export const solBuilds =
{
	reset,
	0: build0,
	1: build1,
	2: build2,
	3: build3
};