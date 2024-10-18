import { showPage } from "../../../scripts/src/loadPage.js";
import { SudokuGenerator } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new SudokuGenerator({ canvas: $("#sudoku-grid") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "sudoku.png"
	});



	function run()
	{
		applet.run();
	}



	showPage();
}