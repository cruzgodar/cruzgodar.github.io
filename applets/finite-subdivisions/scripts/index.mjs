import { FiniteSubdivision } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new FiniteSubdivision($("#output-canvas"));



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const numVerticesInputElement = $("#num-vertices-input");

	const numIterationsInputElement = $("#num-iterations-input");

	applet.listenToInputElements([numVerticesInputElement, numIterationsInputElement], run);

	applet.setInputCaps([numVerticesInputElement, numIterationsInputElement], [10, 7]);



	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-finite-subdivision.png"));



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