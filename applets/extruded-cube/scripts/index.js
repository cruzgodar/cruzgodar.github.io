import { showPage } from "../../../scripts/src/loadPage.js";
import { ExtrudedCube } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new ExtrudedCube({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "an-extruded-cube.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const iterationsSlider = new Slider({
		element: $("#iterations-slider"),
		name: "Iterations",
		value: 16,
		min: 1,
		max: 16,
		integer: true,
		onInput: onSliderInput
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 3,
		min: 1.1,
		max: 4,
		snapPoints: [1.5, 2, 3],
		onInput: onSliderInput
	});

	const separationSlider = new Slider({
		element: $("#separation-slider"),
		name: "Separation",
		value: 1,
		min: 0.5,
		max: 2,
		snapPoints: [2 / 3, 1, 1.5],
		onInput: onSliderInput
	});

	const lockOnOriginCheckbox = new Checkbox({
		element: $("#lock-on-origin-checkbox"),
		name: "Lock on origin",
		checked: true,
		onInput: onCheckboxInput
	});

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const reflectionsCheckbox = new Checkbox({
		element: $("#reflections-checkbox"),
		name: "Reflections",
		onInput: onCheckboxInput
	});

	const antialiasingCheckbox = new Checkbox({
		element: $("#antialiasing-checkbox"),
		name: "Antialiasing",
		onInput: onCheckboxInput
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.setUniform("iterations", iterationsSlider.value);
		applet.setUniform("scale", scaleSlider.value);
		applet.setUniform("separation", separationSlider.value);

		applet.distanceFromOrigin = 10.6418 * separationSlider.value / scaleSlider.value;

		applet.calculateVectors();

		applet.needNewFrame = true;
	}

	function onCheckboxInput()
	{
		applet.setLockedOnOrigin(lockOnOriginCheckbox.checked);

		if (
			applet.useShadows !== shadowsCheckbox.checked
			|| applet.useReflections !== reflectionsCheckbox.checked
			|| applet.useAntialiasing !== antialiasingCheckbox.checked
		) {
			applet.useShadows = shadowsCheckbox.checked;
			applet.useReflections = reflectionsCheckbox.checked;
			applet.useAntialiasing = antialiasingCheckbox.checked;
			applet.reloadShader();
		}
	}
}