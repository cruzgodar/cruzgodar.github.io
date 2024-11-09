import { showPage } from "../../../scripts/src/loadPage.js";
import { FiniteSubdivision } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new FiniteSubdivision({ canvas: $("#output-canvas") });

	new Button({
		element: $("#generate-button"),
		name: "Animate",
		onClick: () => applet.animate()
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: "a-finite-subdivision.png"
	});

	const numVerticesInput = new TextBox({
		element: $("#num-vertices-input"),
		name: "Vertices",
		value: 6,
		minValue: 3,
		maxValue: 10,
		onEnter: run,
		onInput: run
	});

	const numIterationsInput = new TextBox({
		element: $("#num-iterations-input"),
		name: "Iterations",
		value: 5,
		minValue: 0,
		maxValue: 8,
		onEnter: run,
		onInput: run
	});

	run();

	showPage();

	function run()
	{
		applet.run({
			numVertices: numVerticesInput.value,
			numIterations: numIterationsInput.value,
		});
	}
}