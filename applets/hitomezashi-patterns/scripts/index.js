import { showPage } from "../../../scripts/src/loadPage.js";
import { HitomezashiPatterns } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new HitomezashiPatterns({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-hitomezashi-pattern.png"
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
		name: "Grid Size",
		value: 50,
		minValue: 10,
		maxValue: 200,
		onEnter: run,
	});

	const rowProbInput = new TextBox({
		element: $("#row-prob-input"),
		name: "Row Chance",
		value: 0.5,
		minValue: 0,
		maxValue: 1,
		onEnter: run,
	});

	const colProbInput = new TextBox({
		element: $("#col-prob-input"),
		name: "Column Chance",
		value: 0.5,
		minValue: 0,
		maxValue: 1,
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
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
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
			drawRegionsCheckbox.setChecked({
				newChecked: true
			});
		}
	}

	function onCheckDrawRegionsCheckbox()
	{
		if (!drawBoundariesCheckbox.checked && !drawRegionsCheckbox.checked)
		{
			drawBoundariesCheckbox.setChecked({
				newChecked: true
			});
		}
	}
}