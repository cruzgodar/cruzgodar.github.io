import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSetMosaic } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new JuliaSetMosaic({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-julia-set-mosaic.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 2000,
		onEnter: run,
		onInput: changeResolution
	});

	const setDensitySliderElement = $("#set-density-slider");
	const setDensitySliderValueElement = $("#set-density-slider-value");

	setDensitySliderElement.addEventListener("input", () =>
	{
		applet.setDensity = parseFloat(setDensitySliderValueElement.textContent);
	});

	run();

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			setDensity: 10,
			exposure: 1,
			numIterations: 100
		});
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.changeAspectRatio();
	}
}