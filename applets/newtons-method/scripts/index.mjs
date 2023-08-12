import { NewtonsMethod } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const rootSetterElement = $("#root-setter");
	
	const rootAInputElement = $("#root-a-input");
	const rootBInputElement = $("#root-b-input");
	
	const colorSetterElement = $("#color-setter");
	
	const applet = new NewtonsMethod($("#output-canvas"), rootSetterElement, rootAInputElement, rootBInputElement, colorSetterElement);
	
	
	
	const resolutionInputElement = $("#resolution-input");
	
	applet.setInputCaps([resolutionInputElement], [2000]);
	
	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);
		
		applet.changeAspectRatio(true);
	});
	
	
	
	const addRootButtonElement = $("#add-root-button");
	
	addRootButtonElement.addEventListener("click", () => applet.addRoot());
	
	
	
	const removeRootButtonElement = $("#remove-root-button");
	
	removeRootButtonElement.addEventListener("click", () => applet.removeRoot());
	
	
	
	const spreadRootsButtonElement = $("#spread-roots-button");
	
	spreadRootsButtonElement.addEventListener("click", () => applet.spreadRoots(false, false));
	
	
	
	const randomizeRootsButtonElement = $("#randomize-roots-button");
	
	randomizeRootsButtonElement.addEventListener("click", () => applet.spreadRoots(false, true));
	
	
	
	const downloadButtonElement = $("#download-button");
	
	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("newtons-method.png");
	});
	
	
	
	
	
	function setRoot()
	{
		const x = parseFloat(rootAInputElement.value || 0);
		const y = parseFloat(rootBInputElement.value || 0);
		
		applet.setRoot(x, y);
	}
	
	rootAInputElement.addEventListener("input", setRoot);
	rootBInputElement.addEventListener("input", setRoot);
	
	
	
	const rootColorInputElement = $("#root-color-input");
	
	rootColorInputElement.addEventListener("input", () =>
	{
		const hex = rootColorInputElement.value;
		
		applet.setColor(hex);
	});
	
	
	
	showPage();
}