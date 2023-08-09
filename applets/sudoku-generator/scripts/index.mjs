import { showPage } from "/scripts/src/load-page.mjs"
import { SudokuGenerator } from "./class.mjs";

export function load()
{
	const applet = new SudokuGenerator($("#output-canvas"));
	
	
	
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