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
		value: 0.5,
		minValue: 0,
		maxValue: 1,
		onEnter: run,
	});

	const computationsPerFrameSlider = new Slider({
		element: $("#computations-per-frame-slider"),
		name: "Computation Speed",
		value: 1,
		min: 1,
		max: 500,
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
		filename: "an-abelian-sandpile.png"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			density: densityInput.value,
			computationsPerFrame: computationsPerFrameSlider.value,
		});
	}

	function onSliderInput()
	{
		applet.computationsPerFrame = computationsPerFrameSlider.value;
	}
}