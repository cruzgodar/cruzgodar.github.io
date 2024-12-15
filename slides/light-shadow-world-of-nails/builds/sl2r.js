import { applet, canvasBundle, initializeApplet } from "../index.js";
import { ThurstonGeometries } from "/applets/thurston-geometries/scripts/class.js";
import { SL2RRooms } from "/applets/thurston-geometries/scripts/geometries/sl2r.js";
import anime from "/scripts/anime.js";
import { changeOpacity } from "/scripts/src/animation.js";

let geometryData;

async function reset({ slide, forward, duration })
{
	await initializeApplet({
		Class: ThurstonGeometries,
		slide,
		duration,
	});

	geometryData = new SL2RRooms();
	geometryData.sliderValues.wallThickness = forward ? .125 : -.05;
	geometryData.aspectRatio = 95 / 55.625;

	geometryData.forwardVec = [1, 0, 0, 0];
	geometryData.rightVec = [0, 1, 0, 0];

	applet.run(geometryData);
	applet.changeResolution(1000);
	applet.moveForever({
		speed: .5,
		direction: forward ? () => [1, 0, 0, 0] : () => [0, 0, 0, 1]
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
					geometryData.cameraPos[2] *= .99;
					geometryData.cameraPos[3] *= .99;

					if (Math.abs(geometryData.cameraPos[2]) < .0005)
					{
						geometryData.cameraPos[2] = Math.sign(geometryData.cameraPos[2]) * .0005;
					}

					if (Math.abs(geometryData.cameraPos[3]) < .0005)
					{
						geometryData.cameraPos[3] = Math.sign(geometryData.cameraPos[3]) * .0005;
					}

					return [
						1 * (1 - dummy.t) + 0 * dummy.t,
						0,
						0,
						0 * (1 - dummy.t) + 1 * dummy.t,
					];
				};
			}
		}).finished;
	}

	else
	{
		applet.automoving = false;

		await anime({
			targets: dummy,
			t: 1,
			duration: 1000,
			easing: "easeOutQuad",
			update: () =>
			{
				geometryData.cameraPos[0] += .05 * (geometryData.cameraPos[0] - 1);
				geometryData.cameraPos[1] *= .95;
				geometryData.cameraPos[2] *= .95;
				geometryData.cameraPos[3] *= .95;
				geometryData.cameraFiber *= .95;

				geometryData.cameraPos = geometryData.correctPosition(geometryData.cameraPos);

				applet.needNewFrame = true;
			}
		}).finished;

		geometryData.cameraPos = [1, 0, 0, 0];
		geometryData.cameraFiber = 0;

		applet.moveForever({
			speed: .4,
			direction: () => [1, 0, 0, 0],
			rampStart: true
		});
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
				? (1 - dummy.t) * .125 + dummy.t * (-.05)
				: (1 - dummy.t) * (-.05) + dummy.t * .125;
		}
	}).finished;
}

export const sl2rBuilds =
{
	reset,
	0: build0,
	1: build1
};