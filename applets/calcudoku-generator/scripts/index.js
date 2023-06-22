"use strict";

!async function()
{
	await Site.loadApplet("calcudoku-generator");
	
	const applet = new CalcudokuGenerator(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 6);
		
		const maxCageSize = parseInt(maxCageSizeInputElement.value || 1000);
		
		applet.run(gridSize, maxCageSize);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const gridSizeInputElement = Page.element.querySelector("#grid-size-input");
	
	const maxCageSizeInputElement = Page.element.querySelector("#max-cage-size-input");
	
	applet.listenToInputElements([gridSizeInputElement, maxCageSizeInputElement], run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.drawGrid(true);
		
		applet.wilson.downloadFrame("a-calcudoku-puzzle.png");
		
		applet.drawGrid(false);
	});
	
	
	
	Page.show();
}()