import { SortingAlgorithms } from "/applets/sorting-algorithms/scripts/class.js";

let applet;

async function build2({ forward })
{
	if (!forward)
	{
		return;
	}

	applet.run({
		resolution: 2000,
		algorithm: "merge",
		dataLength: 512,
		doPlaySound: true,
	});
}

function load({ slide })
{
	if (applet)
	{
		applet.run({
			resolution: 2000,
			algorithm: "merge",
			dataLength: 512,
			shuffle: false,
		});

		return;
	}

	const canvas = slide.querySelector("canvas");

	applet = new SortingAlgorithms({
		canvas,
	});

	applet.run({
		resolution: 2000,
		algorithm: "merge",
		dataLength: 512,
		shuffle: false,
	});
}

function unload()
{
	applet?.pause?.();
}

export const addingSoundBuilds =
{
	2: build2,
	load,
	unload
};