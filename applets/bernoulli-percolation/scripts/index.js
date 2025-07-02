import { BernoulliPercolation } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new BernoulliPercolation({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 1000,
		maxValue: 3000,
		onInput: redrawEverything,
		onEnter: run,
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 25,
		minValue: 1,
		maxValue: 200,
		onInput: run,
		onEnter: run,
	});

	const drawEdgesCheckbox = new Checkbox({
		element: $("#draw-edges-checkbox"),
		name: "Draw edges",
		checked: true,
		onInput: () => applet.switchDrawEdges()
	});

	const thresholdSlider = new Slider({
		element: $("#threshold-slider"),
		name: "Threshold",
		value: 0.5,
		min: 0,
		max: 1,
		snapPoints: [0.5],
		onInput: onSliderInput
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "bernoulli-percolation.png"
	});

	run();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			gridSize: gridSizeInput.value,
			doDrawDots: drawEdgesCheckbox.checked,
			threshold: thresholdSlider.value * 1000
		});
	}

	function redrawEverything()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;
		applet.doDrawDots = drawEdgesCheckbox.checked;

		applet.redrawEverything(!applet.doDrawDots);
	}

	function onSliderInput()
	{
		applet.threshold = Math.floor(thresholdSlider.value * 1000);
	}
}