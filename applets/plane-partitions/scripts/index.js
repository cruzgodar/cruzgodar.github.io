import { showPage } from "../../../scripts/src/loadPage.js";
import { PlanePartitions } from "./class.js";
import { Button, ToggleButton, equalizeTextButtons } from "/scripts/src/buttons.js";
import { Checkbox } from "/scripts/src/checkboxes.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { equalizeAppletColumns } from "/scripts/src/layout.js";
import { $, $$ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";
import { Textarea } from "/scripts/src/textareas.js";

export async function load()
{
	const applet = new PlanePartitions({
		canvas: $("#output-canvas"),
		numbersCanvas: $("#numbers-canvas")
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 2000,
		minValue: 500,
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

	const maximumSpeedCheckbox = new Checkbox({
		element: $("#maximum-speed-checkbox"),
		name: "Maximum speed",
		onInput: toggleMaximumSpeed
	});

	const categoriesDropdown = new Dropdown({
		element: $("#categories-dropdown"),
		name: "Menus",
		options: {
			viewControls: "View Controls",
			addArray: "Add Array",
			editArray: "Edit Array",
			removeArray: "Remove Array",
			algorithms: "Algorithms"
		},
		onInput: onDropdownInput
	});

	const addArrayTextarea = new Textarea({
		element: $("#add-array-textarea"),
		name: "Array",
		allowEnter: true,
		onEnter: addArray
	});

	const editArrayTextarea = new Textarea({
		element: $("#edit-array-textarea"),
		name: "Array",
		allowEnter: true,
		onEnter: editArray
	});



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
		onClick: addArray
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
		viewControls: $$(".view-controls-section"),
		addArray: $$(".add-array-section"),
		editArray: $$(".edit-array-section"),
		removeArray: $$(".remove-array-section"),
		algorithms: $$(".algorithms-section"),
	};

	const categoryHolderElement = $("#category-holder");
	const canvasLandscapeLeftElement = $("#canvas-landscape-left");

	let visibleSection = "viewControls";

	sectionElements[visibleSection]
		.forEach(element => canvasLandscapeLeftElement.appendChild(element));

	const planePartition = PlanePartitions.generateRandomPlanePartition();
	addArrayTextarea.setValue(PlanePartitions.arrayToAscii(planePartition));
	applet.addNewArray(0, planePartition);

	// testABConfigs();

	showPage();

	function changeResolution()
	{
		applet.resolution = resolutionInput.value;

		applet.renderer.setSize(applet.resolution, applet.resolution, false);

		applet.needNewFrame = true;
	}
	
	async function addArray()
	{
		applet.addNewArray(
			applet.arrays.length,
			PlanePartitions.parseArray(addArrayTextarea.value)
		);
	}

	async function editArray()
	{
		await applet.editArray(
			editArrayIndexInput.value,
			PlanePartitions.parseArray(editArrayTextarea.value)
		);

		editArrayTextarea.value = PlanePartitions.arrayToAscii(
			applet.arrays[editArrayIndexInput.value].numbers
		);
	}

	function updateEditArrayTextarea()
	{
		const index = editArrayIndexInput.value;

		if (index >= applet.arrays.length || index < 0)
		{
			return;
		}

		editArrayTextarea.setValue(
			PlanePartitions.arrayToAscii(applet.arrays[index].numbers)
		);
	}

	function removeArray()
	{
		applet.removeArray(removeArrayIndexInput.value);
	}

	function toggleMaximumSpeed()
	{
		applet.animationTime = maximumSpeedCheckbox.checked ? 60 : 600;
	}

	function onDropdownInput()
	{
		sectionElements[visibleSection]
			.forEach(element => categoryHolderElement.appendChild(element));

		sectionElements[visibleSection]
			.forEach(element => element.classList.remove("moved-to-left"));

		sectionElements[visibleSection]
			.forEach(element => element.classList.remove("moved-to-right"));

		visibleSection = categoriesDropdown.value || "viewControls";

		sectionElements[visibleSection]
			.forEach(element => canvasLandscapeLeftElement.appendChild(element));

		equalizeTextButtons();
		setTimeout(equalizeTextButtons, 10);

		equalizeAppletColumns();
		setTimeout(equalizeAppletColumns, 10);

		if (visibleSection === "editArray")
		{
			updateEditArrayTextarea();
		}
	}

	async function testABConfigs()
	{
		console.clear();

		applet.abConfigMode = true;
		applet.infiniteHeight = 20;
		applet.animationTime = 150;

		// const lambda = [Math.floor(Math.random() * 5) + 3];
		// const mu = [Math.floor(Math.random() * 5) + 3];
		// const nu = [Math.floor(Math.random() * 5) + 3];

		// for (let i = 0; i < 5; i++)
		// {
		// 	lambda.push(Math.max(lambda[i] - Math.floor(Math.random() * 4), 0));
		// 	mu.push(Math.max(mu[i] - Math.floor(Math.random() * 4), 0));
		// 	nu.push(Math.max(nu[i] - Math.floor(Math.random() * 4), 0));
		// }

		const lambda = [2, 2, 1, 1];
		const mu = [2, 2, 0, 0];
		const nu = [3, 3, 0, 0];

		const [A, B] = applet.getMinimalABConfig({
			lambda,
			mu,
			nu,
		});

		console.log(applet.isValidABConfig({ lambda, mu, nu, A, B }));

		applet.printABConfig({ A, B });

		applet.testAllEntriesOfABConfig({ lambda, mu, nu, A, B, onlyUnboundedBelow: true });

		const [bigA, bigB] = applet.getArrayVersionOfABConfig({ lambda, mu, nu, A, B });

		await applet.addNewArray(0, bigA);
		await applet.addNewArray(0, bigB);
		applet.updateCameraHeight();
	}
}