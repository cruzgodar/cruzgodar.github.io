import { showPage } from "../../../scripts/src/loadPage.js";
import { QuaternionicJuliaSet } from "./class.js";
import { Button, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const cXSliderElement = $("#c-x-slider");
	const cYSliderElement = $("#c-y-slider");
	const cZSliderElement = $("#c-z-slider");

	const cXSliderValueElement = $("#c-x-slider-value");
	const cYSliderValueElement = $("#c-y-slider-value");
	const cZSliderValueElement = $("#c-z-slider-value");

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



	const resolutionInputElement = $("#resolution-input");

	const iterationsSliderElement = $("#iterations-slider");
	const iterationsSliderValueElement = $("#iterations-slider-value");

	applet.setInputCaps([resolutionInputElement], [750]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});

	iterationsSliderElement.addEventListener("input", () =>
	{
		applet.maxIterations = parseInt(iterationsSliderValueElement.textContent || 16);

		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);
	});



	const elements = [cXSliderElement, cYSliderElement, cZSliderElement];

	for (let i = 0; i < elements.length; i++)
	{
		elements[i].addEventListener("input", () =>
		{
			const c = [
				parseFloat(cXSliderValueElement.textContent),
				parseFloat(cYSliderValueElement.textContent),
				parseFloat(cZSliderValueElement.textContent),
			];

			applet.updateC(c);
		});
	}



	showPage();
}