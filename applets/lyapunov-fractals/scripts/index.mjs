import { LyapunovFractal } from "./class.mjs";

export function load()
{
	const applet = new LyapunovFractal($("#output-canvas"));
	
	
	
	function run()
	{
		const generatingString = (generatingStringInputElement.value || "AB").toUpperCase();
		
		applet.run(generatingString);
	}
	
	
	
	const generatingStringInputElement = $("#generating-string-input");
	
	applet.listenToInputElements([generatingStringInputElement], run);
	
	
	
	const generateButtonElement = $("#generate-button");
	
	generateButtonElement.addEventListener("click", run);
	
	
	

	const resolutionInputElement = $("#resolution-input");
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.resolution = resolution;
		
		applet.changeAspectRatio(true);
	});
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-lyapunov-fractal.png");
	});
	
	
	
	run();
	
	Page.show();
}