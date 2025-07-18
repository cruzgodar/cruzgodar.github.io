import { SortingAlgorithms } from "./class.js";
import { Button, DownloadButton } from "/scripts/components/buttons.js";
import { Checkbox } from "/scripts/components/checkboxes.js";
import { Dropdown } from "/scripts/components/dropdowns.js";
import { TextBox } from "/scripts/components/textBoxes.js";
import { $, $$ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";

export default function()
{
	const numReadsElement = $("#num-reads");
	const numWritesElement = $("#num-writes");

	const applet = new SortingAlgorithms({
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
		applet,
		filename: () => "a-sorting-algorithm.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 500,
		maxValue: 4000,
		onEnter: run
	});

	const arraySizeInput = new TextBox({
		element: $("#array-size-input"),
		name: "Array Size",
		value: 512,
		minValue: 16,
		maxValue: 2048,
		onEnter: run
	});

	const playSoundCheckbox = new Checkbox({
		element: $("#play-sound-checkbox"),
		name: "Play sound",
		checked: true,
		onInput: onCheckboxInput
	});

	const algorithmsDropdown = new Dropdown({
		element: $("#algorithms-dropdown"),
		name: "Algorithms",
		options: {
			bubble: "Bubble Sort",
			insertion: "Insertion Sort",
			selection: "Selection Sort",
			heap: "Heapsort",
			merge: "Merge Sort",
			quick: "Quicksort",
			shell: "Shellsort",
			cycle: "Cycle Sort",
			msdRadix: "MSD Radix Sort",
			lsdRadix: "LSD Radix Sort",
			gravity: "Gravity Sort",
		},
		onInput: onDropdownInput
	});

	function run()
	{
		applet.run({
			resolution: resolutionInput.value * siteSettings.resolutionMultiplier,
			algorithm: algorithmsDropdown.value || "bubble",
			dataLength: arraySizeInput.value,
			doPlaySound: playSoundCheckbox.checked
		});
	}

	function onDropdownInput()
	{
		for (const element of $$(".info-text"))
		{
			element.style.display = "none";
		}

		const value = algorithmsDropdown.value || "bubble";

		const element = $(`#${value}-info`);

		element.style.display = "block";
	}

	function onCheckboxInput()
	{
		applet.setDoPlaySound(playSoundCheckbox.checked);
	}
}