import { showPage } from "../../../scripts/src/loadPage.js";
import { StrangeAttractor } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new StrangeAttractor({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-strange-attractor.png"
	});



	const resolutionInputElement = $("#resolution-input");

	const sigmaInputElement = $("#sigma-input");

	const rhoInputElement = $("#rho-input");

	const betaInputElement = $("#beta-input");

	Applet.listenToInputElements([
		resolutionInputElement,
		sigmaInputElement,
		rhoInputElement,
		betaInputElement
	], run);

	applet.setInputCaps([
		resolutionInputElement,
		sigmaInputElement,
		rhoInputElement,
		betaInputElement
	], [
		1500,
		20,
		50,
		3.6
	]);



	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const sigma = parseFloat(sigmaInputElement.value || 10);
		const rho = parseFloat(rhoInputElement.value || 28);
		const beta = parseFloat(betaInputElement.value || 2.67);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			resolution,
			sigma,
			rho,
			beta,
			maximumSpeed
		});
	}
}