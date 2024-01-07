import { BrownianTree } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new BrownianTree({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	Applet.listenToInputElements([resolutionInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("a-brownian-tree.png")
	);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);

		applet.run({ resolution });
	}
}