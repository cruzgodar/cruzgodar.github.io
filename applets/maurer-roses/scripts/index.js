import { MaurerRoses } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new MaurerRoses({ canvas: $("#output-canvas") });

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 1000,
		maxValue: 3000,
		onInput: redraw,
		onEnter: animate,
	});

	const thetaFactorSlider = new Slider({
		element: $("#theta-factor-slider"),
		name: "Graph Factor",
		value: 2,
		min: 1,
		max: 10,
		integer: true,
		onInput: redraw,
	});

	const pointFactorSlider = new Slider({
		element: $("#point-factor-slider"),
		name: "Point Separation",
		value: 52,
		min: 1,
		max: 100,
		integer: true,
		onInput: redraw,
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: animate
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-maurer-rose.png"
	});

	redraw();

	function redraw()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			thetaFactor: thetaFactorSlider.value,
			pointFactor: pointFactorSlider.value,
			animate: false,
		});
	}

	function animate()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			thetaFactor: thetaFactorSlider.value,
			pointFactor: pointFactorSlider.value,
			animate: true,
		});
	}
}