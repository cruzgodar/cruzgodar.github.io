import { showPage } from "../../../scripts/src/loadPage.js";
import { LyapunovFractal } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new LyapunovFractal({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-lyapunov-fractal.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const generatingStringInput = new TextBox({
		element: $("#generating-string-input"),
		name: "Generating String",
		value: "AB",
		onInput: run
	});

	run();

	showPage();

	function run()
	{
		applet.run({ generatingString: generatingStringInput.value.toUpperCase() });
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.changeAspectRatio(true);
	}
}