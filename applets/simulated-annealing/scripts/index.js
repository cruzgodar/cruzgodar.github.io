import { SimulatedAnnealing } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new SimulatedAnnealing({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "simulated-annealing.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 500,
		maxValue: 3000,
		onEnter: run
	});

	const numNodesInput = new TextBox({
		element: $("#num-nodes-input"),
		name: "Nodes",
		value: 20,
		minValue: 4,
		maxValue: 100,
		onEnter: run
	});

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed"
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			numNodes: numNodesInput.value,
			maximumSpeed: maximumSpeedCheckbox.checked
		});
	}
}