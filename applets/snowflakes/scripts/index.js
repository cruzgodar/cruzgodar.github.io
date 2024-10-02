import { showPage } from "../../../scripts/src/loadPage.js";
import { Snowflake } from "./class.js";
import { Button, DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new Snowflake({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onEnter: run
	});

	const computationsPerFrameInput = new TextBox({
		element: $("#computations-per-frame-input"),
		name: "Computation Speed",
		value: 25,
		minValue: 1,
		maxValue: 50,
		onEnter: run
	});

	const rhoInput = new TextBox({
		element: $("#rho-input"),
		name: "$\\rho$",
		value: .3673,
		minValue: 0,
		maxValue: 1,
		onEnter: run
	});

	const betaInput = new TextBox({
		element: $("#beta-input"),
		name: "$\\beta$",
		value: 1.1016,
		minValue: 0,
		maxValue: 2,
		onEnter: run
	});

	const alphaInput = new TextBox({
		element: $("#alpha-input"),
		name: "$\\alpha$",
		value: .4022,
		minValue: 0,
		onEnter: run
	});

	const thetaInput = new TextBox({
		element: $("#theta-input"),
		name: "$\\theta$",
		value: .0311,
		onEnter: run
	});

	const kappaInput = new TextBox({
		element: $("#kappa-input"),
		name: "$\\kappa$",
		value: .0013,
		minValue: -.5,
		maxValue: .25,
		onEnter: run
	});

	const muInput = new TextBox({
		element: $("#mu-input"),
		name: "$\\mu$",
		value: .019,
		minValue: -1,
		maxValue: .1,
		onEnter: run
	});

	const gammaInput = new TextBox({
		element: $("#gamma-input"),
		name: "$\\gamma$",
		value: .0005,
		minValue: -.02,
		maxValue: 2,
		onEnter: run
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
		wilson: applet.wilson,
		filename: "a-gravner-griffeath-snowflake.png"
	});



	showPage();



	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
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