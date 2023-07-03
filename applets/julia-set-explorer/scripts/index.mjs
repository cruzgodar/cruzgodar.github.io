import { JuliaSet } from "./class.mjs";

export function load()
{
	const switchJuliaModeButtonElement = $("#switch-julia-mode-button");
	
	const applet = new JuliaSet($("#output-canvas"), switchJuliaModeButtonElement);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	const doublePrecisionCheckboxElement = $("#double-precision-checkbox");
	
	
	
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
	
	
	
	const downloadButtonElement = $("#download-button");
	
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
}