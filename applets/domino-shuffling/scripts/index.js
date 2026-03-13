import { DominoShuffling } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $ } from "/scripts/src/main.js";

export default function()
{
	const applet = new DominoShuffling({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		applet,
		filename: () => "a-domino-tiling.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 200,
		maxValue: 3000,
		onEnter: run,
	});

	const diamondSizeInput = new TextBox({
		element: $("#diamond-size-input"),
		name: "Diamond Size",
		value: 20,
		minValue: 2,
		maxValue: 200,
		onEnter: run,
	});

	const useSmoothColorsCheckbox = new Checkbox({
		element: $("#use-smooth-colors-checkbox"),
		name: "Use smooth colors",
		checked: true
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			diamondSize: diamondSizeInput.value + 1,
			useSmoothColors: useSmoothColorsCheckbox.checked,
		});
	}

	applet.run({
		resolution: 2000,
		diamondSize: 21,
		useSmoothColors: useSmoothColorsCheckbox.checked,
		maximumSpeed: true
	});
}