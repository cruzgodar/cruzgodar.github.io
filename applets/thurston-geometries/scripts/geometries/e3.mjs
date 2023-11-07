import { BaseGeometry } from "./base.mjs";
import { $ } from "/scripts/src/main.mjs";

export class E3Geometry extends BaseGeometry {}

export class E3Rooms extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + wallThickness;

		return distance1;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.z) + 1.0))
		);
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
	`;

	cameraPos = [1, 1, 1, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = "uniform float wallThickness;";
	uniformNames = ["wallThickness"];
	uniformData = {
		wallThickness: 1.3,
	};

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["wallThickness"], this.uniformData.wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.value = 10000;
		wallThicknessSliderValue.textContent = 1.15;

		wallThicknessSlider.addEventListener("input", () =>
		{
			const wallThickness = 1.3 + (1 - parseInt(wallThicknessSlider.value) / 10000) * .2;

			wallThicknessSliderValue.textContent = (Math.round(
				(-wallThickness + 1.415) * 1000
			) / 100).toFixed(2);

			this.uniformData.wallThickness = wallThickness;
		});
	}
}

export class E3Spheres extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
		);
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}