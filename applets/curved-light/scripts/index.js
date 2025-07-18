import { CurvedLight } from "./class.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $, $$ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { animate } from "/scripts/src/utils.js";

export default function()
{
	const applet = new CurvedLight({ canvas: $("#output-canvas") });

	const effects = ["none", "circle", "helix", "spiral", "square", "fuzzed"];

	const visibleSliders = {
		none: [],
		circle: ["#radius-slider"],
		helix: ["#curvature-slider"],
		spiral: ["#curvature-slider"],
		square: ["#radius-slider"],
		fuzzed: []
	};

	const effectsDropdown = new Dropdown({
		element: $("#effects-dropdown"),
		name: "Effects",
		options: {
			none: "Straight line",
			circle: "Circle",
			helix: "Helix",
			spiral: "Spiral",
			square: "Square",
			fuzzed: "Fuzzed edges",
		},
		onInput: onDropdownInput
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "curved-light.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const radiusSlider = new Slider({
		element: $("#radius-slider"),
		name: "Radius",
		value: 5,
		min: 1,
		max: 20,
		onInput: onSliderInput
	});

	const curvatureSlider = new Slider({
		element: $("#curvature-slider"),
		name: "Curvature",
		value: 1,
		min: 1,
		max: 4,
		onInput: onSliderInput
	});

	const reflectionsCheckbox = new Checkbox({
		element: $("#reflections-checkbox"),
		name: "Reflections",
		checked: true,
		onInput: onCheckboxInput
	});

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value * siteSettings.resolutionMultiplier
		});
	}

	function onSliderInput()
	{
		applet.setUniforms({
			radius: radiusSlider.value,
			curvature: curvatureSlider.value
		});

		applet.needNewFrame = true;
	}

	function onDropdownInput()
	{
		const oldCValues = [0, 1, 2, 3, 4, 5].map(index => applet.uniforms[`c${index}`]);
		const newCValues = Array(6).fill(0);
		const newC = effects.indexOf(effectsDropdown.value);
		newCValues[newC] = 1;

		for (const element of $$(".slider-container"))
		{
			element.style.display = "none";
		}
		
		for (const queryString of visibleSliders[effectsDropdown.value])
		{
			$(queryString).parentElement.style.display = "block";
		}


		animate((t) => {
			applet.setUniforms({
				c0: t * newCValues[0] + (1 - t) * oldCValues[0],
				c1: t * newCValues[1] + (1 - t) * oldCValues[1],
				c2: t * newCValues[2] + (1 - t) * oldCValues[2],
				c3: t * newCValues[3] + (1 - t) * oldCValues[3],
				c4: t * newCValues[4] + (1 - t) * oldCValues[4],
				c5: t * newCValues[5] + (1 - t) * oldCValues[5],
			});

			applet.needNewFrame = true;
		}, 2000);
	}

	function onCheckboxInput()
	{
		applet.useReflections = reflectionsCheckbox.checked;
		applet.reloadShader();
	}
}