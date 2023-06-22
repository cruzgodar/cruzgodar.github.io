"use strict";

!async function()
{
	await Site.loadApplet("hitomezashi-patterns");
	
	const applet = new HitomezashiPattern(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const gridSize = parseInt(gridSizeInputElement.value || 50);
		const rowProb = parseFloat(rowProbInputElement.value || .5);
		const colProb = parseFloat(colProbInputElement.value || .5);
		const doDrawBoundaries = drawBoundariesCheckboxElement.checked;
		const doDrawRegions = drawRegionsCheckboxElement.checked;
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		applet.run(resolution, gridSize, rowProb, colProb, doDrawBoundaries, doDrawRegions, maximumSpeed);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const gridSizeInputElement = Page.element.querySelector("#grid-size-input");
	
	const rowProbInputElement = Page.element.querySelector("#row-prob-input");
	
	const colProbInputElement = Page.element.querySelector("#col-prob-input");
	
	const drawBoundariesCheckboxElement = Page.element.querySelector("#toggle-draw-boundaries-checkbox");
	
	const drawRegionsCheckboxElement = Page.element.querySelector("#toggle-draw-regions-checkbox");
	
	const maximumSpeedCheckboxElement = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	drawBoundariesCheckboxElement.checked = true;
	
	drawRegionsCheckboxElement.checked = true;
	
	
	applet.listenToInputElements([resolutionInputElement, gridSizeInputElement, rowProbInputElement, colProbInputElement], run);
	
	
	
	drawBoundariesCheckboxElement.addEventListener("input", () =>
	{
		if (!drawBoundariesCheckboxElement.checked && !drawRegionsCheckboxElement.checked)
		{
			drawRegionsCheckboxElement.checked = true;
		}
	});
	
	drawRegionsCheckboxElement.addEventListener("input", () =>
	{
		if (!drawBoundariesCheckboxElement.checked && !drawRegionsCheckboxElement.checked)
		{
			drawBoundariesCheckboxElement.checked = true;
		}
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-hitomezashi-pattern.png");
	});
	
	
	
	Page.show();
}()