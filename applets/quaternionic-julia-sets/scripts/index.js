import { QuaternionicJuliaSets } from "./class.js";
import { crossProduct, normalize } from "/scripts/applets/raymarchApplet.js";
import { DownloadHighResButton, ToggleButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { animate } from "/scripts/src/utils.js";

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

	const applet = new QuaternionicJuliaSets({
		canvas: $("#output-canvas"),
		xrFramebufferScaleSlider
	});

	new ToggleButton({
		element: $("#switch-bulb-button"),
		name0: "Switch to Mandelbrot",
		name1: "Return to Julia Set",
		onClick0: (instant) => applet.switchBulb(instant),
		onClick1: (instant) => applet.switchBulb(instant)
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => applet.uniforms.juliaProportion < 0.5
			? "the-quaternionic-mandelbrot-set.png"
			: "a-quaternionic-julia-set.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 300,
		maxValue: 3000,
		onInput: changeResolution
	});

	const rhoSlider = new Slider({
		element: $("#rho-slider"),
		name: "$\\rho$",
		value: .895,
		min: 0.01,
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
		checked: applet.lockedOnOrigin,
		persistState: false,
		onInput: onCheckboxInput
	});

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const showCrossSectionCheckbox = new Checkbox({
		element: $("#show-cross-section-checkbox"),
		name: "Show cross-section",
		onInput: onCheckboxInput
	});

	typesetMath();

	onSliderInput();

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value
		});
	}

	function onSliderInput()
	{
		const rho = rhoSlider.value;
		const phi = phiSlider.value;
		const theta = thetaSlider.value === 0 ? 0.001 : thetaSlider.value;

		const c = [
			rho * Math.cos(theta) * Math.cos(phi),
			rho * Math.sin(theta) * Math.cos(phi),
			rho * Math.sin(phi),
		];

		const normalVector = normalize(crossProduct(
			c,
			phi >= 0 ? [-1, 0, 0] : [1, 0, 0],
		));

		applet.setUniforms({ c, normalVector });

		applet.wilson.xrFramebufferScale = xrFramebufferScaleSlider.value;

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

		if (applet.showCrossSection !== showCrossSectionCheckbox.checked)
		{
			applet.showCrossSection = showCrossSectionCheckbox.checked;

			animate((t) =>
			{
				applet.setUniforms({ planeTranslation: applet.showCrossSection ? 1 - t : t });
			}, 500, "easeOutCubic");
		}
	}
}