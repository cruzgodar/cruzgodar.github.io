"use strict";

!async function()
{
	await Site.loadApplet("finite-subdivisions");
	
	const applet = new FiniteSubdivision(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const numVertices = parseInt(numVerticesInputElement.value || 6);
		const numIterations = parseInt(numIterationsInputElement.value || 5);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		applet.run(numVertices, numIterations, maximumSpeed);
	}
	

	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const numVerticesInputElement = Page.element.querySelector("#num-vertices-input");
	
	const numIterationsInputElement = Page.element.querySelector("#num-iterations-input");
	
	applet.listenToInputElements([numVerticesInputElement, numIterationsInputElement], run);
	
	
	
	const maximumSpeedCheckboxElement = Page.element.querySelector("#toggle-maximum-speed-checkbox");
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-finite-subdivision.png"));
	
	
	
	Page.show();
}()