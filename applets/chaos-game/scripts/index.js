import { showPage } from "../../../scripts/src/loadPage.js";
import { ChaosGame } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onEnter: run,
	});

	const numVerticesInput = new TextBox({
		element: $("#num-vertices-input"),
		name: "Vertices",
		value: 5,
		minValue: 3,
		onEnter: run,
	});
	
	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			numVertices: numVerticesInput.value
		});
	}
}