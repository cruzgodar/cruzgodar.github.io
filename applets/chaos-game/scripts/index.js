"use strict";

!async function()
{
	await Site.loadApplet("chaos-game");
	
	const applet = new ChaosGame(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const numVertices = parseInt(numVerticesInputElement.value || 5);
		
		applet.run(resolution, numVertices);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const numVerticesInputElement = Page.element.querySelector("#num-vertices-input");
	
	applet.listenToInputElements([resolutionInputElement, numVerticesInputElement], run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-chaos-game.png"));
	
	
	
	Page.show();
}()