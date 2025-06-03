
import { applet, canvasBundle } from "../index.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { sleep } from "/scripts/src/utils.js";

async function reset({ slide, duration, forward })
{
	await changeOpacity({
		element: canvasBundle,
		opacity: 0,
		duration: duration / 2
	});

	slide.appendChild(canvasBundle);

	applet.run({
		expression: "(λx.xx)(λf.λx.fx)",
	});

	if (!forward)
	{
		await build0({ slide, duration: 300, forward: true });
		await build1({ slide, duration: 300, forward: true });
		await build3({ slide, duration: 300, forward: true });
	}

	await changeOpacity({
		element: canvasBundle,
		opacity: 1,
		duration: duration / 2
	});
}

async function build0({ duration = 1500, forward })
{
	if (!forward)
	{
		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: 200
		});

		applet.animationTime = 10;

		applet.run({
			expression: "(λx.xx)(λf.λx.fx)",
		});

		applet.resume();

		await changeOpacity({
			element: canvasBundle,
			opacity: 1,
			duration: 200
		});

		return;
	}

	applet.animationTime = duration / 3.8333;

	applet.resume();

	applet.run({
		expression: "(λx.xx)(λf.λx.fx)",
		betaReduce: true
	});

	let resolve;
	const promise = new Promise(r => resolve = r);

	setTimeout(() =>
	{
		applet.pause();
		resolve();
	}, duration);

	return promise;
}

async function build1({ duration = 1500, forward })
{
	if (!forward)
	{
		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: 200
		});

		applet.animationTime = 10;

		applet.run({
			expression: "(λx.xx)(λf.λx.fx)",
			betaReduce: true,
			maxBetaReductions: 1
		});

		applet.resume();

		await sleep(100);

		await changeOpacity({
			element: canvasBundle,
			opacity: 1,
			duration: 200
		});

		return;
	}

	applet.animationTime = duration / 3.8333;

	applet.resume();

	let resolve;
	const promise = new Promise(r => resolve = r);

	setTimeout(() =>
	{
		applet.pause();
		resolve();
	}, duration);

	return promise;
}

async function build3({ duration = 1500, forward })
{
	if (!forward)
	{
		await changeOpacity({
			element: canvasBundle,
			opacity: 0,
			duration: 200
		});

		applet.animationTime = 10;

		applet.run({
			expression: "(λx.xx)(λf.λx.fx)",
			betaReduce: true,
			maxBetaReductions: 2
		});

		applet.resume();

		await sleep(100);

		await changeOpacity({
			element: canvasBundle,
			opacity: 1,
			duration: 200
		});

		return;
	}

	applet.animationTime = duration / 2.1667;

	applet.resume();

	let resolve;
	const promise = new Promise(r => resolve = r);

	setTimeout(() =>
	{
		applet.pause();
		resolve();
	}, duration);

	return promise;
}

export const betaReductionBuilds =
{
	reset,
	0: build0,
	1: build1,
	3: build3
};