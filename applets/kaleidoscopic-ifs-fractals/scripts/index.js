import { showPage } from "../../../scripts/src/loadPage.js";
import { KaleidoscopicIFSFractal } from "./class.js";
import { opacityAnimationTime } from "/scripts/src/animation.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new KaleidoscopicIFSFractal({ canvas: $("#output-canvas") });

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-kaleidoscopic-ifs-fractal.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 1000,
		onInput: changeResolution
	});

	// 0 0 1.5708 "$\theta_x$"
	// 0 0 1.5708 "$\theta_y$"
	// 0 0 1.5708 "$\theta_z$"

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

	typesetMath();

	showPage();

	function onSliderInput()
	{
		applet.rotationAngleX2 = rotationAngleX2Slider.value;
		applet.rotationAngleY2 = rotationAngleY2Slider.value;
		applet.rotationAngleZ2 = rotationAngleZ2Slider.value;

		applet.updateMatrices();
	}

	function resetSliders()
	{
		rotationAngleX2Slider.setValue(0);
		rotationAngleY2Slider.setValue(0);
		rotationAngleZ2Slider.setValue(0);

		onSliderInput();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}

	function onDropdownInput()
	{
		if (polyhedraDropdown.value === "tetrahedron")
		{
			applet.changePolyhedron(0);

			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2Slider.setBounds({ max: 2 * Math.PI });
				rotationAngleY2Slider.setBounds({ max: 2 * Math.PI });
				rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 3 });
			}, opacityAnimationTime);
		}

		else if (polyhedraDropdown.value === "cube")
		{
			applet.changePolyhedron(1);

			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2Slider.setBounds({ max: 2 * Math.PI / 2 });
				rotationAngleY2Slider.setBounds({ max: 2 * Math.PI / 2 });
				rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 2 });
			}, opacityAnimationTime);
		}

		else
		{
			applet.changePolyhedron(2);
			
			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2Slider.setBounds({ max: 2 * Math.PI / 2 });
				rotationAngleY2Slider.setBounds({ max: 2 * Math.PI / 2 });
				rotationAngleZ2Slider.setBounds({ max: 2 * Math.PI / 2 });
			}, opacityAnimationTime);
		}
	}
}