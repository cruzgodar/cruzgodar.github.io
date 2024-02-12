import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSetMosaic } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new JuliaSetMosaic({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-julia-set-mosaic.png"
	});

	const resolutionInputElement = $("#resolution-input");

	const setDensitySliderElement = $("#set-density-slider");
	const setDensitySliderValueElement = $("#set-density-slider-value");

	applet.setInputCaps([resolutionInputElement], [2000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeAspectRatio();
	});

	setDensitySliderElement.addEventListener("input", () =>
	{
		applet.setDensity = parseFloat(setDensitySliderValueElement.textContent);
	});



	run();

	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);

		applet.run({
			resolution,
			setDensity: 10,
			exposure: 1,
			numIterations: 100
		});
	}
}