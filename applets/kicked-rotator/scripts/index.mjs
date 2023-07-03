import { KickedRotator } from "./class.mjs";

export function load()
{
	const applet = new KickedRotator($("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const K = parseFloat(kInputElement.value || .75);
		const orbitSeparation = parseInt(orbitSeparationInputElement.value || 0);
		
		applet.run(resolution, K, orbitSeparation);
	}



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	const kInputElement = $("#k-input");
	
	const orbitSeparationInputElement = $("#orbit-separation-input");
	
	applet.listenToInputElements([resolutionInputElement, kInputElement, orbitSeparationInputElement], run);
	
	applet.setInputCaps([resolutionInputElement, kInputElement], [1000, 2]);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-kicked-rotator.png");
	});
	
	
	
	Page.show();
}