import {
	getMatrixGlsl,
	getMinGlslString,
	getVectorGlsl
} from "../../../../scripts/applets/applet.js";
import { dotProduct, mat4TimesVector } from "../class.js";
import { BaseGeometry } from "./base.js";

const teleportations = [
	[
		[1, 0, 1 / Math.sqrt(3), 0],
		[
			[2, 0, Math.sqrt(3), 0],
			[0, 1, 0, 0],
			[Math.sqrt(3), 0, 2, 0],
			[0, 0, 0, 1]
		]
	],

	[
		[-1, 0, 1 / Math.sqrt(3), 0],
		[
			[2, 0, -Math.sqrt(3), 0],
			[0, 1, 0, 0],
			[-Math.sqrt(3), 0, 2, 0],
			[0, 0, 0, 1]
		]
	],

	[
		[0, 1, 1 / Math.sqrt(3), 0],
		[
			[1, 0, 0, 0],
			[0, 2, Math.sqrt(3), 0],
			[0, Math.sqrt(3), 2, 0],
			[0, 0, 0, 1]
		]
	],

	[
		[0, -1, 1 / Math.sqrt(3), 0],
		[
			[1, 0, 0, 0],
			[0, 2, -Math.sqrt(3), 0],
			[0, -Math.sqrt(3), 2, 0],
			[0, 0, 0, 1]
		]
	]
];

class H2xEGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		float h2Mag = sqrt(abs(
			rayDirectionVec.x * rayDirectionVec.x
			+ rayDirectionVec.y * rayDirectionVec.y
			- rayDirectionVec.z * rayDirectionVec.z
		));
		
		vec4 pos = vec4(
			cosh(h2Mag * t) * startPos.xyz + sinh(h2Mag * t) * rayDirectionVec.xyz / h2Mag,
			startPos.w + t * rayDirectionVec.w
		);
		
		globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	dotProductGlsl = /* glsl */`
		return v.x * w.x + v.y * w.y - v.z * w.z + v.w * w.w;
	`;

	normalizeGlsl = /* glsl */`
		return dir * inversesqrt(abs(geometryDot(dir, dir)));
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.25));
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

		const vec4 teleportVec1 = ${getVectorGlsl(teleportations[0][0])};
		const mat4 teleportMat1 = ${getMatrixGlsl(teleportations[0][1])};

		const vec4 teleportVec2 = ${getVectorGlsl(teleportations[1][0])};
		const mat4 teleportMat2 = ${getMatrixGlsl(teleportations[1][1])};

		const vec4 teleportVec3 = ${getVectorGlsl(teleportations[2][0])};
		const mat4 teleportMat3 = ${getMatrixGlsl(teleportations[2][1])};

		const vec4 teleportVec4 = ${getVectorGlsl(teleportations[3][0])};
		const mat4 teleportMat4 = ${getMatrixGlsl(teleportations[3][1])};

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			if (dot(pos, teleportVec1) < 0.0)
			{
				pos = teleportMat1 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				float h2Mag = sqrt(abs(
					rayDirectionVec.x * rayDirectionVec.x
					+ rayDirectionVec.y * rayDirectionVec.y
					- rayDirectionVec.z * rayDirectionVec.z
				));

				rayDirectionVec = teleportMat1 * vec4(
					h2Mag * sinh(h2Mag * t) * startPos.xyz + cosh(h2Mag * t) * rayDirectionVec.xyz,
					rayDirectionVec.w
				);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 1.0, 0.0);
			}

			if (dot(pos, teleportVec2) < 0.0)
			{
				pos = teleportMat2 * pos;

				float h2Mag = sqrt(abs(
					rayDirectionVec.x * rayDirectionVec.x
					+ rayDirectionVec.y * rayDirectionVec.y
					- rayDirectionVec.z * rayDirectionVec.z
				));
				
				rayDirectionVec = teleportMat2 * vec4(
					h2Mag * sinh(h2Mag * t) * startPos.xyz + cosh(h2Mag * t) * rayDirectionVec.xyz,
					rayDirectionVec.w
				);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, -1.0, 0.0);
			}

			if (dot(pos, teleportVec3) < 0.0)
			{
				pos = teleportMat3 * pos;

				float h2Mag = sqrt(abs(
					rayDirectionVec.x * rayDirectionVec.x
					+ rayDirectionVec.y * rayDirectionVec.y
					- rayDirectionVec.z * rayDirectionVec.z
				));
				
				rayDirectionVec = teleportMat3 * vec4(
					h2Mag * sinh(h2Mag * t) * startPos.xyz + cosh(h2Mag * t) * rayDirectionVec.xyz,
					rayDirectionVec.w
				);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, 1.0);
			}

			if (dot(pos, teleportVec4) < 0.0)
			{
				pos = teleportMat4 * pos;

				float h2Mag = sqrt(abs(
					rayDirectionVec.x * rayDirectionVec.x
					+ rayDirectionVec.y * rayDirectionVec.y
					- rayDirectionVec.z * rayDirectionVec.z
				));
				
				rayDirectionVec = teleportMat4 * vec4(
					h2Mag * sinh(h2Mag * t) * startPos.xyz + cosh(h2Mag * t) * rayDirectionVec.xyz,
					rayDirectionVec.w
				);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, -1.0);
			}

			return vec3(0.0, 0.0, 0.0);
		}
	`;

	maxT = "30.0";

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

	getNormalVec(cameraPos)
	{
		// f = -1 + x^2 + y^2 - z^2.
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			cameraPos[2],
			0
		]);
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

	correctVectors()
	{
		function h2DotProduct(vec1, vec2)
		{
			return vec1[0] * vec2[0] + vec1[1] * vec2[1] - vec1[2] * vec2[2];
		}

		// Here, we want this weirdo dot product to be 0.
		const dotUp = h2DotProduct(
			this.cameraPos,
			this.upVec
		);

		const dotRight = h2DotProduct(
			this.cameraPos,
			this.rightVec
		);

		const dotForward = h2DotProduct(
			this.cameraPos,
			this.forwardVec
		);

		for (let i = 0; i < 3; i++)
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
		[0, 1, 0],
		[0, -1, 0],
		[0, 0, 1],
		[0, 0, -1]
	];
	
	baseColor = [0, 0, 0];

	teleportCamera(rotatedForwardVec, recomputeRotation)
	{
		for (let i = 0; i < teleportations.length; i++)
		{
			if (dotProduct(this.cameraPos, teleportations[i][0]) < 0)
			{
				this.cameraPos = mat4TimesVector(
					teleportations[i][1],
					this.cameraPos
				);

				this.forwardVec = mat4TimesVector(
					teleportations[i][1],
					this.forwardVec
				);

				this.rightVec = mat4TimesVector(
					teleportations[i][1],
					this.rightVec
				);

				this.upVec = mat4TimesVector(
					teleportations[i][1],
					this.upVec
				);

				const newRotatedForwardVec = mat4TimesVector(
					teleportations[i][1],
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
	float distance1 = length(vec2(acosh(sqrt(1.0 + pos.y * pos.y)), pos.w)) - .05;
	float distance2 = length(vec2(acosh(sqrt(1.0 + pos.x * pos.x)), pos.w)) - .05;
	float distance3 = acosh(pos.z) - .05;

	float minDistance = ${getMinGlslString("distance", 3)};
`;

export class H2xEAxes extends H2xEGeometry
{
	geodesicGlsl = /* glsl */`
		float h2Mag = sqrt(abs(
			rayDirectionVec.x * rayDirectionVec.x
			+ rayDirectionVec.y * rayDirectionVec.y
			- rayDirectionVec.z * rayDirectionVec.z
		));
		
		vec4 pos = vec4(
			cosh(h2Mag * t) * startPos.xyz + sinh(h2Mag * t) * rayDirectionVec.xyz / h2Mag,
			startPos.w + t * rayDirectionVec.w
		);
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
				.5 + .25 * (.5 * (sin(20.0 * pos.x) + 1.0)),
				.5 + .25 * (.5 * (cos(20.0 * pos.x) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 + .25 * (.5 * (sin(20.0 * pos.y) + 1.0)),
				1.0,
				.5 + .25 * (.5 * (cos(20.0 * pos.y) + 1.0))
			);
		}

		return vec3(
			.5 + .25 * (.5 * (sin(5.0 * pos.w) + 1.0)),
			.5 + .25 * (.5 * (cos(5.0 * pos.w) + 1.0)),
			1.0
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(-1.0, 1.0, 0.0, .5) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * dotProduct1;
	`;

	cameraPos = [-0.52612, 0.55674, 1.25967, 0.34129];
	normalVec = [0.52619, -0.55667, 1.25966, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0.70684, 0.70758, 0.01743, 0];
	forwardVec = [0.88161, -0.89956, -0.76580, 0];

	movingSpeed = 1.25;
}



const roomsDistances = /* glsl */`
	float spacing = 1.875;

	float distance1 = maxT * 2.0;
	float distance2 = maxT * 2.0;

	if (sceneTransition < 1.0)
	{
		float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

		float effectiveWallThickness = wallThickness + sceneTransition * .48 / .75;

		distance1 = effectiveWallThickness - length(vec2(acosh(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
	}

	if (sceneTransition > 0.0)
	{
		float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

		float effectiveRadius = .4 - .4 / .75 * (1.0 - sceneTransition);

		distance2 = (length(vec2(acosh(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0)) - effectiveRadius) * scale;
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
			vec4(1.23188, 0.0, 0.71939, 0),
			pos
		)
	));
	
	float distance4 = abs(asinh(
		dot(
			vec4(1.23188, 0.0, -0.71939, 0),
			pos
		)
	));

	float distance5 = abs(asinh(
		dot(
			vec4(0.0, 1.23188, 0.71939, 0),
			pos
		)
	));
	
	float distance6 = abs(asinh(
		dot(
			vec4(0.0, -1.23188, 0.71939, 0),
			pos
		)
	));

	float minDistance = ${getMinGlslString("distance", 6)};
`;

export class H2xERooms extends H2xEGeometry
{
	distanceEstimatorGlsl = /* glsl */`
		${roomsDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${roomsDistances}

		vec3 roomColor = globalColor + baseColor;

		float wColor = floor((pos.w + 3.0 * spacing / 2.0) / spacing) - spacing / 2.0;

		return mix(
			vec3(
				.15 + .85 * .5 * (sin((.05 * pos.x + wColor + roomColor.y + roomColor.z) * 5.0) + 1.0),
				.15 + .85 * .5 * (sin((.05 * pos.y + wColor + roomColor.y) * 7.0) + 1.0),
				.15 + .85 * .5 * (sin((.05 * pos.z + wColor + roomColor.z) * 11.0) + 1.0)
			),
			vec3(
				.15 + .85 * (.5 * (sin(floor(wColor + roomColor.x + .5) * .25) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(wColor + roomColor.y + .5) * .25) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(wColor + roomColor.z + .5) * .25) + 1.0))
			),
			sceneTransition
		);
	`;

	lightGlsl = /* glsl */`
		float spacing = 1.875;
		vec4 moddedPos = vec4(pos.xyz, mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0);

		if (sceneTransition == 1.0)
		{
			moddedPos.xyz *= 1.001;
			surfaceNormal = getSurfaceNormal(moddedPos, totalT);
		}

		vec4 lightDirection1 = normalize(vec4(-1.0, 1.0, 0.0, .5) - moddedPos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		vec4 lightDirection2 = normalize(vec4(1.0, -1.0, 0.0, -.5) - moddedPos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		

		float lightIntensity = mix(1.5, 2.0, sceneTransition) * max(dotProduct1, dotProduct2);
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-totalT * mix(0.25, 0.05, sceneTransition)));
	`;

	cameraPos = [0, .025, Math.sqrt(.025 * .025 + 1), 0];
	normalVec = [0, -.025, Math.sqrt(.025 * .025 + 1), 0];
	upVec = [0, 0, 0, 1];
	rightVec = [-1, 0, 0, 0];
	forwardVec = [0, 1, 0, 0];

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

		const wallThickness = 1.145 - this.sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList.wallThickness, wallThickness);
		gl.uniform1f(uniformList.clipDistance, this.sliderValues.clipDistance);
		gl.uniform3fv(uniformList.baseColor, this.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button, #clip-distance-slider";

	wallThicknessData = [1.55, -.55, 1.55];
	maxClipDistance = 5;
	doClipBrightening = true;

	getNearestCenter()
	{
		const spacing = 1.875;

		return [0, 0, 1, Math.round(this.cameraPos[3] / spacing) * spacing];
	}

	getNearestCorner()
	{
		const spacing = 1.875;
		const cameraPosWModded = (this.cameraPos[3] + spacing / 2) % spacing - spacing / 2;

		const corners = [
			[1, 1, Math.sqrt(3), spacing / 2],
			[1, -1, Math.sqrt(3), spacing / 2],
			[-1, 1, Math.sqrt(3), spacing / 2],
			[-1, -1, Math.sqrt(3), spacing / 2],
			[1, 1, Math.sqrt(3), -spacing / 2],
			[1, -1, Math.sqrt(3), -spacing / 2],
			[-1, 1, Math.sqrt(3), -spacing / 2],
			[-1, -1, Math.sqrt(3), -spacing / 2],
		];

		let minDistance = Infinity;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const h2Distance = Math.acosh(
				this.cameraPos[0] * corners[i][0]
				+ this.cameraPos[1] * corners[i][1]
				+ this.cameraPos[2] * corners[i][2]
			);

			const e1Distance = cameraPosWModded - corners[i][3];

			// No need to square root the distance when we're just finding the minimum.
			const distance = h2Distance * h2Distance + e1Distance * e1Distance;

			if (distance < minDistance)
			{
				minDistance = distance;
				minIndex = i;
			}
		}

		return [
			corners[minIndex][0],
			corners[minIndex][1],
			corners[minIndex][2],
			this.cameraPos[3] - cameraPosWModded + corners[minIndex][3]
		];
	}
}