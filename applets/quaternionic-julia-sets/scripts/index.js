import { QuaternionicJuliaSet } from "./class.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const cXSliderElement = $("#c-x-slider");
	const cYSliderElement = $("#c-y-slider");
	const cZSliderElement = $("#c-z-slider");

	const cXSliderValueElement = $("#c-x-slider-value");
	const cYSliderValueElement = $("#c-y-slider-value");
	const cZSliderValueElement = $("#c-z-slider-value");

	const switchBulbButtonElement = $("#switch-bulb-button");

	const applet = new QuaternionicJuliaSet(
		$("#output-canvas"),
		switchBulbButtonElement,
		cXSliderElement,
		cYSliderElement,
		cZSliderElement,
		cXSliderValueElement,
		cYSliderValueElement,
		cZSliderValueElement
	);



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



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		if (applet.juliaProportion === 0)
		{
			applet.wilson.downloadFrame("the-quaternionic-mandelbrot-set.png");
		}

		else
		{
			applet.wilson.downloadFrame("a-quaternionic-julia-set.png");
		}
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



	switchBulbButtonElement.style.opacity = 1;

	switchBulbButtonElement.addEventListener("click", () => applet.switchBulb());



	showPage();
}