"use strict";

!async function()
{
	await Site.loadApplet("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups(Page.element.querySelector("#output-canvas"));
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolutionSmall = parseInt(resolutionInputElement.value || 300);
		applet.resolutionLarge = parseInt(resolutionInputElement.value || 300) * 3;
		
		applet.changeAspectRatio();
	});
	
	
	
	const highResolutionInputElement = Page.element.querySelector("#high-resolution-input");
	
	const maxDepthInputElement = Page.element.querySelector("#max-depth-input");
	
	const maxPixelBrightnessInputElement = Page.element.querySelector("#max-pixel-brightness-input");
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", async () =>
	{
		const imageSize = parseInt(highResolutionInputElement.value || 1000);
		const maxDepth = parseInt(maxDepthInputElement.value || 250);
		const maxPixelBrightness = parseInt(maxPixelBrightnessInputElement.value || 50);
		
		await applet.requestHighResFrame(imageSize, maxDepth, maxPixelBrightness);
		
		applet.wilson.downloadFrame("a-quasi-fuchsian-group.png");
	});
	
	
	
	Page.show();
}()