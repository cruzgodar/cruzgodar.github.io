import { showPage } from "../../../scripts/src/loadPage.js";
import { ChaosGame } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new ChaosGame({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-chaos-game.png"
	});

	const resolutionInputElement = $("#resolution-input");

	const numVerticesInputElement = $("#num-vertices-input");

	Applet.listenToInputElements([resolutionInputElement, numVerticesInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);


	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const numVertices = parseInt(numVerticesInputElement.value || 5);

		applet.run({ resolution, numVertices });
	}
}