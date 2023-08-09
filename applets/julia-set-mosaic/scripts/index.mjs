import { showPage } from "/scripts/src/load-page.mjs"
import { JuliaSetMosaic } from "./class.mjs";

export function load()
{
	const applet = new JuliaSetMosaic($("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const setDensity = parseInt(setDensityInputElement.value || 10);
		const exposure = parseFloat(exposureInputElement.value || 1);
		const numIterations = parseInt(numIterationsInputElement.value || 100);
		
		applet.run(resolution, setDensity, exposure, numIterations);
	}
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const setDensityInputElement = $("#set-density-input");
	
	const exposureInputElement = $("#exposure-input");
	
	const numIterationsInputElement = $("#num-iterations-input");
	
	applet.setInputCaps([resolutionInputElement, setDensityInputElement, numIterationsInputElement], [2000, 200, 500]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio();
	});
	
	setDensityInputElement.addEventListener("input", () =>
	{
		applet.setDensity = parseFloat(setDensityInputElement.value || 10);
	});
	
	exposureInputElement.addEventListener("input", () =>
	{
		applet.exposure = parseFloat(exposureInputElement.value || 1);
	});
	
	numIterationsInputElement.addEventListener("input", () =>
	{
		applet.numIterations = parseInt(numIterationsInputElement.value || 200);
	});
	
	
	
	run();
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-generalized-julia-set.png");
	});
	
	
	
	showPage();
}