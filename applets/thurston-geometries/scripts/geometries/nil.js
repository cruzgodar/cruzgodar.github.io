import { ThurstonGeometry } from "../class.js";
import { sliderValues } from "../index.js";
import { BaseGeometry } from "./base.js";
import { $ } from "/scripts/src/main.js";

const baseColorIncreases = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1]
];

const baseColor = [0, 0, 0];

class NilGeometry extends BaseGeometry
{
	geodesicGlsl = `mat4 A = mat4(
		1.0, 0.0, -startPos.y * .5, 0.0,
		0.0, 1.0, startPos.x * .5, 0.0,
		0.0, 0.0, 1.0, 0.0,
		startPos.x, startPos.y, startPos.z, 1.0
	);

	vec4 v = mat4(
		1.0, 0.0, startPos.y * .5, 0.0,
		0.0, 1.0, -startPos.x * .5, 0.0,
		0.0, 0.0, 1.0, 0.0,
		-startPos.x, -startPos.y, -startPos.z, 1.0
	) * rayDirectionVec;

	float alpha = atan(v.y, v.x);
	float a = length(v.xy);
	float c = v.z;

	vec4 pos;

	if (abs(c) < 0.00001)
	{
		pos = A * vec4(
			a * cos(alpha) * t,
			a * sin(alpha) * t,
			0.0,
			0.0
		);
	}
	
	pos = A * vec4(
		2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
		2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
		c * t + a*a / (2.0 * c*c) * (c * t - sin(c * t)),
		0.0
	);

	// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	// No dot product in Nil
	dotProductGlsl = "return 0.0;";

	normalizeGlsl = `float zFactor = dir.z - (cameraPos.x * dir.y - cameraPos.y * dir.x) / 2.0;

	float magnitude = length(vec3(dir.xy, zFactor));
	
	return dir / magnitude;`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(0.5 - totalT * 0.075));";

	
	normalize(vec)
	{
		const zFactor = vec[2] - (this.cameraPos[0] * vec[1] - this.cameraPos[1] * vec[0]) / 2;

		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + zFactor * zFactor);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
	
	followGeodesic(pos, dir, t)
	{
		const A = [
			[1, 0, 0, pos[0]],
			[0, 1, 0, pos[1]],
			[-pos[1] / 2, pos[0] / 2, 1, pos[2]],
			[0, 0, 0, 1]
		];

		const Ainv = [
			[1, 0, 0, -pos[0]],
			[0, 1, 0, -pos[1]],
			[pos[1] / 2, -pos[0] / 2, 1, -pos[2]],
			[0, 0, 0, 1]
		];

		const v = ThurstonGeometry.mat4TimesVector(Ainv, dir);

		const alpha = Math.atan2(v[1], v[0]);
		const a = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
		const c = v[2];

		const newPos = ThurstonGeometry.mat4TimesVector(A,
			Math.abs(c) < 0.00001
				? [
					a * Math.cos(alpha) * t,
					a * Math.sin(alpha) * t,
					0,
					0
				]
				: [
					2 * a / c * Math.sin(c * t / 2) * Math.cos(c * t / 2 + alpha),
					2 * a / c * Math.sin(c * t / 2) * Math.sin(c * t / 2 + alpha),
					c * t + a * a / (2 * c * c) * (c * t - Math.sin(c * t)),
					0
				]
		);
		
		// No need to correct the position in Nil babyyy
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

export class NilSpheres extends NilGeometry
{
	static distances = `
		float distance1 = 1.0;
		/*
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
		*/
	`;

	distanceEstimatorGlsl = `
		${NilSpheres.distances}

		float minDistance = distance1;

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