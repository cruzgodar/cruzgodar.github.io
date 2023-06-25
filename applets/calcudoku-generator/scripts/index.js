"use strict";

!async function()
{
	await Applet.load("calcudoku-generator");
	
	const applet = new CalcudokuGenerator($("#output-canvas"));
	
	
	
	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 6);
		
		const maxCageSize = parseInt(maxCageSizeInputElement.value || 1000);
		
		applet.run(gridSize, maxCageSize);
	}
	
	
	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const gridSizeInputElement = $("#grid-size-input");
	
	const maxCageSizeInputElement = $("#max-cage-size-input");
	
	applet.listenToInputElements([gridSizeInputElement, maxCageSizeInputElement], run);
	
	applet.setInputCaps([gridSizeInputElement, maxCageSizeInputElement], [10, 5]);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.drawGrid(true);
		
		applet.wilson.downloadFrame("a-calcudoku-puzzle.png");
		
		applet.drawGrid(false);
	});
	
	
	
	Page.show();
}()