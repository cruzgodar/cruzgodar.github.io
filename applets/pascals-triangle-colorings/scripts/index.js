import { showPage } from "../../../scripts/src/loadPage.js";
import { PascalsTriangleColoring } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new PascalsTriangleColoring({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-pascals-triangle-coloring.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 500,
		maxValue: 4000,
		onEnter: run
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Triangle Size",
		value: 27,
		minValue: 9,
		maxValue: 243,
		onEnter: run
	});

	const numColorsInput = new TextBox({
		element: $("#num-colors-input"),
		name: "Colors",
		value: 3,
		minValue: 1,
		onEnter: run
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			gridSize: gridSizeInput.value,
			numColors: numColorsInput.value
		});
	}
}