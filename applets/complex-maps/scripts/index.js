"use strict";

!async function()
{
	await Site.loadApplet("complex-maps");
	
	const applet = new ComplexMap(Page.element.querySelector("#output-canvas"), "cexp(cinv(z))");
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value || "cexp(cinv(z))";
		
		applet.run(generatingCode);
	}
	
	
	
	const codeInputElement = Page.element.querySelector("#code-textarea");
	
	codeInputElement.addEventListener("keydown", (e) =>
	{
		if (e.keyCode === 13)
		{
			e.preventDefault();
			
			run();
		}
	});
	
	
	
	const generateButtonElement = Page.element.querySelector("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const selectorModeButtonElement = Page.element.querySelector("#selector-mode-button");
	
	selectorModeButtonElement.addEventListener("click", () => applet.useSelectorMode = true);
	
	
	
	const benchmarkButtonElement = Page.element.querySelector("#benchmark-button");
	
	benchmarkButtonElement.addEventListener("click", () => applet.runBenchmark());
	
	
	
	if (!DEBUG)
	{
		Page.element.querySelector("#debug-buttons").remove();
	}
	
	
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.wilson.changeCanvasSize(applet.resolution, applet.resolution);
		
		applet.drawFrame();
	});
	
	
	
	const blackPointInputElement = Page.element.querySelector("#black-point-input");
	
	blackPointInputElement.addEventListener("input", () =>
	{
		applet.blackPoint = parseFloat(blackPointInputElement.value || 1);
		
		applet.drawFrame();
	});
	
	
	
	const whitePointInputElement = Page.element.querySelector("#white-point-input");
	
	whitePointInputElement.addEventListener("input", () =>
	{
		applet.whitePoint = parseFloat(whitePointInputElement.value || 1);
		
		applet.drawFrame();
	});
	
	
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("a-complex-map.png"));
	
	
	
	const examples =
	{
		"none": "",
		"trig": "csin(z)",
		"poles": "cinv(cmul(csub(cpow(z, 6.0), 1.0), csub(cpow(z, 3.0), 1.0)))",
		"es": "cexp(cinv(z))",
		"tet": "ctet(z, 100.0)",
		"lattices": "wp(z, draggableArg)"
	};
	
	const exampleSelectorDropdownElement = Page.element.querySelector("#example-selector-dropdown");
	
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