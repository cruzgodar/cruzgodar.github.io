import { getMinGlslString, getVectorGlsl } from "../../../../scripts/applets/applet.js";
import { dotProduct, mat4TimesVector } from "../class.js";
import { BaseGeometry } from "./base.js";

const teleportVectors = [
	[1, 0, 0, 1 / Math.sqrt(3)],
	[-1, 0, 0, 1 / Math.sqrt(3)],
	[0, 1, 0, 1 / Math.sqrt(3)],
	[0, -1, 0, 1 / Math.sqrt(3)],
	[0, 0, 1, 1 / Math.sqrt(3)],
	[0, 0, -1, 1 / Math.sqrt(3)],
];

class H3Geometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;

		globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	dotProductGlsl = /* glsl */`
		return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;
	`;

	normalizeGlsl = /* glsl */`
		return dir * inversesqrt(abs(geometryDot(dir, dir)));
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(0.5 - totalT * 0.075));
	`;

	getNormalVecGlsl = /* glsl */`
		return normalize(vec4(-pos.xyz, pos.w));
	`;

	correctPosGlsl = /* glsl */`
		pos = cosh(correctionDistance) * pos - sinh(correctionDistance) * surfaceNormal;
	`;

	functionGlsl = /* glsl */`
		float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		const vec4 teleportVec1 = ${getVectorGlsl(teleportVectors[0])};
		const vec4 teleportVec2 = ${getVectorGlsl(teleportVectors[1])};
		const vec4 teleportVec3 = ${getVectorGlsl(teleportVectors[2])};
		const vec4 teleportVec4 = ${getVectorGlsl(teleportVectors[3])};
		const vec4 teleportVec5 = ${getVectorGlsl(teleportVectors[4])};
		const vec4 teleportVec6 = ${getVectorGlsl(teleportVectors[5])};

		const mat4 teleportMat1 = mat4(
			2.0, 0.0, 0.0, 1.73205081,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			1.73205081, 0.0, 0.0, 2.0
		);
		
		const mat4 teleportMat2 = mat4(
			2.0, 0.0, 0.0, -1.73205081,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			-1.73205081, 0.0, 0.0, 2.0
		);
		
		const mat4 teleportMat3 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 2.0, 0.0, 1.73205081,
			0.0, 0.0, 1.0, 0.0,
			0.0, 1.73205081, 0.0, 2.0
		);
		
		const mat4 teleportMat4 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 2.0, 0.0, -1.73205081,
			0.0, 0.0, 1.0, 0.0,
			0.0, -1.73205081, 0.0, 2.0
		);
		
		const mat4 teleportMat5 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 2.0, 1.73205081,
			0.0, 0.0, 1.73205081, 2.0
		);
		
		const mat4 teleportMat6 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 2.0, -1.73205081,
			0.0, 0.0, -1.73205081, 2.0
		);

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			if (dot(pos, teleportVec1) < 0.0)
			{
				pos = teleportMat1 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat1 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(1.0, 0.0, 0.0);
			}

			if (dot(pos, teleportVec2) < 0.0)
			{
				pos = teleportMat2 * pos;

				rayDirectionVec = teleportMat2 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(-1.0, 0.0, 0.0);
			}

			if (dot(pos, teleportVec3) < 0.0)
			{
				pos = teleportMat3 * pos;

				rayDirectionVec = teleportMat3 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 1.0, 0.0);
			}

			if (dot(pos, teleportVec4) < 0.0)
			{
				pos = teleportMat4 * pos;

				rayDirectionVec = teleportMat4 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, -1.0, 0.0);
			}

			if (dot(pos, teleportVec5) < 0.0)
			{
				pos = teleportMat5 * pos;

				rayDirectionVec = teleportMat5 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, 1.0);
			}

			if (dot(pos, teleportVec6) < 0.0)
			{
				pos = teleportMat6 * pos;

				rayDirectionVec = teleportMat6 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, -1.0);
			}

			return vec3(0.0, 0.0, 0.0);
		}
	`;

	maxT = "30.0";

	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] - vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(Math.abs(this.dotProduct(vec, vec)));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}

	correctPosition(pos)
	{
		return this.normalize(pos);
	}

	getNormalVec(cameraPos)
	{
		// f = -1 + x^2 + y^2 + z^2 - w^2.
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			cameraPos[3]
		]);
	}

	correctVectors()
	{
		const dotUp = this.dotProduct(
			this.cameraPos,
			this.upVec
		);

		const dotRight = this.dotProduct(
			this.cameraPos,
			this.rightVec
		);

		const dotForward = this.dotProduct(
			this.cameraPos,
			this.forwardVec
		);

		for (let i = 0; i < 4; i++)
		{
			// The signature of the Lorentzian inner product means
			// we need to add these instead of subtracting them.
			this.upVec[i] += dotUp * this.cameraPos[i];
			this.rightVec[i] += dotRight * this.cameraPos[i];
			this.forwardVec[i] += dotForward * this.cameraPos[i];
		}

		this.upVec = this.normalize(this.upVec);
		this.rightVec = this.normalize(this.rightVec);
		this.forwardVec = this.normalize(this.forwardVec);
	}

	baseColorIncreases = [
		[1, 0, 0],
		[-1, 0, 0],
		[0, 1, 0],
		[0, -1, 0],
		[0, 0, 1],
		[0, 0, -1]
	];
	
	baseColor = [0, 0, 0];

	teleportCamera(rotatedForwardVec, recomputeRotation)
	{
		const teleportMatrices = [
			[
				[2, 0, 0, Math.sqrt(3)],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[Math.sqrt(3), 0, 0, 2]
			],
			[
				[2, 0, 0, -Math.sqrt(3)],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[-Math.sqrt(3), 0, 0, 2]
			],
			[
				[1, 0, 0, 0],
				[0, 2, 0, Math.sqrt(3)],
				[0, 0, 1, 0],
				[0, Math.sqrt(3), 0, 2]
			],
			[
				[1, 0, 0, 0],
				[0, 2, 0, -Math.sqrt(3)],
				[0, 0, 1, 0],
				[0, -Math.sqrt(3), 0, 2]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 2, Math.sqrt(3)],
				[0, 0, Math.sqrt(3), 2]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 2, -Math.sqrt(3)],
				[0, 0, -Math.sqrt(3), 2]
			]
		];

		for (let i = 0; i < teleportMatrices.length; i++)
		{
			if (dotProduct(this.cameraPos, teleportVectors[i]) < 0)
			{
				this.cameraPos = mat4TimesVector(
					teleportMatrices[i],
					this.cameraPos
				);

				this.forwardVec = mat4TimesVector(
					teleportMatrices[i],
					this.forwardVec
				);

				this.rightVec = mat4TimesVector(
					teleportMatrices[i],
					this.rightVec
				);

				this.upVec = mat4TimesVector(
					teleportMatrices[i],
					this.upVec
				);

				const newRotatedForwardVec = mat4TimesVector(
					teleportMatrices[i],
					rotatedForwardVec
				);

				recomputeRotation(newRotatedForwardVec);

				this.baseColor[0] += this.baseColorIncreases[i][0];
				this.baseColor[1] += this.baseColorIncreases[i][1];
				this.baseColor[2] += this.baseColorIncreases[i][2];
			}
		}
	}
}



const axesDistances = /* glsl */`
	float distance1 = acosh(sqrt(pos.w * pos.w - pos.x * pos.x)) - .05;
	float distance2 = acosh(sqrt(pos.w * pos.w - pos.y * pos.y)) - .05;
	float distance3 = acosh(sqrt(pos.w * pos.w - pos.z * pos.z)) - .05;

	float minDistance = ${getMinGlslString("distance", 3)};
`;

export class H3Axes extends H3Geometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;
	`;

	functionGlsl = /* glsl */`
		float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}
	`;

	teleportCamera() {}

	distanceEstimatorGlsl = /* glsl */`
		${axesDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${axesDistances}
		
		if (minDistance == distance1)
		{
			return vec3(
				1.0,
				.5 + .25 * (.5 * (sin(10.0 * pos.x) + 1.0)),
				.5 + .25 * (.5 * (cos(10.0 * pos.x) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 + .25 * (.5 * (sin(10.0 * pos.y) + 1.0)),
				1.0,
				.5 + .25 * (.5 * (cos(10.0 * pos.y) + 1.0))
			);
		}

		return vec3(
			.5 + .25 * (.5 * (sin(10.0 * pos.z) + 1.0)),
			.5 + .25 * (.5 * (cos(10.0 * pos.z) + 1.0)),
			1.0
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity = max(
			max(abs(dotProduct1), abs(dotProduct2)),
			max(abs(dotProduct3), abs(dotProduct4))
		);
	`;

	cameraPos = [0.89424, -0.89424, 0.24177, 1.63027];
	normalVec = [-0.89424, 0.89424, -0.24177, 1.63027];
	upVec = [0.07548, -0.07548, 1.02152, 0.23431];
	rightVec = [0.70710, 0.70710, 0, 0];
	forwardVec = [-1.13752, 1.13752, -0.12226, -1.26605];

	movingSpeed = 1;
}



const roomsDistances = /* glsl */`
	float distance1 = maxT * 2.0;
	float distance2 = maxT * 2.0;

	if (sceneTransition < 1.0)
	{
		float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

		float effectiveWallThickness = wallThickness + sceneTransition * 4.0 / .75;

		distance1 = effectiveWallThickness - acosh(pos.w);
	}

	if (sceneTransition > 0.0)
	{
		float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

		float effectiveRadius = .425 - .425 / .75 * (1.0 - sceneTransition);

		distance2 = acosh(pos.w) - effectiveRadius;
	}

	if (totalT < clipDistance)
	{
		distance1 = maxT * 2.0;
		distance2 = maxT * 2.0;
	}

	// Translate the reflection plane to the x = 0 plane, then get the distance to it.
	// The DE to x = 0 is abs(asinh(pos.x)).
	float distance3 = abs(asinh(
		dot(
			vec4(1.23188, 0.0, 0.0, 0.71939),
			pos
		)
	));
	
	float distance4 = abs(asinh(
		dot(
			vec4(1.23188, 0.0, 0.0, -0.71939),
			pos
		)
	));

	float distance5 = abs(asinh(
		dot(
			vec4(0.0, 1.23188, 0.0, 0.71939),
			pos
		)
	));
	
	float distance6 = abs(asinh(
		dot(
			vec4(0.0, -1.23188, 0.0, 0.71939),
			pos
		)
	));

	float distance7 = abs(asinh(
		dot(
			vec4(0.0, 0.0, 1.23188, 0.71939),
			pos
		)
	));
	
	float distance8 = abs(asinh(
		dot(
			vec4(0.0, 0.0, -1.23188, 0.71939),
			pos
		)
	));

	float minDistance = ${getMinGlslString("distance", 8)};
`;

export class H3Rooms extends H3Geometry
{
	distanceEstimatorGlsl = /* glsl */`
		${roomsDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		vec3 roomColor = globalColor + baseColor;

		return mix(
			vec3(
				.25 + .75 * (.5 * (sin((.004 * pos.x + roomColor.x) * 40.0) + 1.0)),
				.25 + .75 * (.5 * (sin((.004 * pos.y + roomColor.y) * 57.0) + 1.0)),
				.25 + .75 * (.5 * (sin((.004 * pos.z + roomColor.z) * 89.0) + 1.0))
			),
			vec3(
				.15 + .85 * (.5 * (sin(floor(roomColor.x + .5) * .25) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(roomColor.y + .5) * .25) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(roomColor.z + .5) * .25) + 1.0))
			),
			sceneTransition
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = mix(1.0, 1.25, sceneTransition) * max(abs(dotProduct1), abs(dotProduct2));
	`;

	cameraPos = [-.1, 0, 0, Math.sqrt(.1 * .1 + 1)];
	normalVec = [.1, 0, 0, Math.sqrt(.1 * .1 + 1)];
	upVec = [0, 0, 1, 0];
	rightVec = [0, -1, 0, 0];
	forwardVec = [-1, 0, 0, 0];

	movingSpeed = 1.25;

	uniformGlsl = /* glsl */`
		uniform float sceneTransition;
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["sceneTransition", "wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList.sceneTransition, this.sliderValues.sceneTransition);

		const wallThickness = 1.5 -
			(this.sliderValues.wallThickness - (-.357)) / (.143 - (-.357)) * (1.5 - 1);

		gl.uniform1f(uniformList.wallThickness, wallThickness);
		gl.uniform1f(uniformList.clipDistance, this.sliderValues.clipDistance);
		gl.uniform3fv(uniformList.baseColor, this.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button, #clip-distance-slider";

	wallThicknessData = [.143, -.357, .143];
	maxClipDistance = 6;
	doClipBrightening = true;

	getNearestCenter()
	{
		return [0, 0, 0, 1];
	}

	getNearestCorner()
	{
		const corners = [
			[1, 1, 1, 2],
			[1, -1, 1, 2],
			[-1, 1, 1, 2],
			[-1, -1, 1, 2],
			[1, 1, -1, 2],
			[1, -1, -1, 2],
			[-1, 1, -1, 2],
			[-1, -1, -1, 2],
		];

		let minDistance = Infinity;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const distance = Math.acosh(
				this.cameraPos[0] * corners[i][0]
				+ this.cameraPos[1] * corners[i][1]
				+ this.cameraPos[2] * corners[i][2]
				+ this.cameraPos[3] * corners[i][3]
			);

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return corners[minIndex];
	}
}