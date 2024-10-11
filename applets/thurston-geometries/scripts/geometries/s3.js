import {
	getColorGlslString,
	getMaxGlslString,
	getMinGlslString
} from "../../../../scripts/applets/applet.js";
import { ThurstonGeometry } from "../class.js";
import { BaseGeometry } from "./base.js";

class S3Geometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));
	`;

	maxMarches = "100";
	maxT = "6.283";

	correctPosition(pos)
	{
		return ThurstonGeometry.normalize(pos);
	}

	getNormalVec(cameraPos)
	{
		// f = 1 - x^2 - y^2 - z^2 - w^2.
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			-cameraPos[3]
		]);
	}
}



export class S3Axes extends S3Geometry
{
	static distances = /* glsl */`
		float distance1 = acos(length(pos.xw)) - .05;
		float distance2 = acos(length(pos.yw)) - .05;
		float distance3 = acos(length(pos.zw)) - .05;

		float minDistance = ${getMinGlslString("distance", 3)};
	`;
	distanceEstimatorGlsl = /* glsl */`
		${S3Axes.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S3Axes.distances}

		if (minDistance == distance1)
		{
			return vec3(
				1.0,
				.5 + .25 * (.5 * (sin(20.0 * pos.x) + 1.0)),
				.5 + .25 * (.5 * (cos(20.0 * pos.x) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 + .25 * (.5 * (sin(20.0 * pos.y) + 1.0)),
				1.0,
				.5 + .25 * (.5 * (cos(20.0 * pos.y) + 1.0))
			);
		}

		return vec3(
			.5 + .25 * (.5 * (sin(20.0 * pos.z) + 1.0)),
			.5 + .25 * (.5 * (cos(20.0 * pos.z) + 1.0)),
			1.0
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(.5, .5, .5, .5) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-.5, -.5, -.5, -.5) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.5 * min(abs(dotProduct1), abs(dotProduct2));
	`;

	cameraPos = [0.6247, 0.6247, 0.4683, -0.0157];
	normalVec = [-0.6247, -0.6247, -0.4683, 0.0157];
	upVec = [-0.3268, -0.3268, 0.8657, -0.1925];
	rightVec = [0.7071, -0.7071, 0, 0];
	forwardVec = [-0.0542, -0.0542, 0.1773, 0.9812];
}



export class S3Rooms extends S3Geometry
{
	static distances = /* glsl */`
		float minRoomDistance = 1000000.0;
		float minSphereDistance = 1000000.0;

		float acosX = acos(pos.x);
		float acosNegX = pi - acosX;
		float acosY = acos(pos.y);
		float acosNegY = pi - acosY;
		float acosZ = acos(pos.z);
		float acosNegZ = pi - acosZ;
		float acosW = acos(pos.w);
		float acosNegW = pi - acosW;

		float roomDistance1 = maxT * 2.0;
		float roomDistance2 = maxT * 2.0;
		float roomDistance3 = maxT * 2.0;
		float roomDistance4 = maxT * 2.0;
		float roomDistance5 = maxT * 2.0;
		float roomDistance6 = maxT * 2.0;
		float roomDistance7 = maxT * 2.0;
		float roomDistance8 = maxT * 2.0;

		if (sceneTransition < 1.0)
		{
			float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

			float effectiveWallThickness = wallThickness + sceneTransition * .125 / .75;
			roomDistance1 = effectiveWallThickness - acosX;
			roomDistance2 = effectiveWallThickness - acosNegX;
			roomDistance3 = effectiveWallThickness - acosY;
			roomDistance4 = effectiveWallThickness - acosNegY;
			roomDistance5 = effectiveWallThickness - acosZ;
			roomDistance6 = effectiveWallThickness - acosNegZ;
			roomDistance7 = effectiveWallThickness - acosW;
			roomDistance8 = effectiveWallThickness - acosNegW;

			minRoomDistance = ${getMaxGlslString("roomDistance", 8)} * scale;
		}

		float sphereDistance1 = maxT * 2.0;
		float sphereDistance2 = maxT * 2.0;
		float sphereDistance3 = maxT * 2.0;
		float sphereDistance4 = maxT * 2.0;
		float sphereDistance5 = maxT * 2.0;
		float sphereDistance6 = maxT * 2.0;
		float sphereDistance7 = maxT * 2.0;

		if (sceneTransition > 0.0)
		{
			float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

			float effectiveRadius = .3 - .3 / .75 * (1.0 - sceneTransition);
			sphereDistance1 = acosX - effectiveRadius;
			sphereDistance2 = acosNegX - effectiveRadius;
			sphereDistance3 = acosY - effectiveRadius;
			sphereDistance4 = acosNegY - effectiveRadius;
			sphereDistance5 = acosZ - effectiveRadius;
			sphereDistance6 = acosNegZ - effectiveRadius;
			sphereDistance7 = acosW - effectiveRadius;

			minSphereDistance = ${getMinGlslString("sphereDistance", 7)} * scale;
		}
		
		float minDistance = min(minRoomDistance, minSphereDistance);
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S3Rooms.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S3Rooms.distances}

		float roomVariation = .075;
		float sphereVariation = .25;

		if (minDistance == roomDistance1)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((roomVariation * pos.y) * 17.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.z) * 23.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.w) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance2)
		{
			return vec3(
				.5 * (.5 * (sin((roomVariation * pos.y) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.z) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.w) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance3)
		{
			return vec3(
				.5 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.z) * 23.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.w) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance4)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.5 + .15 * (.5 * (sin((roomVariation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance5)
		{
			return vec3(
				.5 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.w) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance6)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.w) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance7)
		{
			return vec3(
				.5 + .15 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((roomVariation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((roomVariation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == roomDistance8)
		{
			return vec3(
				.65 + .35 * (.5 * (sin((roomVariation * pos.x) * 17.0) + 1.0)),
				.65 + .35 * (.5 * (sin((roomVariation * pos.y) * 23.0) + 1.0)),
				.65 + .35 * (.5 * (sin((roomVariation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == sphereDistance1)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((sphereVariation * pos.y) * 17.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.z) * 23.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.w) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		if (minDistance == sphereDistance2)
		{
			return vec3(
				.5 * (.5 * (sin((sphereVariation * pos.y) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((sphereVariation * pos.z) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((sphereVariation * pos.w) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		if (minDistance == sphereDistance3)
		{
			return vec3(
				.5 * (.5 * (sin((sphereVariation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((sphereVariation * pos.z) * 23.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.w) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		if (minDistance == sphereDistance4)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((sphereVariation * pos.x) * 17.0) + 1.0)),
				.5 + .15 * (.5 * (sin((sphereVariation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.z) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		if (minDistance == sphereDistance5)
		{
			return vec3(
				.5 * (.5 * (sin((sphereVariation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((sphereVariation * pos.w) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		if (minDistance == sphereDistance6)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((sphereVariation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((sphereVariation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((sphereVariation * pos.w) * 29.0) + 1.0))
			) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
		}

		return vec3(
			.5 + .15 * (.5 * (sin((sphereVariation * pos.x) * 17.0) + 1.0)),
			.5 * (.5 * (sin((sphereVariation * pos.y) * 23.0) + 1.0)),
			.85 + .15 * (.5 * (sin((sphereVariation * pos.z) * 29.0) + 1.0))
		) * getBanding(pos.x + pos.y + pos.z + pos.w, 7.854);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, -1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity1 = 4.0 * max(dotProduct1, dotProduct2);



		vec4 lightDirection3 = normalize(vec4(.5, .5, .5, .5) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-.5, -.5, -.5, -.5) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity2 = 1.75 * min(abs(dotProduct3), abs(dotProduct4));



		float lightIntensity = mix(lightIntensity1, lightIntensity2, sceneTransition);
	`;

	cameraPos = [0, -0.20927, 0, -0.97785];
	normalVec = [-0, 0.20934, -0, 0.97784];
	upVec = [0, 0, 1, 0];
	rightVec = [1, 0, 0, 0];
	forwardVec = [0, -0.97784, 0, 0.20934];

	uniformGlsl = /* glsl */`
		uniform float sceneTransition;
		uniform float wallThickness;
	`;

	uniformNames = ["sceneTransition", "wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .97 -
			(this.sliderValues.wallThickness - (-.15)) / (.35 - (-.15)) * (.97 - .92);

		gl.uniform1f(uniformList.sceneTransition, this.sliderValues.sceneTransition);
		gl.uniform1f(uniformList.wallThickness, wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button";

	wallThicknessData = [.35, -.15, .35];

	getNearestCenter()
	{
		const centers = [
			[1, 0, 0, 0],
			[-1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, -1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, -1, 0],
			[0, 0, 0, 1],
			[0, 0, 0, -1]
		];

		let minDistance = Math.PI;
		let minIndex = 0;

		for (let i = 0; i < centers.length; i++)
		{
			const distance = Math.acos(ThurstonGeometry.dotProduct(
				centers[i], this.cameraPos
			));

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return centers[minIndex];
	}

	getNearestCorner()
	{
		const corners = [
			[.5, .5, .5, .5],
			[.5, .5, .5, -.5],
			[.5, .5, -.5, .5],
			[.5, .5, -.5, -.5],
			[.5, -.5, .5, .5],
			[.5, -.5, .5, -.5],
			[.5, -.5, -.5, .5],
			[.5, -.5, -.5, -.5],
			[-.5, .5, .5, .5],
			[-.5, .5, .5, -.5],
			[-.5, .5, -.5, .5],
			[-.5, .5, -.5, -.5],
			[-.5, -.5, .5, .5],
			[-.5, -.5, .5, -.5],
			[-.5, -.5, -.5, .5],
			[-.5, -.5, -.5, -.5],
		];

		let minDistance = Math.PI;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const distance = Math.acos(ThurstonGeometry.dotProduct(
				corners[i], this.cameraPos
			));

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return corners[minIndex];
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

function getHopfFiber(index, numFibers, theta, startingFiber)
{
	const phi = index / numFibers * (2 * Math.PI);

	const rgb = hsvToRgb(
		theta / (Math.PI),
		Math.abs((phi % Math.PI) - Math.PI / 2) / (Math.PI / 2),
		1
	);

	const p = [Math.cos(phi) * Math.sin(theta), Math.sin(phi) * Math.sin(theta), Math.cos(theta)];

	/*	normalize(vec4(1.0 + p.z, -p.y, p.x, 0.0)),
					normalize(vec4(0.0, p.x, p.y, 1.0 + p.z)), */
	const vec1 = ThurstonGeometry.normalize([1 + p[2], -p[1], p[0], 0]);
	const vec2 = ThurstonGeometry.normalize([0, p[0], p[1], 1 + p[2]]);

	return [/* glsl */`
		float distance${index + 1 + startingFiber} = greatCircleDistance(
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

		const numFibers = 18;

		this.distanceEstimatorGlsl = "";

		const colors = new Array(numFibers * 3 + 2);

		for (let i = 0; i < numFibers; i++)
		{
			const result = getHopfFiber(i, numFibers, Math.PI / 4, 0);
			this.distanceEstimatorGlsl += result[0];
			colors[i] = result[1];
		}

		for (let i = 0; i < numFibers; i++)
		{
			const result = getHopfFiber(i, numFibers, Math.PI / 2, numFibers);
			this.distanceEstimatorGlsl += result[0];
			colors[numFibers + i] = result[1];
		}

		for (let i = 0; i < numFibers; i++)
		{
			const result = getHopfFiber(i, numFibers, 3 * Math.PI / 4, 2 * numFibers);
			this.distanceEstimatorGlsl += result[0];
			colors[2 * numFibers + i] = result[1];
		}

		const result = getHopfFiber(0, 1, 0, 3 * numFibers);
		this.distanceEstimatorGlsl += result[0];
		colors[3 * numFibers] = [255, 255, 96];

		const result2 = getHopfFiber(0, 1, Math.PI, 3 * numFibers + 1);
		this.distanceEstimatorGlsl += result2[0];
		colors[3 * numFibers + 1] = [255, 96, 96];



		this.distanceEstimatorGlsl += /* glsl */`
			float minDistance = ${getMinGlslString("distance", numFibers * 3 + 2)};
		`;

		this.getColorGlsl = this.distanceEstimatorGlsl + getColorGlslString(
			"distance",
			"minDistance",
			colors
		);

		this.distanceEstimatorGlsl += "return minDistance;";
	}
	
	functionGlsl = /* glsl */`
		//p and v must be orthonormal.
		float greatCircleDistance(vec4 pos, vec4 p, vec4 v, float r)
		{
			float dot1 = dot(pos, p);
			float dot2 = dot(pos, v);

			return acos(sqrt(dot1 * dot1 + dot2 * dot2)) - r;
		}
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity = max(
			max(abs(dotProduct1), abs(dotProduct2)),
			max(abs(dotProduct3), abs(dotProduct4))
		);
	`;

	cameraPos = [-0.0403, 0.4848, -0.0054, -0.8736];
	normalVec = [0.0403, -0.4848, 0.0054, 0.8736];
	upVec = [-0.0002, 0.0021, 0.9999, -0.0050];
	rightVec = [-0.9987, 0.0057, -0.0000, 0.0493];
	forwardVec = [0.0289, 0.8745, 0.0006, 0.4839];

	uniformGlsl = /* glsl */`
		uniform float fiberThickness;
	`;

	uniformNames = ["fiberThickness"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList.fiberThickness, this.sliderValues.fiberThickness);
	}
}