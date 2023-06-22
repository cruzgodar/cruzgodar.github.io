"use strict";

!async function()
{
	await Site.loadApplet("kicked-rotator");
	
	const applet = new KickedRotator(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const K = parseFloat(kInputElement.value || .75);
		const orbitSeparation = parseInt(orbitSeparationInputElement.value || 0);
		
		applet.run(resolution, K, orbitSeparation);
	}



	const generateButtonElement = Page.element.querySelector("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const kInputElement = Page.element.querySelector("#k-input");
	
	const orbitSeparationInputElement = Page.element.querySelector("#orbit-separation-input");
	
	applet.listenToInputElements([resolutionInputElement, kInputElement, orbitSeparationInputElement], run);
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-kicked-rotator.png");
	});
	
	
	
	Page.show();
}()