import { QuaternionicJuliaSets } from "./class.js";
import { DownloadButton, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new QuaternionicJuliaSets({ canvas: $("#output-canvas") });

	new ToggleButton({
		element: $("#switch-bulb-button"),
		name0: "Switch to Mandelbrot",
		name1: "Return to Julia Set",
		onClick0: (instant) => applet.switchBulb(instant),
		onClick1: (instant) => applet.switchBulb(instant)
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 400,
		minValue: 100,
		maxValue: 800,
		onInput: changeResolution
	});

	const rhoSlider = new Slider({
		element: $("#rho-slider"),
		name: "$\\rho$",
		value: .895,
		min: 0,
		max: 1,
		onInput: onSliderInput
	});

	const thetaSlider = new Slider({
		element: $("#theta-slider"),
		name: "$\\theta$",
		value: 3.353,
		min: 0,
		max: 2 * Math.PI,
		onInput: onSliderInput
	});

	const phiSlider = new Slider({
		element: $("#phi-slider"),
		name: "$\\phi$",
		value: -.9,
		min: -Math.PI / 2,
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

	typesetMath();

	onSliderInput();

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value * siteSettings.resolutionMultiplier
		});
	}

	function onSliderInput()
	{
		const c = [
			rhoSlider.value * Math.cos(thetaSlider.value) * Math.cos(phiSlider.value),
			rhoSlider.value * Math.sin(thetaSlider.value) * Math.cos(phiSlider.value),
			rhoSlider.value * Math.sin(phiSlider.value),
		];

		applet.setUniforms({ c });

		applet.needNewFrame = true;
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