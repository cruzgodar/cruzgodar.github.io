import { showPage } from "../../../scripts/src/loadPage.js";
import { CurvedLight } from "./class.js";
import anime from "/scripts/anime.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $, $$ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "curved-light.png"
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

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.setUniform("radius", radiusSlider.value);
		applet.setUniform("curvature", curvatureSlider.value);

		applet.needNewFrame = true;
	}

	function onDropdownInput()
	{
		const oldCValues = [0, 1, 2, 3, 4, 5].map(index => applet.uniforms[`c${index}`][1]);
		const newCValues = Array(6).fill(0);
		const newC = effects.indexOf(effectsDropdown.value);
		newCValues[newC] = 1;

		$$(".slider-container").forEach(element =>
		{
			element.style.display = "none";
		});
		
		visibleSliders[effectsDropdown.value].forEach(queryString =>
		{
			$(queryString).parentElement.style.display = "block";
		});

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: 2000,
			easing: "easeOutQuad",
			update: () =>
			{
				for (let i = 0; i < 6; i++)
				{
					applet.setUniform(`c${i}`, dummy.t * newCValues[i] + (1 - dummy.t) * oldCValues[i]);
				}
				
				applet.needNewFrame = true;
			}
		});
	}

	function onCheckboxInput()
	{
		applet.useReflections = reflectionsCheckbox.checked;
		applet.reloadShader();
	}
}