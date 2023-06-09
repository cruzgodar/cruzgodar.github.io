"use strict";

!async function()
{
	await Site.loadApplet("abelian-sandpiles");
	
	const applet = new AbelianSandpile(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const numGrains = parseInt(numGrainsInputElement.value || 10000);
		const computationsPerFrame = parseInt(computationsPerFrameInputElement.value || 25);
		
		applet.run(numGrains, computationsPerFrame);
	}
	
	
	
	const numGrainsInputElement = Page.element.querySelector("#num-grains-input");
	const computationsPerFrameInputElement = Page.element.querySelector("#computations-per-frame-input");
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("an-abelian-sandpile.png"));
	
	
	
	Page.show();
}()