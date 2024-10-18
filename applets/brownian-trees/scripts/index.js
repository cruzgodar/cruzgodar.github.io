import { showPage } from "../../../scripts/src/loadPage.js";
import { BrownianTree } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new BrownianTree({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-brownian-tree.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 200,
		maxValue: 2000,
		onEnter: run,
	});

	showPage();

	function run()
	{
		applet.run({ resolution: resolutionInput.value * siteSettings.resolutionMultiplier });
	}
}