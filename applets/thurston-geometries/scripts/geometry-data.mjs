import { ThurstonGeometry } from "./class.mjs";

function getE3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cameraPos + t * rayDirectionVec;",

		fogGlsl: "return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));",
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
		{
			for (let i = 0; i < 4; i++)
			{
				cameraPos[i] = cameraPos[i] + dt * tangentVec[i];
			}
			
			//Since we're only doing a linear approximation, this position won't be exactly
			//on the manifold. Therefore, we'll do a quick correction to get it back.
		},

		getNormalVec: () =>
		{
			//f = w - 1.
			return [0, 0, 0, 1];
		},

		getGammaPrime: (pos, dir) =>
		{
			//gamma = (1 -t)*pos + t*dir
			//gamma' = -pos + dir
			//gamma'' = 0
			//All of these are evaluated at t=0.
			return [-pos[0] + dir[0], -pos[1] + dir[1], -pos[2] + dir[2], -pos[3] + dir[3]];
		},

		getGammaDoublePrime: () =>
		{
			return [0, 0, 0, 0];
		},

		cameraPos: [0, 0, 0, 1],
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		movingSpeed: 2,
	};
}

function getS3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;",

		fogGlsl: "return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));",
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
		{
			for (let i = 0; i < 4; i++)
			{
				cameraPos[i] = Math.cos(dt) * cameraPos[i] + Math.sin(dt) * tangentVec[i];
			}
			
			//Since we're only doing a linear approximation, this position won't be exactly
			//on the manifold. Therefore, we'll do a quick correction to get it back.

			//Here, we just want the magnitude to be equal to 1
			const magnitude = ThurstonGeometry.magnitude(cameraPos);

			cameraPos[0] /= magnitude;
			cameraPos[1] /= magnitude;
			cameraPos[2] /= magnitude;
			cameraPos[3] /= magnitude;
		},

		getNormalVec: (cameraPos) =>
		{
			//f = x^2 + y^2 + z^2 + w^2 - 1.
			return ThurstonGeometry.normalize(cameraPos);
		},

		getGammaPrime: (_pos, dir) =>
		{
			//gamma = cos(t)*pos + sin(t)*dir
			//gamma' = -sin(t)*pos + cos(t)*dir
			//gamma'' = -cos(t)*pos - sin(t)*dir
			//All of these are evaluated at t=0.
			return [...dir];
		},

		getGammaDoublePrime: (pos) =>
		{
			return [-pos[0], -pos[1], -pos[2], -pos[3]];
		},

		cameraPos: [0, 0, 0, -1],
		normalVec: [0, 0, 0, -1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		movingSpeed: 1,
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

			float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1);
		`
	};
}

export function getS3RoomsData()
{
	return {
		...getS3BaseData(),

		distanceEstimatorGlsl: `
			float distance1 = acos(pos.x) - .9;
			float distance2 = acos(-pos.x) - .9;
			float distance3 = acos(pos.y) - .9;
			float distance4 = acos(-pos.y) - .9;
			float distance5 = acos(pos.z) - .9;
			float distance6 = acos(-pos.z) - .9;
			float distance7 = acos(pos.w) - .9;
			float distance8 = acos(-pos.w) - .9;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			return -minDistance;
		`,

		getColorGlsl: `
			float distance1 = acos(pos.x) - .9;
			float distance2 = acos(-pos.x) - .9;
			float distance3 = acos(pos.y) - .9;
			float distance4 = acos(-pos.y) - .9;
			float distance5 = acos(pos.z) - .9;
			float distance6 = acos(-pos.z) - .9;
			float distance7 = acos(pos.w) - .9;
			float distance8 = acos(-pos.w) - .9;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			if (minDistance == distance1)
			{
				return vec3(1.0, 0.0, 0.0);
			}

			if (minDistance == distance2)
			{
				return vec3(0.0, 1.0, 1.0);
			}

			if (minDistance == distance3)
			{
				return vec3(0.0, 1.0, 0.0);
			}

			if (minDistance == distance4)
			{
				return vec3(1.0, 0.0, 1.0);
			}

			if (minDistance == distance5)
			{
				return vec3(0.0, 0.0, 1.0);
			}

			if (minDistance == distance6)
			{
				return vec3(1.0, 1.0, 0.0);
			}

			if (minDistance == distance7)
			{
				return vec3(1.0, 0.5, 0.0);
			}

			if (minDistance == distance8)
			{
				return vec3(.5, 0.0, 1.0);
			}
		`,

		lightGlsl: `
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
		`
	};
}

export function getS3SpheresData()
{
	return {
		...getS3BaseData(),

		distanceEstimatorGlsl: `
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

			return minDistance;
		`,

		getColorGlsl: `
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

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
		`,

		lightGlsl: `
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
		`
	};
}