import { sliderValues } from "../index.mjs";
import { BaseGeometry, getMinGlslString } from "./base.mjs";
import { $ } from "/scripts/src/main.mjs";

class S2xEGeometry extends BaseGeometry
{
	geodesicGlsl = `vec4 pos = vec4(
		cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
		startPos.w + t * rayDirectionVec.w
	);`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));";
	
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

	// The result of solving cos(t)pos1 + sin(t)v = pos2 for v
	getGeodesicDirection(pos1, pos2, t)
	{
		return;
		// const cosFactor = Math.cos(t);
		// const sinFactor = Math.sin(t);
		
		// const dir = [
		// 	(pos2[0] - cosFactor * pos1[0]) / sinFactor,
		// 	(pos2[1] - cosFactor * pos1[1]) / sinFactor,
		// 	(pos2[2] - cosFactor * pos1[2]) / sinFactor,
		// 	(pos2[3] - cosFactor * pos1[3]) / sinFactor,
		// ];

		// return this.normalize(dir);
	}

	//Gets the distance from pos1 to pos2 along the geodesic in the direction of dir.
	getGeodesicDistance(pos1, pos2)
	{
		return;

		// const dot = this.dotProduct(pos1, pos2);

		// return Math.acos(dot);
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

	getGammaPrime(_pos, dir)
	{
		//gamma = cos(t)*pos + sin(t)*dir
		//gamma' = -sin(t)*pos + cos(t)*dir
		//gamma'' = -cos(t)*pos - sin(t)*dir
		//gamma''' = sin(t)*pos - cos(t)*dir
		//All of these are evaluated at t=0.
		return;
	}

	getGammaDoublePrime(pos)
	{
		return;
	}

	getGammaTriplePrime(_pos, dir)
	{
		return;
	}

	gammaTriplePrimeIsLinearlyIndependent = false;
}



export class S2xERooms extends S2xEGeometry
{
	static distances = `
		float distance1 = length(vec2(acos(pos.x), pos.w)) - wallThickness;
		float distance2 = length(vec2(acos(-pos.x), pos.w)) - wallThickness;
		float distance3 = length(vec2(acos(pos.y), pos.w)) - wallThickness;
		float distance4 = length(vec2(acos(-pos.y), pos.w)) - wallThickness;
	`;

	distanceEstimatorGlsl = `
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 4)};

		return minDistance;
	`;

	getColorGlsl = `
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 4)};

		if (minDistance == distance1)
		{
			return vec3(1.0, 0.0, 0.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance2)
		{
			return vec3(0.0, 1.0, 1.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance3)
		{
			return vec3(0.0, 1.0, 0.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance4)
		{
			return vec3(1.0, 0.0, 1.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
		}
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, -1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
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
		const wallThickness = sliderValues.wallThickness;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = .1;
		wallThicknessSlider.max = 1;
		wallThicknessSlider.value = .2;
		wallThicknessSliderValue.textContent = .2;
		sliderValues.wallThickness = .2;
	}
}