import { ThurstonGeometry } from "./class.mjs";
import { getE3RoomsData, getE3SpheresData } from "./geometries/e3.mjs";
import { getH3SpheresData } from "./geometries/h3.mjs";
import { getS3HopfFibrationData, getS3RoomsData, getS3SpheresData } from "./geometries/s3.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	applet.run(getS3HopfFibrationData());



	const resolutionInputElement = $("#resolution-input");

	const fovSlider = $("#fov-slider");
	const fovSliderValue = $("#fov-slider-value");
	fovSliderValue.textContent = 1;

	applet.setInputCaps([resolutionInputElement], [2000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});

	fovSlider.addEventListener("input", () =>
	{
		//The acual FOV can range from 0.5 to 2.
		const fov = parseInt(fovSlider.value) / 10000 * 1.5 + .5;

		fovSliderValue.textContent = Math.round(fov * 100) / 100;

		applet.fov = fov;
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.fov, fov);
	});



	const scenes =
	{
		"e3-rooms": getE3RoomsData,
		"e3-spheres": getE3SpheresData,
		"s3-rooms": getS3RoomsData,
		"s3-spheres": getS3SpheresData,
		"h3-spheres": getH3SpheresData
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