import { JuliaSetMosaic } from "./class.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new JuliaSetMosaic({ canvas: $("#output-canvas") });

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-julia-set-mosaic.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 200,
		maxValue: 2000,
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

	function changeResolution()
	{
		applet.wilson.resizeCanvas({ width: resolutionInput.value });
	}

	function onSliderInput()
	{
		applet.wilson.setUniforms({ setDensity: setDensitySlider.value });
		applet.needNewFrame = true;
	}
}