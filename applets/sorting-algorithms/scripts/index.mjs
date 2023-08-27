import { SortingAlgorithm } from "./class.mjs";
import { opacityAnimationTime } from "/scripts/src/animation.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $, $$ } from "/scripts/src/main.mjs";

export function load()
{
	const numReadsElement = $("#num-reads");
	const numWritesElement = $("#num-writes");

	const applet = new SortingAlgorithm($("#output-canvas"), numReadsElement, numWritesElement);



	const algorithmSelectorDropdownElement = $("#algorithm-selector-dropdown");

	algorithmSelectorDropdownElement.addEventListener("input", () =>
	{
		$$(".info-text").forEach(element => element.style.opacity = 0);

		setTimeout(() =>
		{
			$$(".info-text").forEach(element => element.style.display = "none");

			const element = $(`#${algorithmSelectorDropdownElement.value}-info`);

			element.style.display = "block";

			setTimeout(() =>
			{
				element.style.opacity = 1;
			}, 10);
		}, opacityAnimationTime);
	});



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const arraySizeInputElement = $("#array-size-input");

	applet.listenToInputElements([resolutionInputElement, arraySizeInputElement], run);

	applet.setInputCaps([resolutionInputElement, arraySizeInputElement], [4000, 2048]);

	const playSoundCheckboxElement = $("#play-sound-checkbox");

	playSoundCheckboxElement.checked = true;





	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-sorting-algorithm.png");
	});



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 2000);
		const algorithm = algorithmSelectorDropdownElement.value;
		const dataLength = parseInt(arraySizeInputElement.value || 256);
		const doPlaySound = playSoundCheckboxElement.checked;

		applet.run({
			resolution,
			algorithm,
			dataLength,
			doPlaySound
		});
	}
}