import { BaseGeometry, getMinGlslString } from "./base.mjs";

class S2xEGeometry extends BaseGeometry
{
	geodesicGlsl = `vec4 pos = vec4(
		cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
		startPos.w + t * rayDirectionVec.w
	);`;

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 5.0));";
	
	followGeodesic(pos, dir, t)
	{
		const s2Mag = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
		
		const newPos = s2Mag === 0
			? [pos[0], pos[1], pos[2], pos[3] + t * dir[3]]
			: [
				Math.cos(s2Mag * t) * pos[0] + Math.sin(s2Mag * t) * dir[0] / s2Mag,
				Math.cos(s2Mag * t) * pos[1] + Math.sin(s2Mag * t) * dir[1] / s2Mag,
				Math.cos(s2Mag * t) * pos[2] + Math.sin(s2Mag * t) * dir[2] / s2Mag,
				pos[3] + t * dir[3]
			];
		
		//Since we're only doing a linear approximation, this position won't be exactly
		//on the manifold. Therefore, we'll do a quick correction to get it back.

		//Here, we just want the S2 magnitude to be equal to 1.
		const magnitude = Math.sqrt(
			newPos[0] * newPos[0]
			+ newPos[1] * newPos[1]
			+ newPos[2] * newPos[2]
		);

		newPos[0] /= magnitude;
		newPos[1] /= magnitude;
		newPos[2] /= magnitude;

		return newPos;
	}

	getNormalVec(cameraPos)
	{
		//f = 1 - x^2 - y^2 - z^2
		return this.normalize([
			-cameraPos[0],
			-cameraPos[1],
			-cameraPos[2],
			0
		]);
	}
}



export class S2xERooms extends S2xEGeometry
{
	static distances = `
		float distance1 = length(vec2(acos(pos.x), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance2 = length(vec2(acos(-pos.x), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance3 = length(vec2(acos(pos.y), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance4 = length(vec2(acos(-pos.y), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance5 = length(vec2(acos(pos.z), mod(pos.w + .5, 1.0) - .5)) - .35;
	`;

	distanceEstimatorGlsl = `
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		return minDistance;
	`;

	getColorGlsl = `
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance", 5)};

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.65 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.65 * (.5 * (sin(floor(pos.w + .5) * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.65 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.65 * (.5 * (sin(floor(pos.w + .5) * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.65 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.65 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.65 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.88 + .12 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.88 + .12 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.88 + .12 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}
	`;

	lightGlsl = `
		// The cap of .05 fixes a very weird bug where the top and bottom of spheres had tiny dots of incorrect lighting.

		vec3 lightDirection1 = normalize(vec3(0.0, 0.0, 1.0) - pos.xyz);
		float dotProduct1 = min(abs(dot(surfaceNormal.xyz, lightDirection1)), 0.65);

		vec3 lightDirection2 = normalize(vec3(1.0, 1.0, 0.0) - pos.xyz);
		float dotProduct2 = min(abs(dot(surfaceNormal.xyz, lightDirection2)), 0.65);

		float lightIntensity = lightBrightness * max(dotProduct1, dotProduct2);
	`;

	cameraPos = [0, 0, -1, 0];
	normalVec = [0, 0, -1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	getMovingSpeed()
	{
		return 1;
	}
}