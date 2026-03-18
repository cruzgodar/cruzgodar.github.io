import { NewtonsMethodExtended } from "/applets/newtons-method-extended/scripts/class.js";

let applet;

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
	
	applet.run({
		// eslint-disable-next-line max-len
		generatingCode: "cmul(csin(vec2(z.x, sign(z.y) * min(abs(z.y), mod(abs(z.y), 2.0*PI) + 2.0*PI))), sin(cmul(vec2(z.x, sign(z.y) * min(abs(z.y), mod(abs(z.y), 2.0*PI) + 2.0*PI)), i)))",
		resolution: 1500
	});
}

function unload()
{
	applet?.pause?.();
}

export const palettesBuilds =
{
	load,
	unload
};