"use strict";

!async function()
{
	await Site.loadApplet("domino-shuffling");
	
	const applet = new DominoShuffling($("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const diamondSize = parseInt(diamondSizeInputElement.value || 20) + 1;
		const useSmoothColors = useSmoothColorsCheckboxElement.checked;
		
		applet.run(resolution, diamondSize, useSmoothColors);
	}
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const diamondSizeInputElement = $("#diamond-size-input");
	
	applet.listenToInputElements([resolutionInputElement, diamondSizeInputElement], run);
	
	
	
	const useSmoothColorsCheckboxElement = $("#use-smooth-colors-checkbox");
	useSmoothColorsCheckboxElement.checked = true;
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("an-aztec-diamond.png"));
	
	
	
	Page.show();
}()