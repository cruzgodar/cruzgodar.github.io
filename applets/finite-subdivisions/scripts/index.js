import { showPage } from "../../../scripts/src/loadPage.js";
import { FiniteSubdivision } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new FiniteSubdivision({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-finite-subdivision.png"
	});



	const numVerticesInputElement = $("#num-vertices-input");

	const numIterationsInputElement = $("#num-iterations-input");

	Applet.listenToInputElements([numVerticesInputElement, numIterationsInputElement], run);

	applet.setInputCaps([numVerticesInputElement, numIterationsInputElement], [10, 7]);



	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");



	showPage();



	function run()
	{
		const numVertices = parseInt(numVerticesInputElement.value || 6);
		const numIterations = parseInt(numIterationsInputElement.value || 5);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			numVertices,
			numIterations,
			maximumSpeed
		});
	}
}