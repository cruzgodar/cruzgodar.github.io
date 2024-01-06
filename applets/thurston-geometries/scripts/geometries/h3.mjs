import { ThurstonGeometry } from "../class.mjs";
import { sliderValues } from "../index.mjs";
import { BaseGeometry, getMinGlslString } from "./base.mjs";
import { $ } from "/scripts/src/main.mjs";

const baseColorIncreases = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1]
];

const baseColor = [0, 0, 0];

class H3Geometry extends BaseGeometry
{
	geodesicGlsl = `vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;

	globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);`;

	dotProductGlsl = "return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;";

	normalizeGlsl = `float magnitude = sqrt(abs(geometryDot(dir, dir)));
	
	return dir / magnitude;`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(0.5 - totalT * 0.075));";

	functionGlsl = `float sinh(float x)
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
			float c = cos(gluingAngle);
			float s = sin(gluingAngle);

			vec4 teleportVec1 = vec4(1.0, 0.0, 0.0, 0.577350269);
			mat4 teleportMat1 = mat4(
				2.0, 0.0, 0.0, 1.73205081,
				0.0, c, s, 0.0,
				0.0, -s, c, 0.0,
				1.73205081, 0.0, 0.0, 2.0
			);

			vec4 teleportVec2 = vec4(-1.0, 0.0, 0.0, 0.577350269);
			mat4 teleportMat2 = mat4(
				2.0, 0.0, 0.0, -1.73205081,
				0.0, c, -s, 0.0,
				0.0, s, c, 0.0,
				-1.73205081, 0.0, 0.0, 2.0
			);

			vec4 teleportVec3 = vec4(0.0, 1.0, 0.0, 0.577350269);
			mat4 teleportMat3 = mat4(
				c, 0.0, s, 0.0,
				0.0, 2.0, 0.0, 1.73205081,
				-s, 0.0, c, 0.0,
				0.0, 1.73205081, 0.0, 2.0
			);

			vec4 teleportVec4 = vec4(0.0, -1.0, 0.0, 0.577350269);
			mat4 teleportMat4 = mat4(
				c, 0.0, -s, 0.0,
				0.0, 2.0, 0.0, -1.73205081,
				s, 0.0, c, 0.0,
				0.0, -1.73205081, 0.0, 2.0
			);

			vec4 teleportVec5 = vec4(0.0, 0.0, 1.0, 0.577350269);
			mat4 teleportMat5 = mat4(
				c, s, 0.0, 0.0,
				-s, c, 0.0, 0.0,
				0.0, 0.0, 2.0, 1.73205081,
				0.0, 0.0, 1.73205081, 2.0
			);

			vec4 teleportVec6 = vec4(0.0, 0.0, -1.0, 0.577350269);
			mat4 teleportMat6 = mat4(
				c, -s, 0.0, 0.0,
				s, c, 0.0, 0.0,
				0.0, 0.0, 2.0, -1.73205081,
				0.0, 0.0, -1.73205081, 2.0
			);



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

	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] - vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(Math.abs(this.dotProduct(vec, vec)));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
	
	followGeodesic(pos, dir, t)
	{
		const newPos = new Array(4);

		for (let i = 0; i < 4; i++)
		{
			newPos[i] = Math.cosh(t) * pos[i] + Math.sinh(t) * dir[i];
		}
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we just want the hyperbolic dot product to be -1.
		const dot = this.dotProduct(newPos, newPos);
		const magnitude = Math.sqrt(-dot);

		newPos[0] /= magnitude;
		newPos[1] /= magnitude;
		newPos[2] /= magnitude;
		newPos[3] /= magnitude;

		return newPos;
	}

	getNormalVec(cameraPos)
	{
		//f = -1 + x^2 + y^2 + z^2 - w^2.
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			cameraPos[3]
		]);
	}

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		vec4 lightDirection3 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);

		vec4 lightDirection4 = normalize(vec4(-1.0, -1.0, -1.0, 0.0) - pos);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float lightIntensity = lightBrightness * max(
			max(abs(dotProduct1), abs(dotProduct2)),
			max(abs(dotProduct3), abs(dotProduct4))
		);
	`;

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

	teleportCamera(rotatedForwardVec, recomputeRotation)
	{
		const cosine = Math.cos(sliderValues.gluingAngle);
		const sine = Math.sin(sliderValues.gluingAngle);

		const teleportations = [
			[
				[1, 0, 0, 1 / Math.sqrt(3)],
				[
					[2, 0, 0, Math.sqrt(3)],
					[0, cosine, -sine, 0],
					[0, sine, cosine, 0],
					[Math.sqrt(3), 0, 0, 2]
				]
			],
	
			[
				[-1, 0, 0, 1 / Math.sqrt(3)],
				[
					[2, 0, 0, -Math.sqrt(3)],
					[0, cosine, sine, 0],
					[0, -sine, cosine, 0],
					[-Math.sqrt(3), 0, 0, 2]
				]
			],
	
			[
				[0, 1, 0, 1 / Math.sqrt(3)],
				[
					[cosine, 0, -sine, 0],
					[0, 2, 0, Math.sqrt(3)],
					[sine, 0, cosine, 0],
					[0, Math.sqrt(3), 0, 2]
				]
			],
	
			[
				[0, -1, 0, 1 / Math.sqrt(3)],
				[
					[cosine, 0, sine, 0],
					[0, 2, 0, -Math.sqrt(3)],
					[-sine, 0, cosine, 0],
					[0, -Math.sqrt(3), 0, 2]
				]
			],
	
			[
				[0, 0, 1, 1 / Math.sqrt(3)],
				[
					[cosine, -sine, 0, 0],
					[sine, cosine, 0, 0],
					[0, 0, 2, Math.sqrt(3)],
					[0, 0, Math.sqrt(3), 2]
				]
			],
	
			[
				[0, 0, -1, 1 / Math.sqrt(3)],
				[
					[cosine, sine, 0, 0],
					[-sine, cosine, 0, 0],
					[0, 0, 2, -Math.sqrt(3)],
					[0, 0, -Math.sqrt(3), 2]
				]
			],
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

				baseColor[0] += baseColorIncreases[i][0];
				baseColor[1] += baseColorIncreases[i][1];
				baseColor[2] += baseColorIncreases[i][2];
			}
		}
	}
}

export class H3Rooms extends H3Geometry
{
	static distances = `
		float distance1 = wallThickness - acosh(pos.w);

		// Translate the reflection plane to the x = 0 plane, then get the distance to it.
		// The DE to x = 0 is abs(asinh(pos.x)).
		float distance2 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, 0.0, 0.71939),
				pos
			)
		));
		
		float distance3 = abs(asinh(
			dot(
				vec4(1.23188, 0.0, 0.0, -0.71939),
				pos
			)
		));

		float distance4 = abs(asinh(
			dot(
				vec4(0.0, 1.23188, 0.0, 0.71939),
				pos
			)
		));
		
		float distance5 = abs(asinh(
			dot(
				vec4(0.0, -1.23188, 0.0, 0.71939),
				pos
			)
		));

		float distance6 = abs(asinh(
			dot(
				vec4(0.0, 0.0, 1.23188, 0.71939),
				pos
			)
		));
		
		float distance7 = abs(asinh(
			dot(
				vec4(0.0, 0.0, -1.23188, 0.71939),
				pos
			)
		));
	`;

	distanceEstimatorGlsl = `
		${H3Rooms.distances}

		float minDistance = ${getMinGlslString("distance", 7)};

		return minDistance;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(floor(baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		);
	`;

	getMovingSpeed()
	{
		return 1.5;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, -1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = `
		uniform float wallThickness;
		uniform float gluingAngle;
		uniform vec3 baseColor;
	`;

	uniformNames = ["wallThickness", "gluingAngle", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		const wallThickness = 1.5 -
			(sliderValues.wallThickness - (-.357)) / (.143 - (-.357)) * (1.5 - 1);

		gl.uniform1f(uniformList["wallThickness"], wallThickness);
		gl.uniform1f(uniformList["gluingAngle"], sliderValues.gluingAngle);
		gl.uniform3fv(uniformList["baseColor"], baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider, #gluing-angle-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.357;
		wallThicknessSlider.max = .143;
		wallThicknessSlider.value = .143;
		wallThicknessSliderValue.textContent = .143;
		sliderValues.wallThickness = .143;

		const gluingAngleSlider = $("#gluing-angle-slider");
		const gluingAngleSliderValue = $("#gluing-angle-slider-value");

		gluingAngleSlider.min = 0;
		gluingAngleSlider.max = 2 * Math.PI;
		gluingAngleSlider.value = 0;
		gluingAngleSliderValue.textContent = 0;
		sliderValues.gluingAngle = 0;
	}
}