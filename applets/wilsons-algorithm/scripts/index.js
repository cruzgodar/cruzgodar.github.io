import { WilsonsAlgorithm } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";

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
		filename: () => "wilsons-algorithm.png"
	});

	const animateMazeCheckbox = new Checkbox({
		element: $("#animate-maze-checkbox"),
		name: "Animate drawing maze",
		checked: true
	});

	const animateColoringCheckbox = new Checkbox({
		element: $("#animate-coloring-checkbox"),
		name: "Animate coloring",
		checked: true
	});

	const drawBordersCheckbox = new Checkbox({
		element: $("#draw-borders-checkbox"),
		name: "Draw borders",
		checked: true
	});

	function run()
	{
		applet.run({
			gridSize: gridSizeInput.value,
			animateMaze: animateMazeCheckbox.checked,
			animateColoring: animateColoringCheckbox.checked,
			noBorders: !drawBordersCheckbox.checked
		});
	}

	applet.run({
		gridSize: gridSizeInput.value,
		animateMaze: false,
		animateColoring: false,
		noBorders: !drawBordersCheckbox.checked
	});
}