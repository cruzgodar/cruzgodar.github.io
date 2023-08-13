import { SudokuGenerator } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new SudokuGenerator($("#sudoku-grid"));
	
	
	
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