import { showPage } from "../../../scripts/src/loadPage.js";
import { BarnsleyFern } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new BarnsleyFern({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "the-barnsley-fern.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 4000,
		onEnter: run,
	});

	showPage();

	function run()
	{
		applet.run({ resolution: resolutionInput.value });
	}
}