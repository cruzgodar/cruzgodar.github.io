import { ThurstonGeometry } from "./class.mjs";
import { E3Rooms, E3SeifertWeberSpace, E3Spheres } from "./geometries/e3.mjs";
import { H3Rooms } from "./geometries/h3.mjs";
import { S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.mjs";
import { showPage } from "/scripts/src/load-page.mjs";
import { $, $$ } from "/scripts/src/main.mjs";

export const sliderValues = {
	wallThickness: 0,
	fiberThickness: 0,
	gluingAngle: 0
};

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const scenes =
	{
		"e3-rooms": E3Rooms,
		"e3-spheres": E3Spheres,
		"e3-seifert-weber-space": E3SeifertWeberSpace,
		"s3-rooms": S3Rooms,
		"s3-spheres": S3Spheres,
		"s3-hopf-fibration": S3HopfFibration,
		"h3-rooms": H3Rooms
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	function run()
	{
		const GeometryDataClass = sceneSelectorDropdownElement.value === "none"
			? E3Rooms
			: scenes[sceneSelectorDropdownElement.value];
		
		const geometryData = new GeometryDataClass();

		const elementsToShow = Array.from(
			geometryData.uiElementsUsed
				? $$(geometryData.uiElementsUsed)
				: []
		).map(element => element.parentNode);
		
		const elementsToHide = Array.from(
			geometryData.uiElementsUsed
				? $$(`.slider-container > input:not(#fov-slider, ${geometryData.uiElementsUsed})`)
				: $$(".slider-container > input:not(#fov-slider)")
		).map(element => element.parentNode);

		elementsToShow.forEach(element => element.style.display = "flex");
		elementsToHide.forEach(element => element.style.display = "none");

		applet.run(geometryData);
		geometryData.initUI();
	}



	const sliders = {
		wallThickness: [$("#wall-thickness-slider"), $("#wall-thickness-slider-value")],
		fiberThickness: [$("#fiber-thickness-slider"), $("#fiber-thickness-slider-value")],
		gluingAngle: [$("#gluing-angle-slider"), $("#gluing-angle-slider-value")],
	};

	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [1000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});

	for (const key in sliders)
	{
		sliderValues[key] = parseFloat(sliders[key][1].textContent);

		sliders[key][0].addEventListener("input", () =>
		{
			sliderValues[key] = parseFloat(sliders[key][1].textContent);
		});
	}

	const fovSliderElement = $("#fov-slider");
	const fovSliderValueElement = $("#fov-slider-value");

	fovSliderElement.addEventListener("input", () =>
	{
		applet.fov = parseFloat(fovSliderValueElement.textContent);
		applet.wilson.gl.uniform1f(applet.wilson.uniforms.fov, applet.fov);
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