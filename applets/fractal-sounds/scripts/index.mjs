import { FractalSounds } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new FractalSounds($("#output-canvas"), $("#line-drawer-canvas"));
	
	applet.loadPromise.then(() => run());
	
	
	
	const examples = 
	{
		"mandelbrot": ["cmul(z, z) + c", (x, y, a, b) => [x*x - y*y + a, 2*x*y + b]],
		"sfx": ["cmul(z, dot(z, z)) - cmul(z, c*c)", (x, y, a, b) => [x*x*x + x*y*y - x*a*a + y*b*b, x*x*y - x*b*b + y*y*y - y*a*a]],
		"burning-ship": ["-vec2(z.x * z.x - z.y * z.y, 2.0 * abs(z.x * z.y)) + c", (x, y, a, b) => [-(x*x - y*y) + a, -(2 * Math.abs(x * y)) + b]],
		"feather": ["cdiv(cmul(cmul(z, z), z), ONE + z*z) + c", (x, y, a, b) => [a + (x*x*x*x*x + x*x*x*(1 - 3*y*y) + 3*x*x*y*y*y - 3*x*y*y - y*y*y*y*y) / (x*x*x*x + 2*x*x + y*y*y*y + 1), b + (y*(3*x*x*x*x - x*x*x*y - x*x*(y*y - 3) + 3*x*y*y*y - y*y)) / (x*x*x*x + 2*x*x + y*y*y*y + 1)]],
		"duffing": ["vec2(z.y, -c.y * z.x + c.x * z.y - z.y * z.y * z.y)", (x, y, a, b) => [y, -b*x + a*y - y*y*y]],
		"ikeda": ["vec2(1.0 + c.x * (z.x * cos(.4 - 6.0 / (1.0 + dot(z, z))) - z.y * sin(.4 - 6.0 / (1.0 + dot(z, z)))), c.y * (z.x * sin(.4 - 6.0 / (1.0 + dot(z, z))) + z.y * cos(.4 - 6.0 / (1.0 + dot(z, z)))))", (x, y, a, b) => [1.0 + a * (x * Math.cos(.4 - 6.0 / (1.0 + x*x + y*y)) - y * Math.sin(.4 - 6.0 / (1.0 + x*x + y*y))), b * (x * Math.sin(.4 - 6.0 / (1.0 + x*x + y*y)) + y * Math.cos(.4 - 6.0 / (1.0 + x*x + y*y)))]]
	};
	
	const fractalSelectorDropdownElement = $("#fractal-selector-dropdown");
	
	fractalSelectorDropdownElement.addEventListener("input", run);
	
	

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
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-sound-fractal.png");
	});
	
	
	
	showPage();



	function run()
	{
		const glslCode = examples[fractalSelectorDropdownElement.value][0];
		const jsCode = examples[fractalSelectorDropdownElement.value][1];
		const resolution = parseInt(resolutionInputElement.value || 500);
		const exposure = parseFloat(exposureInputElement.value || 1);
		const numIterations = parseInt(numIterationsInputElement.value || 200);
		
		applet.run(glslCode, jsCode, resolution, exposure, numIterations);
	}
}