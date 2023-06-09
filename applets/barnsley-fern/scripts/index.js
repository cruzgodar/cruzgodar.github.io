"use strict";

!async function()
{
	await Site.loadApplet("barnsley-fern");
	
	const applet = new BarnsleyFern(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const numIterations = 1000 * parseInt(numIterationsInputElement.value || 10000);
		
		applet.run(numIterations);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const numIterationsInputElement = Page.element.querySelector("#num-iterations-input");
	
	numIterationsInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			run();
		}
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("the-barnsley-fern.png"));
	
	
	
	Page.show();
}()