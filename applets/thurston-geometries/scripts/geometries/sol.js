import { sliderValues } from "../index.js";
import { BaseGeometry } from "./base.js";
import { $ } from "/scripts/src/main.js";

class SolGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl*/`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	fogGlsl = /* glsl*/`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	`;

	functionGlsl = /* glsl*/`
		float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float tanh(float x)
		{
			float expTerm = exp(2.0 * x);

			return (expTerm - 1.0) / (expTerm + 1.0);
		}

		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				exp(pos.z), 0.0, 0.0, 0.0,
				0.0, exp(-pos.z), 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		// Flow from the origin numerically. Used when objects in the scene are extremely close.
		const float numericalStepDistance = 0.0002;
		const int maxNumericalSteps = 100;
		vec4 getUpdatedPosNumerically(vec4 rayDirectionVec, float t)
		{
			vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);
			vec4 dir = rayDirectionVec;

			int numSteps = int(floor(t / numericalStepDistance));

			for (int i = 0; i < maxNumericalSteps; i++)
			{
				if (i >= numSteps)
				{
					break;
				}

				// This translates dir to pos.
				pos += numericalStepDistance * dir * vec4(exp(pos.z), exp(-pos.z), 1.0, 0.0);
				dir += numericalStepDistance * vec4(
					dir.x * dir.z,
					-dir.y * dir.z,
					-dir.x * dir.x + dir.y * dir.y,
					0.0
				);

				// Normalize the direction.
				float dirMagnitude = sqrt(
					exp(-2.0 * dir.z) * dir.x * dir.x
					+ exp(2.0 * dir.z) * dir.y * dir.y
					+ dir.z * dir.z
				);

				dir /= dirMagnitude;
			}

			return pos;
		}

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float a = abs(rayDirectionVec.x);
			float b = abs(rayDirectionVec.y);
			float c = rayDirectionVec.z;

			vec4 pos;
		
			// All the following formulas get differentiated dt.
			if (a == 0.0)
			{
				float tanhT = tanh(t);

				pos = vec4(
					0.0,
					b * tanhT / (1.0 + c * tanhT),
					log(cosh(t) + c * sinh(t)),
					1.0
				);
			}
		
			else if (b == 0.0)
			{
				float tanhT = tanh(t);

				pos = vec4(
					a * tanhT / (1.0 - c * tanhT),
					0.0,
					-log(cosh(t) - c * sinh(t)),
					1.0
				);
			}
			
			else
			{
				// Following the paper, there are quite a few different strategies
				// used at this point.
				pos = vec4(0.0, 0.0, 0.0, 1.0);
			}

			return pos;
		}
	`;

	
	normalize(vec)
	{
		const expFactor = Math.exp(2 * vec[2]);

		const magnitude = Math.sqrt(
			vec[0] * vec[0] / expFactor
			+ vec[1] * vec[1] * expFactor
			+ vec[2] * vec[2]
		);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
	
	// Frustratingly, doing a linear approximation produces weird movement patterns in Nil.
	followGeodesic(pos, dir, t)
	{
		
	}

	getNormalVec()
	{
		return [0, 0, 0, 1];
	}

	correctVectors() {}
}

export class SolRooms extends SolGeometry
{
	static distances = /* glsl*/`
		float radius = wallThickness;
		float distance1 = 0.0;
	`;

	distanceEstimatorGlsl = /* glsl*/`
		${SolRooms.distances}

		float minDistance = distance1;

		return minDistance;
	`;

	getColorGlsl = /* glsl*/`
		// return vec3(
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.x + baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.y + baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.z + baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		// );

		return vec3(0.5, 0.5, 0.5);
	`;

	lightGlsl = /* glsl*/`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(3.0, 2.0, 0.5, 1.0) - pos);
		float dotProduct3 = .5 * dot(surfaceNormal, lightDirection3);

		float lightIntensity = 1.2 * lightBrightness * max(max(abs(dotProduct1), abs(dotProduct2)), abs(dotProduct3));

		lightIntensity = 1.0;
	`;

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = /* glsl*/`
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["wallThickness"], .703 - sliderValues.wallThickness / 10);
		gl.uniform3fv(uniformList["baseColor"], [0,0, 0]);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.72;
		wallThicknessSlider.max = .78;
		wallThicknessSlider.value = .78;
		wallThicknessSliderValue.textContent = .78;
		sliderValues.wallThickness = .78;
	}
}