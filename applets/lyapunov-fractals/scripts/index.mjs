import { LyapunovFractal } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new LyapunovFractal($("#output-canvas"));
	
	
	
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
	
	showPage();



	function run()
	{
		const generatingString = (generatingStringInputElement.value || "AB").toUpperCase();
		
		applet.run(generatingString);
	}
}