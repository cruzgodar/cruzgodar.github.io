import { KickedRotator } from "./class.mjs";
import { Applet } from "/scripts/src/applets.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new KickedRotator({ canvas: $("#output-canvas") });



	const generateButtonElement = $("#generate-button");

	generateButtonElement.addEventListener("click", run);



	const resolutionInputElement = $("#resolution-input");

	const kInputElement = $("#k-input");

	const orbitSeparationInputElement = $("#orbit-separation-input");

	Applet.listenToInputElements(
		[resolutionInputElement, kInputElement, orbitSeparationInputElement],
		run
	);

	applet.setInputCaps([resolutionInputElement, kInputElement], [1000, 2]);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-kicked-rotator.png");
	});



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