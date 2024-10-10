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

const minScale = 1.15;
const minScaleEpsilon = .00006;
const maxScaleEpsilon = .0000003;

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

	const rotationAngleXSlider = new Slider({
		element: $("#rotation-angle-x-slider"),
		name: "$\\theta_x$",
		value: 0,
		min: 0,
		max: Math.PI,
		onInput: onSliderInput
	});

	const rotationAngleYSlider = new Slider({
		element: $("#rotation-angle-y-slider"),
		name: "$\\theta_y$",
		value: 0,
		min: 0,
		max: Math.PI,
		onInput: onSliderInput
	});

	const rotationAngleZSlider = new Slider({
		element: $("#rotation-angle-z-slider"),
		name: "$\\theta_z$",
		value: 0,
		min: 0,
		max: Math.PI,
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
		min: minScale,
		max: 2,
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

		// Exponentially interpolate from .001 to .0000003.
		const power = (scaleSlider.value - minScale) / (2 - minScale)
			* Math.log10(minScaleEpsilon / maxScaleEpsilon);
		applet.setMinEpsilon(minScaleEpsilon / Math.pow(10, power));

		applet.rotationAngleX = rotationAngleXSlider.value;
		applet.rotationAngleY = rotationAngleYSlider.value;
		applet.rotationAngleZ = rotationAngleZSlider.value;

		applet.updateMatrices();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onDropdownInput()
	{
		applet.changePolyhedron(polyhedraDropdown.value);
	}

	function onCheckboxInput()
	{
		applet.setLockedOnOrigin(lockOnOriginCheckbox.checked);

		if (applet.useShadows !== shadowsCheckbox.checked)
		{
			applet.useShadows = shadowsCheckbox.checked;
			applet.reloadShader();
		}
	}
}