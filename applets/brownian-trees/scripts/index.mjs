import { BrownianTree } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new BrownianTree($("#output-canvas"));



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	applet.listenToInputElements([resolutionInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-brownian-tree.png"));



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);

		applet.run({ resolution });
	}
}