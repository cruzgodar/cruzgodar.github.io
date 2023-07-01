"use strict";

!async function()
{
	await Applet.load("sudoku-generator");
	
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
	
	
	
	Page.show();
}()