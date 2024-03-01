import { showPage } from "../../../scripts/src/loadPage.js";
import { ExtrudedSponge } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new ExtrudedSponge({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-kaleidoscopic-ifs-fractal.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: changeResolution
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}