"use strict";

!async function()
{
	await Site.loadApplet("finite-subdivisions");
	
	const applet = new FiniteSubdivision($("#output-canvas"));
	
	
	
	function run()
	{
		const numVertices = parseInt(numVerticesInputElement.value || 6);
		const numIterations = parseInt(numIterationsInputElement.value || 5);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		
		applet.run(numVertices, numIterations, maximumSpeed);
	}
	

	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const numVerticesInputElement = $("#num-vertices-input");
	
	const numIterationsInputElement = $("#num-iterations-input");
	
	applet.listenToInputElements([numVerticesInputElement, numIterationsInputElement], run);
	
	
	
	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-finite-subdivision.png"));
	
	
	
	Page.show();
}()