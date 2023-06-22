"use strict";

!async function()
{
	await Site.loadApplet("quasi-fuchsian-groups");
	
	const applet = new QuasiFuchsianGroups($("#output-canvas"));
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolutionSmall = parseInt(resolutionInputElement.value || 300);
		applet.resolutionLarge = parseInt(resolutionInputElement.value || 300) * 3;
		
		applet.changeAspectRatio();
	});
	
	
	
	const highResolutionInputElement = $("#high-resolution-input");
	
	const maxDepthInputElement = $("#max-depth-input");
	
	const maxPixelBrightnessInputElement = $("#max-pixel-brightness-input");
	
	const generateButtonElement = $("#generate-button");
	
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