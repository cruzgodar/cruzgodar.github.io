import { ThurstonGeometry } from "./class.js";
import { E3Axes, E3Rooms, E3Spheres } from "./geometries/e3.js";
import { H2xEAxes, H2xERooms } from "./geometries/h2xe.js";
import { H3Axes, H3Rooms } from "./geometries/h3.js";
import { NilAxes, NilRooms, NilSpheres } from "./geometries/nil.js";
import { S2xEAxes, S2xERooms, S2xESpheres } from "./geometries/s2xe.js";
import { S3Axes, S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.js";
import { SL2RRooms } from "./geometries/sl2r.js";
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
			const int maxMarches = 250;
			const float maxT = 30.0;
			const float stepFactor = 0.99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			uniform float fov;

			

			float geometryDot(vec4 v, vec4 w)
			{
				
		return dot(v, w);
	
			}

			vec4 geometryNormalize(vec4 dir)
			{
				
		return normalize(dir);
	
			}

			
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				1.0, 0.0, -pos.y * .5, 0.0,
				0.0, 1.0, pos.x * .5, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		float metricToOrigin(vec4 pos)
		{
			return length(vec3(pos.xyz));
		}

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.z;
		
			if (abs(c) < .0002)
			{
				return A * vec4(
					a * cos(alpha) * t,
					a * sin(alpha) * t,
					0.0,
					1.0
				);
			}
		
			if (c * t < .001)
			{
				return A * vec4(
					2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
					2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
					c * t + a*a * (c*t*t*t / 12.0 - c*c*c*t*t*t*t*t / 240.0 + c*c*c*c*c*t*t*t*t*t*t*t / 10080.0),
					1.0
				);
			}
			
			return A * vec4(
				2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
				2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
				c * t + a*a / (2.0 * c*c) * (c * t - sin(c * t)),
				1.0
			);
		}

		vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.z;
		
			vec4 pos;
		
			// All the following formulas get differentiated dt.
			if (abs(c) < 0.001)
			{
				return A * vec4(
					a * cos(alpha),
					a * sin(alpha),
					0.0,
					0.0
				);
			}
		
			if (c * t < .001)
			{
				return A * vec4(
					a * cos(alpha + c * t),
					a * sin(alpha + c * t),
					c + a*a * (c*t*t / 4.0 - c*c*c*t*t*t*t / 48.0 + c*c*c*c*c*t*t*t*t*t*t / 1440.0),
					0.0
				);
			}
			
			return A * vec4(
				a * cos(alpha + c * t),
				a * sin(alpha + c * t),
				c - a*a / (2.0 * c) * (cos(c * t) - 1.0),
				0.0
			);
		}
	



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				
		
		float distance1 = metricToOrigin(vec4(0.0, pos.yz, 1.0)) - .1;
		float distance2 = metricToOrigin(vec4(pos.x, 0.0, pos.z, 1.0)) - .1;
		float distance3 = metricToOrigin(vec4(pos.xy, 0.0, 1.0)) - .1;

		float minDistance = min(min(distance1, distance2), distance3);
	

		return minDistance;
	
			}
			
			vec3 getColor(vec4 pos, vec3 globalColor)
			{
				
		if (minDistance == distance1)
		{
			return vec3(
				1.0,
				.5 + .25 * (.5 * (sin(pos.x) + 1.0)),
				.5 + .25 * (.5 * (cos(pos.x) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 + .25 * (.5 * (sin(pos.y) + 1.0)),
				1.0,
				.5 + .25 * (.5 * (cos(pos.y) + 1.0))
			);
		}

		return vec3(
			.5 + .25 * (.5 * (sin(pos.z) + 1.0)),
			.5 + .25 * (.5 * (cos(pos.z) + 1.0)),
			1.0
		);
	
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
				
				
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.2 + .8 * max(dotProduct1, -.75 * dotProduct1)) * 1.15;
	

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos, globalColor)
					* lightIntensity
					* max(
						1.0 - float(iteration) / 250.0,
						0.0)
					;

				//Apply fog.
				
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	
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
					
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);
	
					
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
			}
`