import { showPage } from "../../../scripts/src/loadPage.js";
import { NewtonsMethod } from "./class.js";
import { Button, DownloadButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

export function load()
{
	const rootSetterElement = $("#root-setter");

	const rootAInputElement = $("#root-a-input");
	const rootBInputElement = $("#root-b-input");

	const colorSetterElement = $("#color-setter");

	const applet = new NewtonsMethod({
		canvas: $("#output-canvas"),
		rootSetterElement,
		rootAInputElement,
		rootBInputElement,
		colorSetterElement
	});

	new Button({
		element: $("#add-root-button"),
		name: "Add Root",
		onClick: () => applet.addRoot()
	});

	new Button({
		element: $("#remove-root-button"),
		name: "Remove Root",
		onClick: () => applet.removeRoot()
	});

	new Button({
		element: $("#spread-roots-button"),
		name: "Spread Roots",
		onClick: () => applet.spreadRoots(false, false)
	});

	new Button({
		element: $("#randomize-roots-button"),
		name: "Randomize Roots",
		onClick: () => applet.spreadRoots(false, true)
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "newtons-method.png"
	});

	

	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);

	resolutionInputElement.addEventListener("input", () =>
	{
		applet.resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeAspectRatio(true);
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