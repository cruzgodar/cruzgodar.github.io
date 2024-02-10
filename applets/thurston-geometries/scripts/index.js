import { ThurstonGeometry } from "./class.js";
import { E3Axes, E3Rooms } from "./geometries/e3.js";
import { H2xEAxes, H2xERooms } from "./geometries/h2xe.js";
import { H3Axes, H3Rooms, H3Spheres } from "./geometries/h3.js";
import { NilAxes, NilRooms, NilSpheres } from "./geometries/nil.js";
import { E3S2Demo, S2xES2Demo } from "./geometries/s2.js";
import { S2xEAxes, S2xERooms, S2xESpheres } from "./geometries/s2xe.js";
import { S3Axes, S3HopfFibration, S3Rooms } from "./geometries/s3.js";
import { SL2RAxes, SL2RRooms } from "./geometries/sl2r.js";
import { SolAxes, SolRooms, SolSpheres } from "./geometries/sol.js";
import anime from "/scripts/anime.js";
import { currentlyTouchDevice } from "/scripts/src/interaction.js";
import { equalizeAppletColumns } from "/scripts/src/layout.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const demoCanvas = $("#demo-canvas");
	const demoCanvasContainer = $("#demo-canvas-container");

	let demoApplet;

	const scenes =
	{
		"s2-dots": E3S2Demo,

		"e3-axes": E3Axes,
		"e3-rooms": E3Rooms,

		"s3-axes": S3Axes,
		"s3-rooms": S3Rooms,
		"s3-hopf-fibration": S3HopfFibration,

		"h3-axes": H3Axes,
		"h3-rooms": H3Rooms,
		"h3-spheres": H3Spheres,

		"s2xe-axes": S2xEAxes,
		"s2xe-rooms": S2xERooms,
		"s2xe-spheres": S2xESpheres,

		"h2xe-axes": H2xEAxes,
		"h2xe-rooms": H2xERooms,

		"sl2r-axes": SL2RAxes,
		"sl2r-rooms": SL2RRooms,

		"nil-axes": NilAxes,
		"nil-rooms": NilRooms,
		"nil-spheres": NilSpheres,

		"sol-axes": SolAxes,
		"sol-rooms": SolRooms,
		"sol-spheres": SolSpheres
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	if (!window.DEBUG)
	{
		$$("[data-option-name$=axes], [data-option-name=s3-hopf-fibration]")
			.forEach(element => element.style.display = "none");
	}

	if (currentlyTouchDevice)
	{
		$("#controls-text-wasd").remove();
	}

	else
	{
		$("#controls-text-touch").remove();
	}

	function run()
	{
		const value = sceneSelectorDropdownElement.value === "none"
			? "s2-dots"
			: sceneSelectorDropdownElement.value;
		
		const alwaysShown = "#fov-slider, #test-slider";

		$$(`.info-text:not(#${value}-text)`)
			.forEach(element => element.style.display = "none");
		$$(`#${value}-text`)
			.forEach(element => element.style.display = "block");

		const GeometryDataClass = scenes[value];

		if (GeometryDataClass === E3S2Demo)
		{
			setUpS2Demo(applet);
			return;
		}

		applet.restrictCamera = true;
		
		const geometryData = new GeometryDataClass();

		const elementsToShow = Array.from(
			geometryData.uiElementsUsed
				? $$(`${alwaysShown},${geometryData.uiElementsUsed}`)
				: $$(alwaysShown)
		).map(element => element.parentNode);
		
		const elementsToHide = Array.from(
			geometryData.uiElementsUsed
				? $$(`.slider-container > input:not(${alwaysShown}, ${geometryData.uiElementsUsed})`)
				: $$(`.slider-container > input:not(${alwaysShown})`)
		).map(element => element.parentNode);

		elementsToShow.forEach(element => element.style.display = "");
		$(".sliders").style.display = "";

		elementsToHide.forEach(element => element.style.display = "none");

		setTimeout(() => equalizeAppletColumns(), 0);

		demoCanvasContainer.style.display = "none";

		if (demoApplet)
		{
			demoApplet.animationPaused = true;
		}

		applet.run(geometryData);
		geometryData.initUI();
	}



	const sliders = {
		wallThickness: [$("#wall-thickness-slider"), $("#wall-thickness-slider-value")],
		fiberThickness: [$("#fiber-thickness-slider"), $("#fiber-thickness-slider-value")],
	};

	const resolutionInputElement = $("#resolution-input");

	applet.setInputCaps([resolutionInputElement], [1000]);



	resolutionInputElement.addEventListener("input", () =>
	{
		applet.needNewFrame = true;
		const resolution = parseInt(resolutionInputElement.value || 500);

		applet.changeResolution(resolution);
	});

	for (const key in sliders)
	{
		sliders[key][0].addEventListener("input", () =>
		{
			applet.geometryData.sliderValues[key] = parseFloat(sliders[key][1].textContent);
			applet.needNewFrame = true;
		});
	}

	const fovSliderElement = $("#fov-slider");
	const fovSliderValueElement = $("#fov-slider-value");

	fovSliderElement.addEventListener("input", () =>
	{
		applet.fov = Math.tan(parseFloat(fovSliderValueElement.textContent) / 2 * Math.PI / 180);
		applet.needNewFrame = true;
	});

	$$(".slider-container").forEach(element => element.style.display = "none");

	const switchSceneButtonElement = $("#switch-scene-button");

	switchSceneButtonElement.addEventListener("click", () =>
	{
		const isRooms = applet.geometryData.sliderValues.sceneTransition === 0;

		const oldSceneTransition = applet.geometryData.sliderValues.sceneTransition;
		const newSceneTransition = isRooms ? 1 : 0;

		const oldCameraPos = [...applet.geometryData.cameraPos];
		const newCameraPos = applet.geometryData.getRelocatedCameraPos(newSceneTransition);

		const dummy = { t: 0 };

		anime({
			targets: dummy,
			t: 1,
			duration: 500,
			easing: "easeInOutSine",
			update: () =>
			{
				applet.geometryData.cameraPos = applet.geometryData.correctPosition(
					[
						(1 - dummy.t) * oldCameraPos[0] + dummy.t * newCameraPos[0],
						(1 - dummy.t) * oldCameraPos[1] + dummy.t * newCameraPos[1],
						(1 - dummy.t) * oldCameraPos[2] + dummy.t * newCameraPos[2],
						(1 - dummy.t) * oldCameraPos[3] + dummy.t * newCameraPos[3]
					]
				);

				applet.geometryData.normalVec = applet.geometryData.getNormalVec(
					applet.geometryData.cameraPos
				);

				applet.geometryData.correctVectors();

				applet.needNewFrame = true;
			}
		});

		anime({
			targets: dummy,
			t: 1,
			duration: 500,
			easing: "easeInOutQuad",
			update: () =>
			{
				applet.geometryData.sliderValues.sceneTransition =
					(1 - dummy.t) * oldSceneTransition + dummy.t * newSceneTransition;
			}
		});

		

		anime({
			targets: applet.geometryData.cameraPos,

			duration: 500,
			easing: "easeInOutSine",
		});
	});

	const testSliderElement = $("#test-slider");
	const testSliderValueElement = $("#test-slider-value");

	testSliderElement.addEventListener("input", () =>
	{
		applet.geometryData.sliderValues.sceneTransition =
		parseFloat(testSliderValueElement.textContent);
		applet.needNewFrame = true;
	});



	sceneSelectorDropdownElement.addEventListener("input", run);



	const downloadButtonElement = $("#download-button");

	downloadButtonElement.addEventListener("click", () =>
	{
		applet.wilson.downloadFrame("a-thurston-geometry.png");
	});



	function setUpS2Demo()
	{
		$(".sliders").style.display = "none";

		const geometryDataE3 = new E3S2Demo();

		if (demoApplet === undefined)
		{
			demoApplet = new ThurstonGeometry({
				canvas: demoCanvas,
			});

			$$(".wilson-enter-fullscreen-button")[1].remove();
		}

		else
		{
			demoApplet.animationPaused = false;

			demoApplet.drawFrame();
		}



		geometryDataE3.handleMovingCallback = (movingAmount, timeElapsed) =>
		{
			demoApplet.handleMoving(movingAmount, timeElapsed);
			demoApplet.needNewFrame = true;
		};

		applet.run(geometryDataE3);

		applet.restrictCamera = false;
		applet.wilson.worldCenterY = Math.PI / 4.5;
		applet.wilson.worldCenterX = 3 * Math.PI / 4;



		const geometryDataS2xE = new S2xES2Demo();

		geometryDataS2xE.drawFrameCallback = () =>
		{
			applet.geometryData.cameraDotPos = [...demoApplet.geometryData.cameraPos];

			for (let i = 0; i < applet.geometryData.numRays; i++)
			{
				const angle = (i - Math.floor(applet.geometryData.numRays / 2))
					/ applet.geometryData.numRays * 1.87;

				[
					applet.geometryData.rayDirs[i],
					applet.geometryData.testVecs[i]
				] = ThurstonGeometry.rotateVectors(
					demoApplet.geometryData.forwardVec,
					demoApplet.geometryData.rightVec,
					angle
				);

				[
					applet.geometryData.rayLengths,
					applet.geometryData.rayColors
				] = demoApplet.geometryData.getRayData(applet.geometryData.rayDirs);
			}

			applet.needNewFrame = true;
		};

		demoApplet.run(geometryDataS2xE);

		demoApplet.wilson.worldCenterX = Math.PI / 4;

		demoCanvasContainer.style.display = "";
		
		demoCanvasContainer.querySelector(".wilson-applet-canvas-container").style.setProperty(
			"margin-top",
			"4px",
			"important"
		);
	}

	run();

	showPage();
}