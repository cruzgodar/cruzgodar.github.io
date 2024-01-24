import { ThurstonGeometry } from "../class.js";
import { sliderValues } from "../index.js";
import { BaseGeometry, getMatrixGlsl, getMinGlslString, getVectorGlsl } from "./base.js";
import { $ } from "/scripts/src/main.js";

function getTransformationMatrix(pos)
{
	return [
		[pos[0], -pos[1], pos[2], pos[3]],
		[pos[1], pos[0], pos[3], -pos[2]],
		[pos[2], pos[3], pos[0], -pos[1]],
		[pos[3], -pos[2], pos[1], pos[0]]
	];
}

const root2 = Math.sqrt(2);
const root2Over2 = Math.sqrt(2) / 2;
const root1PlusRoot2 = Math.sqrt(1 + Math.sqrt(2));
const delta = Math.sqrt(2) * Math.sqrt(Math.sqrt(2) - 1);

const teleportElements = [
	[root2Over2 + 1, -root2Over2 - 1, -root2 * root1PlusRoot2, 0], // A1
	[root2Over2 + 1, -root2Over2 - 1, root2 * root1PlusRoot2, 0], // A2
	[root2Over2 + 1, root2Over2 + 1, root1PlusRoot2, -root1PlusRoot2], // B1
	[root2Over2 + 1, root2Over2 + 1, -root1PlusRoot2, root1PlusRoot2], // B2
	[1, 0, 0, 0] // C
];

const teleportElementsInv = teleportElements.map(e => [e[0], -e[1], -e[2], -e[3]]);

const teleportMatrices = [
	//B1inv, B2inv
	[
		getTransformationMatrix(teleportElementsInv[2]),
		getTransformationMatrix(teleportElementsInv[3])
	],
	// A1, A2
	[
		getTransformationMatrix(teleportElements[0]),
		getTransformationMatrix(teleportElements[1])
	],
	// B1, B2
	[
		getTransformationMatrix(teleportElements[2]),
		getTransformationMatrix(teleportElements[3])
	],
	// A1inv, A2inv
	[
		getTransformationMatrix(teleportElementsInv[0]),
		getTransformationMatrix(teleportElementsInv[1])
	],
	[
		getTransformationMatrix(teleportElements[4]),
		getTransformationMatrix(teleportElements[4])
	]
];

const teleportFibers = [
	[-Math.PI / 2, -Math.PI / 2],
	[-Math.PI / 2, -Math.PI / 2],
	[Math.PI / 2, Math.PI / 2],
	[Math.PI / 2, Math.PI / 2],
	[-2 * Math.PI, 2 * Math.PI]
];

const teleportVectors = [
	[[1, 0, 0], delta],
	[[root2Over2, root2Over2, 0], delta],
	[[0, 1, 0], delta],
	[[-root2Over2, root2Over2, 0], delta],
	[[0, 0, 1], Math.PI]
];

function getTeleportGlslChunk({
	comparisonVec,
	dotProductThreshhold,
	teleportMatPos,
	teleportMatNeg,
	fiberAdjustPos,
	fiberAdjustNeg,
	teleportElementPos,
	teleportElementNeg,
}) {
	return /*glsl*/`
		dotProduct = dot(kleinElement, ${comparisonVec});

		if (dotProduct > (${dotProductThreshhold}))
		{
			// applyH2Isometry(pos, rayDirectionVec.xyz);

			pos = ${teleportMatPos} * pos;
			fiber += ${fiberAdjustPos};

			// applyH2Isometry(${teleportElementPos}, rayDirectionVec.xyz);
			// applyH2Isometry(vec4(pos.x, -pos.yzw), rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);
		}

		else if (dotProduct < -(${dotProductThreshhold}))
		{
			// applyH2Isometry(pos, rayDirectionVec.xyz);

			pos = ${teleportMatNeg} * pos;
			fiber += ${fiberAdjustNeg};

			// applyH2Isometry(${teleportElementNeg}, rayDirectionVec.xyz);
			// applyH2Isometry(vec4(pos.x, -pos.yzw), rayDirectionVec.xyz);

			startPos = pos;
			startFiber = fiber;
			totalT += t;
			t = 0.0;

			kleinElement = getKleinElement(pos, fiber);
		}
	`;
}

function getBinarySearchGlslChunk({
	comparisonVec,
	dotProductThreshhold,
	searchIterations
}) {
	return /*glsl*/`
		dotProduct = dot(kleinElement, ${comparisonVec});

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
				getUpdatedPos(startPos, startFiber, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition, pos, fiber);

				kleinElement = getKleinElement(pos, fiber);

				dotProduct = dot(kleinElement, ${comparisonVec});

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

			totalT -= lastTIncrease * (1.0 - currentSearchPosition);

			getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

			kleinElement = getKleinElement(pos, fiber);
		}
	`;
}

function getH2Element(qElement)
{
	return [
		2.0 * qElement[0] * qElement[2] - 2.0 * qElement[1] * qElement[3],
		2.0 * qElement[0] * qElement[3] + 2.0 * qElement[1] * qElement[2],
		qElement[0] * qElement[0]
			+ qElement[1] * qElement[1]
			+ qElement[2] * qElement[2]
			+ qElement[3] * qElement[3]
	];
}

function getKleinElement(qElement, fiber)
{
	const h2Element = getH2Element(qElement);

	return [h2Element[0] / h2Element[2], h2Element[1] / h2Element[2], fiber];
}

class SL2RGeometry extends BaseGeometry
{
	raymarchSetupGlsl = /*glsl*/`
		float startFiber = cameraFiber;
	`;

	geodesicGlsl = /*glsl*/`
		vec4 pos;
		float fiber;

		getUpdatedPos(startPos, startFiber, rayDirectionVec, t, pos, fiber);

		vec3 kleinElement = getKleinElement(pos, fiber);
		
		float dotProduct;

	${getBinarySearchGlslChunk({
		comparisonVec: "teleportVec1",
		dotProductThreshhold: "delta + .0001",
		searchIterations: "5"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "teleportVec2",
		dotProductThreshhold: "delta + .0001",
		searchIterations: "5"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "teleportVec3",
		dotProductThreshhold: "delta + .0001",
		searchIterations: "5"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "teleportVec4",
		dotProductThreshhold: "delta + .0001",
		searchIterations: "5"
	})}

	${getBinarySearchGlslChunk({
		comparisonVec: "teleportVec5",
		dotProductThreshhold: "pi + .0001",
		searchIterations: "5"
	})}

		globalColor += teleportPos(pos, fiber, startPos, startFiber, rayDirectionVec, t, totalT);
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
		// For future reference: the inverse to one of these is given by negating y, z, and w.
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

		vec3 getKleinElement(vec4 qElement, float fiber)
		{
			vec3 h2Element = getH2Element(qElement);

			return vec3(h2Element.x / h2Element.z, h2Element.y / h2Element.z, fiber);
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

		vec4 getUpdatedDirectionVec(vec4 pos, vec4 rayDirectionVec, float t)
		{
			vec3 h2Element = rayDirectionVec.xyz;

			applyH2Isometry(pos, h2Element);

			return vec4(h2Element, rayDirectionVec.w);
		}

		const float pi = 3.14159265;
		const float piOver2 = 1.5707963;

		const float root2 = 1.41421356;
		const float root2Over2Plus1 = 1.7071068;
		const float root1PlusRoot2 = 1.55377397;

		const vec3 teleportVec1 = ${getVectorGlsl(teleportVectors[0][0])};
		const vec3 teleportVec2 = ${getVectorGlsl(teleportVectors[1][0])};
		const vec3 teleportVec3 = ${getVectorGlsl(teleportVectors[2][0])};
		const vec3 teleportVec4 = ${getVectorGlsl(teleportVectors[3][0])};
		const vec3 teleportVec5 = ${getVectorGlsl(teleportVectors[4][0])};

		const mat4 teleportMat1Pos = ${getMatrixGlsl(teleportMatrices[0][0])};
		const mat4 teleportMat1Neg = ${getMatrixGlsl(teleportMatrices[0][1])};
		const mat4 teleportMat2Pos = ${getMatrixGlsl(teleportMatrices[1][0])};
		const mat4 teleportMat2Neg = ${getMatrixGlsl(teleportMatrices[1][1])};
		const mat4 teleportMat3Pos = ${getMatrixGlsl(teleportMatrices[2][0])};
		const mat4 teleportMat3Neg = ${getMatrixGlsl(teleportMatrices[2][1])};
		const mat4 teleportMat4Pos = ${getMatrixGlsl(teleportMatrices[3][0])};
		const mat4 teleportMat4Neg = ${getMatrixGlsl(teleportMatrices[3][1])};
		const mat4 teleportMat5Pos = ${getMatrixGlsl(teleportMatrices[4][0])};
		const mat4 teleportMat5Neg = ${getMatrixGlsl(teleportMatrices[4][1])};

		const float fiberAdjust1Pos = ${teleportFibers[0][0]};
		const float fiberAdjust1Neg = ${teleportFibers[0][1]};
		const float fiberAdjust2Pos = ${teleportFibers[1][0]};
		const float fiberAdjust2Neg = ${teleportFibers[1][1]};
		const float fiberAdjust3Pos = ${teleportFibers[2][0]};
		const float fiberAdjust3Neg = ${teleportFibers[2][1]};
		const float fiberAdjust4Pos = ${teleportFibers[3][0]};
		const float fiberAdjust4Neg = ${teleportFibers[3][1]};
		const float fiberAdjust5Pos = ${teleportFibers[4][0]};
		const float fiberAdjust5Neg = ${teleportFibers[4][1]};

		const float dotProductThreshhold1 = ${teleportVectors[0][1]};
		const float dotProductThreshhold2 = ${teleportVectors[1][1]};
		const float dotProductThreshhold3 = ${teleportVectors[2][1]};
		const float dotProductThreshhold4 = ${teleportVectors[3][1]};
		const float dotProductThreshhold5 = ${teleportVectors[4][1]};

		const float delta = ${delta};

		vec3 teleportPos(inout vec4 pos, inout float fiber, inout vec4 startPos, inout float startFiber, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec3 color = vec3(0.0, 0.0, 0.0);

			// First, we need to get the corresponding point in the Klein model of H^2, which is given by the intersection
			// of the line from our point on the hyperboloid to the origin with the plane z = 1.
			vec3 kleinElement = getKleinElement(pos, fiber);

			float dotProduct;

	${getTeleportGlslChunk({
		comparisonVec: "teleportVec1",
		dotProductThreshhold: "dotProductThreshhold1",
		teleportMatPos: "teleportMat1Pos",
		teleportMatNeg: "teleportMat1Neg",
		fiberAdjustPos: "fiberAdjust1Pos",
		fiberAdjustNeg: "fiberAdjust1Neg",
		teleportElementPos: "",
		teleportElementNeg: ""
	})}

	${getTeleportGlslChunk({
		comparisonVec: "teleportVec2",
		dotProductThreshhold: "dotProductThreshhold2",
		teleportMatPos: "teleportMat2Pos",
		teleportMatNeg: "teleportMat2Neg",
		fiberAdjustPos: "fiberAdjust2Pos",
		fiberAdjustNeg: "fiberAdjust2Neg",
		teleportElementPos: "",
		teleportElementNeg: ""
	})}

	${getTeleportGlslChunk({
		comparisonVec: "teleportVec3",
		dotProductThreshhold: "dotProductThreshhold3",
		teleportMatPos: "teleportMat3Pos",
		teleportMatNeg: "teleportMat3Neg",
		fiberAdjustPos: "fiberAdjust3Pos",
		fiberAdjustNeg: "fiberAdjust3Neg",
		teleportElementPos: "",
		teleportElementNeg: ""
	})}

	${getTeleportGlslChunk({
		comparisonVec: "teleportVec4",
		dotProductThreshhold: "dotProductThreshhold4",
		teleportMatPos: "teleportMat4Pos",
		teleportMatNeg: "teleportMat4Neg",
		fiberAdjustPos: "fiberAdjust4Pos",
		fiberAdjustNeg: "fiberAdjust4Neg",
		teleportElementPos: "",
		teleportElementNeg: ""
	})}

	${getTeleportGlslChunk({
		comparisonVec: "teleportVec5",
		dotProductThreshhold: "dotProductThreshhold5",
		teleportMatPos: "teleportMat5Pos",
		teleportMatNeg: "teleportMat5Neg",
		fiberAdjustPos: "fiberAdjust5Pos",
		fiberAdjustNeg: "fiberAdjust5Neg",
		teleportElementPos: "",
		teleportElementNeg: ""
	})}

			return color;
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
	/*
	[
					[1.7071068, 1.7071068, -2.1973682, 0],
					[-1.7071068, 1.7071068, 0, 2.1973682],
					[-2.1973682, 0, 1.7071068, 1.7071068],
					[0, 2.1973682, -1.7071068, 1.7071068]
				],
				[
					[1.7071068, -1.7071068, 2.1973682, 0],
					[1.7071068, 1.7071068, 0, -2.1973682],
					[2.1973682, 0, 1.7071068, -1.7071068],
					[0, -2.1973682, 1.7071068, 1.7071068]
				]
	*/

	teleportCamera(rotatedForwardVec, recomputeRotation)
	{
		let kleinElement = getKleinElement(this.cameraPos, this.cameraFiber);

		for (let i = 0; i < teleportMatrices.length; i++)
		{
			const dotProduct = kleinElement[0] * teleportVectors[i][0][0]
				+ kleinElement[1] * teleportVectors[i][0][1]
				+ kleinElement[2] * teleportVectors[i][0][2];

			if (dotProduct > teleportVectors[i][1])
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportMatrices[i][0],
					this.cameraPos
				);

				this.cameraFiber += teleportFibers[i][0];

				kleinElement = getKleinElement(this.cameraPos, this.cameraFiber);

				console.log("teleported!", i);
			}

			else if (dotProduct < -teleportVectors[i][1])
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportMatrices[i][1],
					this.cameraPos
				);

				this.cameraFiber += teleportFibers[i][1];

				kleinElement = getKleinElement(this.cameraPos, this.cameraFiber);

				console.log("teleported!", i);
			}
		}
	}
}

export class SL2RSpheres extends SL2RGeometry
{
	static distances = /*glsl*/`
		float radius = 1.0 + wallThickness;

		vec3 h2Element = getH2Element(pos);

		float distance1 = length(vec2(acosh(h2Element.z), fiber)) - radius;

		// The fundamental domain has height 2pi, so to evenly space three balls,
		// we want the gap between them to be (2pi - 6 * radius) / 3.
		// Solving for the center of the other spheres gives +/- 2pi/3.

		float distance2 = length(vec2(acosh(h2Element.z), fiber - 0.66667 * pi)) - radius;
		float distance3 = length(vec2(acosh(h2Element.z), fiber + 0.66667 * pi)) - radius;
	`;

	distanceEstimatorGlsl = /*glsl*/`
		${SL2RSpheres.distances}

		float minDistance = ${getMinGlslString("distance", 3)};

		return -minDistance;
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
		uniform float wallThickness;
	`;

	uniformNames = ["cameraFiber", "wallThickness"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["cameraFiber"], this.cameraFiber);
		gl.uniform1f(uniformList["wallThickness"], sliderValues.wallThickness);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = 0;
		wallThicknessSlider.max = 1.0;
		wallThicknessSlider.value = 0.0;
		wallThicknessSliderValue.textContent = 0.0;
		sliderValues.wallThickness = 0.0;
	}
}