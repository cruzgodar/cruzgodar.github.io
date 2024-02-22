import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSet } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	// eslint-disable-next-line prefer-const
	let applet;

	const switchJuliaModeButton = new ToggleButton({
		element: $("#switch-julia-mode-button"),
		name0: "Pick Julia Set",
		name1: "Return to Mandelbrot",
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
				applet.wilson.downloadFrame("the-mandelbrot-set.png");
			}

			else
			{
				applet.wilson.downloadFrame("a-julia-set.png");
			}
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 2000,
		onInput: changeResolution
	});

	new Checkbox({
		element: $("#double-precision-checkbox"),
		name: "Allow double precision",
		onInput: () => applet.toggleUseDoublePrecision()
	});

	showPage();

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;
		applet.changeAspectRatio();
	}
}