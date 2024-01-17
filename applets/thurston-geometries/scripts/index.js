import { ThurstonGeometry } from "./class.js";
import { E3Rooms, E3Spheres } from "./geometries/e3.js";
import { H2xERooms } from "./geometries/h2xe.js";
import { H3Rooms } from "./geometries/h3.js";
import { NilRooms, NilSpheres } from "./geometries/nil.js";
import { S2xERooms, S2xESpheres } from "./geometries/s2xe.js";
import { S3HopfFibration, S3Rooms, S3Spheres } from "./geometries/s3.js";
import { SL2RSpheres } from "./geometries/sl2r.js";
import { showPage } from "/scripts/src/load-page.js";
import { $, $$ } from "/scripts/src/main.js";

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

		"s3-rooms": S3Rooms,
		"s3-spheres": S3Spheres,
		"s3-hopf-fibration": S3HopfFibration,

		"h3-rooms": H3Rooms,

		"s2xe-rooms": S2xERooms,
		"s2xe-spheres": S2xESpheres,

		"h2xe-rooms": H2xERooms,

		"nil-rooms": NilRooms,
		"nil-spheres": NilSpheres,

		"sl2r-spheres": SL2RSpheres
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

/*glsl*/`
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

const float lightBrightness = 1.0;

const float epsilon = 0.00001;
const int maxMarches = 200;
const float stepFactor = .99;
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

// Projects a point p in the universal cover, i.e. H^2 x R, down to Q.
vec4 projectToQ(vec4 p)
{
float denominator = sqrt(2.0 * p.z + 2.0);

vec4 zetaOutput = vec4(
	sqrt((p.z + 1.0) * 0.5),
	0.0,
	p.x / denominator,
	p.y / denominator
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
mat2 h2Matrix = -h2Element.x * E3 + h2Element.y * E2 + h2Element.z * E1;
mat2 qMatrix = qElement.x * E0 + qElement.y * E1 + qElement.z * E2 + qElement.w * E3;

mat2 conjugatedh2Matrix = qMatrix * h2Matrix * qMatrix;

h2Element = vec3(
	conjugatedh2Matrix[1][1],
	0.5 * (conjugatedh2Matrix[1][0] + conjugatedh2Matrix[0][1]),
	0.5 * (conjugatedh2Matrix[1][0] - conjugatedh2Matrix[0][1])
);
}

const float root2Over2 = 0.70710678;

vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
{
float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
float a = length(rayDirectionVec.xy);
float c = rayDirectionVec.w;
float kappa = sqrt(abs(c*c - a*a));

vec4 pos;

if (c > a)
{
	float trigArg = kappa * t * 0.5;
	float sineFactor = sin(trigArg);

	pos = vec4(
		2.0 * a / kappa * sineFactor * cos(trigArg),
		-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
		1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
		2.0 * c * t + 2.0 * atan(-c / kappa * tan(trigArg))
			- sign(c) * floor(0.5 * kappa * t / 3.14159265 + 0.5) * 6.28318531
			// Had to go digging in their code for this last term
			// since it's only referred to in the paper as a adjustment by
			// "the correct multiple of 2pi". This belongs in the paper!!
	);
}

else if (c == a)
{
	pos = vec4(
		root2Over2 * t,
		-t * t * 0.25,
		1.0 + t * t * 0.25,
		2.0 * c * t - root2Over2 * t
	);
}

else
{
	float trigArg = kappa * t * 0.5;
	float sineFactor = sinh(trigArg);

	pos = vec4(
		2.0 * a / kappa * sineFactor * cosh(trigArg),
		-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
		1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
		2.0 * c * t + 2.0 * atan(-c / kappa * tanh(trigArg))
	);
}

// Apply r_alpha.
pos.xy = mat2(
	cos(alpha), sin(alpha),
	-sin(alpha), cos(alpha)
) * pos.xy;

// Finally, translate this to the starting position, beginning by getting the element
// of Q corresponding to this.
vec4 qElement = projectToQ(startPos);

// Now this element induces an isomorphism of H^2 by conjugation. We'll apply
// it to the H^2 part of pos.
applyH2Isometry(qElement, pos.xyz);

pos.w += startPos.w;

return pos;
}




float getBanding(float amount, float numBands)
{
	return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
}



float distanceEstimator(vec4 pos)
{
	

float radius = .25;
float distance1 = 1.0;

// approximateDistanceToOrigin(pos);

// if (distance1 > radius + 1.0)
// {
// 	distance1 -= radius;
// }

// else
// {
// 	distance1 = exactDistanceToOrigin(pos) - radius;
// }


return distance1;

}

vec3 getColor(vec4 pos, vec3 globalColor)
{
	
return vec3(1.0, 1.0, 1.0); 

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

vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
float dotProduct1 = dot(surfaceNormal, lightDirection1);

vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
float dotProduct2 = dot(surfaceNormal, lightDirection2);

float lightIntensity = 1.0;


	//The last factor adds ambient occlusion.
	vec3 color = getColor(pos, globalColor)
		* lightIntensity
		* max(
			1.0 - float(iteration) / 100.0,
			0.0)
		;

	//Apply fog.
	
return color;//mix(color, fogColor, 1.0 - exp(-totalT * 0.2));

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

// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);

		
		float distance = distanceEstimator(pos);
		
		if (distance < epsilon)
		{
			
			
			finalColor = computeShading(pos, iteration, globalColor, totalT);
			break;
		}

		
lastTIncrease = distance * stepFactor;

t += lastTIncrease;

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
`;