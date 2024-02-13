import { showPage } from "../../../scripts/src/loadPage.js";
import { KaleidoscopicIFSFractal } from "./class.js";
import { opacityAnimationTime } from "/scripts/src/animation.js";
import { DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
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
	
	const rotationAngleX2SliderElement = $("#rotation-angle-x-2-slider");
	const rotationAngleX2SliderValueElement = $("#rotation-angle-x-2-slider-value");

	const rotationAngleY2SliderElement = $("#rotation-angle-y-2-slider");
	const rotationAngleY2SliderValueElement = $("#rotation-angle-y-2-slider-value");

	const rotationAngleZ2SliderElement = $("#rotation-angle-z-2-slider");
	const rotationAngleZ2SliderValueElement = $("#rotation-angle-z-2-slider-value");

	const sliderElements = [
		rotationAngleX2SliderElement,
		rotationAngleY2SliderElement,
		rotationAngleZ2SliderElement
	];

	for (let i = 0; i < sliderElements.length; i++)
	{
		sliderElements[i].addEventListener("input", updateRotation);
	}



	const polyhedronSelectorDropdownElement = $("#polyhedron-selector-dropdown");

	polyhedronSelectorDropdownElement.addEventListener("input", () =>
	{
		if (polyhedronSelectorDropdownElement.value === "tetrahedron")
		{
			applet.changePolyhedron(0);

			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2SliderElement.setAttribute("max", 2 * Math.PI);
				rotationAngleY2SliderElement.setAttribute("max", 2 * Math.PI);
				rotationAngleZ2SliderElement.setAttribute("max", 2 * Math.PI / 3);
			}, opacityAnimationTime);
		}

		else if (polyhedronSelectorDropdownElement.value === "cube")
		{
			applet.changePolyhedron(1);

			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2SliderElement.setAttribute("max", Math.PI / 2);
				rotationAngleY2SliderElement.setAttribute("max", Math.PI / 2);
				rotationAngleZ2SliderElement.setAttribute("max", Math.PI / 2);
			}, opacityAnimationTime);
		}

		else
		{
			applet.changePolyhedron(2);
			
			setTimeout(() =>
			{
				resetSliders();

				rotationAngleX2SliderElement.setAttribute("max", Math.PI / 2);
				rotationAngleY2SliderElement.setAttribute("max", Math.PI / 2);
				rotationAngleZ2SliderElement.setAttribute("max", Math.PI / 2);
			}, opacityAnimationTime);
		}
	});



	showPage();



	function updateRotation()
	{
		applet.rotationAngleX2 = parseFloat(rotationAngleX2SliderValueElement.textContent);
		applet.rotationAngleY2 = parseFloat(rotationAngleY2SliderValueElement.textContent);
		applet.rotationAngleZ2 = parseFloat(rotationAngleZ2SliderValueElement.textContent);

		applet.updateMatrices();
	}

	function resetSliders()
	{
		rotationAngleX2SliderElement.value = 0;
		rotationAngleX2SliderValueElement.textContent = "0.000";

		rotationAngleY2SliderElement.value = 0;
		rotationAngleY2SliderValueElement.textContent = "0.000";

		rotationAngleZ2SliderElement.value = 0;
		rotationAngleZ2SliderValueElement.textContent = "0.000";

		updateRotation();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}