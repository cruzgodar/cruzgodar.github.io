"use strict";

!async function()
{
	await Site.loadApplet("julia-set-mosaic");
	
	const applet = new JuliaSetMosaic(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const setDensity = parseInt(setDensityInputElement.value || 10);
		const exposure = parseFloat(exposureInputElement.value || 1);
		const numIterations = parseInt(numIterationsInputElement.value || 100);
		
		applet.run(resolution, setDensity, exposure, numIterations);
	}
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio();
	});
	
	
	
	const setDensityInputElement = Page.element.querySelector("#set-density-input");
	
	setDensityInputElement.addEventListener("input", () =>
	{
		applet.setDensity = parseFloat(setDensityInputElement.value || 10);
	});
	
	
	
	const exposureInputElement = Page.element.querySelector("#exposure-input");
	
	exposureInputElement.addEventListener("input", () =>
	{
		applet.exposure = parseFloat(exposureInputElement.value || 1);
	});
	
	
	
	const numIterationsInputElement = Page.element.querySelector("#num-iterations-input");
	
	numIterationsInputElement.addEventListener("input", () =>
	{
		applet.numIterations = parseInt(numIterationsInputElement.value || 200);
	});
	
	
	
	run();
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-generalized-julia-set.png");
	});
	
	
	
	Page.show();
}()