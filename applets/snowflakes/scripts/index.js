import { showPage } from "../../../scripts/src/loadPage.js";
import { Snowflake } from "./class.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new Snowflake({ canvas: $("#output-canvas") });



	const resolutionInputElement = $("#resolution-input");
	const computationsPerFrameInputElement = $("#computations-per-frame-input");
	const rhoInputElement = $("#rho-input");
	const betaInputElement = $("#beta-input");
	const alphaInputElement = $("#alpha-input");
	const thetaInputElement = $("#theta-input");
	const kappaInputElement = $("#kappa-input");
	const muInputElement = $("#mu-input");
	const gammaInputElement = $("#gamma-input");

	applet.setInputCaps([resolutionInputElement, computationsPerFrameInputElement], [1000, 20]);



	const randomizeParametersButtonElement = $("#randomize-parameters-button");

	randomizeParametersButtonElement.addEventListener("click", () =>
	{
		rhoInputElement.value = Math.round((.3 + (.6 - .3) * Math.random()) * 100000) / 100000;
		betaInputElement.value = Math.round((.9 + (1.7 - .9) * Math.random()) * 100000) / 100000;
		alphaInputElement.value = Math.round((.2 + (.6 - .2) * Math.random()) * 100000) / 100000;
		thetaInputElement.value = Math.round((.01 + (.05 - .01) * Math.random()) * 100000) / 100000;
		kappaInputElement.value = Math.round((0 + (.01 - 0) * Math.random()) * 100000) / 100000;
		muInputElement.value = Math.round((0 + (.065 - 0) * Math.random()) * 100000) / 100000;
		muInputElement.value = Math.round((0 + (.05 - 0) * Math.random()) * 100000) / 100000;
	});



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("a-gravner-griffeath-snowflake.png")
	);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		const computationsPerFrame = parseInt(computationsPerFrameInputElement.value || 25);
		const rho = parseFloat(rhoInputElement.value || .45);
		const beta = parseFloat(betaInputElement.value || 1.3);
		const alpha = parseFloat(alphaInputElement.value || .4);
		const theta = parseFloat(thetaInputElement.value || .03);
		const kappa = parseFloat(kappaInputElement.value || .005);
		const mu = parseFloat(muInputElement.value || .0325);
		const gamma = parseFloat(gammaInputElement.value || .025);

		applet.run({
			resolution,
			computationsPerFrame,
			rho,
			beta,
			alpha,
			theta,
			kappa,
			mu,
			gamma
		});
	}
}