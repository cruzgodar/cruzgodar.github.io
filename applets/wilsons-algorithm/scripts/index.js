"use strict";

!async function()
{
	await Applet.load("wilsons-algorithm");
	
	const applet = new WilsonsAlgorithm($("#output-canvas"));

	

	function run()
	{
		const gridSize = parseInt(gridSizeInputElement.value || 50);
		const maximumSpeed = maximumSpeedCheckboxElement.checked;
		const noBorders = noBordersCheckboxElement.checked;

		applet.run(gridSize, maximumSpeed, noBorders);
	}


	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const gridSizeInputElement = $("#grid-size-input");
	
	applet.setInputCaps([gridSizeInputElement], [200]);

	applet.listenToInputElements([gridSizeInputElement], run);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("wilsons-algorithm.png");
	});
	
	
	
	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");
	
	const noBordersCheckboxElement = $("#no-borders-checkbox");



	Page.show();
}()