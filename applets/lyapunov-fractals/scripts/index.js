import { LyapunovFractals } from "./class.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new LyapunovFractals({ canvas: $("#output-canvas") });

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-lyapunov-fractal.png"
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