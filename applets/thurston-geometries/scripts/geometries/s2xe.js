import { BaseGeometry } from "./base.js";
import { getMaxGlslString, getMinGlslString } from "/scripts/src/applets.js";

export class S2xEGeometry extends BaseGeometry
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



export class S2xEAxes extends S2xEGeometry
{
	static distances = /* glsl */`
		float distance1 = length(vec2(acos(sqrt(1.0 - pos.y * pos.y)), pos.w)) - .1;
		float distance2 = length(vec2(acos(sqrt(1.0 - pos.x * pos.x)), pos.w)) - .1;
		float distance3 = acos(pos.z) - .1;

		float minDistance = ${getMinGlslString("distance", 3)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xEAxes.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xEAxes.distances}

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
			.5 + .25 * (.5 * (sin(5.0 * pos.w) + 1.0)),
			.5 + .25 * (.5 * (cos(5.0 * pos.w) + 1.0)),
			1.0
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = vec4(normalize(vec3(2.0, 2.0, -2.0) - pos.xyz), 0.0);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * dotProduct1;
	`;

	cameraPos = [-0.69965, -0.70677, 0.10463, 0.61483];
	normalVec = [0.69965, 0.70676, -0.10471, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0.71092, -0.70325, 0.00345, 0];
	forwardVec = [0.07120, 0.07685, 0.99449, 0];
}

export class S2xERooms extends S2xEGeometry
{
	static distances = /* glsl */`
		float spacing = 1.09;

		float minRoomDistance = 1000000.0;
		float minSphereDistance = 1000000.0;

		float acosX = acos(pos.x);
		float acosNegX = pi - acosX;
		float acosY = acos(pos.y);
		float acosNegY = pi - acosY;
		float acosZ = acos(pos.z);
		float acosNegZ = pi - acosZ;

		float modPosW = mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0;

		float roomDistance1 = maxT * 2.0;
		float roomDistance2 = maxT * 2.0;
		float roomDistance3 = maxT * 2.0;
		float roomDistance4 = maxT * 2.0;
		float roomDistance5 = maxT * 2.0;
		float roomDistance6 = maxT * 2.0;

		if (sceneTransition < 1.0)
		{
			float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

			float effectiveWallThickness = wallThickness + sceneTransition * .225 / .75;

			roomDistance1 = effectiveWallThickness - length(vec2(acosX, modPosW));
			roomDistance2 = effectiveWallThickness - length(vec2(acosNegX, modPosW));
			roomDistance3 = effectiveWallThickness - length(vec2(acosY, modPosW));
			roomDistance4 = effectiveWallThickness - length(vec2(acosNegY, modPosW));
			roomDistance5 = effectiveWallThickness - length(vec2(acosZ, modPosW));
			roomDistance6 = effectiveWallThickness - length(vec2(acosNegZ, modPosW));

			minRoomDistance = ${getMaxGlslString("roomDistance", 6)} * scale;
		}

		float sphereDistance1 = maxT * 2.0;
		float sphereDistance2 = maxT * 2.0;
		float sphereDistance3 = maxT * 2.0;
		float sphereDistance4 = maxT * 2.0;
		float sphereDistance5 = maxT * 2.0;

		if (sceneTransition > 0.0)
		{
			float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

			float effectiveRadius = .3 - .3 / .75 * (1.0 - sceneTransition);

			sphereDistance1 = length(vec2(acosX, modPosW)) - effectiveRadius;
			sphereDistance2 = length(vec2(acosNegX, modPosW)) - effectiveRadius;
			sphereDistance3 = length(vec2(acosY, modPosW)) - effectiveRadius;
			sphereDistance4 = length(vec2(acosNegY, modPosW)) - effectiveRadius;
			sphereDistance5 = length(vec2(acosZ, modPosW)) - effectiveRadius;

			minSphereDistance = ${getMinGlslString("sphereDistance", 5)} * scale;
		}

		float minDistance = min(minRoomDistance, minSphereDistance);
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xERooms.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xERooms.distances}

		float wColor = floor((pos.w + spacing / 2.0) / spacing);

		float variation = .04;

		if (minDistance == roomDistance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.65 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.65 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 89.0) + 1.0))
			);
		}

		if (minDistance == roomDistance2)
		{
			return vec3(
				.65 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.65 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 89.0) + 1.0))
			);
		}

		if (minDistance == roomDistance3)
		{
			return vec3(
				.65 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.65 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 17.0) + 1.0))
			);
		}

		if (minDistance == roomDistance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.65 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 17.0) + 1.0))
			);
		}

		if (minDistance == roomDistance5)
		{
			return vec3(
				.65 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 17.0) + 1.0))
			);
		}

		if (minDistance == roomDistance6)
		{
			return vec3(
				.65 + .35 * (.5 * (sin((variation * pos.x + 0.3 * wColor) * 7.0) + 1.0)),
				.65 + .35 * (.5 * (sin((variation * pos.y + 0.3 * wColor) * 11.0) + 1.0)),
				.65 + .35 * (.5 * (sin((variation * pos.z + 0.3 * wColor) * 17.0) + 1.0))
			);
		}

		if (minDistance == sphereDistance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == sphereDistance2)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == sphereDistance3)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == sphereDistance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		return vec3(
			.88 + .12 * (.5 * (sin(wColor * 7.0) + 1.0)),
			.88 + .12 * (.5 * (sin(wColor * 11.0) + 1.0)),
			.88 + .12 * (.5 * (sin(wColor * 17.0) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		float spacing = 1.09;
		vec4 modPos = vec4(pos.xyz, mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0);

		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -2.0) - modPos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity1 = 1.5 * dotProduct1;

		pos.xyz /= 1.001;
		surfaceNormal = getSurfaceNormal(pos);

		vec4 lightDirection2 = normalize(vec4(0.0, 2.0, 2.0, 2.5) - modPos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(2.0, 0.0, -2.0, 2.5) - modPos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		float lightIntensity2 = 1.3 * max(dotProduct2, dotProduct3);

		float lightIntensity = mix(lightIntensity1, lightIntensity2, sceneTransition);
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [1, 0, 0, 0];
	forwardVec = [0, -1, 0, 0];

	uniformGlsl = /* glsl */`
		uniform float sceneTransition;
		uniform float wallThickness;
	`;

	uniformNames = ["sceneTransition", "wallThickness"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .9557 - this.sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["sceneTransition"], this.sliderValues.sceneTransition);
		gl.uniform1f(uniformList["wallThickness"], wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button";

	wallThicknessData = [.8, -.45, .8];

	getNearestCenter()
	{
		const spacing = 1.09;

		const cameraPosWModded = (this.cameraPos[3] + spacing / 2) % spacing;

		const centers = [
			[1, 0, 0, -spacing],
			[-1, 0, 0, -spacing],
			[0, 1, 0, -spacing],
			[0, -1, 0, -spacing],
			[0, 0, 1, -spacing],
			[0, 0, -1, -spacing],
			[1, 0, 0, spacing],
			[-1, 0, 0, spacing],
			[0, 1, 0, spacing],
			[0, -1, 0, spacing],
			[0, 0, 1, spacing],
			[0, 0, -1, spacing],
		];

		let minDistance = Math.PI;
		let minIndex = 0;

		for (let i = 0; i < centers.length; i++)
		{
			const s2Distance = Math.acos(
				centers[i][0] * this.cameraPos[0]
				+ centers[i][1] * this.cameraPos[1]
				+ centers[i][2] * this.cameraPos[2]
			);

			const e1Distance = cameraPosWModded - centers[i][3];

			// No need to square root the distance when we're just finding the minimum.
			const distance = s2Distance * s2Distance + e1Distance * e1Distance;

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return [
			centers[minIndex][0],
			centers[minIndex][1],
			centers[minIndex][2],
			this.cameraPos[3] - cameraPosWModded + centers[minIndex][3]
		];
	}

	getNearestCorner()
	{
		const spacing = 1.09;

		const cameraPosWModded = (this.cameraPos[3] + spacing / 2) % spacing;

		const oneOverRoot3 = 1 / Math.sqrt(3);

		const corners = [
			[oneOverRoot3, oneOverRoot3, oneOverRoot3, spacing / 2],
			[oneOverRoot3, oneOverRoot3, oneOverRoot3, -spacing / 2],
			[oneOverRoot3, oneOverRoot3, -oneOverRoot3, spacing / 2],
			[oneOverRoot3, oneOverRoot3, -oneOverRoot3, -spacing / 2],
			[oneOverRoot3, -oneOverRoot3, oneOverRoot3, spacing / 2],
			[oneOverRoot3, -oneOverRoot3, oneOverRoot3, -spacing / 2],
			[oneOverRoot3, -oneOverRoot3, -oneOverRoot3, spacing / 2],
			[oneOverRoot3, -oneOverRoot3, -oneOverRoot3, -spacing / 2],
			[-oneOverRoot3, oneOverRoot3, oneOverRoot3, spacing / 2],
			[-oneOverRoot3, oneOverRoot3, oneOverRoot3, -spacing / 2],
			[-oneOverRoot3, oneOverRoot3, -oneOverRoot3, spacing / 2],
			[-oneOverRoot3, oneOverRoot3, -oneOverRoot3, -spacing / 2],
			[-oneOverRoot3, -oneOverRoot3, oneOverRoot3, spacing / 2],
			[-oneOverRoot3, -oneOverRoot3, oneOverRoot3, -spacing / 2],
			[-oneOverRoot3, -oneOverRoot3, -oneOverRoot3, spacing / 2],
			[-oneOverRoot3, -oneOverRoot3, -oneOverRoot3, -spacing / 2]
		];

		let minDistance = Math.PI;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const s2Distance = Math.acos(
				corners[i][0] * this.cameraPos[0]
				+ corners[i][1] * this.cameraPos[1]
				+ corners[i][2] * this.cameraPos[2]
			);

			const e1Distance = cameraPosWModded - corners[i][3];

			// No need to square root the distance when we're just finding the minimum.
			const distance = s2Distance * s2Distance + e1Distance * e1Distance;

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return [
			corners[minIndex][0],
			corners[minIndex][1],
			corners[minIndex][2],
			this.cameraPos[3] - cameraPosWModded + corners[minIndex][3]
		];
	}
}