import { ThurstonGeometry } from "../class.js";
import { BaseGeometry, getMinGlslString } from "./base.js";

class SL2RGeometry extends BaseGeometry
{
	geodesicGlsl = /*glsl*/`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	normalizeGlsl = /*glsl*/`
		float zFactor = dir.z - (cameraPos.x * dir.y - cameraPos.y * dir.x) / 2.0;

		float magnitude = length(vec3(dir.xy, zFactor));
		
		return dir / magnitude;
	`;

	fogGlsl = /*glsl*/`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
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

		const float root2Over2 = 0.70710678;
		
		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
			float kappa = sqrt(abs(c*c - a*a));
		
			vec4 pos;
		
			if (c > a)
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sin(trigArg);

				pos = vec3(
					2.0 * a / kappa * sineFactor * cos(trigArg),
					-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
					1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
					2.0 * c * t + 2.0 * atan(-c / kappa * tan(trigArg))
						- sign(c) * floor(0.5 * kappa * t / 3.14159265 + 0.5) * 6.28318531
						// Had to go digging in their code for this last term
						// since it's only referred to in the paper as a adjustment by
						// "the correct multiple of 2pi". This belongs in the paper!!
				);
			}

			else if (c == a)
			{
				pos = vec4(
					root2Over2 * t,
					-t * t * 0.25,
					1.0 + t * t * 0.25,
					2.0 * c * t - root2Over2 * t
				);
			}

			else
			{
				float trigArg = kappa * t * 0.5;
				float sineFactor = sinh(trigArg);

				pos = vec3(
					2.0 * a / kappa * sineFactor * cosh(trigArg),
					-2.0 * a * c / (kappa * kappa) * sineFactor * sineFactor,
					1.0 + 2.0 * a * a / (kappa * kappa) * sineFactor * sineFactor,
					2.0 * c * t + 2.0 * atan(-c / kappa * tanh(trigArg))
				);
			}

			// Apply r_alpha.
			pos.xy = mat2(
				cos(alpha), sin(alpha),
				-sin(alpha), cos(alpha)
			) * pos.xy;

			// Finally, translate this to the starting position. This is easier said than done:
			// we have isometries of SL(2, R) (i.e. script Q), but not of the universal cover (i.e. X)
			// a priori. Instead, 

		}

		vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.w;
		
			vec4 pos;
		
			// All the following formulas get differentiated dt.
			if (abs(c) < 0.001)
			{
				return A * vec4(
					a * cos(alpha),
					a * sin(alpha),
					0.0,
					0.0
				);
			}
		
			if (c * t < .001)
			{
				return A * vec4(
					a * cos(alpha + c * t),
					a * sin(alpha + c * t),
					c + a*a * (c*t*t / 4.0 - c*c*c*t*t*t*t / 48.0 + c*c*c*c*c*t*t*t*t*t*t / 1440.0),
					0.0
				);
			}
			
			return A * vec4(
				a * cos(alpha + c * t),
				a * sin(alpha + c * t),
				c - a*a / (2.0 * c) * (cos(c * t) - 1.0),
				0.0
			);
		}

		const mat4 teleportMatX1 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.5, 0.0,
			0.0, 0.0, 1.0, 0.0,
			1.0, 0.0, 0.0, 1.0
		);

		const mat4 teleportMatX2 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, -0.5, 0.0,
			0.0, 0.0, 1.0, 0.0,
			-1.0, 0.0, 0.0, 1.0
		);

		const mat4 teleportMatY1 = mat4(
			1.0, 0.0, -0.5, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 1.0, 0.0, 1.0
		);
		
		const mat4 teleportMatY2 = mat4(
			1.0, 0.0, 0.5, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, -1.0, 0.0, 1.0
		);
		
		const mat4 teleportMatZ1 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 1.0, 1.0
		);
		
		const mat4 teleportMatZ2 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, -1.0, 1.0
		);

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec3 color = vec3(0.0, 0.0, 0.0);

			if (pos.x < -0.5)
			{
				mat4 A = getTransformationMatrix(pos);

				pos = teleportMatX1 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				// Also important! In Nil, the direction vec is from the origin, so we
				// then need to translate the teleported vector back to the origin.

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatX1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(1.0, 0.0, 0.0);
			}

			else if (pos.x > 0.5)
			{
				mat4 A = getTransformationMatrix(pos);
				pos = teleportMatX2 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatX2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(-1.0, 0.0, 0.0);
			}

			if (pos.y < -0.5)
			{
				mat4 A = getTransformationMatrix(pos);
				pos = teleportMatY1 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatY1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 1.0, 0.0);
			}

			else if (pos.y > 0.5)
			{
				mat4 A = getTransformationMatrix(pos);
				pos = teleportMatY2 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatY2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, -1.0, 0.0);
			}

			if (pos.z < -0.5)
			{
				mat4 A = getTransformationMatrix(pos);
				pos = teleportMatZ1 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatZ1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 0.0, 1.0);
			}

			else if (pos.z > 0.5)
			{
				mat4 A = getTransformationMatrix(pos);
				pos = teleportMatZ2 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatZ2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 0.0, -1.0);
			}

			return color;
		}
	`;

	
	normalize(vec)
	{
		const zFactor = vec[2] - (this.cameraPos[0] * vec[1] - this.cameraPos[1] * vec[0]) / 2;

		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + zFactor * zFactor);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
	
	followGeodesic(pos, dir, t)
	{
		// Some subtlety here: we need to construct the transformation matrix to
		// translate the geodesic from the origin, but we do *not* want to translate the current
		// vectors backward to the origin. In the other geometries, I've gotten away with simply
		// projecting the tangent space vectors onto the new trnagent space after moving, but the
		// twisting in Nil combined with the fact that all tangent spaces are literally equal
		// means that such a correction would be extremely difficult. Instead, we'll leave
		// the vectors at the origin (i.e. just not translate them back).
		const A = [
			[1, 0, 0, pos[0]],
			[0, 1, 0, pos[1]],
			[-pos[1] / 2, pos[0] / 2, 1, pos[2]],
			[0, 0, 0, 1]
		];

		const alpha = Math.atan2(dir[1], dir[0]);
		const a = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
		const c = dir[2];

		const newPos = ThurstonGeometry.mat4TimesVector(A,
			Math.abs(c) < 0.01
				? [
					a * Math.cos(alpha) * t,
					a * Math.sin(alpha) * t,
					0,
					1
				]
				: [
					2 * a / c * Math.sin(c * t / 2) * Math.cos(c * t / 2 + alpha),
					2 * a / c * Math.sin(c * t / 2) * Math.sin(c * t / 2 + alpha),
					c * t + a * a / (2 * c * c) * (c * t - Math.sin(c * t)),
					1
				]
		);
		
		// No need to correct the position in Nil babyyy
		return newPos;
	}

	getNormalVec()
	{
		return [0, 0, 0, 1];
	}

	correctVectors() {}

	baseColorIncreases = [
		[1, 0, 0],
		[-1, 0, 0],
		[0, 1, 0],
		[0, -1, 0],
		[0, 0, 1],
		[0, 0, -1]
	];
	
	baseColor = [0, 0, 0];

	teleportCamera()
	{
		const teleportations = [
			[
				[1, 0, 0, 1],
				[0, 1, 0, 0],
				[0, .5, 1, 0],
				[0, 0, 0, 1]
			],
			[
				[1, 0, 0, -1],
				[0, 1, 0, 0],
				[0, -.5, 1, 0],
				[0, 0, 0, 1]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, 1],
				[-.5, 0, 1, 0],
				[0, 0, 0, 1]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, -1],
				[.5, 0, 1, 0],
				[0, 0, 0, 1]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 1],
				[0, 0, 0, 1]
			],
			[
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, -1],
				[0, 0, 0, 1]
			]
		];

		// Okay so here's the thing. This isometry moves *points* on one face
		// to points on the other, and therefore induces a map on the tangent spaces.
		// However, our direction vectors are from the *origin*. So we'll transfer
		// the vectors to the camera position, teleport them, and then transfer them back
		// using the new camera position's transformation.

		for (let i = 0; i < 3; i++)
		{
			if (this.cameraPos[i] < -0.5)
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportations[2 * i],
					this.cameraPos
				);

				this.baseColor[0] += this.baseColorIncreases[2 * i][0];
				this.baseColor[1] += this.baseColorIncreases[2 * i][1];
				this.baseColor[2] += this.baseColorIncreases[2 * i][2];
			}

			else if (this.cameraPos[i] > 0.5)
			{
				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportations[2 * i + 1],
					this.cameraPos
				);

				this.baseColor[0] += this.baseColorIncreases[2 * i + 1][0];
				this.baseColor[1] += this.baseColorIncreases[2 * i + 1][1];
				this.baseColor[2] += this.baseColorIncreases[2 * i + 1][2];
			}
		}
	}
}

export class SL2RSpheres extends SL2RGeometry
{
	static distances = `
		float radius = .25;
		float distance1 = approximateDistanceToOrigin(pos);

		if (distance1 > radius + 1.0)
		{
			distance1 -= radius;
		}

		else
		{
			distance1 = exactDistanceToOrigin(pos) - radius;
		}

		
		// The distance to the x and y teleportation planes is the distance between the projections
		// to E^2. Unfortunately for our performance, the tolerances really do need to be this tight
		// to avoid artifacts.
		float distance2 = abs(pos.x - 0.515);
		float distance3 = abs(pos.x + 0.515);

		float distance4 = abs(pos.y - 0.515);
		float distance5 = abs(pos.y + 0.515);
	`;

	distanceEstimatorGlsl = `
		${SL2RSpheres.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(floor(baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		);
	`;

	lightGlsl = `
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.4 * lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;

	ambientOcclusionDenominator = "250.0";

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [0.163559, -0.438969, 0.124604, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0.0748089, 0.997196, 0, 0];
	forwardVec = [0.997199, -0.074809, 0, 0];

	baseColor = [-2, 0, -2];

	uniformGlsl = `
		uniform vec3 baseColor;
	`;

	uniformNames = ["baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform3fv(uniformList["baseColor"], this.baseColor);
	}
}