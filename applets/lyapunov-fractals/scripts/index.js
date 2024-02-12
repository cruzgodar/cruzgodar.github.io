import { showPage } from "../../../scripts/src/loadPage.js";
import { LyapunovFractal } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new LyapunovFractal({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-lyapunov-fractal.png"
	});



	const generatingStringInputElement = $("#generating-string-input");

	Applet.listenToInputElements([generatingStringInputElement], run);



	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);

	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.resolution = resolution;

		applet.changeAspectRatio(true);
	});



	run();

	showPage();



	function run()
	{
		const generatingString = (generatingStringInputElement.value || "AB").toUpperCase();

		applet.run({ generatingString });
	}
}