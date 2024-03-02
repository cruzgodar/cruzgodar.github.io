import { showPage } from "../../../scripts/src/loadPage.js";
import { DoublePendulumFractal } from "./class.js";
import { DownloadButton, GenerateButton, ToggleButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
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
		onClick0: () => applet.drawingFractal = false,
		onClick1: () =>
		{
			applet.drawingFractal = true;
			applet.hidePendulumDrawerCanvas(); // :(
		}
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "the-double-pendulum-fractal.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		maxValue: 2000,
		onEnter: run,
	});

	const centerUnstableEquilibriumCheckbox = new Checkbox({
		element: $("#center-unstable-equilibrium-checkbox"),
		name: "Center unstable equilibrium"
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			centerUnstableEquilibrium: centerUnstableEquilibriumCheckbox.checked
		});
	}
}