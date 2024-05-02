import { showPage } from "../../../scripts/src/loadPage.js";
import { HopfFibration } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new HopfFibration({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-menger-sponge.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}