import { ThurstonGeometry } from "../class.mjs";
import { BaseGeometry, getColorGlslString, getMinGlslString } from "./base.mjs";
import { $ } from "/scripts/src/main.mjs";

class S3Geometry extends BaseGeometry
{
	geodesicGlsl = "vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;";

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));";

	customDotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}
	
	updateCameraPos(cameraPos, tangentVec, dt)
	{
		const newCameraPos = [...cameraPos];

		for (let i = 0; i < 4; i++)
		{
			newCameraPos[i] = Math.cos(dt) * newCameraPos[i] + Math.sin(dt) * tangentVec[i];
		}
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we just want the magnitude to be equal to 1
		const magnitude = ThurstonGeometry.magnitude(newCameraPos);

		newCameraPos[0] /= magnitude;
		newCameraPos[1] /= magnitude;
		newCameraPos[2] /= magnitude;
		newCameraPos[3] /= magnitude;

		return newCameraPos;
	}

	//Given two points on the manifold, find the vector in the tangent space to pos1
	//that points to pos2. For simplicity, we assume dt = 1 and then normalize later.
	getGeodesicDirection(pos1, pos2)
	{
		const dir = new Array(4);

		for (let i = 0; i < 4; i++)
		{
			dir[i] = (pos2[i] - Math.cos(1) * pos1[i]) / Math.sin(1);
		}

		const magnitude = ThurstonGeometry.magnitude(dir);

		return [ThurstonGeometry.normalize(dir), magnitude];
	}

	getNormalVec(cameraPos)
	{
		//f = 1 - x^2 - y^2 - z^2 - w^2.
		return ThurstonGeometry.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			-cameraPos[3]
		]);
	}

	getGammaPrime(_pos, dir)
	{
		//gamma = cos(t)*pos + sin(t)*dir
		//gamma' = -sin(t)*pos + cos(t)*dir
		//gamma'' = -cos(t)*pos - sin(t)*dir
		//gamma''' = sin(t)*pos - cos(t)*dir
		//All of these are evaluated at t=0.
		return [...dir];
	}

	getGammaDoublePrime(pos)
	{
		return [-pos[0], -pos[1], -pos[2], -pos[3]];
	}

	getGammaTriplePrime(_pos, dir)
	{
		return [-dir[0], -dir[1], -dir[2], -dir[3]];
	}

	gammaTriplePrimeIsLinearlyIndependent = false;
}



export class S3Rooms extends S3Geometry
{
	static distances = `
		float distance1 = acos(pos.x) - wallThickness;
		float distance2 = acos(-pos.x) - wallThickness;
		float distance3 = acos(pos.y) - wallThickness;
		float distance4 = acos(-pos.y) - wallThickness;
		float distance5 = acos(pos.z) - wallThickness;
		float distance6 = acos(-pos.z) - wallThickness;
		float distance7 = acos(pos.w) - wallThickness;
		float distance8 = acos(-pos.w) - wallThickness;
	`;

	distanceEstimatorGlsl = `
		${S3Rooms.distances}

		float minDistance = ${getMinGlslString("distance", 8)};

		return -minDistance;
	`;

	getColorGlsl = `
		${S3Rooms.distances}

		float minDistance = ${getMinGlslString("distance", 8)};

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

		if (minDistance == distance5)
		{
			return vec3(0.0, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance6)
		{
			return vec3(1.0, 1.0, 0.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance7)
		{
			return vec3(0.5, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
		if (minDistance == distance8)
		{
			return vec3(1.0, 0.5, 0.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, -1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;

	cameraPos = [0, 0, 0, -1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}

	uniformGlsl = "uniform float wallThickness;";
	uniformNames = ["wallThickness"];
	uniformData = {
		wallThickness: .92,
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
		wallThicknessSliderValue.textContent = "0.30";

		wallThicknessSlider.addEventListener("input", () =>
		{
			const wallThickness = 0.92 + (1 - parseInt(wallThicknessSlider.value) / 10000) * .05;

			wallThicknessSliderValue.textContent = (Math.round(
				(-wallThickness + .955) * 1000
			) / 100).toFixed(2);

			this.uniformData.wallThickness = wallThickness;
		});
	}
}



export class S3Spheres extends S3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = abs(acos(pos.x) - .3);
		float distance2 = abs(acos(-pos.x) - .3);
		float distance3 = abs(acos(pos.y) - .3);
		float distance4 = abs(acos(-pos.y) - .3);
		float distance5 = abs(acos(pos.z) - .3);
		float distance6 = abs(acos(-pos.z) - .3);
		float distance7 = abs(acos(pos.w) - .3);

		float minDistance = ${getMinGlslString("distance", 7)};

		return minDistance;
	`;

	getColorGlsl = `
		float distance1 = abs(acos(pos.x) - .3);
		float distance2 = abs(acos(-pos.x) - .3);
		float distance3 = abs(acos(pos.y) - .3);
		float distance4 = abs(acos(-pos.y) - .3);
		float distance5 = abs(acos(pos.z) - .3);
		float distance6 = abs(acos(-pos.z) - .3);
		float distance7 = abs(acos(pos.w) - .3);

		float minDistance = ${getMinGlslString("distance", 7)};

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

		if (minDistance == distance5)
		{
			return vec3(0.0, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance6)
		{
			return vec3(1.0, 1.0, 0.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance7)
		{
			return vec3(1.0, 1.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity = lightBrightness * max(
			max(abs(dotProduct1), abs(dotProduct2)),
			max(abs(dotProduct3), abs(dotProduct4))
		);
	`;

	cameraPos = [0, 0, 0, -1];
	normalVec = [0, 0, 0, -1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}
}



function hsvToRgb(h, s, v)
{
	function f(n)
	{
		const k = (n + 6 * h) % 6;
		return v - v * s * Math.max(0, Math.min(k, Math.min(4 - k, 1)));
	}

	return [255 * f(5), 255 * f(3), 255 * f(1)];
}

function getHopfFiber(index, numFibers)
{
	const phi = index / numFibers * (2 * Math.PI);
	const theta = Math.PI / 2;

	const rgb = hsvToRgb(
		theta / (2 * Math.PI),
		Math.abs((phi % Math.PI) - Math.PI / 2) / (Math.PI / 2),
		1
	);

	const p = [Math.cos(phi) * Math.sin(theta), Math.sin(phi) * Math.sin(theta), Math.cos(theta)];

	/*	normalize(vec4(1.0 + p.z, -p.y, p.x, 0.0)),
					normalize(vec4(0.0, p.x, p.y, 1.0 + p.z)), */
	const vec1 = ThurstonGeometry.normalize([1 + p[2], -p[1], p[0], 0]);
	const vec2 = ThurstonGeometry.normalize([0, p[0], p[1], 1 + p[2]]);

	return [`float distance${index + 1} = greatCircleDistance(
		pos,
		vec4(${vec1[0]}, ${vec1[1]}, ${vec1[2]}, ${vec1[3]}),
		vec4(${vec2[0]}, ${vec2[1]}, ${vec2[2]}, ${vec2[3]}),
		fiberThickness);
	`, rgb];
}

export class S3HopfFibration extends S3Geometry
{
	constructor()
	{
		super();

		const numFibers = 20;

		this.distanceEstimatorGlsl = "";

		const colors = new Array(numFibers);

		for (let i = 0; i < numFibers; i++)
		{
			const result = getHopfFiber(i, numFibers);
			this.distanceEstimatorGlsl += result[0];
			colors[i] = result[1];
		}

		this.distanceEstimatorGlsl += `float minDistance = ${getMinGlslString("distance", numFibers)};`;

		this.getColorGlsl = this.distanceEstimatorGlsl + getColorGlslString(
			"distance",
			"minDistance",
			colors
		);

		this.distanceEstimatorGlsl += "return minDistance;";
	}
	
	functionGlsl = `
		//p and v must be orthonormal.
		float greatCircleDistance(vec4 pos, vec4 p, vec4 v, float r)
		{
			float dot1 = dot(pos, p);
			float dot2 = dot(pos, v);

			return acos(sqrt(dot1 * dot1 + dot2 * dot2)) - r;
		}
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity = lightBrightness * max(
			max(abs(dotProduct1), abs(dotProduct2)),
			max(abs(dotProduct3), abs(dotProduct4))
		);
	`;

	cameraPos = [0, 0, 0, -1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}

	uniformGlsl = "uniform float fiberThickness;";
	uniformNames = ["fiberThickness"];
	uniformData = {
		fiberThickness: .025,
	};

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["fiberThickness"], this.uniformData.fiberThickness);
	}

	uiElementsUsed = "#fiber-thickness-slider";

	initUI()
	{
		const fiberThicknessSlider = $("#fiber-thickness-slider");
		const fiberThicknessSliderValue = $("#fiber-thickness-slider-value");

		fiberThicknessSlider.value = 2105;
		fiberThicknessSliderValue.textContent = "0.25";

		fiberThicknessSlider.addEventListener("input", () =>
		{
			const fiberThickness = .005 + parseInt(fiberThicknessSlider.value) / 10000 * .095;

			fiberThicknessSliderValue.textContent = (Math.round(
				(fiberThickness) * 1000
			) / 100).toFixed(2);

			this.uniformData.fiberThickness = fiberThickness;
		});
	}
}