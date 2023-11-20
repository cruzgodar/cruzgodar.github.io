import { BaseGeometry, getMinGlslString } from "./base.mjs";

class H3Geometry extends BaseGeometry
{
	geodesicGlsl = "vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;";

	dotProductGlsl = "return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;";

	normalizeGlsl = `float magnitude = sqrt(abs(geometryDot(dir, dir)));
		
	return dir / magnitude;`;

	fogGlsl = `return mix(
		color,
		fogColor,
		0.0//1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)
	);`;

	functionGlsl = `float sinh(float x)
	{
		return .5 * (exp(x) - exp(-x));
	}

	float cosh(float x)
	{
		return .5 * (exp(x) + exp(-x));
	}

	float acosh(float x)
	{
		return log(x + sqrt(x*x - 1.0));
	}`;

	dotProduct(vec1, vec2)
	{
		return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2] - vec1[3] * vec2[3];
	}

	normalize(vec)
	{
		const magnitude = Math.sqrt(Math.abs(this.dotProduct(vec, vec)));

		return [vec[0] / magnitude, vec[1] / magnitude, vec[2] / magnitude, vec[3] / magnitude];
	}

	// The result of solving cosh(t)pos1 + sinh(t)v = pos2 for v.
	getGeodesicDirection(pos1, pos2, t)
	{
		const cosFactor = Math.cosh(t);
		const sinFactor = Math.sinh(t);
		
		const dir = [
			(pos2[0] - cosFactor * pos1[0]) / sinFactor,
			(pos2[1] - cosFactor * pos1[1]) / sinFactor,
			(pos2[2] - cosFactor * pos1[2]) / sinFactor,
			(pos2[3] - cosFactor * pos1[3]) / sinFactor,
		];

		return this.normalize(dir);
	}

	//Gets the distance from pos1 to pos2 along the geodesic in the direction of dir.
	getGeodesicDistance(pos1, pos2)
	{
		const dot = this.dotProduct(pos1, pos2);

		return Math.acosh(-dot);
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

	getGammaPrime(_pos, dir)
	{
		//gamma = cosh(t)*pos + sinh(t)*dir
		//gamma' = sinh(t)*pos + cosh(t)*dir
		//gamma'' = cosh(t)*pos + sinh(t)*dir
		//gamma''' = sinh(t)*pos + cosh(t)*dir
		//All of these are evaluated at t=0.
		return [...dir];
	}

	getGammaDoublePrime(pos)
	{
		return [...pos];
	}

	getGammaTriplePrime(_pos, dir)
	{
		return [...dir];
	}

	gammaTriplePrimeIsLinearlyIndependent = false;
}

export class H3Spheres extends H3Geometry
{
	static distances = `
		float distance1 = acosh(-geometryDot(pos, vec4(1.0, 1.0, -1.0, 2.0))) - .7;
		float distance2 = acosh(-geometryDot(pos, vec4(1.0, -1.0, 1.0, 2.0))) - .7;
		float distance3 = acosh(-geometryDot(pos, vec4(1.0, -1.0, -1.0, 2.0))) - .7;
		float distance4 = acosh(-geometryDot(pos, vec4(-1.0, 1.0, 1.0, 2.0))) - .7;
		float distance5 = acosh(-geometryDot(pos, vec4(-1.0, 1.0, -1.0, 2.0))) - .7;
		float distance6 = acosh(-geometryDot(pos, vec4(-1.0, -1.0, 1.0, 2.0))) - .7;
		float distance7 = acosh(-geometryDot(pos, vec4(-1.0, -1.0, -1.0, 2.0))) - .7;
	`;

	distanceEstimatorGlsl = `
		${H3Spheres.distances}

		float minDistance = ${getMinGlslString("distance", 7)};

		return minDistance;
	`;

	getColorGlsl = `
		${H3Spheres.distances}
		
		float minDistance = ${getMinGlslString("distance", 7)};

		if (minDistance == distance1)
		{
			return vec3(1.0, 0.0, 0.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance2)
		{
			return vec3(0.0, 1.0, 1.0) * getBanding(pos.y + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance3)
		{
			return vec3(0.0, 1.0, 0.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance4)
		{
			return vec3(1.0, 0.0, 1.0) * getBanding(pos.x + pos.z + pos.w, 10.0);
		}

		if (minDistance == distance5)
		{
			return vec3(0.0, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance6)
		{
			return vec3(1.0, 1.0, 0.0) * getBanding(pos.x + pos.y + pos.w, 10.0);
		}

		if (minDistance == distance7)
		{
			return vec3(1.0, 1.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
	`;

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
			this.normalVec,
			this.upVec
		);

		const dotRight = this.dotProduct(
			this.normalVec,
			this.rightVec
		);

		const dotForward = this.dotProduct(
			this.normalVec,
			this.forwardVec
		);

		for (let i = 0; i < 4; i++)
		{
			// The signature of the Lorentzian inner product means
			// we need to add these instead of subtracting them.
			this.upVec[i] += dotUp * this.normalVec[i];
			this.rightVec[i] += dotRight * this.normalVec[i];
			this.forwardVec[i] += dotForward * this.normalVec[i];
		}

		this.upVec = this.normalize(this.upVec);
		this.rightVec = this.normalize(this.rightVec);
		this.forwardVec = this.normalize(this.forwardVec);

		// console.log(
		// 	this.dotProduct(this.forwardVec, this.rightVec),
		// 	this.dotProduct(this.forwardVec, this.upVec),
		// 	this.dotProduct(this.forwardVec, this.normalVec),
		// 	this.dotProduct(this.rightVec, this.upVec),
		// 	this.dotProduct(this.rightVec, this.normalVec),
		// 	this.dotProduct(this.upVec, this.normalVec),
		// );
	}

	getMovingSpeed()
	{
		return .25;
	}

	cameraPos = [0, 0, 0, 1];
	normalVec = [0, 0, 0, -1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];
}