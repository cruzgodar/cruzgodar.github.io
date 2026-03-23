import { NewtonsMethodExtended } from "/applets/newtons-method-extended/scripts/class.js";

let applet;

const generatingCodePalettes = "cmul(sin(z), csinh(z))";
const generatingCodeCrosshatch = "cmul(csin(z), csinh(z))";
const generatingCodeTrig = "csin(z)";

async function reset({ forward })
{
	applet.run({
		// eslint-disable-next-line max-len
		generatingCode: forward ? generatingCodePalettes : generatingCodeCrosshatch,
		resolution: 1000
	});
}

async function build2({ forward })
{
	applet.run({
		// eslint-disable-next-line max-len
		generatingCode: forward ? generatingCodeTrig : generatingCodePalettes,
		resolution: 1000
	});
}

async function build3({ forward })
{
	applet.run({
		// eslint-disable-next-line max-len
		generatingCode: forward ? generatingCodeCrosshatch : generatingCodeTrig,
		resolution: 1000
	});
}

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new NewtonsMethodExtended({
		canvas,
	});
}

function unload()
{
	applet?.pause?.();
}

export const palettesBuilds =
{
	reset,
	2: build2,
	3: build3,
	load,
	unload
};