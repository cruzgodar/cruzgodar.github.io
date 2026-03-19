import { FractalSounds } from "/applets/fractal-sounds/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		return;
	}

	const canvas = slide.querySelector("#fractal-sounds-mandelbrot-canvas");
	const lineDrawerCanvas = slide.querySelector("#fractal-sounds-path-canvas");

	applet = new FractalSounds({
		canvas,
		lineDrawerCanvas
	});

	applet.run({
		glslCode: "cdiv(cmul(cmul(z, z), z), ONE + z*z) + c",
		jsCode: (x, y, a, b) => [
			a + (
				x * x * x * x * x + x * x * x * (1 - 3 * y * y)
				+ 3 * x * x * y * y * y
				- 3 * x * y * y
				- y * y * y * y * y
			) / (
				x * x * x * x
				+ 2 * x * x + y * y * y * y + 1
			),
			b + (
				y * (
					3 * x * x * x * x
					- x * x * x * y
					- x * x * (y * y - 3)
					+ 3 * x * y * y * y - y * y
				)
			) / (
				x * x * x * x
				+ 2 * x * x + y * y * y * y
				+ 1
			)
		]
	});
}

function unload()
{
	applet?.pause?.();
}

export const designingAroundSoundBuilds =
{
	load,
	unload
};