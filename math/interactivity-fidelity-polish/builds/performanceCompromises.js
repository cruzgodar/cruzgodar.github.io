import { QuasiFuchsianGroups } from "/applets/quasi-fuchsian-groups/scripts/class.js";

let applet;

async function reset({ slide })
{
	if (applet)
	{
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new QuasiFuchsianGroups({
		canvas,
	});
}

function load()
{
	applet?.resume?.();
}

function unload()
{
	applet?.pause?.();
}

export const performanceCompromisesBuilds =
{
	reset,
	load,
	unload
};