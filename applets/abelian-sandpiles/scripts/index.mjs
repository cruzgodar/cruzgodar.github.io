import { AbelianSandpile } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new AbelianSandpile({ canvas: $("#output-canvas") });



	const numGrainsInputElement = $("#num-grains-input");

	const computationsPerFrameInputElement = $("#computations-per-frame-input");

	applet.listenToInputElements([numGrainsInputElement, computationsPerFrameInputElement], run);

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