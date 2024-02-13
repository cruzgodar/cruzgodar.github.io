import { showPage } from "../../../scripts/src/loadPage.js";
import { Mandelbulb } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const rotationAngleXSliderElement = $("#rotation-angle-x-slider");
	const rotationAngleXSliderValueElement = $("#rotation-angle-x-slider-value");

	const rotationAngleYSliderElement = $("#rotation-angle-y-slider");
	const rotationAngleYSliderValueElement = $("#rotation-angle-y-slider-value");

	const rotationAngleZSliderElement = $("#rotation-angle-z-slider");
	const rotationAngleZSliderValueElement = $("#rotation-angle-z-slider-value");

	const cXSliderElement = $("#c-x-slider");
	const cXSliderValueElement = $("#c-x-slider-value");

	const cYSliderElement = $("#c-y-slider");
	const cYSliderValueElement = $("#c-y-slider-value");

	const cZSliderElement = $("#c-z-slider");
	const cZSliderValueElement = $("#c-z-slider-value");

	const applet = new Mandelbulb({
		canvas: $("#output-canvas"),
	});

	new ToggleButton({
		element: $("#switch-bulb-button"),
		name0: "Switch to Juliabulb",
		name1: "Return to Mandelbulb",
		onClick0: () => applet.switchBulb(),
		onClick1: () => applet.switchBulb()
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], 1024);
			applet.wilson.gl.uniform1f(applet.wilson.uniforms["stepFactor"], 12);

			if (applet.juliaProportion < .5)
			{
				applet.wilson.downloadFrame("the-mandelbulb.png");
			}

			else
			{
				applet.wilson.downloadFrame("a-juliabulb.png");
			}

			applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], applet.maxMarches);
			applet.wilson.gl.uniform1f(applet.wilson.uniforms["stepFactor"], 1);
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		maxValue: 750,
		onInput: changeResolution
	});

	const iterationsSliderElement = $("#iterations-slider");
	const iterationsSliderValueElement = $("#iterations-slider-value");

	const powerSliderElement = $("#power-slider");
	const powerSliderValueElement = $("#power-slider-value");

	const elements = [
		rotationAngleXSliderElement,
		rotationAngleYSliderElement,
		rotationAngleZSliderElement,
		cXSliderElement,
		cYSliderElement,
		cZSliderElement,
		powerSliderElement,
		iterationsSliderElement
	];

	elements.forEach(element => element.addEventListener("input", updateParameters));

	showPage();

	function updateParameters()
	{
		const cx = parseFloat(cXSliderValueElement.textContent);
		const cy = parseFloat(cYSliderValueElement.textContent);
		const cz = parseFloat(cZSliderValueElement.textContent);

		applet.c = [cx, cy, cz];
		applet.wilson.gl.uniform3fv(applet.wilson.uniforms["c"], applet.c);

		applet.rotationAngleX = parseFloat(rotationAngleXSliderValueElement.textContent);
		applet.rotationAngleY = parseFloat(rotationAngleYSliderValueElement.textContent);
		applet.rotationAngleZ = parseFloat(rotationAngleZSliderValueElement.textContent);

		applet.power = parseFloat(powerSliderValueElement.textContent);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["power"], applet.power);

		applet.maxIterations = parseInt(iterationsSliderValueElement.textContent);
		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);

		applet.updateRotationMatrix();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}