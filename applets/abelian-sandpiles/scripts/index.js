import { showPage } from "../../../scripts/src/loadPage.js";
import { AbelianSandpile } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new AbelianSandpile({ canvas: $("#output-canvas") });

	const numGrainsInput = new TextBox({
		element: $("#num-grains-input"),
		name: "Grains",
		value: 100000,
		minValue: 100,
		maxValue: 1000000,
		onEnter: run,
	});

	const computationsPerFrameInput = new TextBox({
		element: $("#computations-per-frame-input"),
		name: "Computation Speed",
		value: 10,
		minValue: 1,
		maxValue: 20,
		onEnter: run,
	});

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
		applet.run({
			numGrains: numGrainsInput.value,
			computationsPerFrame: computationsPerFrameInput.value
		});
	}
}