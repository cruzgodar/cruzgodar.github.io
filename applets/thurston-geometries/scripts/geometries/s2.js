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
				effectiveDistance += pi;
			}

			if (effectiveDistance < rayLength${index})
			{
				return vec3(0);
			}
		}
	`;
}

// This renders a white sphere, a black camera dot on it,
// polka dot circles, and the light rays.
export class E3S2Demo extends E3Geometry
{
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
			return vec3(0.2);
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
		vec3 directionToCamera = (pos.xyz - cos(distanceToCamera) * cameraDotPos.xyz) / sin(distanceToCamera);

		${getSphereBandGlsl(1)}
		${getSphereBandGlsl(2)}
		${getSphereBandGlsl(3)}
		${getSphereBandGlsl(4)}
		${getSphereBandGlsl(5)}
		${getSphereBandGlsl(6)}
		${getSphereBandGlsl(7)}



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

	movingSpeed = 5;
	
	lockedOnOrigin = true;

	fov = Math.tan(60 / 2 * Math.PI / 180);

	cameraDotPos = [0, 0, 1, 0];
	
	numRays = 7;

	rayDirs = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];

	testVecs = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	];

	rayLengths = [1, 1, 1, 1, 1, 1, 1];

	uniformGlsl = /* glsl */`
		uniform vec4 cameraDotPos;

		uniform vec4 rayDir1;
		uniform vec4 rayDir2;
		uniform vec4 rayDir3;
		uniform vec4 rayDir4;
		uniform vec4 rayDir5;
		uniform vec4 rayDir6;
		uniform vec4 rayDir7;

		uniform vec4 testVec1;
		uniform vec4 testVec2;
		uniform vec4 testVec3;
		uniform vec4 testVec4;
		uniform vec4 testVec5;
		uniform vec4 testVec6;
		uniform vec4 testVec7;

		uniform float rayLength1;
		uniform float rayLength2;
		uniform float rayLength3;
		uniform float rayLength4;
		uniform float rayLength5;
		uniform float rayLength6;
		uniform float rayLength7;
	`;

	uniformNames = [
		"cameraDotPos",

		"rayDir1",
		"rayDir2",
		"rayDir3",
		"rayDir4",
		"rayDir5",
		"rayDir6",
		"rayDir7",

		"testVec1",
		"testVec2",
		"testVec3",
		"testVec4",
		"testVec5",
		"testVec6",
		"testVec7",

		"rayLength1",
		"rayLength2",
		"rayLength3",
		"rayLength4",
		"rayLength5",
		"rayLength6",
		"rayLength7"
	];

	updateUniforms(gl, uniformList)
	{
		gl.uniform4fv(uniformList["cameraDotPos"], this.cameraDotPos);

		for (let i = 0; i < this.numRays; i++)
		{
			gl.uniform4fv(uniformList[`rayDir${i + 1}`], this.rayDirs[i]);
			gl.uniform4fv(uniformList[`testVec${i + 1}`], this.testVecs[i]);
			gl.uniform1f(uniformList[`rayLength${i + 1}`], this.rayLengths[i]);
		}
	}
}

export class S2xES2Demo extends S2xEGeometry
{
	static distances = /* glsl */`
		float distance1 = length(vec2(acos(pos.x), pos.w)) - .5;
		float distance2 = length(vec2(acos(-pos.x), pos.w)) - .5;
		float distance3 = length(vec2(acos(pos.y), pos.w)) - .5;
		float distance4 = length(vec2(acos(-pos.y), pos.w)) - .5;
		float distance5 = length(vec2(acos(-pos.z), pos.w)) - .5;

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

	aspectRatio = 10;
}