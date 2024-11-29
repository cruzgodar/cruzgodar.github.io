import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSet } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	// eslint-disable-next-line prefer-const
	let applet;

	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
		persistState: false,
		onClick0: () => applet.advanceJuliaMode(),
		onClick1: () => applet.advanceJuliaMode(),
	});

	applet = new JuliaSet({
		canvas: $("#output-canvas"),
		switchJuliaModeButton
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			if (applet.juliaMode === 0)
			{
				applet.downloadFrame("the-mandelbrot-set.png");
			}

			else
			{
				applet.downloadFrame("a-julia-set.png");
			}
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	showPage();

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.changeAspectRatio();
	}
}