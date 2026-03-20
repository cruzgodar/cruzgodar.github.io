import { QuaternionicJuliaSets } from "/applets/quaternionic-julia-sets/scripts/class.js";
import { animate } from "/scripts/src/utils.js";

let applet;

async function reset({ forward })
{
	if (!forward)
	{
		applet.showCrossSection = true;
		applet.setUniforms({ planeTranslation: 0 });
	}

	else
	{
		applet.showCrossSection = false;
		applet.setUniforms({ planeTranslation: 1 });
	}
}

async function build2({ forward, duration = 500 })
{
	applet.showCrossSection = forward;
	
	await animate((t) =>
	{
		applet.setUniforms({ planeTranslation: applet.showCrossSection ? 1 - t : t });
	}, duration, "easeOutCubic");
}

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new QuaternionicJuliaSets({
		canvas,
	});
}

function unload()
{
	applet?.pause?.();
}

export const clarityBuilds =
{
	reset,
	2: build2,
	load,
	unload
};