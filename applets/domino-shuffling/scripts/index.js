import { showPage } from "../../../scripts/src/loadPage.js";
import { DominoShuffling } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new DominoShuffling({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-domino-tiling.png"
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

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			diamondSize: diamondSizeInput.value + 1,
			useSmoothColors: useSmoothColorsCheckbox.checked
		});
	}
}