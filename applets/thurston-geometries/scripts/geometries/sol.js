import { ThurstonGeometry } from "../class.js";
import { BaseGeometry, getMatrixGlsl } from "./base.js";
import { $ } from "/scripts/src/main.js";

const numericalStepDistance = 0.0002;
const flowNumericallyThreshhold = 0.002;
const flowNearPlaneThreshhold = 0.0001;

const maxNumericalSteps = Math.ceil(flowNumericallyThreshhold / numericalStepDistance);

const phi = (1 + Math.sqrt(5)) / 2;
const tauInverse = 1 / (2 * Math.log(phi));

function getTransformationMatrix(pos)
{
	return [
		[Math.exp(pos[2]), 0, 0, pos[0]],
		[0, Math.exp(-pos[2]), 0, pos[1]],
		[0, 0, 1, pos[2]],
		[0, 0, 0, 1]
	];
}

function getInverseTransformationMatrix(pos)
{
	const expZ = Math.exp(pos[2]);
	const expNegZ = Math.exp(-pos[2]);

	return [
		[expNegZ, 0, 0, -expNegZ * pos[0]],
		[0, expZ, 0, -expZ * pos[1]],
		[0, 0, 1, -pos[2]],
		[0, 0, 0, 1]
	];
}

function liftToM(pos)
{
	return [
		phi * pos[0] - pos[1],
		pos[0] + phi * pos[1],
		tauInverse * pos[2]
	];
}

function getBinarySearchGlslChunk({
	comparisonVec,
	dotProductThreshhold,
	searchIterations
}) {
	return /* glsl */`
		dotProduct = dot(mElement, ${comparisonVec});

		if (abs(dotProduct) > ${dotProductThreshhold})
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < ${searchIterations}; i++)
			{
				pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

				mElement = liftToM(pos);

				dotProduct = dot(mElement, ${comparisonVec});

				if (abs(dotProduct) > ${dotProductThreshhold})
				{
					currentSearchPosition -= currentSearchScale;
				}

				else 
				{
					currentSearchPosition += currentSearchScale;
				}

				currentSearchScale *= .5;
			}

			t = oldT + lastTIncrease * currentSearchPosition;

			// totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

			mElement = liftToM(pos);
		}
	`;
}

const teleportationElementA1 = [phi / (phi + 2), -1 / (phi + 2), 0, 1];
const teleportationElementA2 = [1 / (phi + 2), phi / (phi + 2), 0, 1];
const teleportationElementB = [0, 0, 2 * Math.log(phi), 1];

const teleportationMatrixA1 = getTransformationMatrix(teleportationElementA1);
const teleportationMatrixA1inv = getInverseTransformationMatrix(teleportationElementA1);
const teleportationMatrixA2 = getTransformationMatrix(teleportationElementA2);
const teleportationMatrixA2inv = getInverseTransformationMatrix(teleportationElementA2);
const teleportationMatrixB = getTransformationMatrix(teleportationElementB);
const teleportationMatrixBinv = getInverseTransformationMatrix(teleportationElementB);

const teleportationMatrices = [
	teleportationMatrixA1,
	teleportationMatrixA1inv,
	teleportationMatrixA2,
	teleportationMatrixA2inv,
	teleportationMatrixB,
	teleportationMatrixBinv
];

class SolGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		vec3 mElement = liftToM(pos);
		float dotProduct;

	${getBinarySearchGlslChunk({
		comparisonVec: "vec3(0.0, 0.0, 1.0)",
		dotProductThreshhold: "0.501",
		searchIterations: "10"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "vec3(1.0, 0.0, 0.0)",
		dotProductThreshhold: "0.501",
		searchIterations: "10"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "vec3(0.0, 1.0, 0.0)",
		dotProductThreshhold: "0.501",
		searchIterations: "10"
	})}

		globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.225));
	`;

	raymarchSetupGlsl = /* glsl */`
		setGlobals(rayDirectionVec);
	`;

	functionGlsl = /* glsl */`
		const float phi = ${phi};
		const float tauInverse = ${tauInverse};

		const mat4 teleportationMatrixA1 = ${getMatrixGlsl(teleportationMatrixA1)};
		const mat4 teleportationMatrixA1inv = ${getMatrixGlsl(teleportationMatrixA1inv)};
		const mat4 teleportationMatrixA2 = ${getMatrixGlsl(teleportationMatrixA2)};
		const mat4 teleportationMatrixA2inv = ${getMatrixGlsl(teleportationMatrixA2inv)};
		const mat4 teleportationMatrixB = ${getMatrixGlsl(teleportationMatrixB)};
		const mat4 teleportationMatrixBinv = ${getMatrixGlsl(teleportationMatrixBinv)};
		
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

		// Converts an element in Sol to an element in the universal cover of the suspension of the
		// 2-torus, so that we can easily check if it needs to be teleported.
		vec3 liftToM(vec4 pos)
		{
			return vec3(
				phi * pos.x - pos.y,
				pos.x + phi * pos.y,
				tauInverse * pos.z
			);
		}

		// Elliptic integral computations, sourced from
		// https://github.com/henryseg/non-euclidean_VR/blob/master/src/geometries/sol/geometry/shaders/part1.glsl,
		// which is in turn based on various sources in the literature.
		
		float g_mu;
		float g_k;
		float g_kPrime;
		float g_m;
		float g_K;
		float g_E;
		float g_L;

		const int maxAGMSteps = 10;
		
		// We can terminate the algorithm early, and this is the actual length of the data vector.
		int actualAGMSteps;

		const float minAGMError = 0.00001;

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
			vec3 data = vec3(1.0, g_kPrime, g_k);
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
			
			g_mu = sqrt(1.0 + 2.0 * absAB);
			g_k = root1Minus2AbsAB / g_mu;
			g_kPrime = 2.0 * rootAbsAB / g_mu;
			g_m = (1.0 - 2.0 * absAB) / (1.0 + 2.0 * absAB);

			runAGMAlgorithm();

			// With that elliptic integral computed, we can compute K and E.
			g_K = 0.5 * pi / lastAGMData.x;

			float sumTotal = 0.0;

			for (int i = 0; i < maxAGMSteps; i++)
			{
				if (i == actualAGMSteps)
				{
					break;
				}

				sumTotal += pow(2.0, float(i - 1)) * AGMData[i].z * AGMData[i].z;
			}

			g_E = g_K * (1.0 - sumTotal);

			if (absAB != 0.0)
			{
				g_L = g_E / (g_kPrime * g_K) - 0.5 * g_kPrime;
			}
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
					exp(-2.0 * pos.z) * dir.x * dir.x
					+ exp(2.0 * pos.z) * dir.y * dir.y
					+ dir.z * dir.z
				);

				dir /= dirMagnitude;
			}

			return pos;
		}

		vec4 getUpdatedDirectionVecNumerically(vec4 rayDirectionVec, float t)
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
					exp(-2.0 * pos.z) * dir.x * dir.x
					+ exp(2.0 * pos.z) * dir.y * dir.y
					+ dir.z * dir.z
				);

				dir /= dirMagnitude;
			}

			return dir;
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

			vec4 p2 = vec4(
				0.0,
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

		vec4 getUpdatedDirectionVecNearX0(vec4 rayDirectionVec, float t)
		{
			float a = rayDirectionVec.x;
			float b = rayDirectionVec.y;
			float c = rayDirectionVec.z;

			float sinhT = sinh(t);
			float coshT = cosh(t);
			float tanhT = tanh(t);

			float onePlusCTanhT = 1.0 + c * tanhT;

			return vec4(
				0.0,

				-b * c * tanhT / (coshT * coshT * onePlusCTanhT * onePlusCTanhT)
					+ b / (coshT * coshT * onePlusCTanhT),

				(c * coshT + sinhT) / (coshT + c * sinhT),

				0.0
			);
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

		vec4 getUpdatedDirectionVecNearY0(vec4 rayDirectionVec, float t)
		{
			vec4 dir = getUpdatedDirectionVecNearX0(
				vec4(rayDirectionVec.y, rayDirectionVec.x, -rayDirectionVec.z, 0.0),
				t
			);

			return vec4(dir.y, dir.x, -dir.z, 0.0);
		}

		const float jacobiEllipticTolerance = 0.001;

		// Returns sn(u, k), cn(u, k), and dn(u, k).
		// See https://en.wikipedia.org/wiki/Jacobi_elliptic_functions.
		// Like most of the other math in this section, it's taken mostly
		// wholecloth from the noneuclidean VR repo (which itself is taken
		// partially wholecloth from other sources) --- the difference here
		// is that I understand the math in this function much less.

		// One thing I do understand is that the comments in the noneuclidean-VR
		// repo have it wrong: the elliptic modulus is k, not m = k^2. The shadertoy
		// code they used (the second half of this function) specifies that the square
		// of the modulus is to be passed in, but they stripped that comment.
		vec3 computeJacobiEllipticFunctions(float u)
		{
			float uMod4K = mod(u, 4.0 * g_K);

			float xSign = 1.0;
			
			vec3 signVector = vec3(1.0, 1.0, 1.0);

			if (uMod4K > 2.0 * g_K)
			{
				uMod4K = 4.0 * g_K - uMod4K;
				xSign = -1.0;
			}

			if (uMod4K < jacobiEllipticTolerance)
			{
				// Series expansion about 0.
				float k2 = g_m;
				float k4 = g_m * g_m;
				float k6 = k4 * g_m;

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

			float emc = 1.0 - g_m;

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
				float k2 = g_m;
				float k4 = k2 * g_m;
				float k6 = k4 * g_m;

				result = -(g_E / g_K - 1.0) * t0;
				result -= (1.0 / 6.0) * (g_E * k2 / g_K + k2 - 2.0 * g_E / g_K + 2.0) * pow(t0, 3.0);
				result -= (1.0 / 40.0) * (3.0 * g_E * k4 / g_K + k4 - 8.0 * g_E * k2 / g_K - 8.0 * k2 + 8.0 * g_E / g_K - 8.0) * pow(t0, 5.0);
				result -= (1.0 / 112.0) * (5.0 * g_E * k6 / g_K + k6 - 18.0 * g_E * k4 / g_K - 6.0 * k4 + 24.0 * g_E * k2 / g_K + 24.0 * k2 - 16.0 * g_E / g_K + 16.0) * pow(t0, 7.0);
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
				(abs(a) + abs(b)) / g_mu
			);

			// The elliptic functions are periodic with period 4K.
			float muTimesTMod4K = mod(g_mu * t, 4.0 * g_K);

			// Now we'll plug this into the elliptic functions. In the paper, we need
			// an argument of alpha + mu*t, but first we'll get just mu*t.
			vec3 jef1 = computeJacobiEllipticFunctions(muTimesTMod4K);

			// These appear to use formulas (48)-(50) on
			// https://mathworld.wolfram.com/JacobiEllipticFunctions.html.
			vec3 jef2 = vec3(
				jef1.x * jef0.y * jef0.z + jef0.x * jef1.y * jef1.z,
				jef1.y * jef0.y - jef1.x * jef1.z * jef0.x * jef0.z,
				jef1.z * jef0.z - g_m * jef1.x * jef1.y * jef0.x * jef0.y
			) / (1.0 - g_m * jef1.x * jef1.x * jef0.x * jef0.x);

			// Compute the Jacobi zeta function. This uses an addition formula
			// that I haven't been able to find.
			float zeta = computeJacobiZetaFunction(jef1.x / jef1.y) - g_m * jef1.x * jef0.x * jef2.x;

			// Now we can finally compute the formula for gamma from the paper.
			return vec4(
				sign(a) * sqrt(abs(b / a)) * (
					zeta / g_kPrime
					+ g_k * (jef2.x - jef0.x) / g_kPrime
					+ g_L * g_mu * t
				),
				sign(b) * sqrt(abs(a / b)) * (
					zeta / g_kPrime
					- g_k * (jef2.x - jef0.x) / g_kPrime
					+ g_L * g_mu * t
				),
				0.5 * log(abs(b / a)) + asinh(g_k * jef2.y / g_kPrime),
				1.0
			);
		}

		vec4 getUpdatedDirectionVecExactly(vec4 rayDirectionVec, float t)
		{
			// The convention used in the paper.
			float a = rayDirectionVec.x;
			float b = rayDirectionVec.y;
			float c = rayDirectionVec.z;

			float root1Minus2AbsAB = sqrt(1.0 - 2.0 * abs(a * b));

			vec3 jef0 = vec3(
				-c / root1Minus2AbsAB,
				(abs(a) - abs(b)) / root1Minus2AbsAB,
				(abs(a) + abs(b)) / g_mu
			);

			// The elliptic functions are periodic with period 4K.
			float muTimesTMod4K = mod(g_mu * t, 4.0 * g_K);

			// Now we'll plug this into the elliptic functions. In the paper, we need
			// an argument of alpha + mu*t, but first we'll get just mu*t.
			vec3 jef1 = computeJacobiEllipticFunctions(muTimesTMod4K);

			float jef2Den = 1.0 - g_m * jef1.x * jef1.x * jef0.x * jef0.x;

			vec3 jef2 = vec3(
				jef1.x * jef0.y * jef0.z + jef0.x * jef1.y * jef1.z,
				jef1.y * jef0.y - jef1.x * jef1.z * jef0.x * jef0.z,
				jef1.z * jef0.z - g_m * jef1.x * jef1.y * jef0.x * jef0.y
			) / jef2Den;

			// The core issue with all of these computations is that we don't know
			// alpha, only its image under the Jacobi elliptic and zeta functions.
			// The paper got around this in the position function by using addition
			// formulas, but when we differentiate, there's this sin term involving
			// alpha that we can't compute. However, it's only that one factor
			// that appears, and so we can use the fact that the vector must have
			// magnitude after being translated to the origin to solve for it.
			float B = jef2.y * jef2.z * g_k / g_kPrime;
			float C = -jef2.x * jef2.z * g_k * g_mu
				/ length(vec2(g_kPrime, jef2.y * g_k));

			float z = 0.5 * log(abs(b / a)) + asinh(g_k * jef2.y / g_kPrime);
			float exp2Z = exp(2.0 * z);
			float expNeg2Z = exp(-2.0 * z);

			float A = (
				-b * b * B * g_mu * g_mu
				+ a * a * B * exp2Z * exp2Z * g_mu * g_mu
				+ sqrt(
					abs(a * b) * exp2Z * exp2Z * g_mu * g_mu * (
						-b * b * (C * C - 1.0) * expNeg2Z
						- a * a * (C * C - 1.0) * exp2Z
						- 4.0 * abs(a * b) * B * B * g_mu * g_mu
					)
				)
			) / (g_mu * g_mu * (b * b + a * a * exp2Z * exp2Z));

			return vec4(
				sign(a) * sqrt(abs(b / a)) * g_mu * (A + B),
				sign(b) * sqrt(abs(a / b)) * g_mu * (A - B),
				C,
				0.0
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

			else if (abs(rayDirectionVec.x) < flowNearPlaneThreshhold * 2.0)
			{
				pos = getUpdatedPosNearX0(rayDirectionVec, t);
			}
		
			else if (abs(rayDirectionVec.y) < flowNearPlaneThreshhold * 2.0)
			{
				pos = getUpdatedPosNearY0(rayDirectionVec, t);
			}
			
			else
			{
				pos = getUpdatedPosExactly(rayDirectionVec, t);
			}

			return getTransformationMatrix(startPos) * pos;
		}

		vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			float e = .001;
			if (t < flowNumericallyThreshhold)
			{
				return getTransformationMatrix(startPos) * getUpdatedDirectionVecNumerically(rayDirectionVec, t);
			}

			if (abs(rayDirectionVec.x) < flowNearPlaneThreshhold * 30.0)
			{
				return getTransformationMatrix(startPos) * getUpdatedDirectionVecNearX0(rayDirectionVec, t);
			}
		
			if (abs(rayDirectionVec.y) < flowNearPlaneThreshhold * 6.0)
			{
				return getTransformationMatrix(startPos) * getUpdatedDirectionVecNearY0(rayDirectionVec, t);
			}

			return getTransformationMatrix(startPos) * getUpdatedDirectionVecExactly(rayDirectionVec, t);
		}

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec3 color = vec3(0.0, 0.0, 0.0);

			vec3 mElement = liftToM(pos);

			if (mElement.z < -0.5)
			{
				pos = teleportationMatrixB * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixB * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				mElement = liftToM(pos);

				color += vec3(0.0, 0.0, -1.0);
			}

			else if (mElement.z > 0.5)
			{
				pos = teleportationMatrixBinv * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixBinv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				mElement = liftToM(pos);

				color += vec3(0.0, 0.0, 1.0);
			}

			if (mElement.x < -0.5)
			{
				pos = teleportationMatrixA1 * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				mElement = liftToM(pos);

				color += vec3(-1.0, 0.0, 0.0);
			}

			else if (mElement.x > 0.5)
			{
				pos = teleportationMatrixA1inv * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA1inv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				mElement = liftToM(pos);

				color += vec3(1.0, 0.0, 0.0);
			}

			if (mElement.y < -0.5)
			{
				pos = teleportationMatrixA2 * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, -1.0, 0.0);
			}

			else if (mElement.y > 0.5)
			{
				pos = teleportationMatrixA2inv * pos;

				rayDirectionVec = getInverseTransformationMatrix(pos) * teleportationMatrixA2inv * getUpdatedDirectionVec(startPos, rayDirectionVec, t);
				setGlobals(rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 1.0, 0.0);
			}

			return color;
		}
	`;

	stepFactor = ".8";
	
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

	baseColorIncreases = [
		[-1, 0, 0],
		[1, 0, 0],
		[0, -1, 0],
		[0, 1, 0],
		[0, 0, -1],
		[0, 0, 1]
	];
	
	baseColor = [0, 0, 0];

	teleportCamera()
	{
		let mElement = liftToM(this.cameraPos);

		for (let i = 2; i >= 0; i--)
		{
			if (mElement[i] < -0.5)
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportationMatrices[2 * i],
					this.cameraPos
				);

				mElement = liftToM(this.cameraPos);

				this.baseColor[0] += this.baseColorIncreases[2 * i][0];
				this.baseColor[1] += this.baseColorIncreases[2 * i][1];
				this.baseColor[2] += this.baseColorIncreases[2 * i][2];
			}

			else if (mElement[i] > 0.5)
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportationMatrices[2 * i + 1],
					this.cameraPos
				);

				mElement = liftToM(this.cameraPos);

				this.baseColor[0] += this.baseColorIncreases[2 * i + 1][0];
				this.baseColor[1] += this.baseColorIncreases[2 * i + 1][1];
				this.baseColor[2] += this.baseColorIncreases[2 * i + 1][2];
			}
		}
	}
}

export class SolRooms extends SolGeometry
{
	static distances = /* glsl */`
		float distance1 = length(pos.xyz * vec3(1.0, 1.0, 0.55)) - wallThickness;
	`;

	distanceEstimatorGlsl = /* glsl */`
		${SolRooms.distances}

		return -distance1;
	`;

	getColorGlsl = /* glsl */`
		${SolRooms.distances}

		vec3 roomColor = baseColor + globalColor;

		return vec3(
			.3 + .7 * (.5 * (sin((.01 * (pos.x + pos.z) + roomColor.x + roomColor.z) * 40.0) + 1.0)),
			.3 + .7 * (.5 * (sin((.01 * (pos.y + pos.z) + roomColor.y + roomColor.z) * 57.0) + 1.0)),
			.3 + .7 * (.5 * (sin((.01 * (pos.x + pos.y) + roomColor.x + roomColor.y) * 89.0) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.25 + .75 * dotProduct1 * dotProduct1) * 1.4;
	`;

	maxMarches = "100";
	ambientOcclusionDenominator = "100.0";
	maxT = "15.0";

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	movingSpeed = .5;

	uniformGlsl = /* glsl */`
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = .372 - this.sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);

		gl.uniform3fv(uniformList["baseColor"], this.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -0.18;
		wallThicknessSlider.max = 0.42;
		wallThicknessSlider.value = 0.42;
		wallThicknessSliderValue.textContent = 0.42;
		this.sliderValues.wallThickness = 0.42;
	}
}

export class SolSpheres extends SolGeometry
{
	static distances = /* glsl */`
		float distance1 = length(pos.xyz) - .125;
	`;

	distanceEstimatorGlsl = /* glsl */`
		${SolSpheres.distances}

		return distance1;
	`;

	getColorGlsl = /* glsl */`
		${SolSpheres.distances}

		vec3 roomColor = baseColor + globalColor;

		return vec3(
			.15 + .85 * (.5 * (sin(floor(roomColor.x + .5) * .25) + 1.0)),
			.15 + .85 * (.5 * (sin(floor(roomColor.y + .5) * .25) + 1.0)),
			.15 + .85 * (.5 * (sin(floor(roomColor.z + .5) * .25) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.2 + .8 * max(dotProduct1, -dotProduct1)) * 1.4;
	`;

	maxMarches = "50";
	ambientOcclusionDenominator = "75.0";
	maxT = "15.0";

	cameraPos = [0, 0, .5, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	movingSpeed = .5;

	uniformGlsl = /* glsl */`
		uniform vec3 baseColor;
	`;

	uniformNames = ["baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform3fv(uniformList["baseColor"], this.baseColor);
	}
}