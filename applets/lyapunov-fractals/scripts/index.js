import { LyapunovFractal } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new LyapunovFractal({ canvas: $("#output-canvas") });



	const generatingStringInputElement = $("#generating-string-input");

	Applet.listenToInputElements([generatingStringInputElement], run);



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);

	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.resolution = resolution;

		applet.changeAspectRatio(true);
	});



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-lyapunov-fractal.png");
	});



	run();

	showPage();



	function run()
	{
		const generatingString = (generatingStringInputElement.value || "AB").toUpperCase();

		applet.run({ generatingString });
	}
}