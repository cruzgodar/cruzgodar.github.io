import { showPage } from "../../../scripts/src/loadPage.js";
import { JuliaSetMosaic } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new JuliaSetMosaic({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-julia-set-mosaic.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 200,
		maxValue: 2000,
		onEnter: run,
		onInput: changeResolution
	});

	const setDensitySlider = new Slider({
		element: $("#set-density-slider"),
		name: "Set Density",
		value: 10,
		min: 2,
		max: 20,
		onInput: onSliderInput
	});

	run();

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			setDensity: 10,
			exposure: 1,
			numIterations: 100
		});
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.changeAspectRatio();
	}

	function onSliderInput()
	{
		applet.setDensity = setDensitySlider.value;
		applet.needNewFrame = true;
	}
}