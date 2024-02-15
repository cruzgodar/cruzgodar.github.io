import { showPage } from "../../../scripts/src/loadPage.js";
import { QuaternionicJuliaSet } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new QuaternionicJuliaSet({ canvas: $("#output-canvas") });

	new ToggleButton({
		element: $("#switch-bulb-button"),
		name0: "Switch to Mandelbrot",
		name1: "Return to Julia Set",
		onClick0: () => applet.switchBulb(),
		onClick1: () => applet.switchBulb()
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			if (applet.juliaProportion === 0)
			{
				applet.wilson.downloadFrame("the-quaternionic-mandelbrot-set.png");
			}

			else
			{
				applet.wilson.downloadFrame("a-quaternionic-julia-set.png");
			}
		}
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 400,
		maxValue: 800,
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

	typesetMath();

	showPage();

	function changeResolution()
	{
		applet.changeResolution(resolutionInput.value);
	}

	function onSliderInput()
	{
		applet.maxIterations = iterationsSlider.value;

		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);

		applet.updateC([
			cXSlider.value,
			cYSlider.value,
			cZSlider.value,
		]);
	}
}