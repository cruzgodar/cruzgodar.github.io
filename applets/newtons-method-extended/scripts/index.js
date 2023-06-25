"use strict";

!async function()
{
	await Applet.load("newtons-method-extended");
	
	const applet = new NewtonsMethodExtended($("#output-canvas"));
	
	applet.loadPromise.then(() => run());
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value;
		
		applet.run(generatingCode);
	}
	
	
	
	const codeInputElement = $("#code-textarea");
	
	codeInputElement.value = "cmul(csin(z), sin(cmul(z, i)))";
	
	
	
	applet.listenToInputElements([codeInputElement], run);
	
	
	
	const randomizePaletteButton = $("#randomize-palette-button");
	
	randomizePaletteButton.addEventListener("click", applet.animatePaletteChange.bind(applet));
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	

	const resolutionInputElement = $("#resolution-input");
	
	const derivativePrecisionInputElement = $("#derivative-precision-input");
	
	applet.setInputCaps([resolutionInputElement, derivativePrecisionInputElement], [2000, 100]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio(true);
	});
	
	derivativePrecisionInputElement.addEventListener("input", () =>
	{
		applet.derivativePrecision = parseFloat(derivativePrecisionInputElement.value || 20);
		
		applet.wilson.gl.uniform1f(applet.wilson.uniforms["derivativePrecision"], applet.derivativePrecision);
		applet.wilsonHidden.gl.uniform1f(applet.wilsonHidden.uniforms["derivativePrecision"], applet.derivativePrecision);
	});
	
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("newtons-method-extended.png");
	});
	
	
	
	const examples =
	{
		"none": "",
		"trig": "csin(z)",
		"crosshatch": "cmul(csin(z), csinh(z))",
		"palette": "cmul(sin(z), csinh(z))",
		"butterflies": "cmul(sin(z), tan(z))",
		"swatches": "cmul(csin(z), sin(cmul(z, i)))"
	};
	
	const exampleSelectorDropdownElement = $("#example-selector-dropdown");
	
	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value !== "none")
		{
			codeInputElement.value = examples[exampleSelectorDropdownElement.value];
			
			run();
		}
	});
	
	
	
	Page.show();
}()