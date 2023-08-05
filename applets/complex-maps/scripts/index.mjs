import { ComplexMap } from "./class.mjs";

export function load()
{
	const applet = new ComplexMap($("#output-canvas"), "cexp(cinv(z))");
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value || "cexp(cinv(z))";
		
		applet.run(generatingCode);
	}
	
	
	
	const codeInputElement = $("#code-textarea");
	
	applet.listenToInputElements([codeInputElement], run);
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	const selectorModeButtonElement = $("#selector-mode-button");
	
	selectorModeButtonElement.addEventListener("click", () => applet.useSelectorMode = true);
	
	
	
	const benchmarkButtonElement = $("#benchmark-button");
	
	benchmarkButtonElement.addEventListener("click", () => applet.runBenchmark());
	
	
	
	$("#debug-buttons").remove();
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const blackPointInputElement = $("#black-point-input");
	
	const whitePointInputElement = $("#white-point-input");
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio(true);
	});
	
	blackPointInputElement.addEventListener("input", () =>
	{
		applet.blackPoint = parseFloat(blackPointInputElement.value || 1);
	});
	
	whitePointInputElement.addEventListener("input", () =>
	{
		applet.whitePoint = parseFloat(whitePointInputElement.value || 1);
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
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
}