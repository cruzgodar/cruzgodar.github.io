import { showPage } from "../../../scripts/src/loadPage.js";
import { HopfFibration } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new HopfFibration({ canvas: $("#output-canvas") });

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			applet.needDownload = true;
			applet.needNewFrame = true;
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const latitudesSlider = new Slider({
		element: $("#latitudes-slider"),
		name: "Latitudes",
		value: 3,
		min: 1,
		max: 10,
		integer: true,
		onInput: onSliderInput
	});

	const longitudesSlider = new Slider({
		element: $("#longitudes-slider"),
		name: "Longitudes",
		value: 30,
		min: 8,
		max: 100,
		integer: true,
		onInput: onSliderInput
	});

	const coreSlider = new Slider({
		element: $("#core-slider"),
		name: "Core Amount",
		value: 1,
		min: .75,
		max: 1,
		snapPoints: [.8, .85, .9, .95],
		onInput: onSliderInput
	});

	const lockOnOriginCheckbox = new Checkbox({
		element: $("#lock-on-origin-checkbox"),
		name: "Lock on origin",
		checked: true,
		onInput: onCheckboxInput
	});

	new ToggleButton({
		element: $("#toggle-compression-button"),
		name0: "Show Compressed Fibration",
		name1: "Show Projected Fibration",
		onClick0: (instant) => applet.toggleCompression(instant),
		onClick1: (instant) => applet.toggleCompression(instant)
	});

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.numLatitudes = latitudesSlider.value;
		applet.numLongitudesPerLatitude = longitudesSlider.value;
		applet.numLongitudesShown = coreSlider.value * applet.numLongitudesPerLatitude;
		applet.createAllFibers();
	}

	function onCheckboxInput()
	{
		applet.setLockedOnOrigin(lockOnOriginCheckbox.checked);
	}
}