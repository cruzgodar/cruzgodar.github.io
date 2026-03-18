import { LambdaCalculus } from "/applets/lambda-calculus/scripts/class.js";

let applet;

async function reset()
{
	applet.run({
		expression: "*32",
		expandShorthands: true,
		betaReduce: false,
	});
}

async function build2()
{
	applet.run({
		expression: "*32",
		expandShorthands: true,
		betaReduce: true,
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

	applet = new LambdaCalculus({
		canvas,
	});

	applet.animationTime = 400;
}

function unload()
{
	applet?.pause?.();
}

export const animationEducationBuilds =
{
	reset,
	2: build2,
	load,
	unload
};