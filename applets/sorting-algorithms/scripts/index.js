import { SortingAlgorithm } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

export function load()
{
	const numReadsElement = $("#num-reads");
	const numWritesElement = $("#num-writes");

	const applet = new SortingAlgorithm({
		canvas: $("#output-canvas"),
		numReadsElement,
		numWritesElement
	});



	const algorithmSelectorDropdownElement = $("#algorithm-selector-dropdown");

	algorithmSelectorDropdownElement.value = "bubble";

	algorithmSelectorDropdownElement.addEventListener("input", () =>
	{
		$$(".info-text").forEach(element => element.style.display = "none");

		const value = algorithmSelectorDropdownElement.value === "none"
			? "bubble"
			: algorithmSelectorDropdownElement.value;

		const element = $(`#${value}-info`);

		element.style.display = "block";
	});



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const arraySizeInputElement = $("#array-size-input");

	Applet.listenToInputElements([resolutionInputElement, arraySizeInputElement], run);

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
		const algorithm = algorithmSelectorDropdownElement.value === "none"
			? "bubble"
			: algorithmSelectorDropdownElement.value;
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