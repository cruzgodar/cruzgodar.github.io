import { DominoShuffling } from "./class.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new DominoShuffling({ canvas: $("#output-canvas") });

	const resolutionInputElement = $("#resolution-input");

	const diamondSizeInputElement = $("#diamond-size-input");

	Applet.listenToInputElements([resolutionInputElement, diamondSizeInputElement], run);

	applet.setInputCaps([resolutionInputElement, diamondSizeInputElement], [3000, 200]);



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const useSmoothColorsCheckboxElement = $("#use-smooth-colors-checkbox");
	useSmoothColorsCheckboxElement.checked = true;



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener(
		"click",
		() => applet.wilson.downloadFrame("an-aztec-diamond.png")
	);



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