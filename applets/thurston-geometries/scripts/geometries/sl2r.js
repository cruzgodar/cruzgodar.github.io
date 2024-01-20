import { ThurstonGeometry } from "../class.js";
import { BaseGeometry } from "./base.js";

class SL2RGeometry extends BaseGeometry
{
	raymarchSetupGlsl = /*glsl*/`
		float startFiber = cameraFiber;
	`;

	geodesicGlsl = /*glsl*/`
		vec4 pos;
		float fiber;
		getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
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

		// Given an element in SL(2, R), returns an isometry sending the origin to that point.
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				pos.x, pos.y, pos.z, pos.w,
				-pos.y, pos.x, pos.w, -pos.z,
				pos.z, pos.w, pos.x, pos.y,
				pos.w, -pos.z, -pos.y, pos.x
			);
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
					//Weird that this one is negative
					-qElement.w, qElement.z, qElement.y, 0.0
				) * mat4(
					qElement.x, qElement.y, qElement.z, qElement.w,
					-qElement.y, qElement.x, qElement.w, -qElement.z,
					qElement.z, qElement.w, qElement.x, qElement.y,
					0.0, 0.0, 0.0, 0.0
				)
			) * h2Element;
		}

		// A special case of the previous function that acts on (0, 0, 1).
		vec3 getH2Element(vec4 qElement)
		{
			return vec3(
				2.0 * qElement.x * qElement.z - 2.0 * qElement.y * qElement.w,
				2.0 * qElement.x * qElement.w + 2.0 * qElement.y * qElement.z,
				qElement.x * qElement.x + qElement.y * qElement.y + qElement.z * qElement.z + qElement.w * qElement.w
			);
		}

		const float root2Over2 = 0.70710678;
		
		void getUpdatedPos(
			vec4 startPos,
			float startFiber,
			vec4 rayDirectionVec,
			float t,
			inout vec4 pos,	
			inout float fiber
		) {
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
			float kappa = sqrt(abs(c*c - a*a));

			vec4 eta;

			if (abs(c) == a)
			{
				eta = vec4(1.0, -0.5 * root2Over2 * t, 0.5 * root2Over2 * t, 0.0);

				fiber = 2.0 * c * t + 2.0 * atan(-0.5 * root2Over2 * t);
			}
		
			else if (abs(c) > a)
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sin(trigArg);

				eta = vec4(cos(trigArg), -c / kappa * sineFactor, a / kappa * sineFactor, 0.0);
				
				// Had to go digging in their code for this last term
				// since it's only referred to in the paper as a adjustment by
				// "the correct multiple of 2pi". This belongs in the paper!!
				fiber = 2.0 * c * t + 2.0 * atan(-c / kappa * tan(trigArg))
					- sign(c) * floor(0.5 * kappa * t / 3.14159265 + 0.5) * 6.28318531;
			}

			else
			{
				float trigArg = kappa * t * 0.5;
				float sinhFactor = sinh(trigArg);

				eta = vec4(cosh(trigArg), -c / kappa * sinhFactor, a / kappa * sinhFactor, 0.0);

				fiber = 2.0 * c * t + 2.0 * atan(-c / kappa * tanh(trigArg));
			}

			// This is eta * ksi, where ksi = (cos(ct), sin(ct), 0, 0) and the multiplication
			// is group multiplication in SL(2, R).
			float sinct = sin(c * t);
			float cosct = cos(c * t);

			eta = vec4(
				eta.x * cosct - eta.y * sinct,
				eta.x * sinct + eta.y * cosct,
				eta.z * cosct,
				-eta.z * sinct
			);

			// Finally, apply R_alpha.
			float sinAlpha = sin(alpha);
			float cosAlpha = cos(alpha);

			eta.zw = vec2(cosAlpha * eta.z - sinAlpha * eta.w, sinAlpha * eta.z + cosAlpha * eta.w);

			// What we have at this point is eta in SL(2, R) and fiber, together specifying
			// a point in the universal cover after flowing from the origin for time t. We now
			// need to translate these to startPos and startFiber, respectively.
			pos = getTransformationMatrix(startPos) * eta;

			fiber += startFiber;
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

		float exactDistanceToOrigin(vec4 pos, float fiber)
		{
			// If the fiber component is negative, we need to apply the flip symmetry.
			if (fiber < 0.0)
			{
				pos = vec4(pos.x, -pos.y, pos.w, pos.z);
				fiber = -fiber;
			}

			// float rho = asinh(length(pos.xy));

			// float phi = chiZero(rho, pos.w);

			// Now we have phi, and so we should be able to solve for t. This is easier said than done :/
			return 0.0;
		}

		float approximateDistanceToOrigin(vec4 pos, float fiber)
		{
			vec3 h2Element = getH2Element(pos);

			float acoshTerm = acosh(h2Element.z * h2Element.z - h2Element.x * h2Element.x - h2Element.y * h2Element.y);
			float sigma = 0.5 * sqrt(acoshTerm * acoshTerm + fiber * fiber);

			return sigma;
		}

		float distanceToHalfPlane(vec4 pos)
		{
			vec3 h2Element = getH2Element(pos);

			return abs(asinh(h2Element.x));
		}
	`;

	usesFiberComponent = true;
	
	// Since cameraPos represents an element of SL(2, R), we want the determinant to be 1.
	correctPosition(pos)
	{
		const magnitude = Math.sqrt(
			pos[0] * pos[0]
			+ pos[1] * pos[1]
			- pos[2] * pos[2]
			- pos[3] * pos[3]
		);

		return [
			pos[0] / magnitude,
			pos[1] / magnitude,
			pos[2] / magnitude,
			pos[3] / magnitude
		];
	}

	getNormalVec()
	{
		return [0, 0, 1, 0];
	}

	followGeodesic(pos, dir, t)
	{
		const a = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
		const c = dir[3];
		const kappa = Math.sqrt(Math.abs(c * c - a * a));

		let eta;
		let fiber;

		if (Math.abs(c) === a)
		{
			eta = [1, -0.35355339 * t, 0.5 * t, 0];
			fiber = 2 * c * t + 2 * Math.atan(-0.35355339 * t);
		}
		
		else if (Math.abs(c) > a)
		{
			const trigArg = kappa * t * 0.5;
			const sineFactor = Math.sin(trigArg);

			eta = [Math.cos(trigArg), -c / kappa * sineFactor, 1 / kappa * sineFactor, 0];
			fiber = 2 * c * t + 2 * Math.atan(-c / kappa * Math.tan(trigArg))
				- Math.sign(c) * Math.floor(0.5 * kappa * t / Math.PI + 0.5) * 2 * Math.PI;
		}

		else
		{
			const trigArg = kappa * t * 0.5;
			const sinhFactor = Math.sinh(trigArg);

			eta = [Math.cosh(trigArg), -c / kappa * sinhFactor, 1 / kappa * sinhFactor, 0];
			fiber = 2 * c * t + 2 * Math.atan(-c / kappa * Math.tanh(trigArg));
		}

		// This is eta * ksi, where ksi = (cos(ct), sin(ct), 0, 0) and the multiplication
		// is group multiplication in SL(2, R).
		const sinct = Math.sin(c * t);
		const cosct = Math.cos(c * t);
		
		eta = [
			eta[0] * cosct - eta[1] * sinct,
			eta[0] * sinct + eta[1] * cosct,
			eta[2] * cosct,
			-eta[2] * sinct
		];

		// This is a trick they use in the repo that isn't in the paper for who
		// knows what reason. Here, we rotate by the direction vector itself instead
		// of the alpha expression -- without this, movement in the space is extremely
		// glitchy.

		eta = ThurstonGeometry.mat4TimesVector([
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, dir[0], -dir[1]],
			[0, 0, dir[1], dir[0]]
		], eta);

		this.cameraFiber += fiber;

		return ThurstonGeometry.mat4TimesVector([
			[pos[0], -pos[1], pos[2], pos[3]],
			[pos[1], pos[0], pos[3], -pos[2]],
			[pos[2], pos[3], pos[0], -pos[1]],
			[pos[3], -pos[2], pos[1], pos[0]]
		], eta);
	}

	// Since we're at the origin, we just want all the vectors to be orthogonal to the
	// normal vector, i.e. [0, 0, 1, 0]. Since we're never moving and projecting like we usually
	// do, this should take care of itself.
	correctVectors() {}
}

export class SL2RSpheres extends SL2RGeometry
{
	static distances = /*glsl*/`
		float radius = .25;
		float distance1 = distanceToHalfPlane(pos);
		float distance2 = approximateDistanceToOrigin(pos, fiber);
	`;

	distanceEstimatorGlsl = /*glsl*/`
		${SL2RSpheres.distances}

		return distance1;
	`;

	getColorGlsl = /*glsl*/`
		return vec3(0.5, 0.5, 0.5) * getBanding(pos.w, 10.0);
	`;

	lightGlsl = /*glsl*/`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.0;//max(dotProduct1, dotProduct2);
	`;

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [1, 0, 0, 0];
	cameraFiber = 0;

	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = /*glsl*/`
		uniform float cameraFiber;
	`;

	uniformNames = ["cameraFiber"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["cameraFiber"], this.cameraFiber);
	}
}