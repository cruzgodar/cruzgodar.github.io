import { Mandelbox } from "./class.js";
import { getRotationMatrix } from "/scripts/applets/raymarchApplet.js";
import { DownloadHighResButton, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new Mandelbox({
		canvas: $("#output-canvas"),
	});

	new ToggleButton({
		element: $("#switch-box-button"),
		name0: "Switch to Juliabox",
		name1: "Return to Mandelbox",
		onClick0: (instant) => applet.switchBox(instant),
		onClick1: (instant) => applet.switchBox(instant)
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => applet.uniforms.juliaProportion < 0.5
			? "the-mandelbulb.png"
			: "a-juliabulb.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 2,
		min: 1.15,
		max: 4,
		onInput: onSliderInput
	});

	const cXSlider = new Slider({
		element: $("#c-x-slider"),
		name: "$c_x$",
		value: 0,
		min: -1,
		max: 1,
		snapPoints: [0],
		onInput: onSliderInput
	});

	const cYSlider = new Slider({
		element: $("#c-y-slider"),
		name: "$c_y$",
		value: 0,
		min: -1,
		max: 1,
		snapPoints: [0],
		onInput: onSliderInput
	});

	const cZSlider = new Slider({
		element: $("#c-z-slider"),
		name: "$c_z$",
		value: 0,
		min: -1,
		max: 1,
		snapPoints: [0],
		onInput: onSliderInput
	});

	const rotationAngleXSlider = new Slider({
		element: $("#rotation-angle-x-slider"),
		name: "$\\theta_x$",
		value: 0,
		min: 0,
		max: Math.PI * 2,
		onInput: onSliderInput
	});

	const rotationAngleYSlider = new Slider({
		element: $("#rotation-angle-y-slider"),
		name: "$\\theta_y$",
		value: 0,
		min: 0,
		max: Math.PI * 2,
		onInput: onSliderInput
	});

	const rotationAngleZSlider = new Slider({
		element: $("#rotation-angle-z-slider"),
		name: "$\\theta_z$",
		value: 0,
		min: 0,
		max: Math.PI * 2,
		onInput: onSliderInput
	});

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const lockOnOriginCheckbox = new Checkbox({
		element: $("#lock-on-origin-checkbox"),
		name: "Lock on origin",
		checked: true,
		onInput: onCheckboxInput
	});

	typesetMath();

	function onSliderInput()
	{
		applet.setUniforms({
			scale: scaleSlider.value,
			c: [cXSlider.value, cYSlider.value, cZSlider.value],
			rotationMatrix: getRotationMatrix(
				rotationAngleXSlider.value,
				rotationAngleYSlider.value,
				rotationAngleZSlider.value
			)
		});
	}

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value * siteSettings.resolutionMultiplier
		});
	}

	function onCheckboxInput()
	{
		applet.setLockedOnOrigin(lockOnOriginCheckbox.checked);

		if (
			applet.useShadows !== shadowsCheckbox.checked
		) {
			applet.useShadows = shadowsCheckbox.checked;
			applet.reloadShader();
		}
	}
}