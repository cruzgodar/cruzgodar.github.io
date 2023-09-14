import { ThurstonGeometry } from "./class.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});



	const resolutionInputElement = $("#resolution-input");

	const viewDistanceInputElement = $("#view-distance-input");

	applet.setInputCaps([resolutionInputElement, viewDistanceInputElement], [2000, 200]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});



	const iterationsInputElement = $("#iterations-input");

	iterationsInputElement.addEventListener("input", () =>
	{
		applet.maxIterations = parseInt(iterationsInputElement.value || 16);

		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxIterations"], applet.maxIterations);
	});



	viewDistanceInputElement.addEventListener("input", () =>
	{
		applet.maxMarches = Math.max(parseInt(viewDistanceInputElement.value || 100), 32);

		applet.wilson.gl.uniform1i(applet.wilson.uniforms["maxMarches"], applet.maxMarches);
	});

	

	showPage();
}