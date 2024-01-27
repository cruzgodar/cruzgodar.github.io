import { DoublePendulumFractal } from "./class.js";
import { changeOpacity } from "/scripts/src/animation.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new DoublePendulumFractal({
		canvas: $("#output-canvas"),
		pendulumCanvas: $("#pendulum-canvas")
	});



	const resolutionInputElement = $("#resolution-input");

	Applet.listenToInputElements([resolutionInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const switchPendulumCanvasButtonElement = $("#switch-pendulum-canvas-button");

	switchPendulumCanvasButtonElement.addEventListener("click", () =>
	{
		if (applet.drawingFractal)
		{
			applet.drawingFractal = false;

			changeOpacity(switchPendulumCanvasButtonElement, 0)
				.then(() =>
				{
					switchPendulumCanvasButtonElement.textContent = "Return to Fractal";

					changeOpacity(switchPendulumCanvasButtonElement, 1);
				});
		}

		else
		{
			applet.drawingFractal = true;

			// What the actual fuck
			applet.hidePendulumDrawerCanvas();



			changeOpacity(switchPendulumCanvasButtonElement, 0)
				.then(() =>
				{
					switchPendulumCanvasButtonElement.textContent = "Pick Pendulum";

					changeOpacity(switchPendulumCanvasButtonElement, 1);
				});
		}
	});



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("the-double-pendulum-fractal.png")
	);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);

		applet.run({ resolution });
	}
}