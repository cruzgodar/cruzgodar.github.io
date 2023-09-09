import { WilsonsAlgorithm } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new WilsonsAlgorithm({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const gridSizeInputElement = $("#grid-size-input");

	applet.setInputCaps([gridSizeInputElement], [200]);

	Applet.listenToInputElements([gridSizeInputElement], run);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("wilsons-algorithm.png");
	});



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