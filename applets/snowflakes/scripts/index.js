import { Snowflakes } from "./class.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";

export default function()
{
	const applet = new Snowflakes({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onEnter: run
	});

	const computationsPerFrameInput = new Slider({
		element: $("#computations-per-frame-slider"),
		name: "Computation Speed",
		value: 25,
		min: 1,
		max: 50,
		integer: true,
		onInput: run
	});

	const rhoInput = new Slider({
		element: $("#rho-slider"),
		name: "$\\rho$",
		value: .3673,
		min: 0,
		max: 1,
		onInput: run
	});

	const betaInput = new Slider({
		element: $("#beta-slider"),
		name: "$\\beta$",
		value: 1.1016,
		min: 0,
		max: 2,
		onInput: run
	});

	const alphaInput = new Slider({
		element: $("#alpha-slider"),
		name: "$\\alpha$",
		value: .4022,
		min: 0,
		max: .6,
		onInput: run
	});

	const thetaInput = new Slider({
		element: $("#theta-slider"),
		name: "$\\theta$",
		value: .0311,
		min: 0,
		max: .05,
		onInput: run
	});

	const kappaInput = new Slider({
		element: $("#kappa-slider"),
		name: "$\\kappa$",
		value: .0013,
		min: -.5,
		max: .25,
		onInput: run
	});

	const muInput = new Slider({
		element: $("#mu-slider"),
		name: "$\\mu$",
		value: .019,
		min: -1,
		max: .1,
		onInput: run
	});

	const gammaInput = new Slider({
		element: $("#gamma-slider"),
		name: "$\\gamma$",
		value: .0005,
		min: -.02,
		max: 2,
		onInput: run
	});

	typesetMath();

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new Button({
		element: $("#randomize-parameters-button"),
		name: "Randomize Parameters",
		onClick: randomizeParameters
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-gravner-griffeath-snowflake.png"
	});



	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			computationsPerFrame: computationsPerFrameInput.value,
			rho: rhoInput.value,
			beta: betaInput.value,
			alpha: alphaInput.value,
			theta: thetaInput.value,
			kappa: kappaInput.value,
			mu: muInput.value,
			gamma: gammaInput.value
		});
	}

	applet.run({
		resolution: 500,
		computationsPerFrame: 25,
		rho: rhoInput.value,
		beta: betaInput.value,
		alpha: alphaInput.value,
		theta: thetaInput.value,
		kappa: kappaInput.value,
		mu: muInput.value,
		gamma: gammaInput.value
	});

	function randomizeParameters()
	{
		rhoInput.setValue(
			Math.round((.325 + (.5 - .325) * Math.random()) * 100000) / 100000,
			false
		);

		betaInput.setValue(
			Math.round((.9 + (1.5 - .9) * Math.random()) * 100000) / 100000,
			false
		);

		alphaInput.setValue(
			Math.round((.2 + (.6 - .2) * Math.random()) * 100000) / 100000,
			false
		);

		thetaInput.setValue(
			Math.round((.01 + (.05 - .01) * Math.random()) * 100000) / 100000,
			false
		);

		kappaInput.setValue(
			Math.round((0 + (.01 - 0) * Math.random()) * 100000) / 100000,
			false
		);

		muInput.setValue(
			Math.round((0 + (.065 - 0) * Math.random()) * 100000) / 100000,
			false
		);

		gammaInput.setValue(
			Math.round((0 + (.1 - 0) * Math.random()) * 100000) / 100000,
			false
		);

		run();
	}
}