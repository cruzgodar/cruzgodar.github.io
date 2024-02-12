import { showPage } from "../../../scripts/src/loadPage.js";
import { KickedRotator } from "./class.js";
import { Applet } from "/scripts/src/applets.js";
import { DownloadButton, GenerateButton } from "/scripts/src/buttons.js";
import { $ } from "/scripts/src/main.js";

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



	const resolutionInputElement = $("#resolution-input");

	const kInputElement = $("#k-input");

	const orbitSeparationInputElement = $("#orbit-separation-input");

	Applet.listenToInputElements(
		[resolutionInputElement, kInputElement, orbitSeparationInputElement],
		run
	);

	applet.setInputCaps([resolutionInputElement, kInputElement], [1000, 2]);



	showPage();



	function run()
	{
		const resolution = parseInt(resolutionInputElement.value || 1000);
		const K = parseFloat(kInputElement.value || .75);
		const orbitSeparation = parseInt(orbitSeparationInputElement.value || 0);

		applet.run({
			resolution,
			K,
			orbitSeparation
		});
	}
}