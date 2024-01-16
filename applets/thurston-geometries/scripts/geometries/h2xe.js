import { ThurstonGeometry } from "../class.js";
import { sliderValues } from "../index.js";
import { BaseGeometry, getMinGlslString } from "./base.js";
import { $ } from "/scripts/src/main.js";

class H2xEGeometry extends BaseGeometry
{
	geodesicGlsl = /*glsl*/`
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

	dotProductGlsl = /*glsl*/`
		return v.x * w.x + v.y * w.y - v.z * w.z + v.w * w.w;
	`;

	normalizeGlsl = /*glsl*/`
		float magnitude = sqrt(abs(geometryDot(dir, dir)));
		
		return dir / magnitude;
	`;

	fogGlsl = /*glsl*/`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.4));
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

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec4 teleportVec1 = vec4(1.0, 0.0, 0.577350269, 0.0);
			mat4 teleportMat1 = mat4(
				2.0, 0.0, 1.73205081, 0.0,
				0.0, 1.0, 0.0, 0.0,
				1.73205081, 0.0, 2.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);

			vec4 teleportVec2 = vec4(-1.0, 0.0, 0.577350269, 0.0);
			mat4 teleportMat2 = mat4(
				2.0, 0.0, -1.73205081, 0.0,
				0.0, 1.0, 0.0, 0.0,
				-1.73205081, 0.0, 2.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);

			vec4 teleportVec3 = vec4(0.0, 1.0, 0.577350269, 0.0);
			mat4 teleportMat3 = mat4(
				1.0, 0.0, 0.0, 0.0,
				0.0, 2.0, 1.73205081, 0.0,
				0.0, 1.73205081, 2.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);

			vec4 teleportVec4 = vec4(0.0, -1.0, 0.577350269, 0.0);
			mat4 teleportMat4 = mat4(
				1.0, 0.0, 0.0, 0.0,
				0.0, 2.0, -1.73205081, 0.0,
				0.0, -1.73205081, 2.0, 0.0,
				0.0, 0.0, 0.0, 1.0
			);



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
		//f = -1 + x^2 + y^2 - z^2.
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

		for (let i = 0; i < teleportations.length; i++)
		{
			if (ThurstonGeometry.dotProduct(this.cameraPos, teleportations[i][0]) < 0)
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportations[i][1],
					this.cameraPos
				);

				this.forwardVec = ThurstonGeometry.mat4TimesVector(
					teleportations[i][1],
					this.forwardVec
				);

				this.rightVec = ThurstonGeometry.mat4TimesVector(
					teleportations[i][1],
					this.rightVec
				);

				this.upVec = ThurstonGeometry.mat4TimesVector(
					teleportations[i][1],
					this.upVec
				);

				const newRotatedForwardVec = ThurstonGeometry.mat4TimesVector(
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



export class H2xERooms extends H2xEGeometry
{
	static distances = /*glsl*/`
		float spacing = 1.875;
		float distance1 = wallThickness - length(vec2(acosh(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));

		// Translate the reflection plane to the x = 0 plane, then get the distance to it.
		// The DE to x = 0 is abs(asinh(pos.x)).
		float distance2 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, 0.71939, 0),
				pos
			)
		));
		
		float distance3 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, -0.71939, 0),
				pos
			)
		));

		float distance4 = abs(asinh(
			dot(
				vec4(0.0, 1.23188, 0.71939, 0),
				pos
			)
		));
		
		float distance5 = abs(asinh(
			dot(
				vec4(0.0, -1.23188, 0.71939, 0),
				pos
			)
		));
	`;

	distanceEstimatorGlsl = /*glsl*/`
		${H2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = /*glsl*/`
		${H2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		float wColor = floor((pos.w + 3.0 * spacing / 2.0) / spacing) - spacing / 2.0;

		return vec3(
			.4 + .6 * .5 * (sin((.05 * pos.x + wColor + globalColor.y + baseColor.y + globalColor.z + baseColor.z) * 5.0) + 1.0),
			.4 + .6 * .5 * (sin((.05 * pos.y + wColor + globalColor.y + baseColor.y) * 7.0) + 1.0),
			.4 + .6 * .5 * (sin((.05 * pos.z + wColor + globalColor.z + baseColor.z) * 11.0) + 1.0)
		);
	`;

	lightGlsl = /*glsl*/`
		float spacing = 1.875;
		vec4 moddedPos = vec4(pos.xyz, mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0);

		vec4 lightDirection1 = normalize(vec4(-1.0, 1.0, 0.0, .5) - moddedPos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		vec4 lightDirection2 = normalize(vec4(1.0, -1.0, 0.0, -.5) - moddedPos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		

		float lightIntensity = 1.5 * lightBrightness * max(dotProduct1, dotProduct2);
	`;

	cameraPos = [0, 0, 1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1.25;
	}

	uniformGlsl = /*glsl*/`
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = 1.145 - sliderValues.wallThickness / 10;

		gl.uniform1f(uniformList["wallThickness"], wallThickness);

		gl.uniform3fv(uniformList["baseColor"], this.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.55;
		wallThicknessSlider.max = 1.05;
		wallThicknessSlider.value = 1.05;
		wallThicknessSliderValue.textContent = 1.05;
		sliderValues.wallThickness = 1.05;
	}
}

export class H2xESpheres extends H2xEGeometry
{
	static distances = /*glsl*/`
		float spacing = 1.5;
		float distance1 = length(vec2(acosh(pos.z), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0)) - .5;

		// Translate the reflection plane to the x = 0 plane, then get the distance to it.
		// The DE to x = 0 is abs(asinh(pos.x)).
		float distance2 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, 0.71939, 0),
				pos
			)
		));
		
		float distance3 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, -0.71939, 0),
				pos
			)
		));

		float distance4 = abs(asinh(
			dot(
				vec4(0.0, 1.23188, 0.71939, 0),
				pos
			)
		));
		
		float distance5 = abs(asinh(
			dot(
				vec4(0.0, -1.23188, 0.71939, 0),
				pos
			)
		));
	`;

	distanceEstimatorGlsl = /*glsl*/`
		${H2xESpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = /*glsl*/`
		${H2xESpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		float wColor = floor((pos.w + spacing / 2.0) / spacing);

		float colorSum = globalColor.x + baseColor.x + globalColor.y + baseColor.y + globalColor.z + baseColor.z;

		return vec3(
			.1 + .8 * .5 * (sin((wColor + colorSum) * 7.0) + 1.0),
			.1 + .8 * .5 * (sin((wColor + colorSum) * 11.0) + 1.0),
			.1 + .8 * .5 * (sin((wColor + colorSum) * 17.0) + 1.0)
		);
	`;

	lightGlsl = /*glsl*/`
		// Equally weird to the S^2 x E fix, and equally necessary.
		pos.xyz *= 1.001;
		surfaceNormal = getSurfaceNormal(pos);

		float spacing = 1.5;
		vec4 moddedPos = vec4(pos.xyz, mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0);

		vec4 lightDirection1 = normalize(vec4(-1.0, 1.0, 0.0, .5) - moddedPos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		vec4 lightDirection2 = normalize(vec4(1.0, -1.0, 0.0, -.5) - moddedPos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 2.0 * lightBrightness * max(dotProduct1, dotProduct2);
	`;

	cameraPos = [0, 0, 1, .75];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1.25;
	}

	uniformGlsl = /*glsl*/`
		uniform vec3 baseColor;
	`;

	uniformNames = ["baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform3fv(uniformList["baseColor"], this.baseColor);
	}
}