import { ChaosGame } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new ChaosGame($("#output-canvas"));



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const numVerticesInputElement = $("#num-vertices-input");

	applet.listenToInputElements([resolutionInputElement, numVerticesInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-chaos-game.png"));



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const numVertices = parseInt(numVerticesInputElement.value || 5);

		applet.run({ resolution, numVertices });
	}
}