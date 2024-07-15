import { showPage } from "../../../scripts/src/loadPage.js";
import { AbelianSandpile } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new AbelianSandpile({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Grid Size",
		value: 319,
		minValue: 10,
		maxValue: 2000,
		onEnter: run,
	});

	const centerGrainsInput = new TextBox({
		element: $("#center-grains-input"),
		name: "Center Grains",
		value: 100000,
		minValue: 0,
		maxValue: 1000000,
		onEnter: run,
	});

	const surroundingGrainsInput = new TextBox({
		element: $("#surrounding-grains-input"),
		name: "Surrounding Grains",
		value: 0,
		minValue: 0,
		maxValue: 8,
		onEnter: run,
	});

	const computationsPerFrameInput = new TextBox({
		element: $("#computations-per-frame-input"),
		name: "Computation Speed",
		value: 10,
		minValue: 1,
		maxValue: 100,
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
		let resolution = Math.max(
			resolutionInput.value,
			Math.floor(Math.sqrt(centerGrainsInput.value)) + 2
		);
		resolution = resolution + 1 - (resolution % 2);

		resolutionInput.setValue(resolution);

		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			numGrains: centerGrainsInput.value,
			floodGrains: surroundingGrainsInput.value,
			computationsPerFrame: computationsPerFrameInput.value
		});
	}
}