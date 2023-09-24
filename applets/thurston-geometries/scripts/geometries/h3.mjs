import { ThurstonGeometry } from "../class.mjs";

function getH3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cosh(t) * cameraPos + sinh(t) * rayDirectionVec;",

		fogGlsl: `return mix(
			color,
			fogColor,
			0.0/*1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)*/
		);`,
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
		{
			const newCameraPos = [...cameraPos];

			for (let i = 0; i < 4; i++)
			{
				newCameraPos[i] = Math.cosh(dt) * newCameraPos[i] + Math.sinh(dt) * tangentVec[i];
			}
			
			//Since we're only doing a linear approximation, this position won't be exactly
			//on the manifold. Therefore, we'll do a quick correction to get it back.

			//Here, we just want the hyperbolic dot product to be -1.
			const magnitude =
				newCameraPos[0] * newCameraPos[0]
				+ newCameraPos[1] * newCameraPos[1]
				+ newCameraPos[2] * newCameraPos[2]
				- newCameraPos[3] * newCameraPos[3];

			newCameraPos[0] /= -magnitude;
			newCameraPos[1] /= -magnitude;
			newCameraPos[2] /= -magnitude;
			newCameraPos[3] /= -magnitude;

			return newCameraPos;
		},

		getNormalVec: (cameraPos) =>
		{
			//f = x^2 + y^2 + z^2 - w^2 + 1.
			return ThurstonGeometry.normalize([
				cameraPos[0],
				cameraPos[1],
				cameraPos[2],
				-cameraPos[3]
			]);
		},

		getGammaPrime: (_pos, dir) =>
		{
			//gamma = cosh(t)*pos + sinh(t)*dir
			//gamma' = sinh(t)*pos + cosh(t)*dir
			//gamma'' = cosh(t)*pos + sinh(t)*dir
			//gamma'' = sinh(t)*pos + cosh(t)*dir
			//All of these are evaluated at t=0.
			return [...dir];
		},

		getGammaDoublePrime: (pos) =>
		{
			return [...pos];
		},

		getGammaTriplePrime: (_pos, dir) =>
		{
			return [...dir];
		},

		gammaTriplePrimeIsLinearlyIndependent: false
	};
}

export function getH3SpheresData()
{
	return {
		...getH3BaseData(),

		distanceEstimatorGlsl: `
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
		`,

		getColorGlsl: `
			return vec3(1.0, 0.0, 0.0);
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

		cameraPos: [0, 0, 0, 1],
		normalVec: [0, 0, 0, -1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		//The distance to the origin is acosh(pos.w), so we want to move at 1 over that.
		getMovingSpeed: (cameraPos) => Math.min(1 / Math.acosh(cameraPos[3]), 1),
	};
}