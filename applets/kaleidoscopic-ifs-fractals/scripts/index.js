"use strict";

!async function()
{
	await Site.loadApplet("kaleidoscopic-ifs-fractals");
	
	const applet = new KaleidoscopicIFSFractal($("#output-canvas"));
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	applet.setInputCaps([resolutionInputElement], [1000]);
	
	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeResolution(resolution);
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-kaleidoscopic-ifs-fractal.png");
	});
	
	
	
	const polyhedronSelectorDropdownElement = $("#polyhedron-selector-dropdown");
	
	polyhedronSelectorDropdownElement.addEventListener("input", () =>
	{
		if (polyhedronSelectorDropdownElement.value === "tetrahedron")
		{
			applet.changePolyhedron(0);
		}
		
		else if (polyhedronSelectorDropdownElement.value === "cube")
		{
			applet.changePolyhedron(1);
		}
		
		else
		{
			applet.changePolyhedron(2);
		}
	});
	
	
	
	const rotationAngleX1InputElement = $("#rotation-angle-x-1-input");
	const rotationAngleY1InputElement = $("#rotation-angle-y-1-input");
	const rotationAngleZ1InputElement = $("#rotation-angle-z-1-input");
	
	const rotationAngleX2InputElement = $("#rotation-angle-x-2-input");
	const rotationAngleY2InputElement = $("#rotation-angle-y-2-input");
	const rotationAngleZ2InputElement = $("#rotation-angle-z-2-input");
	
	const elements = [rotationAngleX1InputElement, rotationAngleY1InputElement, rotationAngleZ1InputElement, rotationAngleX2InputElement, rotationAngleY2InputElement, rotationAngleZ2InputElement];
	
	for (let i = 0; i < 6; i++)
	{
		elements[i].addEventListener("input", () =>
		{
			const rotationAngleX1 = parseFloat(rotationAngleX1InputElement.value || 0);
			const rotationAngleY1 = parseFloat(rotationAngleY1InputElement.value || 0);
			const rotationAngleZ1 = parseFloat(rotationAngleZ1InputElement.value || 0);
			const rotationAngleX2 = parseFloat(rotationAngleX2InputElement.value || 0);
			const rotationAngleY2 = parseFloat(rotationAngleY2InputElement.value || 0);
			const rotationAngleZ2 = parseFloat(rotationAngleZ2InputElement.value || 0);
			applet.updateParameters(rotationAngleX1, rotationAngleY1, rotationAngleZ1, rotationAngleX2, rotationAngleY2, rotationAngleZ2);
		});
	}
	
	
	
	const randomizeParametersButtonElement = $("#randomize-parameters-button");
	
	randomizeParametersButtonElement.addEventListener("click", () =>
	{
		const rotationAngleX1 = Math.random()*.375 - .1875;
		const rotationAngleY1 = Math.random()*.375 - .1875;
		const rotationAngleZ1 = Math.random()*.75 - .375;
		const rotationAngleX2 = Math.random()*.375 - .1875;
		const rotationAngleY2 = Math.random()*.375 - .1875;
		const rotationAngleZ2 = Math.random()*.75 - .375;
		
		rotationAngleX1InputElement.value = Math.round(rotationAngleX1 * 1000000) / 1000000;
		rotationAngleY1InputElement.value = Math.round(rotationAngleY1 * 1000000) / 1000000;
		rotationAngleZ1InputElement.value = Math.round(rotationAngleZ1 * 1000000) / 1000000;
		rotationAngleX2InputElement.value = Math.round(rotationAngleX2 * 1000000) / 1000000;
		rotationAngleY2InputElement.value = Math.round(rotationAngleY2 * 1000000) / 1000000;
		rotationAngleZ2InputElement.value = Math.round(rotationAngleZ2 * 1000000) / 1000000;
		
		applet.updateParameters(rotationAngleX1, rotationAngleY1, rotationAngleZ1, rotationAngleX2, rotationAngleY2, rotationAngleZ2);
	});
	
	
	
	Page.show();
}()