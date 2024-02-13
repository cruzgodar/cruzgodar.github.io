import { showPage } from "../../../scripts/src/loadPage.js";
import { PascalsTriangleColoring } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		maxValue: 4000,
		onEnter: run
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Triangle Size",
		value: 27,
		maxValue: 243,
		onEnter: run
	});

	const numColorsInput = new TextBox({
		element: $("#num-colors-input"),
		name: "Colors",
		value: 3,
		onEnter: run
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			gridSize: gridSizeInput.value,
			numColors: numColorsInput.value
		});
	}
}