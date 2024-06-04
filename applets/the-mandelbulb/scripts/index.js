import { showPage } from "../../../scripts/src/loadPage.js";
import { Mandelbulb } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
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
		minValue: 100,
		maxValue: 750,
		onInput: changeResolution
	});

	const iterationsSlider = new Slider({
		element: $("#iterations-slider"),
		name: "Iterations",
		value: 16,
		min: 0,
		max: 32,
		logarithmic: true,
		integer: true,
		onInput: onSliderInput
	});

	const powerSlider = new Slider({
		element: $("#power-slider"),
		name: "Power",
		value: 8,
		min: 2,
		max: 16,
		snapPoints: [8],
		onInput: onSliderInput
	});

	const cXSlider = new Slider({
		element: $("#c-x-slider"),
		name: "$c_x$",
		value: -0.54,
		min: -1,
		max: 1,
		onInput: onSliderInput
	});

	const cYSlider = new Slider({
		element: $("#c-y-slider"),
		name: "$c_y$",
		value: -0.25,
		min: -1,
		max: 1,
		onInput: onSliderInput
	});

	const cZSlider = new Slider({
		element: $("#c-z-slider"),
		name: "$c_z$",
		value: -0.668,
		min: -1,
		max: 1,
		onInput: onSliderInput
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

	typesetMath();

	showPage();

	function onSliderInput()
	{
		const cx = cXSlider.value;
		const cy = cYSlider.value;
		const cz = cZSlider.value;

		applet.c = [cx, cy, cz];
		applet.wilson.gl.uniform3fv(applet.wilson.uniforms["c"], applet.c);

		applet.rotationAngleX = rotationAngleXSlider.value;
		applet.rotationAngleY = rotationAngleYSlider.value;
		applet.rotationAngleZ = rotationAngleZSlider.value;

		applet.power = powerSlider.value;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["power"], applet.power);

		applet.maxIterations = iterationsSlider.value;
		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);

		applet.updateRotationMatrix();
	}

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}
}