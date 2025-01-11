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
		applet,
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

	const antialiasingCheckbox = new Checkbox({
		element: $("#antialiasing-checkbox"),
		name: "Antialiasing",
		onInput: onCheckboxInput
	});

	showPage();

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
				applet.setUniforms({
					c0: dummy.t * newCValues[0] + (1 - dummy.t) * oldCValues[0],
					c1: dummy.t * newCValues[1] + (1 - dummy.t) * oldCValues[1],
					c2: dummy.t * newCValues[2] + (1 - dummy.t) * oldCValues[2],
					c3: dummy.t * newCValues[3] + (1 - dummy.t) * oldCValues[3],
					c4: dummy.t * newCValues[4] + (1 - dummy.t) * oldCValues[4],
					c5: dummy.t * newCValues[5] + (1 - dummy.t) * oldCValues[5],
				});

				applet.needNewFrame = true;
			}
		});
	}

	function onCheckboxInput()
	{
		applet.useReflections = reflectionsCheckbox.checked;
		applet.useAntialiasing = antialiasingCheckbox.checked;
		applet.reloadShader();
	}
}