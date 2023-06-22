"use strict";

!async function()
{
	await Site.loadApplet("generalized-julia-sets");
	
	const switchJuliaModeButtonElement = Page.element.querySelector("#switch-julia-mode-button");
	
	switchJuliaModeButtonElement.style.opacity = 1;
	
	const applet = new GeneralizedJuliaSet(Page.element.querySelector("#output-canvas"), "cadd(cpow(z, 2.0), c)", switchJuliaModeButtonElement);
	
	applet.loadPromise.then(() => run());
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value || "cadd(cpow(z, 2.0), c)";
		
		const resolution = parseInt(resolutionInputElement.value || 500);
		const exposure = parseFloat(exposureInputElement.value || 1);
		const numIterations = parseInt(numIterationsInputElement.value || 200);
		
		applet.run(generatingCode, resolution, exposure, numIterations);
	}
	
	
	
	const codeInputElement = Page.element.querySelector("#code-textarea");
	
	codeInputElement.value = "cadd(cpow(z, 2.0), c)";
	
	applet.listenToInputElements([codeInputElement], run);
	
	
	
	const examples =
	{
		"mandelbrot": "cadd(cpow(z, 2.0), c)",
		"var-exp": "cadd(cpow(z, 4.0), c)",
		"trig": "csin(cmul(z, c))",
		"burning-ship": "cadd(cpow(vec2(abs(z.x), -abs(z.y)), 2.0), c)",
		"rational-map": "cadd(csub(cpow(z, 2.0), cmul(.05, cpow(z, -2.0))), c)",
		"mandelbrot-dust": "cadd(csub(cpow(z, 2.0), vec2(0.0, cmul(.05, cpow(z, -2.0).y))), c)"
	};
	
	const exampleSelectorDropdownElement = Page.element.querySelector("#example-selector-dropdown");
	
	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value === "none")
		{
			return;
		}
		
		codeInputElement.value = examples[exampleSelectorDropdownElement.value];
		
		run();
	});
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeResolution();
	});
	
	
	
	const exposureInputElement = Page.element.querySelector("#exposure-input");
	
	exposureInputElement.addEventListener("input", () =>
	{
		applet.exposure = parseFloat(exposureInputElement.value || 1);
	});
	
	
	
	const numIterationsInputElement = Page.element.querySelector("#num-iterations-input");
	
	numIterationsInputElement.addEventListener("input", () =>
	{
		applet.numIterations = parseInt(numIterationsInputElement.value || 200);
	});
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	switchJuliaModeButtonElement.addEventListener("click", () => applet.switchJuliaMode());
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-generalized-julia-set.png");
	});
	
	
	
	Page.show();
}()