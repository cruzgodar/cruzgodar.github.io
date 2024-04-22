import { showPage } from "../../../scripts/src/loadPage.js";
import { KickedRotator } from "./class.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export function load()
{
	const applet = new KickedRotator({ canvas: $("#output-canvas") });

	new GenerateButton({
		element: $("#generate-button"),
		onClick: run
	});

	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-kicked-rotator.png"
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 1000,
		minValue: 100,
		maxValue: 2000,
		onEnter: run
	});

	const kInput = new TextBox({
		element: $("#k-input"),
		name: "K",
		value: 0.75,
		minValue: 0,
		maxValue: 2,
		onEnter: run
	});

	showPage();

	function run()
	{
		applet.run({
			resolution: resolutionInput.value,
			K: kInput.value,
			orbitSeparation: 0
		});
	}
}