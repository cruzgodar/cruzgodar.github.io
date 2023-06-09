"use strict";

!async function()
{
	await Site.loadApplet("plane-partitions");
	
	const applet = new PlanePartitions(Page.element.querySelector("#output-canvas"), Page.element.querySelector("#numbers-canvas"));
	
	applet.loadPromise.then(async () =>
	{
		const planePartition = applet.generateRandomPlanePartition();
		arrayDataTextareaElement.value = applet.arrayToAscii(planePartition);
		await applet.addNewArray(0, planePartition);
	});
	
	const sectionNames = ["view-controls", "add-array", "edit-array", "remove-array", "algorithms"];
	
	const sectionElements = 
	{
		"view-controls": Page.element.querySelectorAll(".view-controls-section"),
		"add-array": Page.element.querySelectorAll(".add-array-section"),
		"edit-array": Page.element.querySelectorAll(".edit-array-section"),
		"remove-array": Page.element.querySelectorAll(".remove-array-section"),
		"algorithms": Page.element.querySelectorAll(".algorithms-section"),
		"examples": Page.element.querySelectorAll(".examples-section")
	}
	
	const categoryHolderElement = Page.element.querySelector("#category-holder");
	const canvasLandscapeLeftElement = Page.element.querySelector("#canvas-landscape-left");
	
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
	
	
	
	Page.Load.TextButtons.equalize();
	setTimeout(Page.Load.TextButtons.equalize, 10);
	
	
	
	if (Page.Layout.aspectRatio > 1)
	{
		Page.Layout.AppletColumns.equalize();
	}
	
	
	
	const categorySelectorDropdownElement = Page.element.querySelector("#category-selector-dropdown");
	
	const resolutionInputElement = Page.element.querySelector("#resolution-input");
	
	const showDimersButtonElement = Page.element.querySelector("#show-dimers-button");
	
	const switchViewButtonElement = Page.element.querySelector("#switch-view-button");
	
	const maximumSpeedCheckboxElement = Page.element.querySelector("#maximum-speed-checkbox");
	
	const arrayDataTextareaElement = Page.element.querySelector("#array-data-textarea");
	
	const addArrayButtonElement = Page.element.querySelector("#add-array-button");
	
	const editArrayTextareaElement = Page.element.querySelector("#edit-array-textarea");
		
	const editArrayIndexInputElement = Page.element.querySelector("#edit-array-index-input");
	
	const editArrayButtonElement = Page.element.querySelector("#edit-array-button");
	
	const removeArrayIndexInputElement = Page.element.querySelector("#remove-array-index-input");
	
	const removeArrayButtonElement = Page.element.querySelector("#remove-array-button");
	
	const algorithmIndexInputElement = Page.element.querySelector("#algorithm-index-input");
	
	const hillmanGrasslButtonElement = Page.element.querySelector("#hillman-grassl-button");
	
	const hillmanGrasslInverseButtonElement = Page.element.querySelector("#hillman-grassl-inverse-button");
	
	const pakButtonElement = Page.element.querySelector("#pak-button");
	
	const pakInverseButtonElement = Page.element.querySelector("#pak-inverse-button");
	
	const sulzgruberButtonElement = Page.element.querySelector("#sulzgruber-button");
	
	const sulzgruberInverseButtonElement = Page.element.querySelector("#sulzgruber-inverse-button");
	
	const rskButtonElement = Page.element.querySelector("#rsk-button");
	
	const rskInverseButtonElement = Page.element.querySelector("#rsk-inverse-button");
	
	const example1ButtonElement = Page.element.querySelector("#example-1-button");
	
	const example2ButtonElement = Page.element.querySelector("#example-2-button");
	
	const example3ButtonElement = Page.element.querySelector("#example-3-button");
	
	const downloadButtonElement = Page.element.querySelector("#download-button");
	
	
	
	categorySelectorDropdownElement.addEventListener("input", async () =>
	{
		await Promise.all(Array.from(sectionElements[visibleSection]).map(element => Page.Animate.changeOpacity(element, 0, Site.opacityAnimationTime)));
		
		sectionElements[visibleSection].forEach(element => categoryHolderElement.appendChild(element));
		
		sectionElements[visibleSection].forEach(element => element.classList.remove("move-to-left"));
		sectionElements[visibleSection].forEach(element => element.classList.remove("move-to-right"));
		
		visibleSection = categorySelectorDropdownElement.value;
		
		sectionElements[visibleSection].forEach(element => canvasLandscapeLeftElement.appendChild(element));
		
		Page.Load.TextButtons.equalize();
		setTimeout(Page.Load.TextButtons.equalize, 10);
		
		if (Page.Layout.aspectRatio > 1)
		{
			Page.Layout.AppletColumns.equalize();
		}
		
		if (visibleSection === "edit-array")
		{
			let index = parseInt(editArrayIndexInputElement.value || 0);
		
			if (index < applet.arrays.length && index >= 0)
			{
				editArrayTextareaElement.value = applet.arrayToAscii(applet.arrays[index].numbers);
			}
		}
		
		sectionElements[visibleSection].forEach(element => Page.Animate.changeOpacity(element, 1, Site.opacityAnimationTime))
	});
	
	
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 2000);
		
		applet.renderer.setSize(applet.resolution, applet.resolution, false);
	});
	
	
	
	showDimersButtonElement.addEventListener("click", () =>
	{
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
	
	
	
	Page.show();
	}()