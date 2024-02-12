import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSet } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

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



	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);

	const doublePrecisionCheckboxElement = $("#double-precision-checkbox");



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		applet.changeAspectRatio();
	});

	doublePrecisionCheckboxElement.addEventListener("input", () =>
	{
		applet.toggleUseDoublePrecision();
	});



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		
	});



	showPage();
}