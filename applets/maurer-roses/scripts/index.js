import { showPage } from "../../../scripts/src/loadPage.js";
import { MaurerRoses } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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
		name: "Theta Factor",
		value: 2,
		min: 1,
		max: 10,
		integer: true,
		onInput: redraw,
	});

	const pointFactorSlider = new Slider({
		element: $("#point-factor-slider"),
		name: "Point Factor",
		value: 1,
		min: 1,
		max: 20,
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
		filename: "a-maurer-rose.png"
	});

	redraw();

	showPage();

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