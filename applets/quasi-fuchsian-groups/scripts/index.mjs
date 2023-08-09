import { showPage } from "/scripts/src/load-page.mjs"
import { QuasiFuchsianGroups } from "./class.mjs";

export function load()
{
	const applet = new QuasiFuchsianGroups($("#output-canvas"));
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const highResolutionInputElement = $("#high-resolution-input");
	
	const maxDepthInputElement = $("#max-depth-input");
	
	const maxPixelBrightnessInputElement = $("#max-pixel-brightness-input");
	
	applet.setInputCaps([resolutionInputElement, highResolutionInputElement, maxDepthInputElement, maxPixelBrightnessInputElement], [500, 3000, 1000, 500]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolutionSmall = parseInt(resolutionInputElement.value || 300);
		applet.resolutionLarge = parseInt(resolutionInputElement.value || 300) * 3;
		
		applet.changeAspectRatio();
	});
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", async () =>
	{
		const imageSize = parseInt(highResolutionInputElement.value || 1000);
		const maxDepth = parseInt(maxDepthInputElement.value || 250);
		const maxPixelBrightness = parseInt(maxPixelBrightnessInputElement.value || 50);
		
		await applet.requestHighResFrame(imageSize, maxDepth, maxPixelBrightness);
		
		applet.wilson.downloadFrame("a-quasi-fuchsian-group.png");
	});
	
	
	
	showPage();
}