import { HitomezashiPattern } from "./class.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new HitomezashiPattern({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const gridSizeInputElement = $("#grid-size-input");

	const rowProbInputElement = $("#row-prob-input");

	const colProbInputElement = $("#col-prob-input");

	const drawBoundariesCheckboxElement = $("#toggle-draw-boundaries-checkbox");

	const drawRegionsCheckboxElement = $("#toggle-draw-regions-checkbox");

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	drawBoundariesCheckboxElement.checked = true;

	drawRegionsCheckboxElement.checked = true;


	Applet.listenToInputElements([
		resolutionInputElement,
		gridSizeInputElement,
		rowProbInputElement,
		colProbInputElement
	], run);

	applet.setInputCaps([resolutionInputElement, gridSizeInputElement], [4000, 200]);



	drawBoundariesCheckboxElement.addEventListener("input", () =>
	{
		if (!drawBoundariesCheckboxElement.checked && !drawRegionsCheckboxElement.checked)
		{
			drawRegionsCheckboxElement.checked = true;
		}
	});

	drawRegionsCheckboxElement.addEventListener("input", () =>
	{
		if (!drawBoundariesCheckboxElement.checked && !drawRegionsCheckboxElement.checked)
		{
			drawBoundariesCheckboxElement.checked = true;
		}
	});



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-hitomezashi-pattern.png");
	});



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const gridSize = parseInt(gridSizeInputElement.value || 50);
		const rowProb = parseFloat(rowProbInputElement.value || .5);
		const colProb = parseFloat(colProbInputElement.value || .5);
		const doDrawBoundaries = drawBoundariesCheckboxElement.checked;
		const doDrawRegions = drawRegionsCheckboxElement.checked;
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			resolution,
			gridSize,
			rowProb,
			colProb,
			doDrawBoundaries,
			doDrawRegions,
			maximumSpeed
		});
	}
}