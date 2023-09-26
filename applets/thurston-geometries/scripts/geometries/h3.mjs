import { ThurstonGeometry } from "../class.mjs";

function getH3BaseData()
{
	return {
		geodesicGlsl: "vec4 pos = cosh(t) * cameraPos + sinh(t) * rayDirectionVec;",

		fogGlsl: `return mix(
			color,
			fogColor,
			0.0//1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)
		);`,

		functionGlsl: `float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}`,

		customDotProduct: (vec1, vec2) =>
		{
			return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] - vec1[3] * vec2[3];
		},
		
		updateCameraPos: (cameraPos, tangentVec, dt) =>
		{
			const newCameraPos = new Array(4);

			for (let i = 0; i < 4; i++)
			{
				newCameraPos[i] = Math.cosh(dt) * cameraPos[i] + Math.sinh(dt) * tangentVec[i];
			}
			
			//Since we're only doing a linear approximation, this position won't be exactly
			//on the manifold. Therefore, we'll do a quick correction to get it back.

			//Here, we just want the hyperbolic dot product to be -1.
			const magnitude = Math.sqrt(
				-newCameraPos[0] * newCameraPos[0]
				- newCameraPos[1] * newCameraPos[1]
				- newCameraPos[2] * newCameraPos[2]
				+ newCameraPos[3] * newCameraPos[3]
			);

			newCameraPos[0] /= magnitude;
			newCameraPos[1] /= magnitude;
			newCameraPos[2] /= magnitude;
			newCameraPos[3] /= magnitude;

			return newCameraPos;
		},

		getNormalVec: (cameraPos) =>
		{
			//f = -1 - x^2 - y^2 - z^2 + w^2.
			return ThurstonGeometry.normalize([
				-cameraPos[0],
				-cameraPos[1],
				-cameraPos[2],
				cameraPos[3]
			]);
		},

		getGammaPrime: (_pos, dir) =>
		{
			//gamma = cosh(t)*pos + sinh(t)*dir
			//gamma' = sinh(t)*pos + cosh(t)*dir
			//gamma'' = cosh(t)*pos + sinh(t)*dir
			//gamma''' = sinh(t)*pos + cosh(t)*dir
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
			float distance1 = acosh(dot(pos, vec4(0.0, 0.0, 0.0, 1.0))) - 1.0;
			float distance2 = acosh(dot(pos, vec4(1.0, 1.0, -1.0, 2.0))) - 1.0;
			float distance3 = acosh(dot(pos, vec4(1.0, -1.0, 1.0, 2.0))) - 1.0;
			float distance4 = acosh(dot(pos, vec4(1.0, -1.0, -1.0, 2.0))) - 1.0;
			float distance5 = acosh(dot(pos, vec4(-1.0, 1.0, 1.0, 2.0))) - 1.0;
			float distance6 = acosh(dot(pos, vec4(-1.0, 1.0, -1.0, 2.0))) - 1.0;
			float distance7 = acosh(dot(pos, vec4(-1.0, -1.0, 1.0, 2.0))) - 1.0;
			float distance8 = acosh(dot(pos, vec4(-1.0, -1.0, -1.0, 2.0))) - 1.0;

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

			return minDistance;
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
		normalVec: [0, 0, 0, 1],
		upVec: [0, 0, 1, 0],
		rightVec: [0, 1, 0, 0],
		forwardVec: [1, 0, 0, 0],

		getMovingSpeed: () => .25,
	};
}