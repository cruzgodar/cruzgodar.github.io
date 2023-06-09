"use strict";

!async function()
{
	await Site.loadApplet("magic-carpets");
	
	const applet = new MagicCarpet(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 8);
		const maxCageSize = parseInt(maxCageSizeInputElement.value || 16);
		const uniqueSolution = uniqueSolutionCheckboxElement.checked;
		
		applet.run(gridSize, maxCageSize, uniqueSolution);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const drawSolutionButtonElement = Page.element.querySelector("#draw-solution-button");

	drawSolutionButtonElement.addEventListener("click", () =>
	{
		applet.drawSolution();
	});
	
	
	
	const drawRectanglesButtonElement = Page.element.querySelector("#draw-rectangles-button");

	drawRectanglesButtonElement.addEventListener("click", () =>
	{
		applet.drawSolution(true);
	});
	
	
	
	const gridSizeInputElement = Page.element.querySelector("#grid-size-input");
	
	gridSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const maxCageSizeInputElement = Page.element.querySelector("#max-cage-size-input");
	
	maxCageSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const uniqueSolutionCheckboxElement = Page.element.querySelector("#unique-solution-checkbox");
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-magic-carpet.png");
	});
	
	
	
	Page.show();
}()