import { showPage } from "../../../scripts/src/loadPage.js";
import { SudokuGenerator } from "./class.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new SudokuGenerator({ canvas: $("#sudoku-grid") });



	function run()
	{
		applet.run();
	}


	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("sudoku.png");
	});



	showPage();
}