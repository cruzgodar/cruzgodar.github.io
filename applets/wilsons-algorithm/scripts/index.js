import { showPage } from "../../../scripts/src/loadPage.js";
import { WilsonsAlgorithm } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new WilsonsAlgorithm({ canvas: $("#output-canvas") });

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 50,
		maxValue: 200,
		onEnter: run
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "wilsons-algorithm.png"
	});

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	const noBordersCheckboxElement = $("#no-borders-checkbox");

	showPage();

	function run()
	{
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		const noBorders = noBordersCheckboxElement.checked;

		applet.run({
			gridSize: gridSizeInput.value,
			maximumSpeed,
			noBorders
		});
	}
}