import { showPage } from "../../../scripts/src/loadPage.js";
import { DominoShuffling } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

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

	const resolutionInputElement = $("#resolution-input");

	const diamondSizeInputElement = $("#diamond-size-input");

	Applet.listenToInputElements([resolutionInputElement, diamondSizeInputElement], run);

	applet.setInputCaps([resolutionInputElement, diamondSizeInputElement], [3000, 200]);

	const useSmoothColorsCheckboxElement = $("#use-smooth-colors-checkbox");
	useSmoothColorsCheckboxElement.checked = true;



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const diamondSize = parseInt(diamondSizeInputElement.value || 20) + 1;
		const useSmoothColors = useSmoothColorsCheckboxElement.checked;

		applet.run({
			resolution,
			diamondSize,
			useSmoothColors
		});
	}
}