"use strict";

!async function()
{
	await Site.loadApplet("newtons-method-extended");
	
	const applet = new NewtonsMethodExtended($("#output-canvas"));
	
	applet.loadPromise.then(() => run());
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value;
		
		applet.run(generatingCode);
	}
	
	
	
	const codeInputElement = $("#code-textarea");
	
	codeInputElement.value = "cmul(csin(z), csin(cmul(z, i)))";
	
	
	
	applet.listenToInputElements([codeInputElement], run);
	
	
	
	const randomizePaletteButton = $("#randomize-palette-button");
	
	randomizePaletteButton.addEventListener("click", applet.animatePaletteChange.bind(applet));
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	

	const resolutionInputElement = $("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio(true);
	});
	
	
	
	const derivativePrecisionInputElement = $("#derivative-precision-input");
	
	derivativePrecisionInputElement.addEventListener("input", () =>
	{
		derivativePrecision = parseFloat(derivativePrecisionInputElement.value || 20);
		
		this.wilson.gl.uniform1f(this.wilson.uniforms["derivativePrecision"], derivativePrecision);
		this.wilsonHidden.gl.uniform1f(this.wilsonHidden.uniforms["derivativePrecision"], derivativePrecision);
	});
	
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("newtons-method-extended.png");
	});
	
	
	
	const examples =
	{
		"none": "",
		"polynomial": "csub(cpow(z, 6.0), 1.0)",
		"trig": "csin(z)",
		"crosshatch": "cmul(csin(z), csin(cmul(z, i)))",
		"palette": "cmul(sin(z), csin(cmul(z, i)))",
		"butterflies": "cmul(sin(z), tan(z))"
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