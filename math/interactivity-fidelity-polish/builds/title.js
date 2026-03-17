import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let loaded;
let applet;

async function reset({ slide })
{
	if (applet)
	{
		return;
	}

	const canvas = slide.querySelector("canvas");

	const generatingCodes = [
		"cmul(z, z) + c",
		"cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)", // Burning ship
		"cadd(cpow(z, vec2(4.0, 0.0)), c)", // Varied exponent
		"csin(cmul(z, c))", // Trig
	];

	const worldAdjusts = [
		[-0.75, 0],
		[-0.25, 0.5], // Burning ship
		[-0.5, 0], // Varied exponent
		[0, 0], // Trig
	];

	let index = 0;

	applet = new JuliaSetExplorer({
		canvas,
		generatingCode: generatingCodes[index],
		worldAdjust: worldAdjusts[index],
	});

	setInterval(() =>
	{
		index = (index + 1) % generatingCodes.length;
		
		if (loaded)
		{
			applet.run({
				generatingCode: generatingCodes[index],
				worldAdjust: worldAdjusts[index],
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