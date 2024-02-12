import { showPage } from "../../../scripts/src/loadPage.js";
import { SimulatedAnnealing } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new SimulatedAnnealing({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "simulated-annealing.png"
	});



	const resolutionInputElement = $("#resolution-input");

	const numNodesInputElement = $("#num-nodes-input");

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	Applet.listenToInputElements([resolutionInputElement, numNodesInputElement], run);

	applet.setInputCaps([resolutionInputElement, numNodesInputElement], [3000, 100]);



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