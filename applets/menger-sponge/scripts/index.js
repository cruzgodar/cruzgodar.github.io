import { MengerSponge } from "./class.js";
import { getRotationMatrix } from "/scripts/applets/raymarchApplet.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";

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

	const applet = new MengerSponge({
		canvas: $("#output-canvas"),
		xrFramebufferScaleSlider
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-menger-sponge.png"
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
		min: 2,
		max: 3,
		onInput: onSliderInput
	});

	const rotationAngleXSlider = new Slider({
		element: $("#rotation-angle-x-slider"),
		name: "$\\theta_x$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
		onInput: onSliderInput
	});

	const rotationAngleYSlider = new Slider({
		element: $("#rotation-angle-y-slider"),
		name: "$\\theta_y$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
		onInput: onSliderInput
	});

	const rotationAngleZSlider = new Slider({
		element: $("#rotation-angle-z-slider"),
		name: "$\\theta_z$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
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

	typesetMath();

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value
		});
	}

	function onSliderInput()
	{
		applet.setUniforms({
			scale: scaleSlider.value,
			iterations: iterationsSlider.value,
			rotationMatrix: getRotationMatrix(
				rotationAngleXSlider.value,
				rotationAngleYSlider.value,
				rotationAngleZSlider.value
			),
		});

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