import { showPage } from "../../../scripts/src/loadPage.js";
import { KaleidoscopicIFSFractal } from "./class.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const rotationAngleX2Slider = new Slider({
		element: $("#rotation-angle-x-2-slider"),
		name: "$\\theta_x$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
		onInput: onSliderInput
	});

	const rotationAngleY2Slider = new Slider({
		element: $("#rotation-angle-y-2-slider"),
		name: "$\\theta_y$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
		onInput: onSliderInput
	});

	const rotationAngleZ2Slider = new Slider({
		element: $("#rotation-angle-z-2-slider"),
		name: "$\\theta_z$",
		value: 0,
		min: 0,
		max: Math.PI / 2,
		onInput: onSliderInput
	});

	const polyhedraDropdown = new Dropdown({
		element: $("#polyhedra-dropdown"),
		name: "Polyhedra",
		options: {
			octahedron: "Octahedron",
			tetrahedron: "Tetrahedron",
			cube: "Cube",
		},
		onInput: onDropdownInput
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 2,
		min: 1.2,
		max: 2,
		onInput: onSliderInput
	});

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const applet = new KaleidoscopicIFSFractal({
		canvas: $("#output-canvas"),
		shape: polyhedraDropdown.value || "octahedron",
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-kaleidoscopic-ifs-fractal.png"
	});

	typesetMath();

	showPage();

	function onSliderInput()
	{
		applet.setUniform("scale", scaleSlider.value);

		// Exponentially interpolate from .00003 to .0000003.
		const power = (scaleSlider.value - 1.2) / (2 - 1.2) * 2;
		applet.setMinEpsilon(.00003 / Math.pow(10, power));

		applet.rotationAngleX2 = rotationAngleX2Slider.value;
		applet.rotationAngleY2 = rotationAngleY2Slider.value;
		applet.rotationAngleZ2 = rotationAngleZ2Slider.value;

		applet.updateMatrices();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onDropdownInput()
	{
		applet.changePolyhedron(polyhedraDropdown.value);

		if (polyhedraDropdown.value === "tetrahedron")
		{
			rotationAngleX2Slider.setBounds({ max: 2 * Math.PI });
			rotationAngleY2Slider.setBounds({ max: 2 * Math.PI });
			rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 3 });
		}

		else if (polyhedraDropdown.value === "cube")
		{
			rotationAngleX2Slider.setBounds({ max: 2 * Math.PI / 2 });
			rotationAngleY2Slider.setBounds({ max: 2 * Math.PI / 2 });
			rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 2 });
		}

		else
		{
			rotationAngleX2Slider.setBounds({ max: 2 * Math.PI / 2 });
			rotationAngleY2Slider.setBounds({ max: 2 * Math.PI / 2 });
			rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 2 });
		}
	}

	function onCheckboxInput()
	{
		applet.useShadows = shadowsCheckbox.checked;
		applet.reloadShader();
	}
}