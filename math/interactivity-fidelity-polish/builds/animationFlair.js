import { JuliaSetExplorer } from "/applets/julia-set-explorer/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new JuliaSetExplorer({
		canvas,
		generatingCode: "cadd(cmul(z, z), c)",
		worldAdjust: [-0.75, 0],
		maxWorldSize: 3.25,
		onClickCanvas: async () =>
		{
			if (applet.juliaMode === "julia")
			{
				await applet.advanceJuliaMode();
				applet.advanceJuliaMode();
			}
		}
	});

	applet.loadPromise.then(() =>
	{
		applet.advanceJuliaMode();
	});
}

function unload()
{
	applet.destroy();
}

export const animationFlairBuilds =
{
	load,
	unload
};