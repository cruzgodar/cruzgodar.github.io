import { getMinGlslString } from "./base.js";
import { E3Geometry } from "./e3.js";
import { S2xEGeometry } from "./s2xe.js";

function getSphereBandGlsl(index)
{
	return /* glsl */`
		if (
			length((pos.xyz - dot(pos.xyz, testVec${index}.xyz) * testVec${index}.xyz)) > 0.99897
		){
			float effectiveDistance = distanceToCamera;

			if (dot(directionToCamera, rayDir${index}.xyz) < 0.0)
			{
				effectiveDistance = 2.0 * pi - effectiveDistance;
			}

			if (effectiveDistance < rayLength${index})
			{
				return rayColor${index};
			}
		}
	`;
}

// This renders a white sphere, a black camera dot on it,
// polka dot circles, and the light rays.
export class E3S2Demo extends E3Geometry
{
	numRays = 15;

	rayDirs = Array(this.numRays).fill([0, 0, 0, 0]);

	testVecs = Array(this.numRays).fill([0, 0, 0, 0]);

	rayLengths = Array(this.numRays).fill(0);

	rayColors = Array(this.numRays).fill([0, 0, 0]);

	static distances = /* glsl */`
		// The sphere itself.
		float distance1 = length(pos.xyz) - 1.0;

		// The camera.
		float distance2 = length(pos.xyz - cameraDotPos.xyz) - 0.05;

		float minDistance =  ${getMinGlslString("distance", 2)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${E3S2Demo.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${E3S2Demo.distances}

		if (minDistance == distance2)
		{
			return vec3(1.5);
		}

		pos.xyz /= 1.001;

		float radius = .5;

		if (acos(dot(pos.xyz, normalize(vec3(1, 0, 0)))) - radius < 0.0)
		{
			return vec3(1.0, 0.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 1, 0)))) - radius < 0.0)
		{
			return vec3(0.0, 1.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(-1, 0, 0)))) - radius < 0.0)
		{
			return vec3(0.0, 0.0, 1.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, -1, 0)))) - radius < 0.0)
		{
			return vec3(1.0, 1.0, 0.0);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 0, -1)))) - radius < 0.0)
		{
			return vec3(0.5, 0.5, 0.5);
		}

		float distanceToCamera = acos(dot(pos.xyz, cameraDotPos.xyz));
		vec3 directionToCamera = normalize((pos.xyz - cos(distanceToCamera) * cameraDotPos.xyz) / sin(distanceToCamera));

		${this.rayLengths.map((_, index) => getSphereBandGlsl(index + 1)).join("")}



		return vec3(1.0, 1.0, 1.0);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(-3.0, 1.5, 1.5, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = (.5 + .5 * dotProduct1 * dotProduct1) * 1.15;
	`;

	cameraPos = [-2.5, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	movingSpeed = 0;
	
	lockedOnOrigin = true;

	fov = Math.tan(60 / 2 * Math.PI / 180);

	cameraDotPos = [0, 0, 1, 0];

	uniformGlsl = /* glsl */`
		uniform vec4 cameraDotPos;

		${this.rayLengths.map((_, index) => "uniform vec4 rayDir" + (index + 1)).join(";")};
		${this.rayLengths.map((_, index) => "uniform vec4 testVec" + (index + 1)).join(";")};
		${this.rayLengths.map((_, index) => "uniform float rayLength" + (index + 1)).join(";")};
		${this.rayLengths.map((_, index) => "uniform vec3 rayColor" + (index + 1)).join(";")};
	`;

	uniformNames = [
		"cameraDotPos",

		...(this.rayLengths.map((_, index) => "rayDir" + (index + 1))),
		...(this.rayLengths.map((_, index) => "testVec" + (index + 1))),
		...(this.rayLengths.map((_, index) => "rayLength" + (index + 1))),
		...(this.rayLengths.map((_, index) => "rayColor" + (index + 1))),
	];

	updateUniforms(gl, uniformList)
	{
		gl.uniform4fv(uniformList["cameraDotPos"], this.cameraDotPos);

		for (let i = 0; i < this.numRays; i++)
		{
			gl.uniform4fv(uniformList[`rayDir${i + 1}`], this.rayDirs[i]);
			gl.uniform4fv(uniformList[`testVec${i + 1}`], this.testVecs[i]);
			gl.uniform1f(uniformList[`rayLength${i + 1}`], this.rayLengths[i]);
			gl.uniform3fv(uniformList[`rayColor${i + 1}`], this.rayColors[i]);
		}
	}
}

export class S2xES2Demo extends S2xEGeometry
{
	static distances = /* glsl */`
		float distance1 = acos(pos.x) - .5;
		float distance2 = acos(-pos.x) - .5;
		float distance3 = acos(pos.y) - .5;
		float distance4 = acos(-pos.y) - .5;
		float distance5 = acos(-pos.z) - .5;

		float minDistance = ${getMinGlslString("distance", 5)};
	`;

	distanceEstimatorGlsl = /* glsl */`
		${S2xES2Demo.distances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${S2xES2Demo.distances}

		if (minDistance == distance1)
		{
			return vec3(1.0, 0.0, 0.0);
		}

		if (minDistance == distance2)
		{
			return vec3(0.0, 0.0, 1.0);
		}

		if (minDistance == distance3)
		{
			return vec3(0.0, 1.0, 0.0);
		}

		if (minDistance == distance4)
		{
			return vec3(1.0, 1.0, 0.0);
		}

		return vec3(0.5, 0.5, 0.5);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(0.0, 0.0, 1.0, 0.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.25 * abs(dotProduct1);
	`;

	render1D = true;

	cameraPos = [0, 0, 1, 0];
	normalVec = [0, 0, 1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	aspectRatio = 7;

	distanceEstimator(pos)
	{
		const distance1 = Math.acos(pos[0]) - .49;
		const distance2 = Math.acos(-pos[0]) - .49;
		const distance3 = Math.acos(pos[1]) - .49;
		const distance4 = Math.acos(-pos[1]) - .49;
		const distance5 = Math.acos(-pos[2]) - .49;

		const minDistance = Math.min(
			Math.min(
				Math.min(distance1, distance2),
				Math.min(distance3, distance4)
			),
			distance5
		);

		return minDistance;
	}

	getColor(pos)
	{
		const distance1 = Math.acos(pos[0]) - .5;
		const distance2 = Math.acos(-pos[0]) - .5;
		const distance3 = Math.acos(pos[1]) - .5;
		const distance4 = Math.acos(-pos[1]) - .5;
		const distance5 = Math.acos(-pos[2]) - .5;

		const minDistance = Math.min(
			Math.min(
				Math.min(distance1, distance2),
				Math.min(distance3, distance4)
			),
			distance5
		);

		if (minDistance > 0.00001)
		{
			return [0, 0, 0];
		}

		if (minDistance === distance1)
		{
			return [1, 0, 0];
		}

		if (minDistance === distance2)
		{
			return [0, 0, 1];
		}

		if (minDistance === distance3)
		{
			return [0, 1, 0];
		}

		if (minDistance === distance4)
		{
			return [1, 1, 0];
		}

		return [0.5, 0.5, 0.5];
	}

	getRayData(rayDirs)
	{
		const rayLengths = new Array(rayDirs.length);
		const rayColors = new Array(rayDirs.length);

		for (let i = 0; i < rayDirs.length; i++)
		{
			let t = 0;

			const startPos = [...this.cameraPos];
			let pos = [...startPos];

			let distance = 0;

			do
			{
				distance = this.distanceEstimator(pos);

				t += distance * 0.99;

				pos = [
					Math.cos(t) * startPos[0] + Math.sin(t) * rayDirs[i][0],
					Math.cos(t) * startPos[1] + Math.sin(t) * rayDirs[i][1],
					Math.cos(t) * startPos[2] + Math.sin(t) * rayDirs[i][2],
					0
				];
			} while (distance > 0.00001 && t < 2 * Math.PI);

			rayLengths[i] = t;
			rayColors[i] = this.getColor(pos);
		}

		return [rayLengths, rayColors];
	}
}