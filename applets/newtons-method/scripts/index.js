import { showPage } from "../../../scripts/src/loadPage.js";
import { NewtonsMethod } from "./class.js";
import { Button, DownloadButton, ToggleButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { siteSettings } from "/scripts/src/settings.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const rootSetterElement = $("#root-setter");

	const colorSetterElement = $("#color-setter");

	const rootAInput = new TextBox({
		element: $("#root-a-input"),
		name: "Root a",
		value: 0,
		onInput: setRoot
	});

	const rootBInput = new TextBox({
		element: $("#root-b-input"),
		name: "Root b",
		value: 0,
		onInput: setRoot
	});

	const applet = new NewtonsMethod({
		canvas: $("#output-canvas"),
		rootSetterElement,
		rootAInput,
		rootBInput,
		colorSetterElement
	});

	new ToggleButton({
		element: $("#switch-method-button"),
		name0: "Switch to Secant Method",
		name1: "Switch to Newton's Method",
		onClick0: (instant) => applet.switchMethod(instant),
		onClick1: (instant) => applet.switchMethod(instant)
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
		applet,
		filename: "newtons-method.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 2000,
		onInput: changeResolution
	});

	const rootColorInputElement = $("#root-color-input");

	rootColorInputElement.addEventListener("input", () =>
	{
		const hex = rootColorInputElement.value;

		applet.setColor(hex);
	});

	showPage();

	function setRoot()
	{
		applet.setRoot(rootAInput.value, rootBInput.value);
	}

	function changeResolution()
	{
		applet.resolution = resolutionInput.value * siteSettings.resolutionMultiplier;

		applet.changeAspectRatio(true);
	}
}