import { ThurstonGeometry } from "./class.js";
import { E3Axes, E3Rooms, E3Spheres } from "./geometries/e3.js";
import { H2xEAxes, H2xERooms } from "./geometries/h2xe.js";
import { H3Axes, H3Rooms } from "./geometries/h3.js";
import { NilAxes, NilRooms, NilSpheres } from "./geometries/nil.js";
import { S2xEAxes, S2xERooms, S2xESpheres } from "./geometries/s2xe.js";
import { S3Axes, S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.js";
import { SL2RAxes, SL2RRooms } from "./geometries/sl2r.js";
import { SolRooms } from "./geometries/sol.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

export function load()
{
	const applet = new ThurstonGeometry({
		canvas: $("#output-canvas"),
	});

	const scenes =
	{
		"e3-axes": E3Axes,
		"e3-rooms": E3Rooms,
		"e3-spheres": E3Spheres,

		"s3-axes": S3Axes,
		"s3-rooms": S3Rooms,
		"s3-spheres": S3Spheres,
		"s3-hopf-fibration": S3HopfFibration,

		"h3-axes": H3Axes,
		"h3-rooms": H3Rooms,

		"s2xe-axes": S2xEAxes,
		"s2xe-rooms": S2xERooms,
		"s2xe-spheres": S2xESpheres,

		"h2xe-axes": H2xEAxes,
		"h2xe-rooms": H2xERooms,

		"nil-axes": NilAxes,
		"nil-rooms": NilRooms,
		"nil-spheres": NilSpheres,

		"sl2r-axes": SL2RAxes,
		"sl2r-rooms": SL2RRooms,

		"sol-rooms": SolRooms
	};

	const sceneSelectorDropdownElement = $("#scene-selector-dropdown");

	if (!window.DEBUG)
	{
		$$("[data-option-name$=axes]").forEach(element => element.style.display = "none");
	}

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
		).map(element =>
		{
			// if (element.getAttribute("type") === "checkbox")
			// {
			// 	return element.parentNode.parentNode;
			// }

			return element.parentNode;
		});
		
		const elementsToHide = Array.from(
			geometryData.uiElementsUsed
				? $$(`.slider-container > input:not(#fov-slider, ${geometryData.uiElementsUsed})`)
				: $$(".slider-container > input:not(#fov-slider)")
		).map(element => element.parentNode);
		// .concat(Array.from(
		// 	geometryData.uiElementsUsed
		// 		? $$(`input:not(${geometryData.uiElementsUsed}) ~ .checkbox`)
		// 		: $$("input ~ .checkbox")
		// ).map(element => element.parentNode.parentNode));

		elementsToShow.forEach(element => element.style.display = "");
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
		sliders[key][0].addEventListener("input", () =>
		{
			applet.geometryData.sliderValues[key] = parseFloat(sliders[key][1].textContent);
		});
	}

	const fovSliderElement = $("#fov-slider");
	const fovSliderValueElement = $("#fov-slider-value");

	fovSliderElement.addEventListener("input", () =>
	{
		applet.fov = Math.tan(parseFloat(fovSliderValueElement.textContent) / 2 * Math.PI / 180);
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
			
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float maxT = 6.283;
			const float stepFactor = 0.99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			uniform float fov;

			
		uniform float wallThickness;
	

			float geometryDot(vec4 v, vec4 w)
			{
				
		return dot(v, w);
	
			}

			vec4 geometryNormalize(vec4 dir)
			{
				
		return normalize(dir);
	
			}

			



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				
		
		float distance1 = acos(pos.x) - wallThickness;
		float distance2 = acos(-pos.x) - wallThickness;
		float distance3 = acos(pos.y) - wallThickness;
		float distance4 = acos(-pos.y) - wallThickness;
		float distance5 = acos(pos.z) - wallThickness;
		float distance6 = acos(-pos.z) - wallThickness;
		float distance7 = acos(pos.w) - wallThickness;
		float distance8 = acos(-pos.w) - wallThickness;

		float minDistance = min(min(min(distance1, distance2), min(distance3, distance4)), min(min(distance5, distance6), min(distance7, distance8)));
	

		return -minDistance;
	
			}
			
			vec3 getColor(vec4 pos, vec3 globalColor)
			{
				
		
		float distance1 = acos(pos.x) - wallThickness;
		float distance2 = acos(-pos.x) - wallThickness;
		float distance3 = acos(pos.y) - wallThickness;
		float distance4 = acos(-pos.y) - wallThickness;
		float distance5 = acos(pos.z) - wallThickness;
		float distance6 = acos(-pos.z) - wallThickness;
		float distance7 = acos(pos.w) - wallThickness;
		float distance8 = acos(-pos.w) - wallThickness;

		float minDistance = min(min(min(distance1, distance2), min(distance3, distance4)), min(min(distance5, distance6), min(distance7, distance8)));
	

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin((.03 * pos.x) * 7.0) + 1.0)),
				.65 * (.5 * (sin((.03 * pos.y) * 11.0) + 1.0)),
				.65 * (.5 * (sin((.03 * pos.z) * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(.5 * abs(pos.y), 1.0 - .5 * abs(pos.z), 1.0 - 5 * abs(pos.w));
		}

		if (minDistance == distance3)
		{
			return vec3(0.0, 1.0, 0.0);
		}

		if (minDistance == distance4)
		{
			return vec3(1.0, 0.0, 1.0);
		}

		if (minDistance == distance5)
		{
			return vec3(0.0, 0.0, 1.0);
		}

		if (minDistance == distance6)
		{
			return vec3(1.0, 1.0, 0.0);
		}

		if (minDistance == distance7)
		{
			return vec3(0.5, 0.0, 1.0);
		}
		
		return vec3(1.0, 0.5, 0.0);
	
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos)
			{
				float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0));
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0));
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon));
				
				float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0));
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0));
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon));
				
				return normalize(vec4(
					xStep1 - xStep2,
					yStep1 - yStep2,
					zStep1 - zStep2,
					wStep1 - wStep2
				));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration, vec3 globalColor, float totalT)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, -1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 3.5 * max(dotProduct1, dotProduct2);
	

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos, globalColor)
					* lightIntensity
					* max(
						1.0 - float(iteration) / 100.0,
						0.0)
					;

				//Apply fog.
				
		return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));
	
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;
				float totalT = 0.0;
				
				float lastTIncrease = 0.0;

				vec4 startPos = cameraPos;

				vec3 globalColor = vec3(0.0, 0.0, 0.0);

				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					
		vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;
	
					
					float distance = distanceEstimator(pos);
					
					if (distance < epsilon)
					{
						
						
						finalColor = computeShading(pos, iteration, globalColor, totalT);
						break;
					}

					
		lastTIncrease = distance * stepFactor;
		
		t += lastTIncrease;
	

					if (t > maxT || totalT > maxT)
					{
						return fogColor;
					}
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(
					raymarch(
						geometryNormalize(
							forwardVec
							+ rightVec * uv.x * aspectRatioX * fov
							+ upVec * uv.y / aspectRatioY * fov
						)
					),
					1.0
				);
			}`
