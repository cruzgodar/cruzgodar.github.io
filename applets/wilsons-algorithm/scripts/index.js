import { showPage } from "../../../scripts/src/loadPage.js";
import { WilsonsAlgorithm } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new WilsonsAlgorithm({ canvas: $("#output-canvas") });

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 50,
		minValue: 5,
		maxValue: 200,
		onEnter: run
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "wilsons-algorithm.png"
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	const drawBordersCheckbox = new Checkbox({
		element: $("#draw-borders-checkbox"),
		name: "Draw borders",
		checked: true
	});

	showPage();

	function run()
	{
		applet.run({
			gridSize: gridSizeInput.value,
			maximumSpeed: maximumSpeedCheckbox.checked,
			noBorders: !drawBordersCheckbox.checked
		});
	}
}