import { ThurstonGeometry } from "../class.js";
import { BaseGeometry } from "./base.js";
import { getMinGlslString } from "/scripts/src/applets.js";

export class E3Geometry extends BaseGeometry {}

export class E3Axes extends E3Geometry
{
	static distances = /* glsl */`
		float distance1 = length(pos.yz) - .25;
		float distance2 = length(pos.xz) - .25;
		float distance3 = length(pos.xy) - .25;

		float minDistance = ${getMinGlslString("distance", 3)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${E3Axes.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${E3Axes.distances}

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
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(10.0, 10.0, 10.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.25 + .75 * dotProduct1 * dotProduct1) * 1.5;
	`;

	cameraPos = [4, 4, 2, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [Math.sqrt(2) / 2, -Math.sqrt(2) / 2, 0, 0];
	forwardVec = [-Math.sqrt(2) / 2, -Math.sqrt(2) / 2, 0, 0];

	movingSpeed = 4;
}

export class E3Rooms extends E3Geometry
{
	static distances = /* glsl */`
		float roomDistance = 1000000.0;
		float sphereDistance = 1000000.0;

		if (sceneTransition < 1.0)
		{
			float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

			float effectiveWallThickness = wallThickness + sceneTransition * .471 / .75;

			roomDistance = (effectiveWallThickness - length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0))) * scale;
		}

		if (sceneTransition > 0.0)
		{
			float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

			float effectiveRadius = .5 - .5 / .75 * (1.0 - sceneTransition);

			sphereDistance = (length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - effectiveRadius) * scale;
		}
		
		float minDistance = min(roomDistance, sphereDistance);
	`;

	distanceEstimatorGlsl = /* glsl */`
		${E3Rooms.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		return mix(
			vec3(
				.25 + .75 * (.5 * (sin(pos.z * 0.75) + 1.0)),
				.25 + .75 * (.5 * (sin(pos.x * 0.75) + 1.0)),
				.25 + .75 * (.5 * (sin((-pos.y + 2.0) * 0.75) + 1.0))
			),
			vec3(
				.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
			),
			sceneTransition
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity1 = (.25 + .75 * dotProduct1 * dotProduct1) * 1.5;

		vec4 lightDirection2 = normalize(vec4(1.5, -1.5, 0.5, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity2 = max(dotProduct2, -.5 * dotProduct2) * 1.25;

		float lightIntensity = mix(lightIntensity1, lightIntensity2, sceneTransition);
	`;

	cameraPos = [1, 1.25, 1, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [-1, 0, 0, 0];
	forwardVec = [0, 1, 0, 0];

	movingSpeed = 2;

	uniformGlsl = /* glsl */`
		uniform float sceneTransition;
		uniform float wallThickness;
	`;

	uniformNames = ["sceneTransition", "wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = 1.5 - (this.sliderValues.wallThickness + .85) / 2 * .2;

		gl.uniform1f(uniformList["sceneTransition"], this.sliderValues.sceneTransition);
		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button";

	wallThicknessData = [1.55, -0.85, 1.55];

	getNearestCenter()
	{
		const cameraPosModded = [
			this.cameraPos[0] % 2,
			this.cameraPos[1] % 2,
			this.cameraPos[2] % 2,
			1
		];

		const centers = [
			[1, 1, 1, 1],
			[1, 1, -1, 1],
			[1, -1, 1, 1],
			[1, -1, -1, 1],
			[-1, 1, 1, 1],
			[-1, 1, -1, 1],
			[-1, -1, 1, 1],
			[-1, -1, -1, 1]
		];

		let minDistance = Infinity;
		let minIndex = 0;

		for (let i = 0; i < centers.length; i++)
		{
			const distance = ThurstonGeometry.magnitude(
				[
					cameraPosModded[0] - centers[i][0],
					cameraPosModded[1] - centers[i][1],
					cameraPosModded[2] - centers[i][2],
					cameraPosModded[3] - centers[i][3]
				]
			);

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return [
			this.cameraPos[0] - cameraPosModded[0] + centers[minIndex][0],
			this.cameraPos[1] - cameraPosModded[1] + centers[minIndex][1],
			this.cameraPos[2] - cameraPosModded[2] + centers[minIndex][2],
			this.cameraPos[3] - cameraPosModded[3] + centers[minIndex][3]
		];
	}

	getNearestCorner()
	{
		const cameraPosModded = [
			this.cameraPos[0] % 2,
			this.cameraPos[1] % 2,
			this.cameraPos[2] % 2,
			1
		];

		const corners = [
			[0, 0, 0, 1],
			[0, 0, 2, 1],
			[0, 2, 0, 1],
			[0, 2, 2, 1],
			[2, 0, 0, 1],
			[2, 0, 2, 1],
			[2, 2, 0, 1],
			[2, 2, 2, 1]
		];

		let minDistance = Infinity;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const distance = ThurstonGeometry.magnitude(
				[
					cameraPosModded[0] - corners[i][0],
					cameraPosModded[1] - corners[i][1],
					cameraPosModded[2] - corners[i][2],
					cameraPosModded[3] - corners[i][3]
				]
			);

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return [
			this.cameraPos[0] - cameraPosModded[0] + corners[minIndex][0],
			this.cameraPos[1] - cameraPosModded[1] + corners[minIndex][1],
			this.cameraPos[2] - cameraPosModded[2] + corners[minIndex][2],
			this.cameraPos[3] - cameraPosModded[3] + corners[minIndex][3]
		];
	}
}