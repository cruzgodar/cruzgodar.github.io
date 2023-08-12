import { PascalsTriangleColoring } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";

export function load()
{
	const applet = new PascalsTriangleColoring($("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const gridSize = parseInt(gridSizeInputElement.value || 27);
		const numColors = parseInt(numColorsInputElement.value || 3);
		
		applet.run(resolution, gridSize, numColors);
	}
	

	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const gridSizeInputElement = $("#grid-size-input");
	
	const numColorsInputElement = $("#num-colors-input");
	
	applet.listenToInputElements([resolutionInputElement, gridSizeInputElement, numColorsInputElement], run);
	
	applet.setInputCaps([resolutionInputElement, gridSizeInputElement, numColorsInputElement], [4000, 243, Infinity]);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-pascals-triangle-coloring.png");
	});
	
	
	
	showPage();
}