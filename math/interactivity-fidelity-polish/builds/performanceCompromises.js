import { QuasiFuchsianGroups } from "/applets/quasi-fuchsian-groups/scripts/class.js";

let applet;

function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new QuasiFuchsianGroups({
		canvas,
	});
}

function unload()
{
	applet?.pause?.();
}

export const performanceCompromisesBuilds =
{
	load,
	unload
};