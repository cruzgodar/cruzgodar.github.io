"use strict";

!async function()
{
	await Site.loadApplet("magic-carpets");
	
	const applet = new MagicCarpet($("#output-canvas"));
	
	
	
	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 8);
		const maxCageSize = parseInt(maxCageSizeInputElement.value || 16);
		const uniqueSolution = uniqueSolutionCheckboxElement.checked;
		
		applet.run(gridSize, maxCageSize, uniqueSolution);
	}
	
	
	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const drawSolutionButtonElement = $("#draw-solution-button");

	drawSolutionButtonElement.addEventListener("click", () =>
	{
		applet.drawSolution();
	});
	
	
	
	const drawRectanglesButtonElement = $("#draw-rectangles-button");

	drawRectanglesButtonElement.addEventListener("click", () =>
	{
		applet.drawSolution(true);
	});
	
	
	
	const gridSizeInputElement = $("#grid-size-input");
	
	gridSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const maxCageSizeInputElement = $("#max-cage-size-input");
	
	maxCageSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const uniqueSolutionCheckboxElement = $("#unique-solution-checkbox");
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-magic-carpet.png");
	});
	
	
	
	Page.show();
}()