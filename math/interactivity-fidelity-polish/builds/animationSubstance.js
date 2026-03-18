import { Snowflakes } from "/applets/snowflakes/scripts/class.js";

let applet;

async function reset({ forward })
{
	if (!forward)
	{
		applet.run({
			resolution: 500,
			computationsPerFrame: 25,
		});
	}
}

async function build2({ forward })
{
	if (forward)
	{
		applet.run({
			resolution: 500,
			computationsPerFrame: 25,
		});
	}
}


function load({ slide })
{
	if (applet)
	{
		applet?.resume?.();
		
		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new Snowflakes({
		canvas,
	});
}

function unload()
{
	applet?.pause?.();
}

export const animationSubstanceBuilds =
{
	reset,
	2: build2,
	load,
	unload
};