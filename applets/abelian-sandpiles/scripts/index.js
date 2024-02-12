import { showPage } from "../../../scripts/src/loadPage.js";
import { AbelianSandpile } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new AbelianSandpile({ canvas: $("#output-canvas") });



	const numGrainsInputElement = $("#num-grains-input");

	const computationsPerFrameInputElement = $("#computations-per-frame-input");

	Applet.listenToInputElements([numGrainsInputElement, computationsPerFrameInputElement], run);

	applet.setInputCaps([numGrainsInputElement, computationsPerFrameInputElement], [1000000, 20]);



	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-abelian-sandpile.png"
	});



	showPage();



	function run()
	{
		const numGrains = parseInt(numGrainsInputElement.value || 10000);
		const computationsPerFrame = parseInt(computationsPerFrameInputElement.value || 25);

		applet.run({ numGrains, computationsPerFrame });
	}
}