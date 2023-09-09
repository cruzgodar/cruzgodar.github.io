import { StrangeAttractor } from "./class.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new StrangeAttractor({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



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



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("a-strange-attractor.png")
	);



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