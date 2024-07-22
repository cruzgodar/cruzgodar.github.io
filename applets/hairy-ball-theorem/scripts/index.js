import { showPage } from "../../../scripts/src/loadPage.js";
import { HairyBall } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const vectorFieldResolutionInput = new TextBox({
		element: $("#vector-field-resolution-input"),
		name: "Vector Field Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1500,
		onInput: changeVectorField
	});

	const vectorFieldDilationInput = new Slider({
		element: $("#vector-field-dilation-slider"),
		name: "Vector Field Dilation",
		value: 0,
		min: 0,
		max: 3,
		integer: true,
		onInput: changeVectorField
	});

	const applet = new HairyBall({
		canvas: $("#output-canvas"),
		vectorFieldAppletResolution: vectorFieldResolutionInput.value
			* siteSettings.resolutionMultiplier,
		vectorFieldDilation: vectorFieldDilationInput.value
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "an-extruded-cube.png"
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function changeVectorField()
	{
		applet.vectorFieldAppletResolution = vectorFieldResolutionInput.value
			* siteSettings.resolutionMultiplier;
		applet.vectorFieldDilation = vectorFieldDilationInput.value;
		applet.runVectorField();
	}
}