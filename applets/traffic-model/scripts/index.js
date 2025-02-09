import { showPage } from "../../../scripts/src/loadPage.js";
import { AbelianSandpiles } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new AbelianSandpiles({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Grid Size",
		value: 500,
		minValue: 10,
		maxValue: 2000,
		onEnter: run,
	});

	const densityInput = new TextBox({
		element: $("#density-input"),
		name: "Density",
		value: 0.32,
		minValue: 0,
		maxValue: 1,
		onEnter: run,
	});

	const northAmountSlider = new Slider({
		element: $("#north-amount-slider"),
		name: "North Proportion",
		value: 0.5,
		min: 0,
		max: 1,
		snapPoints: [0.5],
		onInput: onSliderInput,
	});

	const computationsPerFrameSlider = new Slider({
		element: $("#computations-per-frame-slider"),
		name: "Computation Speed",
		value: 1,
		min: 1,
		max: 10,
		logarithmic: true,
		integer: true,
		onInput: onSliderInput,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-traffic-jam.png"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			density: densityInput.value,
			northAmount: northAmountSlider.value,
			computationsPerFrame: computationsPerFrameSlider.value,
		});
	}

	function onSliderInput()
	{
		applet.northAmount = northAmountSlider.value;
		applet.computationsPerFrame = computationsPerFrameSlider.value;
	}
}