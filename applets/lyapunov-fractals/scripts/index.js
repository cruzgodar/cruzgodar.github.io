"use strict";

!async function()
{
	await Site.loadApplet("lyapunov-fractals");
	
	const applet = new LyapunovFractal(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const generatingString = (generatingStringInputElement.value || "AB").toUpperCase();
		
		applet.run(generatingString);
	}
	
	
	
	const generatingStringInputElement = Page.element.querySelector("#generating-string-input");
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	

	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.resolution = resolution;
		
		applet.changeAspectRatio(true);
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-lyapunov-fractal.png");
	});
	
	
	
	run();
	
	Page.show();
}()