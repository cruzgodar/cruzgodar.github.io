import { ThurstonGeometry } from "../class.mjs";

function getE3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cameraPos + t * rayDirectionVec;",

		fogGlsl: "return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));",
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
		{
			const newCameraPos = [...cameraPos];

			for (let i = 0; i < 4; i++)
			{
				newCameraPos[i] = newCameraPos[i] + dt * tangentVec[i];
			}
			
			return newCameraPos;
		},

		getGeodesicDirection(pos1, pos2)
		{
			const dir = new Array(4);

			for (let i = 0; i < 4; i++)
			{
				dir[i] = pos2[i] - pos1[i];
			}

			const magnitude = ThurstonGeometry.magnitude(dir);

			return [ThurstonGeometry.normalize(dir), magnitude];
		},

		getNormalVec: () =>
		{
			//f = w - 1.
			return [0, 0, 0, 1];
		},

		getGammaPrime: (_pos, dir) =>
		{
			//gamma = pos + t*dir
			//gamma' = dir
			//gamma'' = 0
			//All of these are evaluated at t=0.
			return [...dir];
		},

		getGammaDoublePrime: () =>
		{
			return [0, 0, 0, 0];
		},

		getGammaTriplePrime: () =>
		{
			return [0, 0, 0, 0];
		},

		gammaTriplePrimeIsLinearlyIndependent: false
	};
}

export function getE3RoomsData()
{
	return {
		...getE3BaseData(),

		distanceEstimatorGlsl: `
			float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + 1.3;

			return distance1;
		`,

		getColorGlsl: `
			return vec3(
				.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
				.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
				.25 + .75 * (.5 * (sin(pos.z) + 1.0))
			);
		`,

		lightGlsl: `
			vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
			float dotProduct1 = dot(surfaceNormal, lightDirection1);

			vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
			float dotProduct2 = dot(surfaceNormal, lightDirection2);

			float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
		`,

		cameraPos: [1, 1, 1, 1],
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => 3
	};
}

export function getE3SpheresData()
{
	return {
		...getE3BaseData(),

		distanceEstimatorGlsl: `
			float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

			return distance1;
		`,

		getColorGlsl: `
			return vec3(
				.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
			);
		`,

		lightGlsl: `
			vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
			float dotProduct1 = dot(surfaceNormal, lightDirection1);

			float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
		`,

		cameraPos: [0, 0, 0, 1],
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => 3
	};
}