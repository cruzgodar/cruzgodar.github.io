import { showPage } from "../../../scripts/src/loadPage.js";
import { BarnsleyFern } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const applet = new BarnsleyFern({ canvas: $("#output-canvas") });



	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "the-barnsley-fern.png"
	});



	const numIterationsInputElement = $("#num-iterations-input");

	Applet.listenToInputElements([numIterationsInputElement], run);

	applet.setInputCaps([numIterationsInputElement], [100000]);



	showPage();



	function run()
	{
		const numIterations = 1000 * parseInt(numIterationsInputElement.value || 10000);

		applet.run({ numIterations });
	}
}