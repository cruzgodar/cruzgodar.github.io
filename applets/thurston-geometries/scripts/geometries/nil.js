import { ThurstonGeometry } from "../class.js";
import { BaseGeometry } from "./base.js";

class NilGeometry extends BaseGeometry
{
	geodesicGlsl = `mat4 A = mat4(
		1.0, 0.0, -startPos.y * .5, 0.0,
		0.0, 1.0, startPos.x * .5, 0.0,
		0.0, 0.0, 1.0, 0.0,
		startPos.x, startPos.y, startPos.z, 1.0
	);

	// vec4 v = mat4(
	// 	1.0, 0.0, startPos.y * .5, 0.0,
	// 	0.0, 1.0, -startPos.x * .5, 0.0,
	// 	0.0, 0.0, 1.0, 0.0,
	// 	-startPos.x, -startPos.y, -startPos.z, 1.0
	// ) * rayDirectionVec;

	vec4 v = rayDirectionVec;

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
			1.0
		);
	}
	
	pos = A * vec4(
		2.0 * a / c * sin(c * t / 2.0) * cos(c * t / 2.0 + alpha),
		2.0 * a / c * sin(c * t / 2.0) * sin(c * t / 2.0 + alpha),
		c * t + a*a / (2.0 * c*c) * (c * t - sin(c * t)),
		1.0
	);

	// globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);
	`;

	normalizeGlsl = `float zFactor = dir.z - (cameraPos.x * dir.y - cameraPos.y * dir.x) / 2.0;

	float magnitude = length(vec3(dir.xy, zFactor));
	
	return dir / magnitude;`;

	fogGlsl = "return color;//mix(color, fogColor, 1.0 - exp(0.5 - totalT * 0.075));";

	functionGlsl = `float chi(float rho, float z, float phi)
	{
		float sineThing = sin(phi * 0.5);

		return -z + phi + rho*rho / (8.0 * sineThing*sineThing) * (phi - sin(phi));
	}

	float chiPrime(float rho, float z, float phi)
	{
		float sineThing = sin(phi * 0.5);

		return 1.0 - rho*rho / (8.0 * sineThing*sineThing) * (cos(phi) + (phi - sin(phi)) / tan(phi / 2.0) - 1.0);
	}
	
	const int newtonIterations = 5;
	
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
		if (length(pos.xy) < 0.00001)
		{
			// The shortest path is just the straight line along the z-axis.
			return abs(pos.z);
		}

		if (abs(pos.z) < 0.00001)
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
			Math.abs(c) < 0.00001
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

		lightIntensity = 2.0;
	`;

	correctVectors()
	{
		//No need!
	}
}

export class NilSpheres extends NilGeometry
{
	static distances = `
		// A sphere at the origin (honestly, why would you want it to be anywhere else?)
		float radius = .5;
		float distance1 = approximateDistanceToOrigin(pos);

		if (distance1 > radius + epsilon * 100.0)
		{
			distance1 -= radius;
		}

		else
		{
			distance1 = exactDistanceToOrigin(pos) - radius;
		}

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
		// return vec3(
		// 	.25 + .75 * (.5 * (sin(floor(baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
		// 	.25 + .75 * (.5 * (sin(floor(baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
		// 	.25 + .75 * (.5 * (sin(floor(baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		// );

		return vec3(1.0, 1.0, 1.0);
	`;

	getMovingSpeed()
	{
		return 1.5;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}