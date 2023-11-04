import { BaseGeometry, getMinGlslString } from "./base.mjs";

class E3Geometry extends BaseGeometry {}

export class E3Rooms extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + 1.3;

		return distance1;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.z) + 1.0))
		);
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
	`;

	cameraPos = [1, 1, 1, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}

export class E3Spheres extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
	`;

	getColorGlsl = `
		return vec3(
			.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
		);
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}

export class H3Spheres extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = length(pos.xyz) - 1.0;

		return distance1;
	`;

	functionGlsl = `
		// The right side of the plane equations after normalizing.
		const float planeDistance = 1.3763819;
		const vec3 plane1 = vec3(0.52573112, 0.85065077, 0.0);
		const vec3 plane2 = vec3(0.52573112, -0.85065077, 0.0);

		void teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t)
		{
			float dotProduct = dot(pos.xyz, plane1);

			// To reflect through one of these planes, we just subtract a multiple of the normal vector.
			// However, when we're far from the actual sphere, we can jump too far and land inside of the actual
			// sphere when we teleport. So instead, we'll reset to the plane itself when we teleport.
			if (dotProduct < -planeDistance)
			{
				pos.xyz += plane1 * 2.0 * planeDistance;
				startPos = pos;
				t = 0.0;
			}

			else if (dotProduct > planeDistance)
			{
				pos.xyz -= plane1 * 2.0 * planeDistance;
				startPos = pos;
				t = 0.0;
			}



			dotProduct = dot(pos.xyz, plane2);

			if (dotProduct < -planeDistance)
			{
				pos.xyz += plane2 * 2.0 * planeDistance;
				startPos = pos;
				t = 0.0;
			}

			else if (dotProduct > planeDistance)
			{
				pos.xyz -= plane2 * 2.0 * planeDistance;
				startPos = pos;
				t = 0.0;
			}

			//Now that we've teleported, we'll get the distance to the sphere.
		}

		float getTToPlane(vec3 pos, vec3 rayDirectionVec, vec3 planeNormalVec, float planeOffset)
		{
			float denominator = dot(planeNormalVec, rayDirectionVec);

			if (denominator == 0.0)
			{
				return 100.0;
			}

			return (planeOffset - dot(planeNormalVec, pos)) / denominator;
		}
	`;

	geodesicGlsl = `
		vec4 pos = startPos + t * rayDirectionVec;
		
		teleportPos(pos, startPos, rayDirectionVec, t);
	`;

	getColorGlsl = `
		return vec3(1.0, 1.0, 1.0);
	`;

	updateTGlsl = `
		float t1 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, planeDistance));
		float t2 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, -planeDistance));
		float t3 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, planeDistance));
		float t4 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, -planeDistance));

		float minTToPlane = ${getMinGlslString("t", 4)};
		t += min(minTToPlane + .01, distance) * stepFactor;
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;

	cameraPos = [-1, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}