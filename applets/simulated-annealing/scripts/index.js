import { showPage } from "../../../scripts/src/loadPage.js";
import { SimulatedAnnealing } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new SimulatedAnnealing({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "simulated-annealing.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 3000,
		onEnter: run
	});

	const numNodesInput = new TextBox({
		element: $("#num-nodes-input"),
		name: "Nodes",
		value: 20,
		maxValue: 100,
		onEnter: run
	});

	const maximumSpeedCheckboxElement = $("#toggle-maximum-speed-checkbox");

	showPage();

	function run()
	{
		const maximumSpeed = maximumSpeedCheckboxElement.checked;

		applet.run({
			resolution: resolutionInput.value,
			numNodes: numNodesInput.value,
			maximumSpeed
		});
	}
}