import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSetExplorer } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
		persistState: false,
		onClick0: advanceJuliaMode,
		onClick1: advanceJuliaMode
	});

	const applet = new JuliaSetExplorer({
		canvas: $("#output-canvas"),
		switchJuliaModeButton
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			applet.wilson.downloadFrame(
				applet.juliaMode === "mandelbrot"
					? "the-mandelbrot-set.png"
					: "a-julia-set.png"
			);
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	showPage();

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.wilson && applet.wilson.resizeCanvas({ width: applet.resolution });
	}

	function advanceJuliaMode()
	{
		applet.advanceJuliaMode();
	}
}