import { BaseGeometry, getMinGlslString } from "./base.js";
import { E3Geometry } from "./e3.js";
import { S2xEGeometry } from "./s2xe.js";

// This renders a white sphere, a black camera dot on it,
// polka dot circles, and the light rays.
export class E3S2Demo extends E3Geometry
{
	distanceEstimatorGlsl = /* glsl */`
		float distance1 = length(pos.xyz) - 1.0;

		return distance1;
	`;

	getColorGlsl = /* glsl */`
		pos.xyz /= 1.001;

		float radius = .5;

		if (acos(dot(pos.xyz, normalize(vec3(1, 0, 0)))) - radius < 0.0)
		{
			return vec3(1.0, 0.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 1, 0)))) - radius < 0.0)
		{
			return vec3(0.0, 1.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(-1, 0, 0)))) - radius < 0.0)
		{
			return vec3(0.0, 0.0, 1.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, -1, 0)))) - radius < 0.0)
		{
			return vec3(1.0, 1.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 0, -1)))) - radius < 0.0)
		{
			return vec3(0.5, 0.5, 0.5);
		}

		return vec3(1.0, 1.0, 1.0);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(-3.0, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.5 + .5 * dotProduct1 * dotProduct1) * 1.15;
	`;

	correctPosition(pos)
	{
		const mag = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]) / 2.5;
		return [pos[0] / mag, pos[1] / mag, pos[2] / mag, 1];
	}

	correctVectors()
	{
		this.forwardVec = this.normalize([
			-this.cameraPos[0],
			-this.cameraPos[1],
			0,
			0
		]);

		const dotRight = this.dotProduct(
			this.forwardVec,
			this.rightVec
		);

		for (let i = 0; i < 4; i++)
		{
			this.rightVec[i] -= dotRight * this.forwardVec[i];
		}

		this.rightVec = this.normalize(this.rightVec);
	}

	cameraPos = [-2.5, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	movingSpeed = 5;
	
	lockedOnOrigin = true;

	fov = Math.tan(60 / 2 * Math.PI / 180);

	controlMode = BaseGeometry.DISALLOW_MODIFIER;
}

export class S2xES2Demo extends S2xEGeometry
{
	static distances = /* glsl */`
		float distance1 = length(vec2(acos(pos.x), pos.w)) - .25;
		float distance2 = length(vec2(acos(-pos.x), pos.w)) - .25;
		float distance3 = length(vec2(acos(pos.y), pos.w)) - .25;
		float distance4 = length(vec2(acos(-pos.y), pos.w)) - .25;
		float distance5 = length(vec2(acos(pos.z), pos.w)) - .25;

		float minDistance = ${getMinGlslString("distance", 5)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xES2Demo.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xES2Demo.distances}

		if (minDistance == distance1)
		{
			return vec3(1.0, 0.0, 0.0);
		}

		if (minDistance == distance2)
		{
			return vec3(0.0, 1.0, 0.0);
		}

		if (minDistance == distance3)
		{
			return vec3(0.0, 0.0, 1.0);
		}

		if (minDistance == distance4)
		{
			return vec3(1.0, 1.0, 0.0);
		}

		return vec3(0.5, 0.5, 0.5);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -2.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * dotProduct1;
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [1, 0, 0, 0];
	forwardVec = [0, -1, 0, 0];
}