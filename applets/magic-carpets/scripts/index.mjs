import { MagicCarpet } from "./class.mjs";

export function load()
{
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
	
	const maxCageSizeInputElement = $("#max-cage-size-input");
	
	applet.setInputCaps([gridSizeInputElement], [100]);
	
	
	
	gridSizeInputElement.addEventListener("keydown", e =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
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
}