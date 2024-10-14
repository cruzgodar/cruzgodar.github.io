import { getMinGlslString } from "../../../../scripts/applets/applet.js";
import { E3Geometry } from "./e3.js";
import { S2xEGeometry } from "./s2xe.js";

function getSphereBandGlsl(index)
{
	return /* glsl */`
		if (
			length((normalizedPos - dot(normalizedPos, testVec${index}.xyz) * testVec${index}.xyz)) > 0.99995
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

const e3DemoDistances = /* glsl */`
	// The sphere itself.
	float distance1 = length(pos.xyz) - 1.0;

	// The camera.
	float distance2 = length(pos.xyz - cameraDotPos.xyz) - 0.05;

	float minDistance =  ${getMinGlslString("distance", 2)};
`;

// This renders a white sphere, a black camera dot on it,
// polka dot circles, and the light rays.
export class E3S2Demo extends E3Geometry
{
	numRays = 15;

	rayDirs = Array(this.numRays).fill([0, 0, 0, 0]);

	testVecs = Array(this.numRays).fill([0, 0, 0, 0]);

	rayLengths = Array(this.numRays).fill(0);

	rayColors = Array(this.numRays).fill([0, 0, 0]);

	distanceEstimatorGlsl = /* glsl */`
		${e3DemoDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${e3DemoDistances}

		if (minDistance == distance2)
		{
			return vec3(1.5);
		}

		pos.xyz /= 1.001;

		float radius = .35;
		float variation = .175;

		if (acos(dot(pos.xyz, normalize(vec3(1, 0, 0)))) - radius < 0.0)
		{
			return vec3(
				.5 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 1, 0)))) - radius < 0.0)
		{
			return vec3(
				.5 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (acos(dot(pos.xyz, normalize(vec3(-1, 0, 0)))) - radius < 0.0)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, -1, 0)))) - radius < 0.0)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 + .15 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (acos(dot(pos.xyz, normalize(vec3(0, 0, -1)))) - radius < 0.0)
		{
			return vec3(
				.5 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		float distanceToCamera = acos(dot(pos.xyz, cameraDotPos.xyz));
		vec3 directionToCamera = normalize((pos.xyz - cos(distanceToCamera) * cameraDotPos.xyz) / sin(distanceToCamera));

		vec3 normalizedPos = normalize(pos.xyz);

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
		gl.uniform4fv(uniformList.cameraDotPos, this.cameraDotPos);

		for (let i = 0; i < this.numRays; i++)
		{
			gl.uniform4fv(uniformList[`rayDir${i + 1}`], this.rayDirs[i]);
			gl.uniform4fv(uniformList[`testVec${i + 1}`], this.testVecs[i]);
			gl.uniform1f(uniformList[`rayLength${i + 1}`], this.rayLengths[i]);
			gl.uniform3fv(uniformList[`rayColor${i + 1}`], this.rayColors[i]);
		}
	}
}



const s2xeDemoDistances = /* glsl */`
	float radius = .35;

	float distance1 = acos(pos.x) - radius;
	float distance2 = acos(pos.y) - radius;
	float distance3 = acos(-pos.x) - radius;
	float distance4 = acos(-pos.y) - radius;
	float distance5 = acos(-pos.z) - radius;

	float minDistance = ${getMinGlslString("distance", 5)};
`;

export class S2xES2Demo extends S2xEGeometry
{
	distanceEstimatorGlsl = /* glsl */`
		${s2xeDemoDistances}

		return minDistance;
	`;

	getColorGlsl = /* glsl */`
		${s2xeDemoDistances}

		float variation = .175;
		
		if (minDistance == distance1)
		{
			return vec3(
				.5 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.85 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
				.5 + .15 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
				.5 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
			);
		}

		return vec3(
			.5 + .15 * (.5 * (sin((variation * pos.x) * 17.0) + 1.0)),
			.5 * (.5 * (sin((variation * pos.y) * 23.0) + 1.0)),
			.85 + .15 * (.5 * (sin((variation * pos.z) * 29.0) + 1.0))
		);
	`;

	lightGlsl = /* glsl */`
		vec4 lightDirection1 = normalize(vec4(0.0, 0.0, 1.0, 0.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = abs(dotProduct1);
	`;

	render1D = true;

	cameraPos = [0, 0, 1, 0];
	normalVec = [0, 0, 1, 0];
	upVec = [0, 0, 0, 1];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	aspectRatio = 10;
	ignoreAspectRatio = true;

	distanceEstimator(pos)
	{
		const radius = .34;

		const distance1 = Math.acos(pos[0]) - radius;
		const distance2 = Math.acos(-pos[0]) - radius;
		const distance3 = Math.acos(pos[1]) - radius;
		const distance4 = Math.acos(-pos[1]) - radius;
		const distance5 = Math.acos(-pos[2]) - radius;

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
		const radius = .35;

		const distance1 = Math.acos(pos[0]) - radius;
		const distance2 = Math.acos(pos[1]) - radius;
		const distance3 = Math.acos(-pos[0]) - radius;
		const distance4 = Math.acos(-pos[1]) - radius;
		const distance5 = Math.acos(-pos[2]) - radius;

		const minDistance = Math.min(
			Math.min(
				Math.min(distance1, distance2),
				Math.min(distance3, distance4)
			),
			distance5
		);

		const variation = .175;

		if (minDistance > 0.00001)
		{
			return [0, 0, 0];
		}

		if (minDistance === distance1)
		{
			return [
				.5 * (.5 * (Math.sin((variation * pos[0]) * 17.0) + 1.0)),
				.85 + .15 * (.5 * (Math.sin((variation * pos[1]) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (Math.sin((variation * pos[2]) * 29.0) + 1.0))
			];
		}

		if (minDistance === distance2)
		{
			return [
				.5 * (.5 * (Math.sin((variation * pos[0]) * 17.0) + 1.0)),
				.5 * (.5 * (Math.sin((variation * pos[1]) * 23.0) + 1.0)),
				.85 + .15 * (.5 * (Math.sin((variation * pos[2]) * 29.0) + 1.0))
			];
		}

		if (minDistance === distance3)
		{
			return [
				.85 + .15 * (.5 * (Math.sin((variation * pos[0]) * 17.0) + 1.0)),
				.5 * (.5 * (Math.sin((variation * pos[1]) * 23.0) + 1.0)),
				.5 * (.5 * (Math.sin((variation * pos[2]) * 29.0) + 1.0))
			];
		}

		if (minDistance === distance4)
		{
			return [
				.85 + .15 * (.5 * (Math.sin((variation * pos[0]) * 17.0) + 1.0)),
				.5 + .15 * (.5 * (Math.sin((variation * pos[1]) * 23.0) + 1.0)),
				.5 * (.5 * (Math.sin((variation * pos[2]) * 29.0) + 1.0))
			];
		}

		return [
			.5 + .15 * (.5 * (Math.sin((variation * pos[0]) * 17.0) + 1.0)),
			.5 * (.5 * (Math.sin((variation * pos[1]) * 23.0) + 1.0)),
			.85 + .15 * (.5 * (Math.sin((variation * pos[2]) * 29.0) + 1.0))
		];
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