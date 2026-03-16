import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let loaded;
let everLoaded = false;
let applet;

async function reset({ slide })
{
	if (everLoaded)
	{
		return;
	}
	
	everLoaded = true;

	const canvas = slide.querySelector("canvas");

	const generatingCodes = [
		"cmul(z, z) + c",
		"cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)", // Burning ship
		"cadd(csub(cpow(z, 2.0), cmul(.05, cpow(z, -2.0))), c)", // Rational map
		"cadd(cpow(z, vec2(4.0, 0.0)), c)", // Varied exponent
		"csin(cmul(z, c))", // Trig
	];

	let index = 0;

	applet = new JuliaSetExplorer({
		canvas,
		generatingCode: generatingCodes[index]
	});

	setInterval(() =>
	{
		index = (index + 1) % generatingCodes.length;
		
		if (loaded)
		{
			applet.run({
				generatingCode: generatingCodes[index]
			});
		}
	}, 3500);
}

function load()
{
	loaded = true;
	applet?.resume?.();
}

function unload()
{
	loaded = false;
	applet?.pause?.();
}

export const titleBuilds =
{
	reset,
	load,
	unload
};