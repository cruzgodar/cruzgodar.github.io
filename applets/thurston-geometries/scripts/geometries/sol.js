import { BaseGeometry } from "./base.js";

const numericalStepDistance = 0.0002;
const maxNumericalSteps = 20;

class SolGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl*/`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	fogGlsl = /* glsl*/`
		return color;//mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	`;

	functionGlsl = /* glsl*/`
		const float pi = ${Math.PI};
		
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

		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				exp(pos.z), 0.0, 0.0, 0.0,
				0.0, exp(-pos.z), 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		// Elliptic integral computations, sourced from
		// https://github.com/henryseg/non-euclidean_VR/blob/master/src/geometries/sol/geometry/shaders/part1.glsl,
		// which is in turn based on various sources in the literature.
		
		float mu;
		float k;
		float kPrime;
		float m;
		float K;
		float E;
		float L;

		const int maxAGMSteps = 20;
		
		// We can terminate the algorithm early, and this is the actual length of the data vector.
		int actualAGMSteps;

		const float minAGMError = 0.000001;

		// The results of the AGM algorithm at each step. Each entry is of the form
		// (arithmetic mean, geometric mean, error).
		vec3 AGMData[maxAGMSteps];

		// Equal to AGMData[actualAGMSteps - 1], which is invalid GLSL since it's not a compile-time
		// constant index.
		vec3 lastAGMData;

		// The sequence of arithmetic-geometric means converges to an elliptic integral,
		// and that's exactly what we need for some globals!
		// See: https://en.wikipedia.org/wiki/Elliptic_integral#Computation
		void runAGMAlgorithm()
		{
			// The starting values are 1 and kPrime. k starts as the initial error.
			vec3 data = vec3(1.0, kPrime, k);
			AGMData[0] = data;
			actualAGMSteps = 1;

			for (int i = 1; i < maxAGMSteps; i++)
			{
				// This doesn't seem to match the Wikipedia article, although it does match
				// https://en.wikipedia.org/wiki/Arithmetic%E2%80%93geometric_mean#The_number_%CF%80.
				float error = 0.5 * (data.x - data.y);

				if (error < minAGMError)
				{
					lastAGMData = data;
					break;
				}

				data = vec3(0.5 * (data.x + data.y), sqrt(data.x * data.y), error);
				AGMData[i] = data;
				actualAGMSteps = i;
			}
		}

		// Called every time the direction chages (i.e. when we start marching and when we teleport)
		void setGlobals(vec4 rayDirectionVec)
		{
			float absAB = abs(rayDirectionVec.x * rayDirectionVec.y);
			float root1Minus2AbsAB = sqrt(1.0 - 2.0 * absAB);
			float rootAbsAB = sqrt(absAB);
			
			mu = sqrt(1.0 + 2.0 * absAB);
			k = root1Minus2AbsAB / mu;
			kPrime = 2.0 * rootAbsAB / mu;
			m = (1.0 - 2.0 * absAB) / (1.0 + 2.0 * absAB);

			runAGMAlgorithm();

			// With that elliptic integral computed, we can compute K and E.
			K = 0.5 * pi / lastAGMData.x;

			float sumTotal = 0.0;

			for (int i = 0; i < maxAGMSteps; i++)
			{
				if (i == actualAGMSteps)
				{
					break;
				}

				sumTotal += pow(2.0, float(i - 1)) * AGMData[i].z * AGMData[i].z;
			}

			E = K * (1.0 - sumTotal);

			L = E / (kPrime * K) - 0.5 * kPrime;
		}

		const float numericalStepDistance = ${numericalStepDistance};
		const int maxNumericalSteps = ${maxNumericalSteps};

		// Flow from the origin numerically. Used when objects in the scene are extremely close.
		vec4 getUpdatedPosNumerically(vec4 rayDirectionVec, float t)
		{
			vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);
			vec4 dir = rayDirectionVec;

			int numSteps = int(floor(t / numericalStepDistance));

			for (int i = 0; i < maxNumericalSteps; i++)
			{
				if (i == numSteps)
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

		const float jacobiEllipticTolerance = 0.001;

		// Returns sn(u, m), cn(u, m), and dn(u, m).
		// See https://en.wikipedia.org/wiki/Jacobi_elliptic_functions.
		// Like most of the other math in this section, it's taken mostly
		// wholecloth from the noneuclidean VR repo (which itself is taken
		// partially wholecloth from other sources) --- the difference here
		// is that I understand the math in this function much less.
		vec3 computeJacobiEllipticFunctions(float u)
		{
			float uMod4K = mod(u, 4.0 * K);
			
			vec3 signVector = vec3(1.0);

			if (uMod4K > 2.0 * K)
			{
				uMod4K = 4.0 * K - uMod4K;
				signVector.x = -1.0;
			}

			if (uMod4K < jacobiEllipticTolerance)
			{
				// Series expansion about 0 of the Jacobi elliptic functions sn, cn and dn

				float k2 = m;
				float k4 = m * m;
				float k6 = k4 * m;

				float u1 = uMod4K;
				float u2 = u1 * uMod4K;
				float u3 = u2 * uMod4K;
				float u4 = u3 * uMod4K;
				float u5 = u4 * uMod4K;
				float u6 = u5 * uMod4K;
				float u7 = u6 * uMod4K;

				return signVector * vec3(
					u1
					- (1.0 + k2) * u3 / 6.0
					+ (1.0 + 14.0 * k2 + k4) * u5 / 120.0
					- (1.0 + 135.0 * k2 + 135.0 * k4 + k6) * u7 / 5040.0,

					1.0
					- u2 / 2.0
					+ (1.0 + 4.0 * k2) * u4 / 24.0
					- (1.0 + 44.0 * k2 + 16.0 * k4) * u6 / 720.0,

					1.0
					- k2 * u2 / 2.0
					+ k2 * (4.0 + k2) * u4 / 24.0
					- k2 * (16.0 + 44.0 * k2 + k4) * u6 / 720.0
				);
			}

			// This implementation comes ultimately (at least probably?)
			// from https://www.shadertoy.com/view/4tlBRl.

			float emc = 1.0 - m;

			float a = 1.0;
			float b;
			float c;

			float em[4];
			float en[4];

			float dn = 1.0;

			for (int i = 0; i < 4; i++)
			{
				em[i] = a;
				emc = sqrt(emc);
				en[i] = emc;
				c = 0.5 * (a + emc);
				emc *= a;
				a = c;
			}

			uMod4K *= c;

			float sn = sin(uMod4K);
			float cn = cos(uMod4K);

			if (sn != 0.0)
			{
				a = cn / sn;
				c *= a;

				for (int i = 3; i >= 0; i--)
				{
					b = em[i];
					a *= c;
					c *= dn;
					dn = (en[i] + a) / (b + a);
					a = c / b;
				}

				a = 1.0 / sqrt(c * c + 1.0);
				
				if (sn < 0.0)
				{
					sn = -a;
				}

				else
				{
					sn = a;
				}

				cn = c * sn;
			}

			return signVector * vec3(sn, cn, dn);
		}

		const float jacobiZetaTolerance = 0.001;
		// This is about as far as the project has gotten from my area of understanding.
		// It's sourced from the noneuclidean VR repo, like many other functions
		// in this shader.
		float computeJacobiZetaFunction(float tanPhi)
		{
			float t0 = abs(tanPhi);
			
			float result = 0.0;

			// The series expansion about 0.
			if (t0 < jacobiZetaTolerance)
			{
				float k2 = m;
				float k4 = k2 * m;
				float k6 = k4 * m;

				result = -(E / K - 1.0) * t0;
				result -= (1.0 / 6.0) * (E * k2 / K + k2 - 2.0 * E / K + 2.0) * pow(t0, 3.0);
				result -= (1.0 / 40.0) * (3.0 * E * k4 / K + k4 - 8.0 * E * k2 / K - 8.0 * k2 + 8.0 * E / K - 8.0) * pow(t0, 5.0);
				result -= (1.0 / 112.0) * (5.0 * E * k6 / K + k6 - 18.0 * E * k4 / K - 6.0 * k4 + 24.0 * E * k2 / K + 24.0 * k2 - 16.0 * E / K + 16.0) * pow(t0, 7.0);
			}

			else
			{
				float t1;
				float s1;
				float temp;

				for (int i = 0; i < maxAGMSteps; i++)
				{
					if (i == actualAGMSteps)
					{
						break;
					}

					temp = AGMData[i].y / AGMData[i].x;

					t1 = t0 * (1.0 + temp) / (1.0 - temp * t0 * t0);
					s1 = t0 * (1.0 + temp) / sqrt((1.0 + t0 * t0) * (1.0 + temp * temp * t0 * t0));

					result += AGMData[i + 1].z * s1;

					t0 = t1;
				}
			}

			return sign(tanPhi) * result;
		}

		// The full flow function, used in most cases.
		vec4 getUpdatedPosExactly(vec4 rayDirectionVec, float t)
		{
			// The convention used in the paper.
			float a = rayDirectionVec.x;
			float b = rayDirectionVec.y;
			float c = rayDirectionVec.z;

			float root1Minus2AbsAB = sqrt(1.0 - 2.0 * abs(a * b));

			float snAlpha = -c / root1Minus2AbsAB;
			float cnAlpha = (abs(a) - abs(b)) / root1Minus2AbsAB;
			float dnAlpha = (abs(a) + abs(b)) / mu;

			// The elliptic functions are periodic with period 4K.
			float muTimesTMod4K = mod(mu * t, 4.0 * K);

			// Now we'll plug this into the elliptic functions. In the paper, we need
			// an argument of alpha + mu*t, but first we'll get just mu*t.
			vec3 jacobiEllipticFunctions1 = computeJacobiEllipticFunctions(muTimesTMod4K);

			float denominator = 1.0 - m * jacobiEllipticFunctions1.x * jacobiEllipticFunctions1.x * snAlpha * snAlpha;

			vec3 jacobiEllipticFunctions2 = vec3(
				jacobiEllipticFunctions1.x * cnAlpha * dnAlpha
					+ snAlpha * jacobiEllipticFunctions1.y * jacobiEllipticFunctions1.z,
				jacobiEllipticFunctions1.y * cnAlpha
					- jacobiEllipticFunctions1.x * jacobiEllipticFunctions1.z * snAlpha * dnAlpha,
				jacobiEllipticFunctions1.z * dnAlpha
					- m * jacobiEllipticFunctions1.x * jacobiEllipticFunctions1.y * snAlpha * cnAlpha
			) / denominator;

			// Compute the Jacobi zeta function.
			float zeta = computeJacobiZetaFunction(
				jacobiEllipticFunctions1.x / jacobiEllipticFunctions1.y
			) - m * jacobiEllipticFunctions1.x * snAlpha * jacobiEllipticFunctions2.x;

			// Now *finally* we can compute the formula for gamma
			// from the paper.
			return vec4(
				sign(a) * sqrt(abs(b / a)) * (
					zeta / kPrime
					+ k * (jacobiEllipticFunctions2.x - snAlpha) / kPrime
					+ L * mu * t
				),
				sign(b) * sqrt(abs(a / b)) * (
					zeta / kPrime,
					- k * (jacobiEllipticFunctions2.x - snAlpha) / kPrime
					+ L * mu * t
				),
				0.5 * log(abs(b / a)) + asinh(k * jacobiEllipticFunctions2.y / kPrime),
				1.0
			);
		}

		const float flowNumericallyThreshhold = 0.002;

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			float a = rayDirectionVec.x;
			float b = rayDirectionVec.y;
			float c = rayDirectionVec.z;

			vec4 pos;
			
			if (t < flowNumericallyThreshhold)
			{
				pos = getUpdatedPosNumerically(rayDirectionVec, t);
			}

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
				pos = getUpdatedPosExactly(rayDirectionVec, t);
			}

			return getTransformationMatrix(startPos) * pos;
		}

		float approximateDistanceToOrigin(vec4 pos)
		{
			return length(vec3(exp(-pos.z) * pos.x, exp(pos.z) * pos.y, pos.z));
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
		return [
			pos[0] + t * dir[0] * Math.exp(pos[2]),
			pos[1] + t * dir[1] * Math.exp(-pos[2]),
			pos[2] + t * dir[2],
			pos[3]
		];
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
		float radius = 0.5;
		float distance1 = approximateDistanceToOrigin(pos) - radius;
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
		return .1;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}