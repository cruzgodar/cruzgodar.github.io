import { showPage } from "../../../scripts/src/loadPage.js";
import { BarnsleyFern } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
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

	const numIterationsInput = new TextBox({
		element: $("#num-iterations-input"),
		name: "Iterations (x1000)",
		value: 10000,
		minValue: 100,
		maxValue: 100000,
		onEnter: run,
	});

	showPage();

	function run()
	{
		applet.run({ numIterations: 1000 * numIterationsInput.value });
	}
}