import { showPage } from "../../../scripts/src/loadPage.js";
import { DoublePendulumFractal } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new DoublePendulumFractal({
		canvas: $("#output-canvas"),
		pendulumCanvas: $("#pendulum-canvas")
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new ToggleButton({
		element: $("#switch-pendulum-canvas-button"),
		name0: "Pick Pendulum",
		name1: "Return to Fractal",
		onClick0: () => applet.drawingFractal = false,
		onClick1: () =>
		{
			applet.drawingFractal = true;
			applet.hidePendulumDrawerCanvas(); // :(
		}
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "the-double-pendulum-fractal.png"
	});



	const resolutionInputElement = $("#resolution-input");

	Applet.listenToInputElements([resolutionInputElement], run);

	applet.setInputCaps([resolutionInputElement], [2000]);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);

		applet.run({ resolution });
	}
}