import { BaseGeometry, getMaxGlslString } from "./base.js";

const numericalStepDistance = 0.00002;
const flowNumericallyThreshhold = 0.002;
const flowNearPlaneThreshhold = 0.0001;

const maxNumericalSteps = Math.ceil(flowNumericallyThreshhold / numericalStepDistance);

class SolGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	fogGlsl = /* glsl */`
		return color;
		//mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	`;

	raymarchSetupGlsl = /* glsl */`
		setGlobals(rayDirectionVec);
	`;

	functionGlsl = /* glsl */`
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

		// For the inverse transformation, pass
		// vec3(-exp(-pos.z) * pos.x, -exp(pos.z) * pos.y, -pos.z).
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				exp(pos.z), 0.0, 0.0, 0.0,
				0.0, exp(-pos.z), 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		mat4 getInverseTransformationMatrix(vec4 pos)
		{
			float expZ = exp(pos.z);
			float expNegZ = exp(-pos.z);

			return mat4(
				expNegZ, 0.0, 0.0, 0.0,
				0.0, expZ, 0.0, 0.0,
				0.0, 0.0, 1.0, 0.0,
				-expNegZ * pos.x, -expZ * pos.y, -pos.z, 1.0
			);
		}

		// Elliptic integral computations, sourced from
		// https://github.com/henryseg/non-euclidean_VR/blob/master/src/geometries/sol/geometry/shaders/part1.glsl,
		// which is in turn based on various sources in the literature.
		
		float global_mu;
		float global_k;
		float global_kPrime;
		float global_m;
		float global_K;
		float global_E;
		float global_L;

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
			vec3 data = vec3(1.0, global_kPrime, global_k);
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
				actualAGMSteps = i + 1;
			}
		}

		// Called every time the direction chages (i.e. when we start marching and when we teleport)
		void setGlobals(vec4 rayDirectionVec)
		{
			float absAB = abs(rayDirectionVec.x * rayDirectionVec.y);
			float root1Minus2AbsAB = sqrt(1.0 - 2.0 * absAB);
			float rootAbsAB = sqrt(absAB);
			
			global_mu = sqrt(1.0 + 2.0 * absAB);
			global_k = root1Minus2AbsAB / global_mu;
			global_kPrime = 2.0 * rootAbsAB / global_mu;
			global_m = (1.0 - 2.0 * absAB) / (1.0 + 2.0 * absAB);

			runAGMAlgorithm();

			// With that elliptic integral computed, we can compute K and E.
			global_K = 0.5 * pi / lastAGMData.x;

			float sumTotal = 0.0;

			for (int i = 0; i < maxAGMSteps; i++)
			{
				if (i == actualAGMSteps)
				{
					break;
				}

				sumTotal += pow(2.0, float(i - 1)) * AGMData[i].z * AGMData[i].z;
			}

			global_E = global_K * (1.0 - sumTotal);

			if (absAB != 0.0)
			{
				global_L = global_E / (global_kPrime * global_K) - 0.5 * global_kPrime;
			}
		}

		const float numericalStepDistance = ${numericalStepDistance};
		const int maxNumericalSteps = ${maxNumericalSteps};

		// Flow from the origin numerically. Used when objects in the scene are extremely close.
		vec4 getUpdatedPosNumerically(inout vec4 rayDirectionVec, float t)
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
				dir = geometryNormalize(
					dir + numericalStepDistance * vec4(
						dir.x * dir.z,
						-dir.y * dir.z,
						-dir.x * dir.x + dir.y * dir.y,
						0.0
					)
				);

				// Normalize the direction.
				float dirMagnitude = sqrt(
					exp(-2.0 * pos.z) * dir.x * dir.x
					+ exp(2.0 * pos.z) * dir.y * dir.y
					+ dir.z * dir.z
				);

				dir /= dirMagnitude;
			}

			rayDirectionVec = getInverseTransformationMatrix(pos) * dir;

			return pos;
		}

		vec4 getUpdatedPosNearX0(vec4 rayDirectionVec, float t)
		{
			float a = rayDirectionVec.x;
			float b = rayDirectionVec.y;
			float c = rayDirectionVec.z;

			float b2 = b * b;
			float c2 = c * c;

			float n1 = sqrt(b2 + c2);
			float n2 = n1 * n1;
			float n3 = n1 * n2;
			float n4 = n1 * n3;
			
			// From the repo: cosh(s), sinh(s), and tanh(s) where s = n(t+t0)
			float shs = (c * cosh(n1 * t) + n1 * sinh(n1 * t)) / abs(b);
			float chs = (n1 * cosh(n1 * t) + c * sinh(n1 * t)) / abs(b);
			float ths = shs / chs;

			vec4 p0 = vec4(0.0, n1 * ths / b - c / b, log(abs(b) * chs / n1), 1.0);

			vec4 p1 = vec4(b2 * (shs * chs + n1 * t) / (2.0 * n3) - c / (2.0 * n2), 0.0, 0.0, 0.0);

			vec4 p2 = vec4(0.0,
				b * n1 * t / (2.0 * n3)
					- (b2 - 2.0 * c2) * ( n1 * t / pow(chs, 2.0) + ths) / (4.0 * b * n3)
					+ 3.0 * c / (4.0 * b * n2 * pow(chs, 2.0))
					- c / (2.0 * b * n2),
				-b2 * pow(chs, 2.0) / (4.0 * n4)
					- (b2 - 2.0 * c2) * (n1 * t * ths - 1.0) / (4.0 * n4)
					+ 3.0 * c * ths / (4.0 * n3),
				0.0
			);

			return p0 + a * p1 + a * a * p2;
		}

		vec4 getUpdatedPosNearY0(vec4 rayDirectionVec, float t)
		{
			// Applying the isometry S_2 from the paper lets us
			// reuse the previous function.
			vec4 pos = getUpdatedPosNearX0(
				vec4(rayDirectionVec.y, rayDirectionVec.x, -rayDirectionVec.z, 0.0),
				t
			);

			return vec4(pos.y, pos.x, -pos.z, 1.0);
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
			float uMod4K = mod(u, 4.0 * global_K);

			float xSign = 1.0;
			
			vec3 signVector = vec3(1.0, 1.0, 1.0);

			if (uMod4K > 2.0 * global_K)
			{
				uMod4K = 4.0 * global_K - uMod4K;
				xSign = -1.0;
			}

			if (uMod4K < jacobiEllipticTolerance)
			{
				// Series expansion about 0 of the Jacobi elliptic functions sn, cn and dn

				float k2 = global_m;
				float k4 = global_m * global_m;
				float k6 = k4 * global_m;

				float u1 = uMod4K;
				float u2 = u1 * uMod4K;
				float u3 = u2 * uMod4K;
				float u4 = u3 * uMod4K;
				float u5 = u4 * uMod4K;
				float u6 = u5 * uMod4K;
				float u7 = u6 * uMod4K;

				return vec3(
					xSign * (
						u1
						- (1.0 + k2) * u3 / 6.0
						+ (1.0 + 14.0 * k2 + k4) * u5 / 120.0
						- (1.0 + 135.0 * k2 + 135.0 * k4 + k6) * u7 / 5040.0
					),

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

			float emc = 1.0 - global_m;

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

				sn = sign(sn) * a;

				cn = c * sn;
			}

			return vec3(xSign * sn, cn, dn);
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
				float k2 = global_m;
				float k4 = k2 * global_m;
				float k6 = k4 * global_m;

				result = -(global_E / global_K - 1.0) * t0;
				result -= (1.0 / 6.0) * (global_E * k2 / global_K + k2 - 2.0 * global_E / global_K + 2.0) * pow(t0, 3.0);
				result -= (1.0 / 40.0) * (3.0 * global_E * k4 / global_K + k4 - 8.0 * global_E * k2 / global_K - 8.0 * k2 + 8.0 * global_E / global_K - 8.0) * pow(t0, 5.0);
				result -= (1.0 / 112.0) * (5.0 * global_E * k6 / global_K + k6 - 18.0 * global_E * k4 / global_K - 6.0 * k4 + 24.0 * global_E * k2 / global_K + 24.0 * k2 - 16.0 * global_E / global_K + 16.0) * pow(t0, 7.0);
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

			vec3 jef0 = vec3(
				-c / root1Minus2AbsAB,
				(abs(a) - abs(b)) / root1Minus2AbsAB,
				(abs(a) + abs(b)) / global_mu
			);

			// The elliptic functions are periodic with period 4K.
			float muTimesTMod4K = mod(global_mu * t, 4.0 * global_K);

			// Now we'll plug this into the elliptic functions. In the paper, we need
			// an argument of alpha + mu*t, but first we'll get just mu*t.
			vec3 jef1 = computeJacobiEllipticFunctions(muTimesTMod4K);

			vec3 jef2 = vec3(
				jef1.x * jef0.y * jef0.z + jef0.x * jef1.y * jef1.z,
				jef1.y * jef0.y - jef1.x * jef1.z * jef0.x * jef0.z,
				jef1.z * jef0.z - global_m * jef1.x * jef1.y * jef0.x * jef0.y
			) / (1.0 - global_m * jef1.x * jef1.x * jef0.x * jef0.x);

			// Compute the Jacobi zeta function.
			float zeta = computeJacobiZetaFunction(jef1.x / jef1.y) - global_m * jef1.x * jef0.x * jef2.x;

			// Now *finally* we can compute the formula for gamma
			// from the paper.
			return vec4(
				sign(a) * sqrt(abs(b / a)) * (
					zeta / global_kPrime
					+ global_k * (jef2.x - jef0.x) / global_kPrime
					+ global_L * global_mu * t
				),
				sign(b) * sqrt(abs(a / b)) * (
					zeta / global_kPrime,
					- global_k * (jef2.x - jef0.x) / global_kPrime
					+ global_L * global_mu * t
				),
				0.5 * log(abs(b / a)) + asinh(global_k * jef2.y / global_kPrime),
				1.0
			);
		}

		const float flowNumericallyThreshhold = ${flowNumericallyThreshhold};
		const float flowNearPlaneThreshhold = ${flowNearPlaneThreshhold};

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			vec4 pos;

			if (t < flowNumericallyThreshhold)
			{
				pos = getUpdatedPosNumerically(rayDirectionVec, t);
			}

			else if (abs(rayDirectionVec.x * t) < flowNearPlaneThreshhold)
			{
				pos = getUpdatedPosNearX0(rayDirectionVec, t);
			}
		
			else if (abs(rayDirectionVec.y * t) < flowNearPlaneThreshhold)
			{
				pos = getUpdatedPosNearY0(rayDirectionVec, t);
			}
			
			else
			{
				pos = getUpdatedPosExactly(rayDirectionVec, t);
			}

			return getTransformationMatrix(startPos) * pos;
		}

		float approximateDistanceToOrigin(vec4 pos)
		{
			return sqrt(
				exp(-2.0 * pos.z) * pos.x * pos.x
				+ exp(2.0 * pos.z) * pos.y * pos.y
				+ pos.z * pos.z
			);

			// return length(pos.xyz);
		}
	`;
	
	stepFactor = "0.5";
	
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
	static distances = /* glsl */`
		float radius = 0.5;
		// float distance1 = approximateDistanceToOrigin(pos) - radius;
		
		float distance1 = (pos.x - radius);
		float distance2 = -(pos.x + radius);

		float distance3 = (pos.y - radius);
		float distance4 = -(pos.y + radius);

		float distance5 = (pos.z - radius);
		float distance6 = -(pos.z + radius);

		float minDistance = ${getMaxGlslString("distance", 6)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${SolRooms.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${SolRooms.distances}

		// return vec3(
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.x + baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.y + baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
		// 	.35 + .65 * (.5 * (sin((.0125 * pos.z + baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		// );

		if (minDistance == distance1)
		{
			return vec3(0.5, 0.5, 0.5) * getBanding(pos.z, 10.0);
		}

		if (minDistance == distance2)
		{
			return vec3(1.0, 0.5, 0.5) * getBanding(pos.z, 10.0);
		}

		if (minDistance == distance3)
		{
			return vec3(0.5, 1.0, 0.5) * getBanding(pos.y, 10.0);
		}

		if (minDistance == distance4)
		{
			return vec3(0.5, 0.5, 1.0) * getBanding(pos.y, 10.0);
		}

		if (minDistance == distance5)
		{
			return vec3(1.0, 1.0, 0.5) * getBanding(pos.x, 10.0);
		}

		if (minDistance == distance6)
		{
			return vec3(1.0, 0.5, 1.0) * getBanding(pos.x, 10.0);
		}
	`;

	lightGlsl = /* glsl */`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(3.0, 2.0, 0.5, 1.0) - pos);
		float dotProduct3 = .5 * dot(surfaceNormal, lightDirection3);

		float lightIntensity = 1.2 * max(max(abs(dotProduct1), abs(dotProduct2)), abs(dotProduct3));
		
		lightIntensity = 1.0;
	`;

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}