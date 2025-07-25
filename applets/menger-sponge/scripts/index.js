import { MengerSponge } from "./class.js";
import { getRotationMatrix } from "/scripts/applets/raymarchApplet.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new MengerSponge({ canvas: $("#output-canvas") });

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
			width: resolutionInput.value * siteSettings.resolutionMultiplier
		});
	}

	function onSliderInput()
	{
		applet.setUniforms({
			scale: scaleSlider.value,
			iterations: iterationsSlider.value,
			// Linearly interpolate from 5 at scale 2 to 1.75 at scale 3.
			epsilonScaling: 5 - (scaleSlider.value - 2) * (5 - 1.75),
			rotationMatrix: getRotationMatrix(
				rotationAngleXSlider.value,
				rotationAngleYSlider.value,
				rotationAngleZSlider.value
			),
		});

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