import { sliderValues } from "../index.js";
import { BaseGeometry, getMaxGlslString, getMinGlslString } from "./base.js";
import { $ } from "/scripts/src/main.js";

class S2xEGeometry extends BaseGeometry
{
	geodesicGlsl = `vec4 pos = vec4(
		cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
		startPos.w + t * rayDirectionVec.w
	);`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 8.0));";
	
	followGeodesic(pos, dir, t)
	{
		const s2Mag = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
		
		const newPos = s2Mag === 0
			? [pos[0], pos[1], pos[2], pos[3] + t * dir[3]]
			: [
				Math.cos(s2Mag * t) * pos[0] + Math.sin(s2Mag * t) * dir[0] / s2Mag,
				Math.cos(s2Mag * t) * pos[1] + Math.sin(s2Mag * t) * dir[1] / s2Mag,
				Math.cos(s2Mag * t) * pos[2] + Math.sin(s2Mag * t) * dir[2] / s2Mag,
				pos[3] + t * dir[3]
			];
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we just want the S2 magnitude to be equal to 1.
		const magnitude = Math.sqrt(
			newPos[0] * newPos[0]
			+ newPos[1] * newPos[1]
			+ newPos[2] * newPos[2]
		);

		newPos[0] /= magnitude;
		newPos[1] /= magnitude;
		newPos[2] /= magnitude;

		return newPos;
	}

	getNormalVec(cameraPos)
	{
		//f = 1 - x^2 - y^2 - z^2
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
	static distances = `
		float spacing = 1.09;

		float distance1 = wallThickness - length(vec2(acos(pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance2 = wallThickness - length(vec2(acos(-pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance3 = wallThickness - length(vec2(acos(pos.y), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance4 = wallThickness - length(vec2(acos(-pos.y), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance5 = wallThickness - length(vec2(acos(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
		float distance6 = wallThickness - length(vec2(acos(-pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
	`;

	distanceEstimatorGlsl = `
		${S2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance", 6)};

		return minDistance;
	`;

	getColorGlsl = `
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

	lightGlsl = `
		// The cap of .05 fixes a very weird bug where the top and bottom of spheres had tiny dots of incorrect lighting.

		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -3.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * lightBrightness * dotProduct1;
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}

	uniformGlsl = "uniform float wallThickness;";
	uniformNames = ["wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .9557 - sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.45;
		wallThicknessSlider.max = .6;
		wallThicknessSlider.value = .6;
		wallThicknessSliderValue.textContent = .6;
		sliderValues.wallThickness = .6;
	}
}



export class S2xESpheres extends S2xEGeometry
{
	static distances = `
		float distance1 = length(vec2(acos(pos.x), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
		float distance2 = length(vec2(acos(-pos.x), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
		float distance3 = length(vec2(acos(pos.y), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
		float distance4 = length(vec2(acos(-pos.y), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
		float distance5 = length(vec2(acos(pos.z), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
	`;

	distanceEstimatorGlsl = `
		${S2xESpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = `
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

	lightGlsl = `
		// This is very weird, but it fixes an issue where the north and south poles
		// of spheres had dots of incorrect lighting.
		pos.xyz /= 1.001;
		surfaceNormal = getSurfaceNormal(pos);
		
		vec4 lightDirection1 = normalize(vec4(0.0, 1.0, 0.0, 2.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 0.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.3 * lightBrightness * max(dotProduct1, dotProduct2);
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}
}