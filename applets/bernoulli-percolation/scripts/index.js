import { showPage } from "../../../scripts/src/loadPage.js";
import { BernoulliPercolation } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { Slider } from "/scripts/src/sliders.js";

export function load()
{
	const applet = new BernoulliPercolation({ canvas: $("#output-canvas") });

	const threshholdSlider = new Slider({
		element: $("#threshhold-slider"),
		name: "Threshhold",
		value: 0,
		min: 0,
		max: 1,
		snapPoints: [0.5],
		onInput: onSliderInput
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-abelian-sandpile.png"
	});

	showPage();

	function onSliderInput()
	{
		applet.threshhold = Math.floor(threshholdSlider.value * 1000);
	}
}