import { showPage } from "../../../scripts/src/loadPage.js";
import { MengerSponge } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new MengerSponge({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-menger-sponge.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: changeResolution
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 3,
		min: 1.5,
		max: 3,
		snapPoints: [2],
		onInput: onSliderInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}

	function onSliderInput()
	{
		applet.scale = scaleSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.scale, applet.scale);

		applet.calculateVectors();

		applet.needNewFrame = true;
	}
}