import { ChaosGame } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new ChaosGame({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const numVerticesInputElement = $("#num-vertices-input");

	Applet.listenToInputElements([resolutionInputElement, numVerticesInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("a-chaos-game.png")
	);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const numVertices = parseInt(numVerticesInputElement.value || 5);

		applet.run({ resolution, numVertices });
	}
}