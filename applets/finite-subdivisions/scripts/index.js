import { showPage } from "../../../scripts/src/loadPage.js";
import { FiniteSubdivision } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new FiniteSubdivision({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-finite-subdivision.png"
	});

	const numVerticesInput = new TextBox({
		element: $("#num-vertices-input"),
		name: "Vertices",
		value: 6,
		maxValue: 10,
		onEnter: run,
	});

	const numIterationsInput = new TextBox({
		element: $("#num-iterations-input"),
		name: "Iterations",
		value: 5,
		maxValue: 7,
		onEnter: run,
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum Speed"
	});

	showPage();

	function run()
	{
		applet.run({
			numVertices: numVerticesInput.value,
			numIterations: numIterationsInput.value,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}
}