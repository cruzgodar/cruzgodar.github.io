import { showPage } from "../../../scripts/src/loadPage.js";
import { HitomezashiPattern } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new HitomezashiPattern({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-hitomezashi-pattern.png"
	});



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