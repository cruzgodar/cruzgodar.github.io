import { showPage } from "../../../scripts/src/loadPage.js";
import { SudokuGenerator } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new SudokuGenerator({ canvas: $("#sudoku-grid") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "sudoku.png"
	});



	function run()
	{
		applet.run();
	}



	showPage();
}