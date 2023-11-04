import { ThurstonGeometry } from "./class.mjs";
import { E3Rooms, E3Spheres, H3Spheres } from "./geometries/e3.mjs";
import { S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.mjs";
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
		"s3-rooms": S3Rooms,
		"s3-spheres": S3Spheres,
		"s3-hopf-fibration": S3HopfFibration,
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	function run()
	{
		if (sceneSelectorDropdownElement.value !== "none")
		{
			const GeometryDataClass = scenes[sceneSelectorDropdownElement.value];
			applet.run(new H3Spheres());
		}
	}



	const resolutionInputElement = $("#resolution-input");

	const fovSlider = $("#fov-slider");
	const fovSliderValue = $("#fov-slider-value");
	fovSliderValue.textContent = 1.15;

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