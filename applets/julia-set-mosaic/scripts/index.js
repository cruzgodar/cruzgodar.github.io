import { JuliaSetMosaic } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
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

	const antialiasingCheckbox = new Checkbox({
		element: $("#antialiasing-checkbox"),
		name: "Antialiasing",
		onInput: onCheckboxInput,
		checked: true
	});

	onCheckboxInput();

	function changeResolution()
	{
		applet.wilson.resizeCanvas({ width: resolutionInput.value });
	}

	function onSliderInput()
	{
		applet.wilson.setUniforms({ setDensity: setDensitySlider.value });
		applet.needNewFrame = true;
	}

	function onCheckboxInput()
	{
		applet.wilson.setAntialiasing(antialiasingCheckbox.checked);

		applet.needNewFrame = true;
	}
}