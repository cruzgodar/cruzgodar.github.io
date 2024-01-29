import { BaseGeometry, getMaxGlslString, getMinGlslString } from "./base.js";
import { $ } from "/scripts/src/main.js";

class S2xEGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = vec4(
			cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
			startPos.w + t * rayDirectionVec.w
		);
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 8.0));
	`;

	correctPosition(pos)
	{
		const magnitude = Math.sqrt(
			pos[0] * pos[0]
			+ pos[1] * pos[1]
			+ pos[2] * pos[2]
		);

		return [
			pos[0] / magnitude,
			pos[1] / magnitude,
			pos[2] / magnitude,
			pos[3]
		];
	}

	getNormalVec(cameraPos)
	{
		// f = 1 - x^2 - y^2 - z^2
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			0
		]);
	}
}



export class S2xERooms extends S2xEGeometry
{
	static distances = /* glsl */`
		float spacing = 1.09;

		float distance1 = wallThickness - length(vec2(acos(pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance2 = wallThickness - length(vec2(acos(-pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance3 = wallThickness - length(vec2(acos(pos.y), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance4 = wallThickness - length(vec2(acos(-pos.y), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance5 = wallThickness - length(vec2(acos(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance6 = wallThickness - length(vec2(acos(-pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance", 6)};

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance", 6)};

		float wColor = floor((pos.w + spacing / 2.0) / spacing);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance6)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}
	`;

	lightGlsl = /* glsl */`
		// The cap of .05 fixes a very weird bug where the top and bottom of spheres had tiny dots of incorrect lighting.

		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -3.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * dotProduct1;
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = /* glsl */`
		uniform float wallThickness;
	`;

	uniformNames = ["wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .9557 - this.sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.45;
		wallThicknessSlider.max = .8;
		wallThicknessSlider.value = .8;
		wallThicknessSliderValue.textContent = .8;
		this.sliderValues.wallThickness = .8;
	}
}



export class S2xESpheres extends S2xEGeometry
{
	static distances = /* glsl */`
		float distance1 = length(vec2(acos(pos.x), mod(pos.w + .785398, 1.570796) - .785398)) - .3;
		float distance2 = length(vec2(acos(-pos.x), mod(pos.w + .785398, 1.570796) - .785398)) - .3;
		float distance3 = length(vec2(acos(pos.y), mod(pos.w + .785398, 1.570796) - .785398)) - .3;
		float distance4 = length(vec2(acos(-pos.y), mod(pos.w + .785398, 1.570796) - .785398)) - .3;
		float distance5 = length(vec2(acos(pos.z), mod(pos.w + .785398, 1.570796) - .785398)) - .3;
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xESpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xESpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		float wColor = floor((pos.w + .785398) / 1.570796);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.88 + .12 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.88 + .12 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.88 + .12 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}
	`;

	lightGlsl = /* glsl */`
		// This is very weird, but it fixes an issue where the north and south poles
		// of spheres had dots of incorrect lighting.
		pos.xyz /= 1.001;
		surfaceNormal = getSurfaceNormal(pos);
		
		vec4 lightDirection1 = normalize(vec4(0.0, 1.0, 0.0, 2.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 0.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.3 * max(dotProduct1, dotProduct2);
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}