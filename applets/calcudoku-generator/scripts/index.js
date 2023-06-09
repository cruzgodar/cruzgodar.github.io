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
	
	gridSizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const maxCageSizeInputElement = Page.element.querySelector("#max-cage-size-input");
	
	maxCageSizeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.drawGrid(true);
		
		applet.wilson.downloadFrame("a-calcudoku-puzzle.png");
		
		applet.drawGrid(false);
	});
	
	
	
	Page.show();
}()