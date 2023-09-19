import { ThurstonGeometry } from "./class.mjs";
import { getE3SpheresData, getS3RoomsData, getS3SpheresData } from "./geometry-data.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	applet.run(getE3SpheresData());



	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [2000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});



	const scenes =
	{
		"e3-spheres": getE3SpheresData,
		"s3-rooms": getS3RoomsData,
		"s3-spheres": getS3SpheresData
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	sceneSelectorDropdownElement.addEventListener("input", () =>
	{
		if (sceneSelectorDropdownElement.value !== "none")
		{
			const getData = scenes[sceneSelectorDropdownElement.value];
			applet.run(getData());
		}
	});



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-thurston-geometry.png");
	});

	

	showPage();
}