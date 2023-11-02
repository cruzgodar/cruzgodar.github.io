import { ThurstonGeometry } from "./class.mjs";
import { E3Rooms, E3Spheres } from "./geometries/e3.mjs";
import { getH3SpheresData } from "./geometries/h3.mjs";
import { getS3HopfFibrationData, getS3RoomsData, getS3SpheresData } from "./geometries/s3.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $ } from "/scripts/src/main.mjs";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const scenes =
	{
		"e3-rooms": E3Rooms,
		"e3-spheres": E3Spheres,
		"s3-rooms": getS3RoomsData,
		"s3-spheres": getS3SpheresData,
		"s3-hopf-fibration": getS3HopfFibrationData,
		"h3-spheres": getH3SpheresData
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	function run()
	{
		if (sceneSelectorDropdownElement.value !== "none")
		{
			const GeometryDataClass = scenes[sceneSelectorDropdownElement.value];
			console.log(GeometryDataClass);
			applet.run(new GeometryDataClass());
		}
	}



	const resolutionInputElement = $("#resolution-input");

	const fovSlider = $("#fov-slider");
	const fovSliderValue = $("#fov-slider-value");
	fovSliderValue.textContent = 1;

	applet.setInputCaps([resolutionInputElement], [1000]);



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



	sceneSelectorDropdownElement.addEventListener("input", run);

	run();



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-thurston-geometry.png");
	});

	

	showPage();
}