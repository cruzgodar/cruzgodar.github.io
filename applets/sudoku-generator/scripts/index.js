import { SudokuGenerator } from "./class.js";
import { Button, GenerateButton } from "/scripts/components/buttons.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new SudokuGenerator({ canvas: $("#sudoku-grid") });

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
			applet.wilson.downloadFrame("a-sudoku-puzzle.png");
			applet.drawGrid(false);
		}
	});



	function run()
	{
		applet.run();
	}
}