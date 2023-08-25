import { PlanePartitions } from "./class.mjs";
import { changeOpacity } from "/scripts/src/animation.mjs";
import { equalizeTextButtons } from "/scripts/src/buttons.mjs";
import { equalizeAppletColumns } from "/scripts/src/layout.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $, $$ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new PlanePartitions($("#output-canvas"), $("#numbers-canvas"));

	const categorySelectorDropdownElement = $("#category-selector-dropdown");
	
	const resolutionInputElement = $("#resolution-input");
	
	const showDimersButtonElement = $("#show-dimers-button");
	
	const switchViewButtonElement = $("#switch-view-button");
	
	const maximumSpeedCheckboxElement = $("#maximum-speed-checkbox");
	
	const arrayDataTextareaElement = $("#array-data-textarea");
	
	const addArrayButtonElement = $("#add-array-button");
	
	const editArrayTextareaElement = $("#edit-array-textarea");
		
	const editArrayIndexInputElement = $("#edit-array-index-input");
	
	const editArrayButtonElement = $("#edit-array-button");
	
	const removeArrayIndexInputElement = $("#remove-array-index-input");
	
	const removeArrayButtonElement = $("#remove-array-button");
	
	const algorithmIndexInputElement = $("#algorithm-index-input");
	
	const hillmanGrasslButtonElement = $("#hillman-grassl-button");
	
	const hillmanGrasslInverseButtonElement = $("#hillman-grassl-inverse-button");
	
	const pakButtonElement = $("#pak-button");
	
	const pakInverseButtonElement = $("#pak-inverse-button");
	
	const sulzgruberButtonElement = $("#sulzgruber-button");
	
	const sulzgruberInverseButtonElement = $("#sulzgruber-inverse-button");
	
	const rskButtonElement = $("#rsk-button");
	
	const rskInverseButtonElement = $("#rsk-inverse-button");
	
	const example1ButtonElement = $("#example-1-button");
	
	const example2ButtonElement = $("#example-2-button");
	
	const example3ButtonElement = $("#example-3-button");
	
	const downloadButtonElement = $("#download-button");
	
	applet.setInputCaps([resolutionInputElement], [3000]);


	
	const sectionNames = ["view-controls", "add-array", "edit-array", "remove-array", "algorithms"];
	
	const sectionElements = 
	{
		"view-controls": $$(".view-controls-section"),
		"add-array": $$(".add-array-section"),
		"edit-array": $$(".edit-array-section"),
		"remove-array": $$(".remove-array-section"),
		"algorithms": $$(".algorithms-section"),
		"examples": $$(".examples-section")
	};
	
	const categoryHolderElement = $("#category-holder");
	const canvasLandscapeLeftElement = $("#canvas-landscape-left");
	
	let visibleSection = "view-controls";
	
	sectionNames.forEach(sectionName =>
	{
		if (sectionName !== visibleSection)
		{
			sectionElements[sectionName].forEach(element =>
			{
				element.style.opacity = 0;
			});
		}	
	});
	
	sectionElements[visibleSection].forEach(element => canvasLandscapeLeftElement.appendChild(element));
	
	
	
	equalizeTextButtons();
	setTimeout(equalizeTextButtons, 10);
	
	
	
	categorySelectorDropdownElement.addEventListener("input", async () =>
	{
		await Promise.all(Array.from(sectionElements[visibleSection]).map(element => changeOpacity(element, 0)));
		
		sectionElements[visibleSection].forEach(element => categoryHolderElement.appendChild(element));
		
		sectionElements[visibleSection].forEach(element => element.classList.remove("move-to-left"));
		sectionElements[visibleSection].forEach(element => element.classList.remove("move-to-right"));
		
		visibleSection = categorySelectorDropdownElement.value;
		
		sectionElements[visibleSection].forEach(element => canvasLandscapeLeftElement.appendChild(element));
		
		equalizeTextButtons();
		setTimeout(equalizeTextButtons, 10);

		equalizeAppletColumns();
		setTimeout(equalizeAppletColumns, 10);
		
		if (visibleSection === "edit-array")
		{
			const index = parseInt(editArrayIndexInputElement.value || 0);
		
			if (index < applet.arrays.length && index >= 0)
			{
				editArrayTextareaElement.value = applet.arrayToAscii(applet.arrays[index].numbers);
			}
		}
		
		sectionElements[visibleSection].forEach(element => changeOpacity(element, 1));
	});
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 2000);
		
		applet.renderer.setSize(applet.resolution, applet.resolution, false);
	});



	async function switchDimersButton(dimersShown = applet.dimersShown)
	{
		await changeOpacity(showDimersButtonElement, 0);

		showDimersButtonElement.textContent = dimersShown ? "Show Dimers" : "Hide Dimers";

		await changeOpacity(showDimersButtonElement, 1);
	}

	async function switchViewButton(in2dView = applet.in2dView)
	{
		await changeOpacity(switchViewButtonElement, 0);

		switchViewButtonElement.textContent = in2dView ? "Show 2D View" : "Show Hex View";

		await changeOpacity(switchViewButtonElement, 1);
	}
	
	
	
	showDimersButtonElement.addEventListener("click", () =>
	{
		switchDimersButton();

		if (!applet.dimersShown && applet.in2dView)
		{
			switchViewButton();
		}

		if (applet.dimersShown)
		{
			applet.hideDimers();
		}
		
		else
		{
			applet.showDimers();
		}
	});
	
	
	
	switchViewButtonElement.addEventListener("click", () =>
	{
		switchViewButton();

		if (applet.dimersShown && !applet.in2dView)
		{
			switchDimersButton();
		}
		
		if (applet.in2dView)
		{
			applet.showHexView();
		}
		
		else
		{
			applet.show2dView();
		}
	});
	
	
	
	maximumSpeedCheckboxElement.addEventListener("input", () =>
	{
		applet.animationTime = maximumSpeedCheckboxElement.checked ? 60 : 600;
	});
	
	
	
	addArrayButtonElement.addEventListener("click", () =>
	{
		applet.addNewArray(applet.arrays.length, applet.parseArray(arrayDataTextareaElement.value));
	});
	
	
	
	editArrayIndexInputElement.addEventListener("input", () =>
	{
		const index = parseInt(editArrayIndexInputElement.value || 0);
		
		if (index >= applet.arrays.length || index < 0)
		{
			return;
		}
		
		applet.editArrayTextareaElement.value = applet.arrayToAscii(applet.arrays[index].numbers);
	});
	
	
	
	editArrayButtonElement.addEventListener("click", async () =>
	{
		const index = parseInt(editArrayIndexInputElement.value || 0);
		
		await applet.editArray(index, applet.parseArray(editArrayTextareaElement.value));
		
		editArrayTextareaElement.value = applet.arrayToAscii(applet.arrays[index].numbers);
	});
	
	
	
	removeArrayButtonElement.addEventListener("click", () =>
	{
		applet.removeArray(parseInt(removeArrayIndexInputElement.value));
	});
	
	
	
	hillmanGrasslButtonElement.addEventListener("click", () => applet.runAlgorithm("hillmanGrassl", parseInt(algorithmIndexInputElement.value)));
	
	hillmanGrasslInverseButtonElement.addEventListener("click", () => applet.runAlgorithm("hillmanGrasslInverse", parseInt(algorithmIndexInputElement.value)));
	
	pakButtonElement.addEventListener("click", () => applet.runAlgorithm("pak", parseInt(algorithmIndexInputElement.value)));
	
	pakInverseButtonElement.addEventListener("click", () => applet.runAlgorithm("pakInverse", parseInt(algorithmIndexInputElement.value)));
	
	sulzgruberButtonElement.addEventListener("click", () => applet.runAlgorithm("sulzgruber", parseInt(algorithmIndexInputElement.value)));
	
	sulzgruberInverseButtonElement.addEventListener("click", () => applet.runAlgorithm("sulzgruberInverse", parseInt(algorithmIndexInputElement.value)));
	
	rskButtonElement.addEventListener("click", () => applet.runAlgorithm("rsk", parseInt(algorithmIndexInputElement.value)));
	
	rskInverseButtonElement.addEventListener("click", () => applet.runAlgorithm("rskInverse", parseInt(algorithmIndexInputElement.value)));
	
	example1ButtonElement.addEventListener("click", () => applet.runExample(1));
	
	example2ButtonElement.addEventListener("click", () => applet.runExample(2));
	
	example3ButtonElement.addEventListener("click", () => applet.runExample(3));
	
	downloadButtonElement.addEventListener("click", () => applet.needDownload = true);
	


	const planePartition = applet.generateRandomPlanePartition();
	arrayDataTextareaElement.value = applet.arrayToAscii(planePartition);
	applet.addNewArray(0, planePartition);


	
	showPage();
}