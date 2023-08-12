import { BarnsleyFern } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new BarnsleyFern($("#output-canvas"));
	
	
	
	function run()
	{
		const numIterations = 1000 * parseInt(numIterationsInputElement.value || 10000);
		
		applet.run(numIterations);
	}
	
	
	
	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);
	
	
	
	const numIterationsInputElement = $("#num-iterations-input");
	
	applet.listenToInputElements([numIterationsInputElement], run);
	
	applet.setInputCaps([numIterationsInputElement], [100000]);
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () => applet.wilson.downloadFrame("the-barnsley-fern.png"));
	
	
	
	showPage();
}