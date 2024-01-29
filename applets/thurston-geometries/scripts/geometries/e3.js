import { sliderValues } from "../index.js";
import { BaseGeometry } from "./base.js";
import { $ } from "/scripts/src/main.js";

export class E3Geometry extends BaseGeometry {}

export class E3Rooms extends E3Geometry
{
	distanceEstimatorGlsl = /* glsl */`
		float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + wallThickness;

		return distance1;
	`;

	getColorGlsl = /* glsl */`
		return vec3(
			.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.z) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.25 + .75 * dotProduct1 * dotProduct1) * 1.5;
	`;

	cameraPos = [1, 1, 1, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [1, 0, 0, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [0, 0, -1, 0];

	uniformGlsl = /* glsl */`
		uniform float wallThickness;
	`;

	uniformNames = ["wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = 1.5 - (sliderValues.wallThickness + .85) / 2 * .2;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.85;
		wallThicknessSlider.max = 1.55;
		wallThicknessSlider.value = 1.55;
		wallThicknessSliderValue.textContent = 1.55;
		sliderValues.wallThickness = 1.55;
	}
}

export class E3Spheres extends E3Geometry
{
	distanceEstimatorGlsl = /* glsl */`
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
	`;

	getColorGlsl = /* glsl */`
		return vec3(
			.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.5, -1.5, 0.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}