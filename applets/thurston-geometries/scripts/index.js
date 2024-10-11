import { showPage } from "../../../scripts/src/loadPage.js";
import { ThurstonGeometry, makeAnimation } from "./class.js";
import { E3Rooms } from "./geometries/e3.js";
import { H2xERooms } from "./geometries/h2xe.js";
import { H3Rooms } from "./geometries/h3.js";
import { NilRooms } from "./geometries/nil.js";
import { E3S2Demo, S2xES2Demo } from "./geometries/s2.js";
import { S2xERooms } from "./geometries/s2xe.js";
import { S3Rooms } from "./geometries/s3.js";
import { SL2RRooms } from "./geometries/sl2r.js";
import { SolRooms } from "./geometries/sol.js";
import { DownloadButton, ToggleButton } from "/scripts/src/buttons.js";
import { Dropdown } from "/scripts/src/dropdowns.js";
import { currentlyTouchDevice } from "/scripts/src/interaction.js";
import { equalizeAppletColumns } from "/scripts/src/layout.js";
import { $, $$ } from "/scripts/src/main.js";
import { typesetMath } from "/scripts/src/math.js";
import { siteSettings } from "/scripts/src/settings.js";
import { Slider } from "/scripts/src/sliders.js";
import { TextBox } from "/scripts/src/textBoxes.js";

export default function()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const resolutionInput = new TextBox({
		element: $("#resolution-input"),
		name: "Resolution",
		value: 500,
		minValue: 100,
		maxValue: 1000,
		onInput: changeResolution
	});

	const wallThicknessSlider = new Slider({
		element: $("#wall-thickness-slider"),
		name: "Wall Thickness",
		value: 0,
		min: 0,
		max: 1,
		onInput: onSliderInput
	});

	const clipDistanceSlider = new Slider({
		element: $("#clip-distance-slider"),
		name: "Clip Distance",
		value: 0,
		min: 0,
		max: 10,
		onInput: onSliderInput
	});

	const fovSlider = new Slider({
		element: $("#fov-slider"),
		name: "FOV",
		value: 100,
		min: 80,
		max: 120,
		snapPoints: [100],
		onInput: onSliderInput
	});

	const switchSceneButton = new ToggleButton({
		element: $("#switch-scene-button"),
		name0: "Switch to Spheres",
		name1: "Switch to Rooms",
		onClick0: () => applet.switchScene(),
		onClick1: () => applet.switchScene()
	});

	const demoCanvas = $("#demo-canvas");
	const demoCanvasContainer = $("#demo-canvas-container");

	let demoApplet;

	const scenes =
	{
		s2: E3S2Demo,
		e3: E3Rooms,
		s3: S3Rooms,
		h3: H3Rooms,
		s2xe: S2xERooms,
		h2xe: H2xERooms,
		nil: NilRooms,
		sl2r: SL2RRooms,
		sol: SolRooms,
	};

	const geometriesDropdown = new Dropdown({
		element: $("#geometries-dropdown"),
		name: "Geometries",
		options: {
			s2: "$S^2$",
			e3: "$\\mathbb{E}^3$",
			s3: "$S^3$",
			h3: "$\\mathbb{H}^3$",
			s2xe: "$S^2 \\times \\mathbb{E}$",
			h2xe: "$\\mathbb{H}^2 \\times \\mathbb{E}$",
			nil: "Nil",
			sl2r: "$\\widetilde{\\operatorname{SL}}(2, \\mathbb{R})$",
			sol: "Sol",
		},
		onInput: onDropdownInput
	});

	typesetMath();

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
		const geometry = geometriesDropdown.value || "s2";
		
		const alwaysShown = "#fov-slider, #download-button";

		$$(`.info-text:not(#${geometry}-text)`)
			.forEach(element => element.style.display = "none");
		$$(`#${geometry}-text`)
			.forEach(element => element.style.display = "block");

		const GeometryDataClass = scenes[geometry];

		if (GeometryDataClass === E3S2Demo)
		{
			initS2Demo(applet);
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
				? $$(`
					.slider-container > input:not(${alwaysShown}, ${geometryData.uiElementsUsed}),
					.text-button:not(.dropdown, ${alwaysShown}, ${geometryData.uiElementsUsed})
				`)
				: $$(`
					.slider-container > input:not(${alwaysShown}),
					.text-button:not(.dropdown, ${alwaysShown})
				`)
		).map(element => element.parentNode);

		elementsToShow.forEach(element => element.style.display = "");
		$(".sliders").style.display = "";

		if (geometry === "sl2r")
		{
			$$(".text-buttons")[1].style.display = "none";
		}

		else
		{
			$$(".text-buttons")[1].style.display = "";
		}

		elementsToHide.forEach(element => element.style.display = "none");

		setTimeout(() => equalizeAppletColumns(), 0);

		demoCanvasContainer.style.display = "none";

		if (demoApplet)
		{
			demoApplet.animationPaused = true;
		}

		if (geometryData.wallThicknessData)
		{
			wallThicknessSlider.setBounds({
				min: geometryData.wallThicknessData[1],
				max: geometryData.wallThicknessData[2]
			});

			wallThicknessSlider.setValue(geometryData.wallThicknessData[0]);

			geometryData.sliderValues.wallThickness = geometryData.wallThicknessData[0];
		}

		if (geometryData.maxClipDistance)
		{
			console.log(geometryData.maxClipDistance);
			clipDistanceSlider.setBounds({
				min: 0,
				max: geometryData.maxClipDistance
			});

			clipDistanceSlider.setValue(
				Math.min(geometryData.maxClipDistance, clipDistanceSlider.value)
			);

			geometryData.sliderValues.clipDistance = clipDistanceSlider.value;
		}

		applet.run(geometryData);
	}

	$$(".slider-container").forEach(element => element.style.display = "none");



	new DownloadButton({
		element: $("#download-button"),
		wilson: applet.wilson,
		filename: "a-thurston-geometry.png"
	});



	function initS2Demo()
	{
		$(".sliders").style.display = "none";
		$$(".text-buttons")[1].style.display = "none";

		const geometryDataE3 = new E3S2Demo();

		if (demoApplet === undefined)
		{
			demoApplet = new ThurstonGeometry({
				canvas: demoCanvas,
			});

			demoApplet.allowFullscreenWithKeyboard = false;

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

	if (!makeAnimation)
	{
		run();
	}

	showPage();

	function changeResolution()
	{
		applet.needNewFrame = true;
		
		applet.changeResolution(resolutionInput.value * siteSettings.resolutionMultiplier);
	}

	function onSliderInput()
	{
		applet.geometryData.sliderValues.wallThickness = parseFloat(wallThicknessSlider.value);
		applet.geometryData.sliderValues.clipDistance = parseFloat(clipDistanceSlider.value);
		applet.fov = Math.tan(fovSlider.value / 2 * Math.PI / 180);

		applet.needNewFrame = true;
	}

	function onDropdownInput()
	{
		if (switchSceneButton.state)
		{
			switchSceneButton.setState(0);
		}
		
		run();
	}
}

`

			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec4 cameraPos;
			uniform vec4 normalVec;
			uniform vec4 upVec;
			uniform vec4 rightVec;
			uniform vec4 forwardVec;
			
			uniform int resolution;
			
			const float pi = 3.141592653589793;
			const float epsilon = 0.00001;
			const int maxMarches = 200;
			const float maxT = 30.0;
			const float stepFactor = 0.8;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .05;

			uniform float clipDistance;
			uniform float fov;

			
		uniform float cameraFiber;
		uniform float wallThickness;
		uniform vec3 baseColor;
	

			float geometryDot(vec4 v, vec4 w)
			{
				
		return dot(v, w);
	
			}

			vec4 geometryNormalize(vec4 dir)
			{
				
		return normalize(dir);
	
			}

			
		const float piOver2 = 1.5707963267948966;

		const float root2 = 1.4142135623730951;
		const float root2Over2Plus1 = 1.7071067811865475;
		const float root1PlusRoot2 = 1.5537739740300374;

		const vec3 teleportVec1 = vec3(1, 0, 0);
		const vec3 teleportVec2 = vec3(0.7071067811865476, 0.7071067811865476, 0);
		const vec3 teleportVec3 = vec3(0, 1, 0);
		const vec3 teleportVec4 = vec3(-0.7071067811865476, 0.7071067811865476, 0);
		const vec3 teleportVec5 = vec3(0, 0, 1);

		const mat4 teleportMat1Pos = mat4(
			1.7071067811865475, -1.7071067811865475, -1.5537739740300374, 1.5537739740300374,
			1.7071067811865475, 1.7071067811865475, 1.5537739740300374, 1.5537739740300374,
			-1.5537739740300374, 1.5537739740300374, 1.7071067811865475, -1.7071067811865475,
			1.5537739740300374, 1.5537739740300374, 1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat1Neg = mat4(
			1.7071067811865475, -1.7071067811865475, 1.5537739740300374, -1.5537739740300374,
			1.7071067811865475, 1.7071067811865475, -1.5537739740300374, -1.5537739740300374,
			1.5537739740300374, -1.5537739740300374, 1.7071067811865475, -1.7071067811865475,
			-1.5537739740300374, -1.5537739740300374, 1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat2Pos = mat4(
			1.7071067811865475, -1.7071067811865475, -2.19736822693562, 0,
			1.7071067811865475, 1.7071067811865475, 0, 2.19736822693562,
			-2.19736822693562, 0, 1.7071067811865475, -1.7071067811865475,
			0, 2.19736822693562, 1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat2Neg = mat4(
			1.7071067811865475, -1.7071067811865475, 2.19736822693562, 0,
			1.7071067811865475, 1.7071067811865475, 0, -2.19736822693562,
			2.19736822693562, 0, 1.7071067811865475, -1.7071067811865475,
			0, -2.19736822693562, 1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat3Pos = mat4(
			1.7071067811865475, 1.7071067811865475, 1.5537739740300374, -1.5537739740300374,
			-1.7071067811865475, 1.7071067811865475, -1.5537739740300374, -1.5537739740300374,
			1.5537739740300374, -1.5537739740300374, 1.7071067811865475, 1.7071067811865475,
			-1.5537739740300374, -1.5537739740300374, -1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat3Neg = mat4(
			1.7071067811865475, 1.7071067811865475, -1.5537739740300374, 1.5537739740300374,
			-1.7071067811865475, 1.7071067811865475, 1.5537739740300374, 1.5537739740300374,
			-1.5537739740300374, 1.5537739740300374, 1.7071067811865475, 1.7071067811865475,
			1.5537739740300374, 1.5537739740300374, -1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat4Pos = mat4(
			1.7071067811865475, 1.7071067811865475, 2.19736822693562, 0,
			-1.7071067811865475, 1.7071067811865475, 0, -2.19736822693562,
			2.19736822693562, 0, 1.7071067811865475, 1.7071067811865475,
			0, -2.19736822693562, -1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat4Neg = mat4(
			1.7071067811865475, 1.7071067811865475, -2.19736822693562, 0,
			-1.7071067811865475, 1.7071067811865475, 0, 2.19736822693562,
			-2.19736822693562, 0, 1.7071067811865475, 1.7071067811865475,
			0, 2.19736822693562, -1.7071067811865475, 1.7071067811865475
		);
		const mat4 teleportMat5Pos = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
		const mat4 teleportMat5Neg = mat4(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);

		const float fiberAdjust1Pos = float(0);
		const float fiberAdjust1Neg = float(0);
		const float fiberAdjust2Pos = float(0);
		const float fiberAdjust2Neg = float(0);
		const float fiberAdjust3Pos = float(0);
		const float fiberAdjust3Neg = float(0);
		const float fiberAdjust4Pos = float(0);
		const float fiberAdjust4Neg = float(0);
		const float fiberAdjust5Pos = -6.283185307179586;
		const float fiberAdjust5Neg = 6.283185307179586;

		const float dotProductThreshhold1 = 0.9101797211244549;
		const float dotProductThreshhold2 = 0.9101797211244549;
		const float dotProductThreshhold3 = 0.9101797211244549;
		const float dotProductThreshhold4 = 0.9101797211244549;
		const float dotProductThreshhold5 = 3.141592653589793;

		const vec4 teleportElement1Pos = vec4(1.7071067811865475, -1.7071067811865475, -1.5537739740300374, 1.5537739740300374);
		const vec4 teleportElement1Neg = vec4(1.7071067811865475, -1.7071067811865475, 1.5537739740300374, -1.5537739740300374);
		const vec4 teleportElement2Pos = vec4(1.7071067811865475, -1.7071067811865475, -2.19736822693562, 0);
		const vec4 teleportElement2Neg = vec4(1.7071067811865475, -1.7071067811865475, 2.19736822693562, 0);
		const vec4 teleportElement3Pos = vec4(1.7071067811865475, 1.7071067811865475, 1.5537739740300374, -1.5537739740300374);
		const vec4 teleportElement3Neg = vec4(1.7071067811865475, 1.7071067811865475, -1.5537739740300374, 1.5537739740300374);
		const vec4 teleportElement4Pos = vec4(1.7071067811865475, 1.7071067811865475, 2.19736822693562, 0);
		const vec4 teleportElement4Neg = vec4(1.7071067811865475, 1.7071067811865475, -2.19736822693562, 0);
		const vec4 teleportElement5Pos = vec4(1, 0, 0, 0);
		const vec4 teleportElement5Neg = vec4(1, 0, 0, 0);

		const vec3 colorIncrease1Pos = vec3(-1, -1, 0);
		const vec3 colorIncrease1Neg = vec3(-1, 1, 0);
		const vec3 colorIncrease2Pos = vec3(1, 0, 0);
		const vec3 colorIncrease2Neg = vec3(0, 1, 0);
		const vec3 colorIncrease3Pos = vec3(1, 1, 0);
		const vec3 colorIncrease3Neg = vec3(1, -1, 0);
		const vec3 colorIncrease4Pos = vec3(-1, 0, 0);
		const vec3 colorIncrease4Neg = vec3(0, -1, 0);
		const vec3 colorIncrease5Pos = vec3(0, 0, 1);
		const vec3 colorIncrease5Neg = vec3(0, 0, -1);

		const float delta = 0.9101797211244549;

		float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float tanh(float x)
		{
			float expTerm = exp(2.0 * x);

			return (expTerm - 1.0) / (expTerm + 1.0);
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		// Given an element in SL(2, R), returns an isometry sending the origin to that point.
		// For future reference: the inverse to one of these is given by negating y, z, and w.
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				pos.x, pos.y, pos.z, pos.w,
				-pos.y, pos.x, pos.w, -pos.z,
				pos.z, pos.w, pos.x, pos.y,
				pos.w, -pos.z, -pos.y, pos.x
			);
		}

		// Projects a point p in the universal cover, i.e. H^2 x R, down to Q, via the map lambda.
		vec4 projectToQ(vec4 p)
		{
			float denominator = inversesqrt(2.0 * p.z + 2.0);

			vec4 zetaOutput = vec4(
				sqrt((p.z + 1.0) * 0.5),
				0.0,
				p.x * denominator,
				p.y * denominator
			);

			float cosineTerm = cos(p.w * 0.5);
			float sineTerm = sin(p.w * 0.5);

			return mat4(
				cosineTerm, sineTerm, 0.0, 0.0,
				-sineTerm, cosineTerm, 0.0, 0.0,
				0.0, 0.0, cosineTerm, -sineTerm,
				0.0, 0.0, sineTerm, cosineTerm
			) * zetaOutput;
		}

		const mat2 E0 = mat2(1.0, 0.0, 0.0, 1.0);
		const mat2 E1 = mat2(0.0, -1.0, 1.0, 0.0);
		const mat2 E2 = mat2(0.0, 1.0, 1.0, 0.0);
		const mat2 E3 = mat2(1.0, 0.0, 0.0, -1.0);

		void applyH2Isometry(vec4 qElement, inout vec3 h2Element)
		{
			// Yet another thing that should be in the paper but is only knowable
			// by digging around in their code. I'd prefer to use mat4x3 and mat3x4 here,
			// but WebGL doesn't seem to understand.
			h2Element = mat3(
				mat4(
					qElement.x, qElement.y, qElement.z, 0.0,
					-qElement.y, qElement.x, qElement.w, 0.0,
					qElement.z, qElement.w, qElement.x, 0.0,
					//Weird that this one is negative
					-qElement.w, qElement.z, qElement.y, 0.0
				) * mat4(
					qElement.x, qElement.y, qElement.z, qElement.w,
					-qElement.y, qElement.x, qElement.w, -qElement.z,
					qElement.z, qElement.w, qElement.x, qElement.y,
					0.0, 0.0, 0.0, 0.0
				)
			) * h2Element;
		}

		// A special case of the previous function that acts on (0, 0, 1).
		vec3 getH2Element(vec4 qElement)
		{
			return vec3(
				2.0 * qElement.x * qElement.z - 2.0 * qElement.y * qElement.w,
				2.0 * qElement.x * qElement.w + 2.0 * qElement.y * qElement.z,
				qElement.x * qElement.x + qElement.y * qElement.y + qElement.z * qElement.z + qElement.w * qElement.w
			);
		}

		vec3 getKleinElement(vec4 qElement, float fiber)
		{
			vec3 h2Element = getH2Element(qElement);

			return vec3(h2Element.x / h2Element.z, h2Element.y / h2Element.z, fiber);
		}

		// Returns the product element1 * element2 using multiplication in SL(2, R).
		vec4 sl2Product(vec4 element1, vec4 element2)
		{
			return vec4(
				element1.x * element2.x - element1.y * element2.y + element1.z * element2.z + element1.w * element2.w,
				element1.x * element2.y + element1.y * element2.x - element1.z * element2.w + element1.w * element2.z,
				element1.x * element2.z - element1.y * element2.w + element1.z * element2.x + element1.w * element2.y,
				element1.x * element2.w + element1.y * element2.z - element1.z * element2.y + element1.w * element2.x
			);
		}

		const float root2Over2 = 0.70710678;
		
		void getUpdatedPos(
			vec4 startPos,
			float startFiber,
			vec4 rayDirectionVec,
			float t,
			inout vec4 pos,	
			inout float fiber
		) {
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
			float kappa = sqrt(abs(c*c - a*a));

			vec4 eta;

			if (abs(c) == a)
			{
				eta = vec4(1.0, -0.5 * root2Over2 * t, 0.5 * root2Over2 * t, 0.0);

				fiber = 2.0 * c * t + 2.0 * atan(-0.5 * root2Over2 * t);
			}
		
			else if (abs(c) > a)
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sin(trigArg);

				eta = vec4(cos(trigArg), -c / kappa * sineFactor, a / kappa * sineFactor, 0.0);
				
				// Had to go digging in their code for this last term
				// since it's only referred to in the paper as a adjustment by
				// "the correct multiple of 2pi". This belongs in the paper!!
				fiber = 2.0 * c * t + 2.0 * atan(-c / kappa * tan(trigArg))
					- sign(c) * floor(0.5 * kappa * t / 3.14159265 + 0.5) * 6.28318531;
			}

			else
			{
				float trigArg = kappa * t * 0.5;
				float sinhFactor = sinh(trigArg);

				eta = vec4(cosh(trigArg), -c / kappa * sinhFactor, a / kappa * sinhFactor, 0.0);

				fiber = 2.0 * c * t + 2.0 * atan(-c / kappa * tanh(trigArg));
			}

			vec4 ksi = vec4(cos(c * t), sin(c * t), 0.0, 0.0);

			eta = sl2Product(eta, ksi);

			// Finally, apply R_alpha.
			float sinAlpha = sin(alpha);
			float cosAlpha = cos(alpha);

			eta.zw = vec2(cosAlpha * eta.z - sinAlpha * eta.w, sinAlpha * eta.z + cosAlpha * eta.w);

			// What we have at this point is eta in SL(2, R) and fiber, together specifying
			// a point in the universal cover after flowing from the origin for time t. We now
			// need to translate these to startPos and startFiber, respectively.
			pos = getTransformationMatrix(startPos) * eta;

			fiber += startFiber;
		}

		vec4 getUpdatedDirectionVec(
			vec4 startPos,
			vec4 rayDirectionVec,
			float t
		) {
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
			float kappa = sqrt(abs(c*c - a*a));

			// The direction vector in H^2 x E at the origin right before teleporting,
			// derived from the derivative of the geodesic formula.
			vec4 lastDirectionVec;

			if (abs(c) == a)
			{
				return vec4(
					root2 * rayDirectionVec.x + t * rayDirectionVec.y,
					-t * rayDirectionVec.x + root2 * rayDirectionVec.y,
					0.5 * t,
					2.0 * c - 4.0 * root2 / (8.0 + t*t)
				);
			}
		
			if (abs(c) > a)
			{
				float trigArg = kappa * t;
				float sinKappaT = sin(trigArg);
				float cosKappaT = cos(trigArg);
				
				return vec4(
					rayDirectionVec.x * cosKappaT + c * rayDirectionVec.y * sinKappaT / kappa,
					rayDirectionVec.y * cosKappaT - c * rayDirectionVec.x * sinKappaT / kappa,
					a * a * sinKappaT / kappa,
					2.0 * c * (1.0 - (c*c - a*a) / (2.0 * c*c - a*a * (1.0 + cosKappaT)))
				);
			}

			float trigArg = kappa * t;
			float sinhKappaT = sinh(trigArg);
			float coshKappaT = cosh(trigArg);
			float coshKappaHalfT = cosh(0.5 * trigArg);
			float tanhKappaHalfT = tanh(0.5 * trigArg);

			return vec4(
				rayDirectionVec.x * coshKappaT + c * rayDirectionVec.y * sinhKappaT / kappa,
				rayDirectionVec.y * coshKappaT - c * rayDirectionVec.x * sinhKappaT / kappa,
				a * a * sinhKappaT / kappa,
				2.0 * c - c / (coshKappaHalfT * coshKappaHalfT * (1.0 + c * c * tanhKappaHalfT * tanhKappaHalfT / (kappa * kappa)))
			);
		}

		vec3 teleportPos(inout vec4 pos, inout float fiber, inout vec4 startPos, inout float startFiber, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec3 color = vec3(0.0, 0.0, 0.0);

			// First, we need to get the corresponding point in the Klein model of H^2, which is given by the intersection
			// of the line from our point on the hyperboloid to the origin with the plane z = 1.
			vec3 kleinElement = getKleinElement(pos, fiber);

			float dotProduct;

	
		dotProduct = dot(kleinElement, teleportVec1);

		if (dotProduct > (dotProductThreshhold1))
		{
			pos = teleportMat1Pos * pos;
			fiber += fiberAdjust1Pos;

			// lastDirectionVec has a long journey to go on before it gets back to the origin.
			// First, we need to translate it to startPos, which will place it right at the teleportation
			// boundary. Then we'll teleport, and then apply the inverse translation of that position
			// to take it back to the origin. All of these are linear maps, so they commute with differentiation,
			// and so we've saved them until now. That goes for the projection to H^2 too.
			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement1Pos, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease1Pos;
		}

		else if (dotProduct < -(dotProductThreshhold1))
		{
			pos = teleportMat1Neg * pos;
			fiber += fiberAdjust1Neg;

			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement1Neg, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease1Neg;
		}
	

	
		dotProduct = dot(kleinElement, teleportVec2);

		if (dotProduct > (dotProductThreshhold2))
		{
			pos = teleportMat2Pos * pos;
			fiber += fiberAdjust2Pos;

			// lastDirectionVec has a long journey to go on before it gets back to the origin.
			// First, we need to translate it to startPos, which will place it right at the teleportation
			// boundary. Then we'll teleport, and then apply the inverse translation of that position
			// to take it back to the origin. All of these are linear maps, so they commute with differentiation,
			// and so we've saved them until now. That goes for the projection to H^2 too.
			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement2Pos, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease2Pos;
		}

		else if (dotProduct < -(dotProductThreshhold2))
		{
			pos = teleportMat2Neg * pos;
			fiber += fiberAdjust2Neg;

			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement2Neg, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease2Neg;
		}
	

	
		dotProduct = dot(kleinElement, teleportVec3);

		if (dotProduct > (dotProductThreshhold3))
		{
			pos = teleportMat3Pos * pos;
			fiber += fiberAdjust3Pos;

			// lastDirectionVec has a long journey to go on before it gets back to the origin.
			// First, we need to translate it to startPos, which will place it right at the teleportation
			// boundary. Then we'll teleport, and then apply the inverse translation of that position
			// to take it back to the origin. All of these are linear maps, so they commute with differentiation,
			// and so we've saved them until now. That goes for the projection to H^2 too.
			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement3Pos, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease3Pos;
		}

		else if (dotProduct < -(dotProductThreshhold3))
		{
			pos = teleportMat3Neg * pos;
			fiber += fiberAdjust3Neg;

			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement3Neg, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease3Neg;
		}
	

	
		dotProduct = dot(kleinElement, teleportVec4);

		if (dotProduct > (dotProductThreshhold4))
		{
			pos = teleportMat4Pos * pos;
			fiber += fiberAdjust4Pos;

			// lastDirectionVec has a long journey to go on before it gets back to the origin.
			// First, we need to translate it to startPos, which will place it right at the teleportation
			// boundary. Then we'll teleport, and then apply the inverse translation of that position
			// to take it back to the origin. All of these are linear maps, so they commute with differentiation,
			// and so we've saved them until now. That goes for the projection to H^2 too.
			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement4Pos, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease4Pos;
		}

		else if (dotProduct < -(dotProductThreshhold4))
		{
			pos = teleportMat4Neg * pos;
			fiber += fiberAdjust4Neg;

			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement4Neg, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease4Neg;
		}
	

	
		dotProduct = dot(kleinElement, teleportVec5);

		if (dotProduct > (dotProductThreshhold5))
		{
			pos = teleportMat5Pos * pos;
			fiber += fiberAdjust5Pos;

			// lastDirectionVec has a long journey to go on before it gets back to the origin.
			// First, we need to translate it to startPos, which will place it right at the teleportation
			// boundary. Then we'll teleport, and then apply the inverse translation of that position
			// to take it back to the origin. All of these are linear maps, so they commute with differentiation,
			// and so we've saved them until now. That goes for the projection to H^2 too.
			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement5Pos, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease5Pos;
		}

		else if (dotProduct < -(dotProductThreshhold5))
		{
			pos = teleportMat5Neg * pos;
			fiber += fiberAdjust5Neg;

			vec4 totalTranslationElement = sl2Product(
				vec4(pos.x, -pos.yzw),
				sl2Product(teleportElement5Neg, startPos)
			);

			rayDirectionVec = getUpdatedDirectionVec(startPos, rayDirectionVec, t);
			applyH2Isometry(totalTranslationElement, rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);

			color += colorIncrease5Neg;
		}
	

			return color;
		}
	



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(abs(amount) * numBands, 2.0)) * 0.5;
			}

			vec3 hsv2rgb(vec3 c)
			{
				vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
				vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
				return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
			}
			
			
			
			float distanceEstimator(vec4 pos, float fiber, float totalT)
			{
				
		
		vec3 h2Element = getH2Element(pos);

		float distance1 = length(vec2(acosh(h2Element.z), fiber)) - wallThickness;

		// The fundamental domain has height 2pi, so to evenly space three balls,
		// we want the gap between them to be (2pi - 6 * radius) / 3.
		// Solving for the center of the other spheres gives +/- 2pi/3.

		float distance2 = length(vec2(acosh(h2Element.z), fiber - 0.66667 * pi)) - wallThickness;
		float distance3 = length(vec2(acosh(h2Element.z), fiber + 0.66667 * pi)) - wallThickness;

		if (totalT < clipDistance)
		{
			minDistance = maxT * 2.0;
		}

		float minDistance = min(min(distance1, distance2), distance3);
	

		return -minDistance;
	
			}
			
			vec3 getColor(vec4 pos, float fiber, vec3 globalColor, float totalT)
			{
				
		vec3 roomColor = globalColor + baseColor;

		return vec3(
			.35 + .65 * (.5 * (sin((.01 * (pos.x + pos.z) + roomColor.x) * 40.0) + 1.0)),
			.35 + .65 * (.5 * (sin((.01 * (pos.y + pos.w) + roomColor.y) * 57.0) + 1.0)),
			.35 + .65 * (.5 * (sin((.01 * fiber + roomColor.z) * 89.0) + 1.0))
		);
	
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos, float fiber, float totalT)
			{
				float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0), fiber, totalT);
				float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0), fiber, totalT);
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0), fiber, totalT);
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon), fiber, totalT);
				
				float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0), fiber, totalT);
				float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0), fiber, totalT);
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0), fiber, totalT);
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon), fiber, totalT);
				
				return normalize(vec4(
					xStep1 - xStep2,
					yStep1 - yStep2,
					zStep1 - zStep2,
					wStep1 - wStep2
				));
			}
			
			
			
			vec3 computeShading(vec4 pos, float fiber, int iteration, vec3 globalColor, float totalT)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos, fiber, totalT);
				
				
		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.5 * max(dotProduct1, dotProduct2);
	

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos, fiber, globalColor, totalT)
					* lightIntensity
					* max(
						1.0 - float(iteration) / 100.0,
						0.0)
					* (1.0 + clipDistance / 5.0);

				//Apply fog.
				
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.125));
	
			}
			
			
			
			vec3 raymarch(float u, float v)
			{
				vec4 rayDirectionVec = geometryNormalize(
					forwardVec
					+ rightVec * u * aspectRatioX * fov
					+ upVec * v / aspectRatioY * fov
				);

				vec3 finalColor = fogColor;
				
				float t = 0.0;
				float totalT = 0.0;
				
				float lastTIncrease = 0.0;

				vec4 startPos = cameraPos;

				vec3 globalColor = vec3(0.0, 0.0, 0.0);

				
		float startFiber = cameraFiber;
	
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					
		vec4 pos;
		float fiber;

		getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

		vec3 kleinElement = getKleinElement(pos, fiber);
		
		float dotProduct;

	
		dotProduct = dot(kleinElement, teleportVec1);

		if (abs(dotProduct) > delta + .00001)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 10; i++)
			{
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, teleportVec1);

				if (abs(dotProduct) > delta + .00001)
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	

	
		dotProduct = dot(kleinElement, teleportVec2);

		if (abs(dotProduct) > delta + .00001)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 10; i++)
			{
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, teleportVec2);

				if (abs(dotProduct) > delta + .00001)
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	

	
		dotProduct = dot(kleinElement, teleportVec3);

		if (abs(dotProduct) > delta + .00001)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 10; i++)
			{
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, teleportVec3);

				if (abs(dotProduct) > delta + .00001)
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	

	
		dotProduct = dot(kleinElement, teleportVec4);

		if (abs(dotProduct) > delta + .00001)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 10; i++)
			{
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, teleportVec4);

				if (abs(dotProduct) > delta + .00001)
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	

	
		dotProduct = dot(kleinElement, teleportVec5);

		if (abs(dotProduct) > pi + .00001)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 10; i++)
			{
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, teleportVec5);

				if (abs(dotProduct) > pi + .00001)
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	

		globalColor += teleportPos(pos, fiber, startPos, startFiber, rayDirectionVec, t, totalT);
	
					
					float distanceToScene = distanceEstimator(pos, fiber, totalT);
					
					if (distanceToScene < epsilon)
					{
						

						if (totalT == 0.0)
						{
							totalT = t;
						}
						
						return computeShading(pos, fiber, iteration, globalColor, totalT);
					}

					
		lastTIncrease = distanceToScene * stepFactor;
		
		t += lastTIncrease;
	

					if (t > maxT || totalT > maxT)
					{
						return fogColor;
					}
				}
				
				return fogColor;
			}
			
			
			
			void main(void)
			{
				// float stepSize = 0.5 / 4000.0;

				// gl_FragColor = vec4(
				// 	.25 * (
				// 		raymarch(uv.x - stepSize, uv.y - stepSize)
				// 		+ raymarch(uv.x - stepSize, uv.y + stepSize)
				// 		+ raymarch(uv.x + stepSize, uv.y - stepSize)
				// 		+ raymarch(uv.x + stepSize, uv.y + stepSize)
				// 	),
				// 	1.0
				// );

				gl_FragColor = vec4(
					raymarch(uv.x, uv.y),
					1.0
				);
			}
		
`;