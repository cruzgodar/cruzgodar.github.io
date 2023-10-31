import { ThurstonGeometry } from "../class.mjs";

function getS3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;",

		fogGlsl: "return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));",

		customDotProduct: (vec1, vec2) =>
		{
			return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] + vec1[3] * vec2[3];
		},
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
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
		},

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
		},

		getNormalVec: (cameraPos) =>
		{
			//f = 1 - x^2 - y^2 - z^2 - w^2.
			return ThurstonGeometry.normalize([
				-cameraPos[0],
				-cameraPos[1],
				-cameraPos[2],
				-cameraPos[3]
			]);
		},

		getGammaPrime: (_pos, dir) =>
		{
			//gamma = cos(t)*pos + sin(t)*dir
			//gamma' = -sin(t)*pos + cos(t)*dir
			//gamma'' = -cos(t)*pos - sin(t)*dir
			//gamma''' = sin(t)*pos - cos(t)*dir
			//All of these are evaluated at t=0.
			return [...dir];
		},

		getGammaDoublePrime: (pos) =>
		{
			return [-pos[0], -pos[1], -pos[2], -pos[3]];
		},

		getGammaTriplePrime: (_pos, dir) =>
		{
			return [-dir[0], -dir[1], -dir[2], -dir[3]];
		},

		gammaTriplePrimeIsLinearlyIndependent: false
	};
}



export function getS3RoomsData()
{
	return {
		...getS3BaseData(),

		distanceEstimatorGlsl: `
			float distance1 = acos(pos.x) - .92;
			float distance2 = acos(-pos.x) - .92;
			float distance3 = acos(pos.y) - .92;
			float distance4 = acos(-pos.y) - .92;
			float distance5 = acos(pos.z) - .92;
			float distance6 = acos(-pos.z) - .92;
			float distance7 = acos(pos.w) - .92;
			float distance8 = acos(-pos.w) - .92;

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
			float distance1 = acos(pos.x) - .92;
			float distance2 = acos(-pos.x) - .92;
			float distance3 = acos(pos.y) - .92;
			float distance4 = acos(-pos.y) - .92;
			float distance5 = acos(pos.z) - .92;
			float distance6 = acos(-pos.z) - .92;
			float distance7 = acos(pos.w) - .92;
			float distance8 = acos(-pos.w) - .92;

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
		`,

		cameraPos: [0, 0, 0, -1],
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => 1
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
		`,

		cameraPos: [0, 0, 0, -1],
		normalVec: [0, 0, 0, -1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => 1
	};
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

	return [`float distance${index} = greatCircleDistance(
		pos,
		vec4(${vec1[0]}, ${vec1[1]}, ${vec1[2]}, ${vec1[3]}),
		vec4(${vec2[0]}, ${vec2[1]}, ${vec2[2]}, ${vec2[3]}),
		.025);
	`, rgb];
}

function getMinDistanceCode(numFibers)
{
	let minDistanceCode = "float minDistance = ";

	for (let i = 0; i < numFibers - 1; i++)
	{
		minDistanceCode += `min(distance${i}, `;
	}

	minDistanceCode += `distance${numFibers - 1}` + ")".repeat(numFibers - 1) + ";";

	return minDistanceCode;
}

function getColorCode(numFibers, colors)
{
	let colorCode = "";

	for (let i = 0; i < numFibers; i++)
	{
		colorCode += `if (minDistance == distance${i}) { return vec3(${colors[i][0] / 255}, ${colors[i][1] / 255}, ${colors[i][2] / 255}); }
		`;
	}

	return colorCode;
}

export function getS3HopfFibrationData()
{
	const numFibers = 20;

	let distanceEstimatorGlsl = "";

	const colors = new Array(numFibers);

	for (let i = 0; i < numFibers; i++)
	{
		const result = getHopfFiber(i, numFibers);
		distanceEstimatorGlsl += result[0];
		colors[i] = result[1];
	}

	distanceEstimatorGlsl += getMinDistanceCode(numFibers);

	const getColorGlsl = distanceEstimatorGlsl + getColorCode(numFibers, colors);

	distanceEstimatorGlsl += "return minDistance;";



	return {
		...getS3BaseData(),

		functionGlsl: `
			//p and v must be orthonormal.
			float greatCircleDistance(vec4 pos, vec4 p, vec4 v, float r)
			{
				float dot1 = dot(pos, p);
				float dot2 = dot(pos, v);

				return acos(sqrt(dot1 * dot1 + dot2 * dot2)) - r;
			}
		`,

		distanceEstimatorGlsl,

		getColorGlsl,

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
		`,

		cameraPos: [0, 0, 0, -1],
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => 1
	};
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