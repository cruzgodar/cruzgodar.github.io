"use strict";

!async function()
{
	await Site.loadApplet("brownian-trees");
	
	const applet = new BrownianTree(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		
		applet.run(resolution);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	applet.listenToInputElements([resolutionInputElement], run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => wilson.downloadFrame("a-brownian-tree.png"));
	
	
	
	Page.show();
}()