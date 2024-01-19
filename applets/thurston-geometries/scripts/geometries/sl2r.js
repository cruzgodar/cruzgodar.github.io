import { BaseGeometry } from "./base.js";

class SL2RGeometry extends BaseGeometry
{
	geodesicGlsl = /*glsl*/`
		float fiber;
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t, fiber);

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

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		float atanh(float x)
		{
			return 0.5 * log((1.0 + x) / (1.0 - x));
		}

		// Projects a point p in the universal cover, i.e. H^2 x R, down to Q, via the map lambda.
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
			// Yet another thing that should be in the paper but is only knowable
			// by digging around in their code. I'd prefer to use mat4x3 and mat3x4 here,
			// but WebGL doesn't seem to understand.
			h2Element = mat3(
				mat4(
					qElement.x, qElement.y, qElement.z, 0.0,
					-qElement.y, qElement.x, qElement.w, 0.0,
					qElement.z, qElement.w, qElement.x, 0.0,
					-qElement.w, qElement.z, qElement.y, 0.0
				) * mat4(
					qElement.x, qElement.y, qElement.z, qElement.w,
					-qElement.y, qElement.x, qElement.w, -qElement.z,
					qElement.z, qElement.w, qElement.x, qElement.y,
					0.0, 0.0, 0.0, 0.0
				)
			) * h2Element;
		}

		const float root2Over2 = 0.70710678;
		
		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t, inout float fiber)
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

		const float pi = 3.14159265;
		const float piOver2 = 1.5707963;

		float chi(float rho, float w, float phi)
		{
			float sinhTerm = sinh(rho * 0.5);
			float coshTerm = cosh(rho * 0.5);
			float tanPhi = tan(phi);

			if (phi == -piOver2)
			{
				// Typo in the paper: they have -2*cosh rather than pi*cosh, likely because
				// they forgot to write pi/2 factored out of the whole thing.
				return -0.5 * w + phi + pi * coshTerm;
			}

			if (abs(tanPhi) == sinhTerm)
			{
				return -0.5 * w + phi - 2.0 * tanPhi;
			}

			float sqrtTerm = sqrt(abs(sinhTerm * sinhTerm - tanPhi * tanPhi));

			if (abs(tanPhi) < sinhTerm)
			{
				return -0.5 * w + phi - 2.0 * tanPhi * coshTerm / sqrtTerm * atanh(sqrtTerm / coshTerm);
			}

			return -0.5 * w + phi - 2.0 * tanPhi * coshTerm / sqrtTerm * (
				atan(sqrtTerm / coshTerm) - sign(tanPhi) * floor(0.5 - phi / pi) * pi
			);
		}

		float chiPrime(float rho, float w, float phi)
		{
			float sinhTerm = sinh(rho * 0.5);
			float coshTerm = cosh(rho * 0.5);
			float tanPhi = tan(phi);
			float cosPhi = cos(phi);

			if (phi == -piOver2)
			{
				return -cosh(rho);
			}

			if (abs(tanPhi) == sinhTerm)
			{
				return .33333 * (-2.0 - cosh(rho));
			}

			float sqrtArg = abs(sinhTerm * sinhTerm - tanPhi * tanPhi);
			float sqrtTerm = sqrt(sqrtArg);

			float atanhTerm = atanh(sqrtTerm / coshTerm);

			if (abs(tanPhi) < sinhTerm)
			{
				return 1.0 - (2.0 * atanhTerm * coshTerm * tanPhi * tanPhi)
					/ (sqrtArg * sqrtTerm * cosPhi * cosPhi)
				- (2.0 * atanhTerm * coshTerm) / (sqrtTerm * cosPhi * cosPhi)
				+ (2.0 * tanPhi * tanPhi) / (cosPhi * cosPhi * sqrtArg * (
					1.0 - sqrtArg / (coshTerm * coshTerm)
				));
			}

			if (phi > -piOver2)
			{
				return 1.0 + (2.0 * atanhTerm * coshTerm * tanPhi * tanPhi)
					/ (sqrtArg * sqrtTerm * cosPhi * cosPhi)
				- (2.0 * atanhTerm * coshTerm) / (sqrtTerm * cosPhi * cosPhi)
				- (2.0 * tanPhi * tanPhi) / (cosPhi * cosPhi * sqrtArg * (
					1.0 + sqrtArg / (coshTerm * coshTerm)
				));
			}

			return 1.0 + (2.0 * (atanhTerm - pi) * coshTerm * tanPhi * tanPhi)
					/ (sqrtArg * sqrtTerm * cosPhi * cosPhi)
				- (2.0 * (atanhTerm - pi) * coshTerm) / (sqrtTerm * cosPhi * cosPhi)
				- (2.0 * tanPhi * tanPhi) / (cosPhi * cosPhi * sqrtArg * (
					1.0 + sqrtArg / (coshTerm * coshTerm)
				));
		}
		
		const int newtonIterations = 5;
		
		// Returns the unique zero in (-pi, 0] of chi. w must be positive, so apply the flip transformation before doing this if it's not.
		float chiZero(float rho, float w)
		{
			// The minimum phi for which 
			float M = atan(abs(sinh(rho * 0.5))) - pi;

			float phi = 0.5 * M;

			for (int iteration = 0; iteration < newtonIterations; iteration++)
			{
				phi -= chi(rho, w, phi) / chiPrime(rho, w, phi);
			}

			return phi;
		}

		float exactDistanceToOrigin(vec4 pos)
		{
			// If w is negative, we need to flip the whole z-axis.
			if (pos.w < 0.0)
			{
				pos = vec4(pos.y, pos.x, pos.z, -pos.w);
			}

			// float rho = asinh(length(pos.xy));

			// float phi = chiZero(rho, pos.w);

			// Now we have phi, and so we should be able to solve for t. This is easier said than done :/
			return 0.0;
		}

		float approximateDistanceToOrigin(vec4 pos)
		{
			float acoshTerm = acosh(pos.z * pos.z - pos.x * pos.x - pos.y * pos.y);
			float sigma = 0.5 * sqrt(acoshTerm * acoshTerm + pos.w * pos.w);

			return sigma;
		}

		float distanceToHalfPlane(vec4 pos)
		{
			vec4 qElement = projectToQ(pos);
			vec3 h2Element = vec3(0.0, 0.0, 1.0);
			
			applyH2Isometry(qElement, h2Element);

			return abs(asinh(h2Element.x));
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
	static distances = /*glsl*/`
		float radius = .25;
		float distance1 = distanceToHalfPlane(pos);
	`;

	distanceEstimatorGlsl = /*glsl*/`
		${SL2RSpheres.distances}

		return distance1;
	`;

	getColorGlsl = /*glsl*/`
		return vec3(0.5, 0.5, 0.5); 
	`;

	lightGlsl = /*glsl*/`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = max(dotProduct1, dotProduct2);
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