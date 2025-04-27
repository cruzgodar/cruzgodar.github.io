import { showPage } from "../../../scripts/src/loadPage.js";
import { Boids } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new Boids({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 1000,
		maxValue: 3000,
		onInput: updateParameters,
	});

	const numBoidsSlider = new Slider({
		element: $("#num-boids-slider"),
		name: "Boids",
		value: 500,
		min: 100,
		max: 3000,
		logarithmic: true,
		onInput: updateParameters
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "boids.png"
	});

	showPage();

	function updateParameters()
	{
		applet.run({
			resolution: resolutionInput.value,
			numBoids: numBoidsSlider.value,
		});
	}
}