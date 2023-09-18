import { ThurstonGeometry } from "./class.mjs";

const updateCameraPosFunctions = {
	S3: (cameraPos, tangentVec, dt) =>
	{
		for (let i = 0; i < 4; i++)
		{
			//This will change with the geometry.
			cameraPos[i] =
				Math.cos(dt) * cameraPos[i]
				+ Math.sin(dt) * tangentVec[i];
		}
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we just want the magnitude to be equal to 1
		const magnitude = ThurstonGeometry.magnitude(cameraPos);

		cameraPos[0] /= magnitude;
		cameraPos[1] /= magnitude;
		cameraPos[2] /= magnitude;
		cameraPos[3] /= magnitude;
	}
};



const getNormalVecFunctions = {
	S3: (cameraPos) =>
	{
		//f = x^2 + y^2 + z^2 + w^2 - 1.
		return ThurstonGeometry.normalize(cameraPos);
	}
};



const getGammaPrimeFunctions = {
	S3: (_pos, dir) =>
	{
		//gamma = cos(t)*pos + sin(t)*dir
		//gamma' = -sin(t)*pos + cos(t)*dir
		//gamma'' = -cos(t)*pos - sin(t)*dir
		//All of these are evaluated at t=0.
		return [...dir];
	}
};

const getGammaDoublePrimeFunctions = {
	S3: (pos) =>
	{
		return [-pos[0], -pos[1], -pos[2], -pos[3]];
	}
};



export const s3RoomsData = {
	updateCameraPos: updateCameraPosFunctions.S3,
	getNormalVec: getNormalVecFunctions.S3,
	getGammaPrime: getGammaPrimeFunctions.S3,
	getGammaDoublePrime: getGammaDoublePrimeFunctions.S3,

	distanceEstimatorGlsl: `
		float distance1 = acos(pos.x) - radius;
		float distance2 = acos(-pos.x) - radius;
		float distance3 = acos(pos.y) - radius;
		float distance4 = acos(-pos.y) - radius;
		float distance5 = acos(pos.z) - radius;
		float distance6 = acos(-pos.z) - radius;
		float distance7 = acos(pos.w) - radius;
		float distance8 = acos(-pos.w) - radius;

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

		return  -minDistance;
	`,

	getColorGlsl: `
		float distance1 = acos(pos.x) - radius;
		float distance2 = acos(-pos.x) - radius;
		float distance3 = acos(pos.y) - radius;
		float distance4 = acos(-pos.y) - radius;
		float distance5 = acos(pos.z) - radius;
		float distance6 = acos(-pos.z) - radius;
		float distance7 = acos(pos.w) - radius;
		float distance8 = acos(-pos.w) - radius;

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
			return vec3(.5, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}

		if (minDistance == distance8)
		{
			return vec3(1.0, 0.5, 0.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
	`,

	cameraPos: [0, 0, 0, -1],
	normalVec: [0, 0, 0, -1],
	upVec: [1, 0, 0, 0],
	rightVec: [0, 1, 0, 0],
	forwardVec: [0, 0, 1, 0],
};