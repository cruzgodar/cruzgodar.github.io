import { ThurstonGeometry } from "../class.js";
import { sliderValues } from "../index.js";
import { BaseGeometry, getMinGlslString } from "./base.js";
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
	geodesicGlsl = `vec4 pos = getUpdatedPos(startPos, rayDirectionVec, t);

	if (abs(pos.z) > 0.5002)
	{
		// Binary search our way down until we're back in the fundamental domain.
		float oldT = t - lastTIncrease;
		totalT -= lastTIncrease;

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
		totalT += lastTIncrease * currentSearchPosition;
	}

	globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	normalizeGlsl = `float zFactor = dir.z - (cameraPos.x * dir.y - cameraPos.y * dir.x) / 2.0;

	float magnitude = length(vec3(dir.xy, zFactor));
	
	return dir / magnitude;`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-totalT * 0.1));";

	functionGlsl = `mat4 getTransformationMatrix(vec4 pos)
	{
		return mat4(
			1.0, 0.0, -pos.y * .5, 0.0,
			0.0, 1.0, pos.x * .5, 0.0,
			0.0, 0.0, 1.0, 0.0,
			pos.x, pos.y, pos.z, 1.0
		);
	}
	
	float chi(float rho, float z, float phi)
	{
		float sineThing = sin(phi * 0.5);

		return -z + phi + rho*rho / (8.0 * sineThing*sineThing) * (phi - sin(phi));
	}

	float chiPrime(float rho, float z, float phi)
	{
		float sineThing = sin(phi * 0.5);

		return 1.0 - rho*rho / (8.0 * sineThing*sineThing) * (cos(phi) + (phi - sin(phi)) / tan(phi / 2.0) - 1.0);
	}
	
	const int newtonIterations = 10;
	
	// Returns the unique zero in (0, 2pi) of chi. z must be positive, so apply the flip transformation before doing this if it's not.
	float chiZero(float rho, float z)
	{
		float phi = 4.0;

		if (rho <= 0.2)
		{
			phi = 6.2;
		}

		else if (rho <= 1.0)
		{
			phi = 6.0;
		}

		else if (rho <= 4.0)
		{
			phi = 5.0;
		}

		for (int iteration = 0; iteration < newtonIterations; iteration++)
		{
			phi -= chi(rho, z, phi) / chiPrime(rho, z, phi);
		}

		return phi;
	}

	// Uses Newton's method and some nasty equations to get the exact distance to the origin.
	// Only recommended when actually close and an underestimate isn't good enough for detail.
	float exactDistanceToOrigin(vec4 pos)
	{
		if (length(pos.xy) < 0.001)
		{
			// The shortest path is just the straight line along the z-axis.
			return abs(pos.z);
		}

		if (abs(pos.z) < 0.001)
		{
			// Here phi = 0, and  we want to avoid sin(x)/x stuff when possible.

			return length(pos.xy);
		}

		// If z is negative, we need to flip the whole z-axis.
		if (pos.z < 0.0)
		{
			pos = vec4(pos.y, pos.x, -pos.z, 1.0);
		}

		float rho = length(pos.xy);

		float phi = chiZero(rho, pos.z);

		float sineThing = 2.0 * sin(phi * 0.5);

		float t = abs(phi * length(vec3(pos.xy, sineThing)) / sineThing);

		return t;
	}

	// Returns an underestimate of the distance to the origin. The paper has variables
	// m and psi that can be varied; I'm just using m = 1 and psi = 1/2.

	const float sqrt2 = 1.414213562;
	const float sqrt3 = 1.732050808;
	const float sqrt6 = 2.449489743;
	const float sqrt12 = 3.464101615;
	const float sqrt48 = 6.928203230;
	const float fourthRoot12 = 1.861209718;

	float approximateDistanceToOrigin(vec4 pos)
	{
		float fInv;
		float z = abs(pos.z);

		if (z < sqrt6)
		{
			fInv = z;
		}

		else if (z < sqrt48)
		{
			fInv = sqrt3 * sqrt(pow(6.0 * z, .666667) - 4.0);
		}

		else
		{
			fInv = fourthRoot12 * sqrt(z);
		}

		return .5 * (length(pos.xy) + fInv);
	}

	vec4 getUpdatedPos(vec4 startPos, vec4 rayDirectionVec, float t)
	{
		mat4 A = getTransformationMatrix(startPos);
	
		float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
		float a = length(rayDirectionVec.xy);
		float c = rayDirectionVec.z;
	
		vec4 pos;
	
		if (abs(c) < .001)
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

	vec4 getUpdatedDirectionVec(vec4 startPos, vec4 rayDirectionVec, float t)
	{
		mat4 A = getTransformationMatrix(startPos);
	
		float alpha = atan(rayDirectionVec.y, rayDirectionVec.x);
		float a = length(rayDirectionVec.xy);
		float c = rayDirectionVec.z;
	
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

	finalTeleportationGlsl = `if (pos.x > 0.499 && rayDirectionVec.x < -0.05)
	{
		pos.x = -pos.x;
	}

	else if (pos.x < -0.499 && rayDirectionVec.x > 0.05)
	{
		pos.x = -pos.x;
	}

	if (pos.y > 0.499 && rayDirectionVec.y < -0.05)
	{
		pos.y = -pos.y;
	}

	else if (pos.y < -0.499 && rayDirectionVec.y > 0.05)
	{
		pos.y = -pos.y;
	}
	`;

	maxMarches = "300";
	ambientOcclusionDenominator = "300.0";

	
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

	lightGlsl = `
		surfaceNormal.w = 0.0;

		vec4 lightDirection1 = normalize(vec4(3.0, -3.0, 3.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-4.0, 2.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.2 * lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;

	correctVectors() {}

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
				// const oldA = getTransformationMatrix(this.cameraPos);

				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportations[2 * i],
					this.cameraPos
				);

				// const newAinv = getTransformationMatrix([
				// 	-this.cameraPos[0],
				// 	-this.cameraPos[1],
				// 	-this.cameraPos[2],
				// 	1
				// ]);

				// this.forwardVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.forwardVec
				// 		)
				// 	)
				// );

				// this.rightVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.rightVec
				// 		)
				// 	)
				// );

				// this.upVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.upVec
				// 		)
				// 	)
				// );

				// const newRotatedForwardVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			rotatedForwardVec
				// 		)
				// 	)
				// );

				// recomputeRotation(newRotatedForwardVec);

				baseColor[0] += baseColorIncreases[2 * i][0];
				baseColor[1] += baseColorIncreases[2 * i][1];
				baseColor[2] += baseColorIncreases[2 * i][2];
			}

			else if (this.cameraPos[i] > 0.5)
			{
				// const oldA = getTransformationMatrix(this.cameraPos);

				this.cameraPos = ThurstonGeometry.mat4TimesVector(
					teleportations[2 * i + 1],
					this.cameraPos
				);

				// const newAinv = getTransformationMatrix([
				// 	-this.cameraPos[0],
				// 	-this.cameraPos[1],
				// 	-this.cameraPos[2],
				// 	1
				// ]);

				// this.forwardVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i + 1],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.forwardVec
				// 		)
				// 	)
				// );

				// this.rightVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i + 1],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.rightVec
				// 		)
				// 	)
				// );

				// this.upVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i + 1],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			this.upVec
				// 		)
				// 	)
				// );

				// const newRotatedForwardVec = ThurstonGeometry.mat4TimesVector(
				// 	newAinv,
				// 	ThurstonGeometry.mat4TimesVector(
				// 		teleportations[2 * i + 1],
				// 		ThurstonGeometry.mat4TimesVector(
				// 			oldA,
				// 			rotatedForwardVec
				// 		)
				// 	)
				// );

				// recomputeRotation(newRotatedForwardVec);

				baseColor[0] += baseColorIncreases[2 * i + 1][0];
				baseColor[1] += baseColorIncreases[2 * i + 1][1];
				baseColor[2] += baseColorIncreases[2 * i + 1][2];
			}
		}
	}
}

export class NilRooms extends NilGeometry
{
	static distances = `
		// A sphere at the origin (honestly, why would you want it to be anywhere else?)
		float radius = wallThickness;
		float distance1 = approximateDistanceToOrigin(pos);

		if (distance1 > radius + 1.0)
		{
			distance1 -= radius;
		}

		else
		{
			distance1 = exactDistanceToOrigin(pos) - radius;
		}

		distance1 = -distance1;

		
		// The distance to the x and y teleportation planes is the distance between the projections
		// to E^2. Unfortunately for our performance, the tolerances really do need to be this tight
		// to avoid artifacts.
		float distance2 = abs(pos.x - 0.5002);
		float distance3 = abs(pos.x + 0.5002);

		float distance4 = abs(pos.y - 0.5002);
		float distance5 = abs(pos.y + 0.5002);
	`;

	distanceEstimatorGlsl = `
		${NilRooms.distances}

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

		float lightIntensity = 1.2 * lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = `
		uniform float wallThickness;
		uniform vec3 baseColor;
	`;

	uniformNames = ["wallThickness", "baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["wallThickness"], .703 - sliderValues.wallThickness / 10);
		gl.uniform3fv(uniformList["baseColor"], baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.min = -.72;
		wallThicknessSlider.max = .78;
		wallThicknessSlider.value = .78;
		wallThicknessSliderValue.textContent = .78;
		sliderValues.wallThickness = .78;
	}
}

export class NilSpheres extends NilGeometry
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
		float distance2 = abs(pos.x - 0.5002);
		float distance3 = abs(pos.x + 0.5002);

		float distance4 = abs(pos.y - 0.5002);
		float distance5 = abs(pos.y + 0.5002);
	`;

	distanceEstimatorGlsl = `
		${NilSpheres.distances}

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

		float lightIntensity = 1.3 * lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;

	getMovingSpeed()
	{
		return 1;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	uniformGlsl = `
		uniform vec3 baseColor;
	`;

	uniformNames = ["baseColor"];

	updateUniforms(gl, uniformList)
	{
		gl.uniform3fv(uniformList["baseColor"], baseColor);
	}
}