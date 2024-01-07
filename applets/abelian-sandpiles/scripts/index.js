import { AbelianSandpile } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new AbelianSandpile({ canvas: $("#output-canvas") });



	const numGrainsInputElement = $("#num-grains-input");

	const computationsPerFrameInputElement = $("#computations-per-frame-input");

	Applet.listenToInputElements([numGrainsInputElement, computationsPerFrameInputElement], run);

	applet.setInputCaps([numGrainsInputElement, computationsPerFrameInputElement], [1000000, 20]);



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("an-abelian-sandpile.png")
	);



	showPage();



	function run()
	{
		const numGrains = parseInt(numGrainsInputElement.value || 10000);
		const computationsPerFrame = parseInt(computationsPerFrameInputElement.value || 25);

		applet.run({ numGrains, computationsPerFrame });
	}
}