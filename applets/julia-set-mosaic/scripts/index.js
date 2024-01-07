import { JuliaSetMosaic } from "./class.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new JuliaSetMosaic({ canvas: $("#output-canvas") });



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



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-generalized-julia-set.png");
	});



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