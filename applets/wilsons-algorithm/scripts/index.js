import { showPage } from "../../../scripts/src/loadPage.js";
import { WilsonsAlgorithm } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new WilsonsAlgorithm({ canvas: $("#output-canvas") });



	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "wilsons-algorithm.png"
	});



	const gridSizeInputElement = $("#grid-size-input");

	applet.setInputCaps([gridSizeInputElement], [200]);

	Applet.listenToInputElements([gridSizeInputElement], run);



	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	const noBordersCheckboxElement = $("#no-borders-checkbox");



	showPage();



	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 50);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		const noBorders = noBordersCheckboxElement.checked;

		applet.run({
			gridSize,
			maximumSpeed,
			noBorders
		});
	}
}