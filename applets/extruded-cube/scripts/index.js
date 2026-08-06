import { ExtrudedCube } from "./class.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { clamp } from "/scripts/src/utils.js";

export default function()
{
	const xrFramebufferScaleSlider = new Slider({
		element: $("#xr-framebuffer-scale-slider"),
		name: "VR Quality",
		value: 0.5,
		min: 0.1,
		max: 1,
		snapThreshhold: 0.1,
		snapPoints: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
		percent: true,
		onInput: onSliderInput
	});

	const applet = new ExtrudedCube({
		canvas: $("#output-canvas"),
		xrFramebufferScaleSlider,
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "an-extruded-cube.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 750,
		minValue: 300,
		maxValue: 1500,
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
		value: 2.5,
		min: 1.25,
		max: 3,
		snapPoints: [1.5, 2, 2.5],
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

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value
		});
	}

	function onSliderInput()
	{
		// Use epsilon scaling when there's lots of little isolated pieces,
		// i.e. when scale decreases or separation increases.
		applet.epsilonScalingFactor = Math.max(
			clamp(2.5 - scaleSlider.value, 0, 0.5),
			clamp(separationSlider.value - 1.0, 0, 0.5)
		);

		applet.setUniforms({
			iterations: iterationsSlider.value,
			scale: scaleSlider.value,
			separation: separationSlider.value,
			epsilonScaling: applet.computeEpsilonScaling()
		});

		applet.distanceFromOrigin = 15.5 * separationSlider.value / scaleSlider.value;

		applet.calculateVectors();

		applet.wilson.xrFramebufferScale = xrFramebufferScaleSlider.value;

		applet.needNewFrame = true;
	}

	function onCheckboxInput()
	{
		applet.setLockedOnOrigin(lockOnOriginCheckbox.checked);

		if (
			applet.useShadows !== shadowsCheckbox.checked
			|| applet.useReflections !== reflectionsCheckbox.checked
		) {
			applet.useShadows = shadowsCheckbox.checked;
			applet.useReflections = reflectionsCheckbox.checked;
			applet.reloadShader();
		}
	}
}