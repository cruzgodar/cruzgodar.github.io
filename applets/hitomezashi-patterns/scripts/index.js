import { showPage } from "../../../scripts/src/loadPage.js";
import { HitomezashiPattern } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
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

	const drawBoundariesCheckbox = new Checkbox({
		element: $("#draw-boundaries-checkbox"),
		name: "Draw boundaries",
		checked: true,
		onInput: onCheckDrawBoundariesCheckbox
	});

	const drawRegionsCheckbox = new Checkbox({
		element: $("#draw-regions-checkbox"),
		name: "Color regions",
		checked: true,
		onInput: onCheckDrawRegionsCheckbox
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			gridSize: gridSizeInput.value,
			rowProb: rowProbInput.value,
			colProb: colProbInput.value,
			doDrawBoundaries: drawBoundariesCheckbox.checked,
			doDrawRegions: drawRegionsCheckbox.checked,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}

	function onCheckDrawBoundariesCheckbox()
	{
		if (!drawBoundariesCheckbox.checked && !drawRegionsCheckbox.checked)
		{
			drawRegionsCheckbox.setChecked(true);
		}
	}

	function onCheckDrawRegionsCheckbox()
	{
		if (!drawBoundariesCheckbox.checked && !drawRegionsCheckbox.checked)
		{
			drawBoundariesCheckbox.setChecked(true);
		}
	}
}