import { showPage } from "../../../scripts/src/loadPage.js";
import { PascalsTriangleColoring } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new PascalsTriangleColoring({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-pascals-triangle-coloring.png"
	});



	const resolutionInputElement = $("#resolution-input");

	const gridSizeInputElement = $("#grid-size-input");

	const numColorsInputElement = $("#num-colors-input");

	Applet.listenToInputElements(
		[resolutionInputElement, gridSizeInputElement, numColorsInputElement],
		run
	);

	applet.setInputCaps(
		[resolutionInputElement, gridSizeInputElement, numColorsInputElement],
		[4000, 243, Infinity]
	);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const gridSize = parseInt(gridSizeInputElement.value || 27);
		const numColors = parseInt(numColorsInputElement.value || 3);

		applet.run({
			resolution,
			gridSize,
			numColors
		});
	}
}