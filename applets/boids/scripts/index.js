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
		onInput: () => applet.setResolution(resolutionInput.value)
	});

	const numBoidsSlider = new Slider({
		element: $("#num-boids-slider"),
		name: "Boids",
		value: 1000,
		min: 100,
		max: 4000,
		logarithmic: true,
		integer: true,
		snapPoints: [500, 1000, 2000, 3000],
		onInput: () => applet.setNumBoids(numBoidsSlider.value)
	});

	const numBoidsOfPreySlider = new Slider({
		element: $("#num-boids-of-prey-slider"),
		name: "Boids of Prey",
		value: 0,
		min: 0,
		max: 5,
		integer: true,
		onInput: () => applet.setNumBoidsOfPrey(numBoidsOfPreySlider.value)
	});

	const avoidanceFactorSlider = new Slider({
		element: $("#avoidance-factor-slider"),
		name: "Avoidance",
		value: 15,
		min: 0,
		max: 20,
		snapPoints: [5, 10, 15],
		onInput: () => applet.avoidFactor = avoidanceFactorSlider.value / 100
	});

	const alignmentFactorSlider = new Slider({
		element: $("#alignment-factor-slider"),
		name: "Alignment",
		value: 1,
		min: 0,
		max: 3,
		snapPoints: [1, 2],
		onInput: () => applet.alignmentFactor = alignmentFactorSlider.value / 100
	});

	const fearFactorSlider = new Slider({
		element: $("#fear-factor-slider"),
		name: "Fear",
		value: 10,
		min: 0,
		max: 30,
		snapPoints: [5, 10, 15],
		onInput: () => applet.fearFactor = fearFactorSlider.value / 1000
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "boids.png"
	});

	applet.run({
		resolution: resolutionInput.value,
		numBoids: numBoidsSlider.value,
		numBoidsOfPrey: numBoidsOfPreySlider.value,
		avoidFactor: avoidanceFactorSlider.value / 100,
		alignmentFactor: alignmentFactorSlider.value / 100,
		fearFactor: fearFactorSlider.value / 1000,
	});

	showPage();
}