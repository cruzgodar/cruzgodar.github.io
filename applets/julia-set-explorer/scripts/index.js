"use strict";

!async function()
{
	await Site.loadApplet("julia-set-explorer");
	
	const switchJuliaModeButtonElement = Page.element.querySelector("#switch-julia-mode-button");
	
	const applet = new JuliaSet(Page.element.querySelector("#output-canvas"), switchJuliaModeButtonElement);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const doublePrecisionCheckboxElement = Page.element.querySelector("#double-precision-checkbox");
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		applet.changeAspectRatio();
	});
	
	switchJuliaModeButtonElement.addEventListener("click", () =>
	{
		applet.advanceJuliaMode();
	});
	
	doublePrecisionCheckboxElement.addEventListener("input", () =>
	{
		applet.toggleUseDoublePrecision();
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => 
	{
		if (applet.juliaMode === 0)
		{
			applet.wilson.downloadFrame("the-mandelbrot-set.png");
		}
		
		else
		{
			applet.wilson.downloadFrame("a-julia-set.png");
		}
	});
	
	
	
	Page.show();
}()