import { KaleidoscopicIFSFractals } from "./class.js";
import { DownloadHighResButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { Slider } from "/scripts/components/sliders.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";

export default function()
{
	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 300,
		maxValue: 3000,
		onInput: changeResolution
	});

	const rotationAngleXSlider = new Slider({
		element: $("#rotation-angle-x-slider"),
		name: "$\\theta_x$",
		value: 0,
		min: 0,
		max: 2 * Math.PI,
		onInput: onSliderInput
	});

	const rotationAngleYSlider = new Slider({
		element: $("#rotation-angle-y-slider"),
		name: "$\\theta_y$",
		value: 0,
		min: 0,
		max: 2 * Math.PI,
		onInput: onSliderInput
	});

	const rotationAngleZSlider = new Slider({
		element: $("#rotation-angle-z-slider"),
		name: "$\\theta_z$",
		value: 0,
		min: 0,
		max: 2 * Math.PI,
		onInput: onSliderInput
	});

	const polyhedraDropdown = new Dropdown({
		element: $("#polyhedra-dropdown"),
		name: "Polyhedra",
		options: {
			tetrahedron: "Tetrahedron",
			cube: "Cube",
			octahedron: "Octahedron",
			dodecahedron: "Dodecahedron",
			icosahedron: "Icosahedron"
		},
		onInput: onDropdownInput
	});

	const scaleSlider = new Slider({
		element: $("#scale-slider"),
		name: "Scale",
		value: 2,
		min: 1.125,
		max: 8 / 3,
		snapPoints: [2],
		onInput: onSliderInput
	});

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

	xrFramebufferScaleSlider.element.parentElement.style.display = "none";

	const shadowsCheckbox = new Checkbox({
		element: $("#shadows-checkbox"),
		name: "Shadows",
		onInput: onCheckboxInput
	});

	const applet = new KaleidoscopicIFSFractals({
		canvas: $("#output-canvas"),
		shape: polyhedraDropdown.value || "octahedron",
		xrFramebufferScaleSlider
	});

	const lockOnOriginCheckbox = new Checkbox({
		element: $("#lock-on-origin-checkbox"),
		name: "Lock on origin",
		checked: applet.lockedOnOrigin,
		persistState: false,
		onInput: onCheckboxInput
	});

	new DownloadHighResButton({
		element: $("#download-dropdown"),
		applet,
		filename: () => "a-kaleidoscopic-ifs-fractal.png"
	});

	typesetMath();

	function onSliderInput()
	{
		applet.changeScale(scaleSlider.value);
		
		applet.changeRotationAngles(
			rotationAngleXSlider.value,
			rotationAngleYSlider.value,
			rotationAngleZSlider.value
		);

		applet.wilson.xrFramebufferScale = xrFramebufferScaleSlider.value;

		applet.needNewFrame = true;
	}

	function changeResolution()
	{
		applet.wilson.resizeCanvas({
			width: resolutionInput.value
		});
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