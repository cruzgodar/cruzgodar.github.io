import { DoublePendulumFractal } from "./class.js";
import { DownloadButton, GenerateButton, ToggleButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const applet = new DoublePendulumFractal({
		canvas: $("#output-canvas"),
		pendulumCanvas: $("#pendulum-canvas")
	});

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new ToggleButton({
		element: $("#switch-pendulum-canvas-button"),
		name0: "Pick Pendulum",
		name1: "Return to Fractal",
		persistState: false,
		onClick0: () => applet.drawingFractal = false,
		onClick1: () =>
		{
			applet.drawingFractal = true;
			applet.hidePendulumCanvas(); // :(
		}
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "the-double-pendulum-fractal.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onEnter: run,
	});

	const centerUnstableEquilibriumCheckbox = new Checkbox({
		element: $("#center-unstable-equilibrium-checkbox"),
		name: "Center unstable equilibrium"
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			centerUnstableEquilibrium: centerUnstableEquilibriumCheckbox.checked
		});
	}
}