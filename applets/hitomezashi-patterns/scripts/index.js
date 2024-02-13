import { showPage } from "../../../scripts/src/loadPage.js";
import { HitomezashiPattern } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

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

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		maxValue: 4000,
		onEnter: run
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 50,
		maxValue: 200,
		onEnter: run,
	});

	const rowProbInput = new TextBox({
		element: $("#row-prob-input"),
		name: "Row Offset Chance",
		value: 0.5,
		onEnter: run,
	});

	const colProbInput = new TextBox({
		element: $("#col-prob-input"),
		name: "Column Offset Chance",
		value: 0.5,
		onEnter: run,
	});

	const drawBoundariesCheckboxElement = $("#toggle-draw-boundaries-checkbox");

	const drawRegionsCheckboxElement = $("#toggle-draw-regions-checkbox");

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	drawBoundariesCheckboxElement.checked = true;

	drawRegionsCheckboxElement.checked = true;

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
		const doDrawBoundaries = drawBoundariesCheckboxElement.checked;
		const doDrawRegions = drawRegionsCheckboxElement.checked;
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			resolution: resolutionInput.value,
			gridSize: gridSizeInput.value,
			rowProb: rowProbInput.value,
			colProb: colProbInput.value,
			doDrawBoundaries,
			doDrawRegions,
			maximumSpeed
		});
	}
}