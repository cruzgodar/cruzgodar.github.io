import { BaseGeometry } from "./base.js";

class SL2RGeometry extends BaseGeometry
{
	geodesicGlsl = /*glsl*/`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	normalizeGlsl = /*glsl*/`
		return normalize(dir);
	`;

	fogGlsl = /*glsl*/`
		return color;//mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	`;

	functionGlsl = /*glsl*/`
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

		// Projects a point p in the universal cover, i.e. H^2 x R, down to Q.
		vec4 projectToQ(vec4 p)
		{
			float denominator = sqrt(2.0 * p.z + 2.0);

			vec4 zetaOutput = vec4(
				sqrt((p.z + 1.0) * 0.5),
				0.0,
				p.x / denominator,
				p.y / denominator
			);

			float cosineTerm = cos(p.w * 0.5);
			float sineTerm = sin(p.w * 0.5);

			return mat4(
				cosineTerm, sineTerm, 0.0, 0.0,
				-sineTerm, cosineTerm, 0.0, 0.0,
				0.0, 0.0, cosineTerm, -sineTerm,
				0.0, 0.0, sineTerm, cosineTerm
			) * zetaOutput;
		}

		const mat2 E0 = mat2(1.0, 0.0, 0.0, 1.0);
		const mat2 E1 = mat2(0.0, -1.0, 1.0, 0.0);
		const mat2 E2 = mat2(0.0, 1.0, 1.0, 0.0);
		const mat2 E3 = mat2(1.0, 0.0, 0.0, -1.0);

		void applyH2Isometry(vec4 qElement, inout vec3 h2Element)
		{
			mat2 h2Matrix = -h2Element.x * E3 + h2Element.y * E2 + h2Element.z * E1;
			mat2 qMatrix = qElement.x * E0 + qElement.y * E1 + qElement.z * E2 + qElement.w * E3;

			// Inverse function doesn't work for whatever reason, so I'll just do this myself.
			mat2 qMatrixInv = mat2(
				qMatrix[1][1], -qMatrix[0][1],
				-qMatrix[1][0], qMatrix[0][0]
			) / (qMatrix[0][0] * qMatrix[1][1] - qMatrix[1][0] * qMatrix[0][1]);

			mat2 conjugatedh2Matrix = qMatrix * h2Matrix * qMatrixInv;

			h2Element = vec3(
				conjugatedh2Matrix[1][1],
				0.5 * (conjugatedh2Matrix[1][0] + conjugatedh2Matrix[0][1]),
				0.5 * (conjugatedh2Matrix[1][0] - conjugatedh2Matrix[0][1])
			);
		}

		const float root2Over2 = 0.70710678;
		
		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
			float kappa = sqrt(abs(c*c - a*a));
		
			vec4 pos;
		
			if (c > a)
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sin(trigArg);

				pos = vec4(
					2.0 * a / kappa * sineFactor * cos(trigArg),
					-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
					1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
					2.0 * c * t + 2.0 * atan(-c / kappa * tan(trigArg))
						- sign(c) * floor(0.5 * kappa * t / 3.14159265 + 0.5) * 6.28318531
						// Had to go digging in their code for this last term
						// since it's only referred to in the paper as a adjustment by
						// "the correct multiple of 2pi". This belongs in the paper!!
				);
			}

			else if (c == a)
			{
				pos = vec4(
					root2Over2 * t,
					-t * t * 0.25,
					1.0 + t * t * 0.25,
					2.0 * c * t - root2Over2 * t
				);
			}

			else
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sinh(trigArg);

				pos = vec4(
					2.0 * a / kappa * sineFactor * cosh(trigArg),
					-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
					1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
					2.0 * c * t + 2.0 * atan(-c / kappa * tanh(trigArg))
				);
			}

			// Apply r_alpha.
			pos.xy = mat2(
				cos(alpha), sin(alpha),
				-sin(alpha), cos(alpha)
			) * pos.xy;

			// Finally, translate this to the starting position, beginning by getting the element
			// of Q corresponding to this.
			vec4 qElement = projectToQ(startPos);

			// Now this element induces an isomorphism of H^2 by conjugation. We'll apply
			// it to the H^2 part of pos.
			applyH2Isometry(qElement, pos.xyz);

			pos.w += startPos.w;

			return pos;
		}
	`;
	
	// Just the same as in H^2 x E, since it's exactly the same model.
	correctPosition(pos)
	{
		const magnitude = Math.sqrt(
			-pos[0] * pos[0]
			- pos[1] * pos[1]
			+ pos[2] * pos[2]
		);

		return [
			pos[0] / magnitude,
			pos[1] / magnitude,
			pos[2] / magnitude,
			pos[3]
		];
	}

	// Just like correctPosition, this is dependent on the model, not the geodesics.
	// However, unlike H^2 x E, we're always staying at the origin in this geometry,
	// so we're always going to return [0, 0, 1, 0].
	getNormalVec()
	{
		return [0, 0, 1, 0];
	}

	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] - vec1[2] * vec2[2] + vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(Math.abs(this.dotProduct(vec, vec)));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}

	// Since we're at the origin, we just want all the vectors to be orthogonal to the
	// normal vector, i.e. [0, 0, 1, 0]. Since we're never moving and projecting liek we usually
	// do, this should take care of itself.
	correctVectors() {}
}

export class SL2RSpheres extends SL2RGeometry
{
	static distances = `
		float radius = .25;
		float distance1 = 1.0;
		
		// approximateDistanceToOrigin(pos);

		// if (distance1 > radius + 1.0)
		// {
		// 	distance1 -= radius;
		// }

		// else
		// {
		// 	distance1 = exactDistanceToOrigin(pos) - radius;
		// }
	`;

	distanceEstimatorGlsl = `
		${SL2RSpheres.distances}

		return distance1;
	`;

	getColorGlsl = `
		return vec3(1.0, 1.0, 1.0); 
	`;

	lightGlsl = `
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.0;
	`;

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [0, 0, 1, 0];
	normalVec = [0, 0, 1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}