"use strict";

!async function()
{
	await Site.loadApplet("domino-shuffling");
	
	const applet = new DominoShuffling(Page.element.querySelector("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const diamondSize = parseInt(diamondSizeInputElement.value || 20) + 1;
		const useSmoothColors = useSmoothColorsCheckboxElement.checked;
		
		applet.run(resolution, diamondSize, useSmoothColors);
	}
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const diamondSizeInputElement = Page.element.querySelector("#diamond-size-input");
	
	applet.listenToInputElements([resolutionInputElement, diamondSizeInputElement], run);
	
	
	
	const useSmoothColorsCheckboxElement = Page.element.querySelector("#use-smooth-colors-checkbox");
	useSmoothColorsCheckboxElement.checked = true;
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("an-aztec-diamond.png"));
	
	
	
	Page.show();
}()