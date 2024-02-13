import { showPage } from "../../../scripts/src/loadPage.js";
import { PlanePartitions } from "./class.js";
import { Button, ToggleButton, equalizeTextButtons } from "/scripts/src/buttons.js";
import { equalizeAppletColumns } from "/scripts/src/layout.js";
import { $, $$ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new PlanePartitions({
		canvas: $("#output-canvas"),
		numbersCanvas: $("#numbers-canvas")
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		maxValue: 4000,
		onInput: changeResolution
	});

	const editArrayIndexInput = new TextBox({
		element: $("#edit-array-index-input"),
		name: "Index to Edit",
		value: 0,
		onEnter: editArray,
		onInput: updateEditArrayTextarea
	});

	const removeArrayIndexInput = new TextBox({
		element: $("#remove-array-index-input"),
		name: "Index to Remove",
		value: 0,
		onEnter: removeArray
	});

	const algorithmIndexInput = new TextBox({
		element: $("#algorithm-index-input"),
		name: "Index to Use",
		value: 0
	});

	const categorySelectorDropdownElement = $("#category-selector-dropdown");



	const arrayDataTextareaElement = $("#array-data-textarea");

	const editArrayTextareaElement = $("#edit-array-textarea");

	const maximumSpeedCheckboxElement = $("#maximum-speed-checkbox");



	// eslint-disable-next-line prefer-const
	let switchDimersButton;

	const switchViewButton = new ToggleButton({
		element: $("#switch-view-button"),
		name0: "Show 2D View",
		name1: "Show Hex View",
		onClick0: () =>
		{
			if (applet.dimersShown)
			{
				switchDimersButton.setState(0);
			}

			applet.show2dView();
		},
		onClick1: () =>
		{
			applet.showHexView();
		}
	});

	switchDimersButton = new ToggleButton({
		element: $("#show-dimers-button"),
		name0: "Show Dimers",
		name1: "Hide Dimers",
		onClick0: () =>
		{
			if (applet.in2dView)
			{
				switchViewButton.setState(0);
			}

			applet.showDimers();
		},
		onClick1: () =>
		{
			applet.hideDimers();
		}
	});

	new Button({
		element: $("#add-array-button"),
		name: "Add",
		onClick: () =>
		{
			applet.addNewArray(
				applet.arrays.length,
				PlanePartitions.parseArray(arrayDataTextareaElement.value)
			);
		}
	});

	new Button({
		element: $("#edit-array-button"),
		name: "Edit",
		onClick: editArray
	});

	new Button({
		element: $("#remove-array-button"),
		name: "Remove",
		onClick: removeArray
	});

	new Button({
		element: $("#hillman-grassl-button"),
		name: "Hillman-Grassl",
		onClick: () => applet.runAlgorithm(
			"hillmanGrassl",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#hillman-grassl-inverse-button"),
		name: "Hillman-Grassl Inverse",
		onClick: () => applet.runAlgorithm(
			"hillmanGrasslInverse",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#pak-button"),
		name: "Pak",
		onClick: () => applet.runAlgorithm(
			"pak",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#pak-inverse-button"),
		name: "Pak Inverse",
		onClick: () => applet.runAlgorithm(
			"pakInverse",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#sulzgruber-button"),
		name: "Sulzgruber",
		onClick: () => applet.runAlgorithm(
			"sulzgruber",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#sulzgruber-inverse-button"),
		name: "Sulzgruber Inverse",
		onClick: () => applet.runAlgorithm(
			"sulzgruberInverse",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#rsk-button"),
		name: "RSK",
		onClick: () => applet.runAlgorithm(
			"rsk",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#rsk-inverse-button"),
		name: "RSK Inverse",
		onClick: () => applet.runAlgorithm(
			"rskInverse",
			algorithmIndexInput.value
		)
	});

	new Button({
		element: $("#download-button"),
		name: "Download",
		onClick: () => applet.needDownload = true
	});

	const sectionElements =
	{
		"view-controls": $$(".view-controls-section"),
		"add-array": $$(".add-array-section"),
		"edit-array": $$(".edit-array-section"),
		"remove-array": $$(".remove-array-section"),
		"algorithms": $$(".algorithms-section"),
	};

	const categoryHolderElement = $("#category-holder");
	const canvasLandscapeLeftElement = $("#canvas-landscape-left");

	let visibleSection = "view-controls";

	sectionElements[visibleSection]
		.forEach(element => canvasLandscapeLeftElement.appendChild(element));



	categorySelectorDropdownElement.addEventListener("input", () =>
	{
		sectionElements[visibleSection]
			.forEach(element => categoryHolderElement.appendChild(element));

		sectionElements[visibleSection]
			.forEach(element => element.classList.remove("moved-to-left"));

		sectionElements[visibleSection]
			.forEach(element => element.classList.remove("moved-to-right"));

		visibleSection = categorySelectorDropdownElement.value === "none"
			? "view-controls"
			: categorySelectorDropdownElement.value;

		sectionElements[visibleSection]
			.forEach(element => canvasLandscapeLeftElement.appendChild(element));

		equalizeTextButtons();
		setTimeout(equalizeTextButtons, 10);

		equalizeAppletColumns();
		setTimeout(equalizeAppletColumns, 10);

		if (visibleSection === "edit-array")
		{
			updateEditArrayTextarea();
		}
	});



	maximumSpeedCheckboxElement.addEventListener("input", () =>
	{
		applet.animationTime = maximumSpeedCheckboxElement.checked ? 60 : 600;
	});



	const planePartition = PlanePartitions.generateRandomPlanePartition();
	arrayDataTextareaElement.value = PlanePartitions.arrayToAscii(planePartition);
	applet.addNewArray(0, planePartition);



	showPage();



	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.renderer.setSize(applet.resolution, applet.resolution, false);
	}

	async function editArray()
	{
		await applet.editArray(
			editArrayIndexInput.value,
			PlanePartitions.parseArray(editArrayTextareaElement.value)
		);

		editArrayTextareaElement.value = PlanePartitions.arrayToAscii(
			applet.arrays[editArrayIndexInput.value].numbers
		);
	}

	function updateEditArrayTextarea()
	{
		const index = editArrayIndexInput.value;

		console.log(index);

		if (index >= applet.arrays.length || index < 0)
		{
			return;
		}

		editArrayTextareaElement.value = PlanePartitions.arrayToAscii(
			applet.arrays[index].numbers
		);
	}

	function removeArray()
	{
		applet.removeArray(removeArrayIndexInput.value);
	}
}