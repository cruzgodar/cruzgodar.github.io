import { showPage } from "../../../scripts/src/loadPage.js";
import { CalcudokuGenerator } from "./class.js";
import { Button, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new CalcudokuGenerator({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () =>
		{
			applet.drawGrid(true);
			applet.wilson.downloadFrame("a-calcudoku-puzzle.png");
			applet.drawGrid(false);
		}
	});

	const gridSizeInput = new TextBox({
		element: $("#grid-size-input"),
		name: "Grid Size",
		value: 6,
		maxValue: 10,
		onEnter: run,
	});

	const maxCageSizeInput = new TextBox({
		element: $("#max-cage-size-input"),
		name: "Max Cage Size",
		value: 3,
		maxValue: 5,
		onEnter: run,
	});

	showPage();

	function run()
	{
		applet.run({
			gridSize: gridSizeInput.value,
			maxCageSize: maxCageSizeInput.value
		});
	}
}