import { getMatrixGlsl, getMinGlslString } from "../../../../scripts/applets/applet.js";
import { magnitude, mat4TimesVector } from "../class.js";
import { BaseGeometry } from "./base.js";

const loopRoomColors = false;

const teleportationMatrices = [
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

class NilGeometry extends BaseGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

		if (abs(pos.z) > 0.5002)
		{
			// Binary search our way down until we're back in the fundamental domain.
			// It feels like we should change totalT here to reflect the new value, but that seems
			// to badly affect fog calculations.
			float oldT = t - lastTIncrease;

			// The factor by which we multiply lastTIncrease to get the usable increase.
			float currentSearchPosition = 0.5;
			float currentSearchScale = 0.25;

			for (int i = 0; i < 5; i++)
			{
				pos = getUpdatedPos(startPos, rayDirectionVec, oldT + lastTIncrease * currentSearchPosition);

				if (abs(pos.z) > 0.5002)
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
			pos = getUpdatedPos(startPos, rayDirectionVec, t);
		}

		globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	fogGlsl = /* glsl */`
		return mix(color, fogColor, 1.0 - exp(-totalT * 0.2));
	`;

	functionGlsl = /* glsl */`
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				1.0, 0.0, -pos.y * .5, 0.0,
				0.0, 1.0, pos.x * .5, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		float metricToOrigin(vec4 pos)
		{
			return length(vec3(pos.xyz));
		}

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.z;
		
			if (abs(c) < .002)
			{
				return A * vec4(
					a * cos(alpha) * t,
					a * sin(alpha) * t,
					0.0,
					1.0
				);
			}
		
			if (c * t < .005)
			{
				return A * vec4(
					2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
					2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
					c * t + a*a * (c*t*t*t / 12.0 - c*c*c*t*t*t*t*t / 240.0 + c*c*c*c*c*t*t*t*t*t*t*t / 10080.0),
					1.0
				);
			}
			
			return A * vec4(
				2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
				2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
				c * t + a*a / (2.0 * c*c) * (c * t - sin(c * t)),
				1.0
			);
		}

		vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.z;
		
			vec4 pos;
		
			// All the following formulas get differentiated dt.
			if (abs(c) < 0.002)
			{
				return A * vec4(
					a * cos(alpha),
					a * sin(alpha),
					0.0,
					0.0
				);
			}
		
			if (c * t < .005)
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

		const mat4 teleportMatX1 = ${getMatrixGlsl(teleportationMatrices[0])};
		const mat4 teleportMatX2 = ${getMatrixGlsl(teleportationMatrices[1])};
		const mat4 teleportMatY1 = ${getMatrixGlsl(teleportationMatrices[2])};
		const mat4 teleportMatY2 = ${getMatrixGlsl(teleportationMatrices[3])};
		const mat4 teleportMatZ1 = ${getMatrixGlsl(teleportationMatrices[4])};
		const mat4 teleportMatZ2 = ${getMatrixGlsl(teleportationMatrices[5])};

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			vec3 color = vec3(0.0, 0.0, 0.0);

			if (pos.x < -0.5)
			{
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
				pos = teleportMatX2 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatX2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(-1.0, 0.0, 0.0);
			}

			if (pos.y < -0.5)
			{
				pos = teleportMatY1 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatY1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 1.0, 0.0);
			}

			else if (pos.y > 0.5)
			{
				pos = teleportMatY2 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatY2 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, -1.0, 0.0);
			}

			if (pos.z < -0.5)
			{
				pos = teleportMatZ1 * pos;

				rayDirectionVec = getTransformationMatrix(-pos) * teleportMatZ1 * getUpdatedDirectionVec(startPos, rayDirectionVec, t);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				color += vec3(0.0, 0.0, 1.0);
			}

			else if (pos.z > 0.5)
			{
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

	finalTeleportationGlsl = /* glsl */`
		if (pos.x > 0.499 && rayDirectionVec.x < -0.05)
		{
			pos.x = -pos.x;

			globalColor -= vec3(1.0, 0.0, 0.0);
		}

		else if (pos.x < -0.499 && rayDirectionVec.x > 0.05)
		{
			pos.x = -pos.x;

			globalColor += vec3(1.0, 0.0, 0.0);
		}

		if (pos.y > 0.499 && rayDirectionVec.y < -0.05)
		{
			pos.y = -pos.y;

			globalColor -= vec3(0.0, 1.0, 0.0);
		}

		else if (pos.y < -0.499 && rayDirectionVec.y > 0.05)
		{
			pos.y = -pos.y;

			globalColor += vec3(0.0, 1.0, 0.0);
		}
	`;

	maxMarches = "250";
	maxT = "30.0";
	ambientOcclusionDenominator = "300.0";

	
	normalize(vec)
	{
		const zFactor = vec[2] - (this.cameraPos[0] * vec[1] - this.cameraPos[1] * vec[0]) / 2;

		const magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + zFactor * zFactor);

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}
	
	// Frustratingly, doing a linear approximation produces weird movement patterns in Nil.
	followGeodesic(pos, dir, t)
	{
		// Some subtlety here: we need to construct the transformation matrix to
		// translate the geodesic from the origin, but we do *not* want to translate the current
		// vectors backward to the origin. In the other geometries, I've gotten away with simply
		// projecting the tangent space vectors onto the new tangent space after moving, but the
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

		const newPos = mat4TimesVector(A,
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
		// Okay so here's the thing. This isometry moves *points* on one face
		// to points on the other, and therefore induces a map on the tangent spaces.
		// However, our direction vectors are from the *origin*. So we'll transfer
		// the vectors to the camera position, teleport them, and then transfer them back
		// using the new camera position's transformation.

		for (let i = 0; i < 3; i++)
		{
			if (this.cameraPos[i] < -0.5)
			{
				this.cameraPos = mat4TimesVector(
					teleportationMatrices[2 * i],
					this.cameraPos
				);
				
				if (loopRoomColors)
				{
					this.baseColor[0] = (
						this.baseColor[0] + this.baseColorIncreases[2 * i][0] + 25
					) % 50 - 25;

					this.baseColor[1] = (
						this.baseColor[1] + this.baseColorIncreases[2 * i][1] + 25
					) % 50 - 25;

					this.baseColor[2] = (
						this.baseColor[2] + this.baseColorIncreases[2 * i][2] + 25
					) % 50 - 25;
				}

				else
				{
					this.baseColor[0] += this.baseColorIncreases[2 * i][0];
					this.baseColor[1] += this.baseColorIncreases[2 * i][1];
					this.baseColor[2] += this.baseColorIncreases[2 * i][2];
				}
			}

			else if (this.cameraPos[i] > 0.5)
			{
				this.cameraPos = mat4TimesVector(
					teleportationMatrices[2 * i + 1],
					this.cameraPos
				);

				if (loopRoomColors)
				{
					this.baseColor[0] = (
						this.baseColor[0] + this.baseColorIncreases[2 * i + 1][0] + 25
					) % 50 - 25;

					this.baseColor[1] = (
						this.baseColor[1] + this.baseColorIncreases[2 * i + 1][1] + 25
					) % 50 - 25;

					this.baseColor[2] = (
						this.baseColor[2] + this.baseColorIncreases[2 * i + 1][2] + 25
					) % 50 - 25;
				}

				else
				{
					this.baseColor[0] += this.baseColorIncreases[2 * i + 1][0];
					this.baseColor[1] += this.baseColorIncreases[2 * i + 1][1];
					this.baseColor[2] += this.baseColorIncreases[2 * i + 1][2];
				}
			}
		}
	}
}



const axesDistances = /* glsl */`
	float distance1 = metricToOrigin(vec4(0.0, pos.yz, 1.0)) - .05;
	float distance2 = metricToOrigin(vec4(pos.x, 0.0, pos.z, 1.0)) - .05;
	float distance3 = metricToOrigin(vec4(pos.xy, 0.0, 1.0)) - .05;

	float minDistance = ${getMinGlslString("distance", 3)};
`;

export class NilAxes extends NilGeometry
{
	geodesicGlsl = /* glsl */`
		vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);
	`;

	functionGlsl = /* glsl */`
		mat4 getTransformationMatrix(vec4 pos)
		{
			return mat4(
				1.0, 0.0, -pos.y * .5, 0.0,
				0.0, 1.0, pos.x * .5, 0.0,
				0.0, 0.0, 1.0, 0.0,
				pos.x, pos.y, pos.z, 1.0
			);
		}

		float metricToOrigin(vec4 pos)
		{
			return length(vec3(pos.xyz));
		}

		vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
		{
			mat4 A = getTransformationMatrix(startPos);
		
			float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
			float a = length(rayDirectionVec.xy);
			float c = rayDirectionVec.z;
		
			if (abs(c) < .0002)
			{
				return A * vec4(
					a * cos(alpha) * t,
					a * sin(alpha) * t,
					0.0,
					1.0
				);
			}
		
			if (c * t < .001)
			{
				return A * vec4(
					2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
					2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
					c * t + a*a * (c*t*t*t / 12.0 - c*c*c*t*t*t*t*t / 240.0 + c*c*c*c*c*t*t*t*t*t*t*t / 10080.0),
					1.0
				);
			}
			
			return A * vec4(
				2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
				2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
				c * t + a*a / (2.0 * c*c) * (c * t - sin(c * t)),
				1.0
			);
		}
	`;

	finalTeleportationGlsl = "";

	stepFactor = ".5";

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
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.2 + .8 * max(dotProduct1, -.75 * dotProduct1)) * 1.15;
	`;

	ambientOcclusionDenominator = "250.0";

	cameraPos = [-0.4393, 0.4270, 0.2008, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [-0.2057, -0.2057, 0.9567, 0];
	rightVec = [0.6486, 0.7033, 0.2907, 0];
	forwardVec = [0.7327, -0.6803, 0.0112, 0];
}



const roomsDistances = /* glsl */`
	float distance1 = maxT * 2.0;
	float distance2 = maxT * 2.0;
	
	if (sceneTransition < 1.0)
	{
		float scale = exp(max(sceneTransition - 0.8, 0.0) * 5.0);

		float effectiveWallThickness = wallThickness + sceneTransition * .24 / .75;

		distance1 = (effectiveWallThickness - metricToOrigin(pos)) * scale;
	}

	if (sceneTransition > 0.0)
	{
		float scale = exp(max(0.2 - sceneTransition, 0.0) * 5.0);

		float effectiveRadius = .2 - .2 / .75 * (1.0 - sceneTransition);

		distance2 = (metricToOrigin(pos) - effectiveRadius) * scale;
	}

	if (totalT < clipDistance)
	{
		distance1 = maxT * 2.0;
		distance2 = maxT * 2.0;
	}

	// The distance to the x and y teleportation planes is the distance between the projections
	// to E^2. Unfortunately for our performance, the tolerances really do need to be this tight
	// to avoid artifacts.
	float distance3;
	float distance4;
	float distance5;
	float distance6;

	if (sceneTransition < 0.75)
	{
		distance3 = abs(pos.x - 0.5002);
		distance4 = abs(pos.x + 0.5002);

		distance5 = abs(pos.y - 0.5002);
		distance6 = abs(pos.y + 0.5002);
	}

	else
	{
		float tolerance = mix(0.5002, 0.5125, (sceneTransition - .75) * 5.0);

		distance3 = abs(pos.x - tolerance);
		distance4 = abs(pos.x + tolerance);
		distance5 = abs(pos.y - tolerance);
		distance6 = abs(pos.y + tolerance);
	}

	float minDistance = ${getMinGlslString("distance", 6)};
`;

export class NilRooms extends NilGeometry
{
	distanceEstimatorGlsl = /* glsl */`
		${roomsDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		vec3 roomColor = ${loopRoomColors ? "mod(globalColor + baseColor + vec3(25.0), 50.0) - vec3(25.0)" : "globalColor + baseColor"};

		return mix(
			vec3(
				.3 + .7 * (.5 * (sin((.01 * (pos.x + pos.z) + roomColor.x + roomColor.z) * 40.0) + 1.0)),
				.3 + .7 * (.5 * (sin((.01 * (pos.y + pos.z) + roomColor.y + roomColor.z) * 57.0) + 1.0)),
				.3 + .7 * (.5 * (sin((.01 * (pos.x + pos.y) + roomColor.x + roomColor.y) * 89.0) + 1.0))
			),
			vec3(
				.15 + .85 * (.5 * (sin(floor(roomColor.x + .5) * 40.0) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(roomColor.y + .5) * 57.0) + 1.0)),
				.15 + .85 * (.5 * (sin(floor(roomColor.z + .5) * 89.0) + 1.0))
			),
			sceneTransition
		);
	`;

	lightGlsl = /* glsl */`
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity1 = (.25 + .75 * dotProduct1 * dotProduct1) * 1.25;



		vec4 lightDirection2 = normalize(vec4(1.5, 1.5, 1.5, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity2 = (.2 + .8 * max(dotProduct2, -dotProduct2)) * 1.15;



		float lightIntensity = mix(lightIntensity1, lightIntensity2, sceneTransition);
	`;

	ambientOcclusionDenominator = "mix(300.0, 250.0, sceneTransition)";

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [1, 0, 0, 0];
	forwardVec = [0, -1, 0, 0];

	uniformGlsl = /* glsl */`
		uniform float sceneTransition;
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["sceneTransition", "wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList.sceneTransition, this.sliderValues.sceneTransition);
		gl.uniform1f(uniformList.wallThickness, .703 - this.sliderValues.wallThickness / 10);
		gl.uniform1f(uniformList.clipDistance, this.sliderValues.clipDistance);
		gl.uniform3fv(uniformList.baseColor, this.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider, #switch-scene-button, #clip-distance-slider";

	wallThicknessData = [.78, -.72, .78];

	doClipBrightening = true;

	getNearestCenter()
	{
		return [0, 0, 0, 1];
	}

	getNearestCorner()
	{
		const corners = [
			[.45, .45, .45, 1],
			[.45, .45, -.45, 1],
			[.45, -.45, .45, 1],
			[.45, -.45, -.45, 1],
			[-.45, .45, .45, 1],
			[-.45, .45, -.45, 1],
			[-.45, -.45, .45, 1],
			[-.45, -.45, -.45, 1]
		];

		let minDistance = Infinity;
		let minIndex = 0;

		for (let i = 0; i < corners.length; i++)
		{
			const distance = magnitude(
				[
					this.cameraPos[0] - corners[i][0],
					this.cameraPos[1] - corners[i][1],
					this.cameraPos[2] - corners[i][2],
					this.cameraPos[3] - corners[i][3]
				]
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