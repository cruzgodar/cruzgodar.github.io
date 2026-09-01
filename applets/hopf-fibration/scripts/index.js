import { HopfFibration } from "./class.js";
import { Button, ToggleButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";

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
		max: 8,
		integer: true,
		onInput: onSliderInput
	});

	const longitudesSlider = new Slider({
		element: $("#longitudes-slider"),
		name: "Longitudes",
		value: 50,
		min: 8,
		max: 100,
		integer: true,
		onInput: onSliderInput
	});

	const coreSlider = new Slider({
		element: $("#core-slider"),
		name: "Core Amount",
		value: .75,
		min: .75,
		max: 1,
		snapPoints: [.8, .85, .9, .95],
		onInput: onSliderInput
	});

	const lockOnOriginCheckbox = new Checkbox({
		element: $("#lock-on-origin-checkbox"),
		name: "Lock on origin",
		checked: applet.lockedOnOrigin,
		persistState: false,
		onInput: onCheckboxInput
	});

	const toggleProjectionButton = new ToggleButton({
		element: $("#toggle-compression-button"),
		name0: "Show Projected Fibration",
		name1: "Show Compressed Fibration",
		onClick0: async (instant) =>
		{
			toggleProjectionButton.disabled = true;

			await applet.toggleCompression(instant);

			toggleProjectionButton.disabled = false;
		},
		onClick1: async (instant) =>
		{
			toggleProjectionButton.disabled = true;

			await applet.toggleCompression(instant);

			toggleProjectionButton.disabled = false;
		}
	});

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value
		});
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