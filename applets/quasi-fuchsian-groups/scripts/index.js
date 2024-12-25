import { showPage } from "../../../scripts/src/loadPage.js";
import { QuasiFuchsianGroups } from "./class.js";
import { GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new QuasiFuchsianGroups({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const highResolutionInput = new TextBox({
		element: $("#high-resolution-input"),
		name: "Resolution",
		value: 1500,
		minValue: 500,
		maxValue: 3000,
		onEnter: run
	});

	const maxDepthInput = new TextBox({
		element: $("#max-depth-input"),
		name: "Iterations",
		value: 1000,
		minValue: 200,
		maxValue: 2000,
		onEnter: run
	});

	const maxPixelBrightnessInput = new TextBox({
		element: $("#max-pixel-brightness-input"),
		name: "Quality",
		value: 200,
		minValue: 50,
		maxValue: 500,
		onEnter: run
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	showPage();

	async function run()
	{
		await applet.requestHighResFrame(
			highResolutionInput.value * siteSettings.resolutionMultiplier,
			maxDepthInput.value,
			maxPixelBrightnessInput.value
		);

		applet.wilson.downloadFrame("a-quasi-fuchsian-group.png");
	}

	function changeResolution()
	{
		applet.resolutionSmall = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.resolutionLarge = resolutionInput.value * siteSettings.resolutionMultiplier * 3;

		applet.wilson.resizeCanvas({
			width: applet.resolutionSmall
		});
	}
}