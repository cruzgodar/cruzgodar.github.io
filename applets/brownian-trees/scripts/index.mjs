import { BrownianTree } from "./class.mjs";

export function load()
{
	const applet = new BrownianTree($("#output-canvas"));
	
	
	
	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		
		applet.run(resolution);
	}
	
	
	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	applet.listenToInputElements([resolutionInputElement], run);
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => wilson.downloadFrame("a-brownian-tree.png"));
	
	
	
	Page.show();
}