import { SimulatedAnnealing } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new SimulatedAnnealing({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const numNodesInputElement = $("#num-nodes-input");

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	Applet.listenToInputElements([resolutionInputElement, numNodesInputElement], run);

	applet.setInputCaps([resolutionInputElement, numNodesInputElement], [3000, 100]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("simulated-annealing.png");
	});



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const numNodes = parseInt(numNodesInputElement.value || 20);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			resolution,
			numNodes,
			maximumSpeed
		});
	}
}