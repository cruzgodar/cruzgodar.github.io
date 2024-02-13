import { showPage } from "../../../scripts/src/loadPage.js";
import { SortingAlgorithm } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $, $$ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const numReadsElement = $("#num-reads");
	const numWritesElement = $("#num-writes");

	const applet = new SortingAlgorithm({
		canvas: $("#output-canvas"),
		numReadsElement,
		numWritesElement
	});

	new Button({
		element: $("#generate-button"),
		name: "Sort",
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-sorting-algorithm.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		maxValue: 4000,
		onEnter: run
	});

	const arraySizeInput = new TextBox({
		element: $("#array-size-input"),
		name: "Array Size",
		value: 512,
		maxValue: 2048,
		onEnter: run
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

	const playSoundCheckboxElement = $("#play-sound-checkbox");

	playSoundCheckboxElement.checked = true;

	showPage();

	function run()
	{
		const algorithm = algorithmSelectorDropdownElement.value === "none"
			? "bubble"
			: algorithmSelectorDropdownElement.value;

		const doPlaySound = playSoundCheckboxElement.checked;

		applet.run({
			resolution: resolutionInput.value,
			algorithm,
			dataLength: arraySizeInput.value,
			doPlaySound
		});
	}
}