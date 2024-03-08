import { showPage } from "../../../scripts/src/loadPage.js";
import { ExtrudedCube } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new ExtrudedCube({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-extruded-cube.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: changeResolution
	});

	const iterationsSlider = new Slider({
		element: $("#iterations-slider"),
		name: "Iterations",
		value: 16,
		min: 1,
		max: 32,
		integer: true,
		onInput: onSliderInput
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 3,
		min: 1.1,
		max: 4,
		snapPoints: [1.5, 2, 3],
		onInput: onSliderInput
	});

	const separationSlider = new Slider({
		element: $("#separation-slider"),
		name: "Separation",
		value: 1,
		min: 0.5,
		max: 2,
		snapPoints: [2 / 3, 1],
		onInput: onSliderInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}

	function onSliderInput()
	{
		applet.iterations = iterationsSlider.value;
		applet.wilson.gl.uniform1i(applet.wilson.uniforms.iterations, applet.iterations);

		applet.scale = scaleSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.scale, applet.scale);

		applet.separation = separationSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.separation, applet.separation);

		applet.calculateVectors();

		applet.needNewFrame = true;
	}
}