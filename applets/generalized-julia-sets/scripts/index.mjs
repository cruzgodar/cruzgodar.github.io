import { showPage } from "/scripts/src/load-page.mjs"
import { GeneralizedJuliaSet } from "./class.mjs";

export function load()
{
	const switchJuliaModeButtonElement = $("#switch-julia-mode-button");
	
	switchJuliaModeButtonElement.style.opacity = 1;
	
	const applet = new GeneralizedJuliaSet($("#output-canvas"), "cadd(cpow(z, 2.0), c)", switchJuliaModeButtonElement);
	
	applet.loadPromise.then(() => run());
	
	
	
	function run()
	{
		const generatingCode = codeInputElement.value || "cadd(cpow(z, 2.0), c)";
		
		const resolution = parseInt(resolutionInputElement.value || 500);
		const exposure = parseFloat(exposureInputElement.value || 1);
		const numIterations = parseInt(numIterationsInputElement.value || 200);
		
		applet.run(generatingCode, resolution, exposure, numIterations);
	}
	
	
	
	const codeInputElement = $("#code-textarea");
	
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
	
	const exampleSelectorDropdownElement = $("#example-selector-dropdown");
	
	exampleSelectorDropdownElement.addEventListener("input", () =>
	{
		if (exampleSelectorDropdownElement.value === "none")
		{
			return;
		}
		
		codeInputElement.value = examples[exampleSelectorDropdownElement.value];
		
		run();
	});
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const exposureInputElement = $("#exposure-input");
	
	const numIterationsInputElement = $("#num-iterations-input");
	
	applet.setInputCaps([resolutionInputElement, numIterationsInputElement], [2000, 500]);
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio(true);
	});
	
	exposureInputElement.addEventListener("input", () =>
	{
		applet.exposure = parseFloat(exposureInputElement.value || 1);
	});
	
	numIterationsInputElement.addEventListener("input", () =>
	{
		applet.numIterations = parseInt(numIterationsInputElement.value || 200);
	});
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	
	switchJuliaModeButtonElement.addEventListener("click", () => applet.switchJuliaMode());
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-generalized-julia-set.png");
	});
	
	
	
	showPage();
}