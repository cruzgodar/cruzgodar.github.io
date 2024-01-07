import { BarnsleyFern } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new BarnsleyFern({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const numIterationsInputElement = $("#num-iterations-input");

	Applet.listenToInputElements([numIterationsInputElement], run);

	applet.setInputCaps([numIterationsInputElement], [100000]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("the-barnsley-fern.png")
	);



	showPage();



	function run()
	{
		const numIterations = 1000 * parseInt(numIterationsInputElement.value || 10000);

		applet.run({ numIterations });
	}
}