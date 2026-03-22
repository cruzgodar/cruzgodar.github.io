import { FractalSounds } from "/applets/fractal-sounds/scripts/class.js";

let applet;

const glslCodeMandelbrot = "cmul(z, z) + c";
const glslCodeSfx = "cmul(z, dot(z, z)) - cmul(z, c*c)";

const jsCodeMandelbrot = (x, y, a, b) => [
	x * x - y * y + a,
	2 * x * y + b
];

const jsCodeSfx = (x, y, a, b) => [
	x * x * x + x * y * y - x * a * a + y * b * b,
	x * x * y - x * b * b + y * y * y - y * a * a
];

async function reset({ forward })
{
	applet.run({
		resolution: 1500,
		glslCode: forward ? glslCodeMandelbrot : glslCodeSfx,
		jsCode: forward ? jsCodeMandelbrot : jsCodeSfx,
	});
}

async function build2({ forward })
{
	applet.run({
		resolution: 1500,
		glslCode: forward ? glslCodeSfx : glslCodeMandelbrot,
		jsCode: forward ? jsCodeSfx : jsCodeMandelbrot
	});
}

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
}

function unload()
{
	applet?.pause?.();
}

export const designingAroundSoundBuilds =
{
	reset,
	2: build2,
	load,
	unload
};