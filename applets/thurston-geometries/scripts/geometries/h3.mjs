import { ThurstonGeometry } from "../class.mjs";
import { getMaxGlslString, getMinGlslString } from "./base.mjs";
import { E3Geometry } from "./e3.mjs";
import { $ } from "/scripts/src/main.mjs";

const dodecahedronPlanes = [
	[0.52573112, 0.85065077, 0.0],
	[0.52573112, -0.85065077, 0.0],
	[0.0, 0.52573112, 0.85065077],
	[0.0, 0.52573112, -0.85065077],
	[0.85065077, 0.0, 0.52573112],
	[-0.85065077, 0.0, 0.52573112]
];

const baseColorIncreases = [
	[1, 0, 0],
	[1, 1, 0],
	[0, 1, 0],
	[0, 1, 1],
	[0, 0, 1],
	[1, 0, 1]
];

const maxDotProduct = 1.3763819;

let rotationAngle = 1.88495559215;

//We use Seifert-Weber space as a model of H^3.
export class H3Rooms extends E3Geometry
{
	distanceEstimatorGlsl = `
		float distance1 = length(pos.xyz) - wallThickness;

		return -distance1;
	`;

	functionGlsl = `
		const float maxDotProduct = 1.3763819;
		
		const vec3 plane1 = vec3(0.52573112, 0.85065077, 0.0);
		const vec3 plane2 = vec3(0.52573112, -0.85065077, 0.0);
		const vec3 plane3 = vec3(0.0, 0.52573112, 0.85065077);
		const vec3 plane4 = vec3(0.0, 0.52573112, -0.85065077);
		const vec3 plane5 = vec3(0.85065077, 0.0, 0.52573112);
		const vec3 plane6 = vec3(-0.85065077, 0.0, 0.52573112);



		// Rotates pos an angle about axis (which must be a unit vector).
		void rotateAboutVector(inout vec3 pos, inout vec3 rayDirectionVec, vec3 axis, float angle)
		{
			// float sineOfAngle = sin(angle / 2.0);
			// vec4 q = vec4(sineOfAngle * pos, cos(angle / 2.0));
			// vec3 temp = cross(q.xyz, pos) + q.w * pos;
			// pos = pos + 2.0 * cross(q.xyz, temp);

			float s = sin(angle);
			float c = cos(angle);
			float oc = 1.0 - c;

			mat3 rotationMatrix = mat3(
				oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
				oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
				oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
			);

			pos.xyz = rotationMatrix * pos.xyz;
			rayDirectionVec = rotationMatrix * rayDirectionVec;
		}

		//Teleports the position back inside the dodecahedron and returns a vector to update the color.
		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t)
		{
			float dotProduct = dot(pos.xyz, plane1);

			// To reflect through one of these planes, we just subtract a multiple of the normal vector.
			// However, when we're far from the actual sphere, we can jump too far and land inside of the actual
			// sphere when we teleport. So instead, we'll reset to the plane itself when we teleport.
			
			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane1, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane1;
				startPos = pos;
				t = 0.0;

				return vec3(1.0, 0.0, 0.0);
			}

			if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane1, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane1;
				startPos = pos;
				t = 0.0;

				return vec3(-1.0, 0.0, 0.0);
			}

			

			dotProduct = dot(pos.xyz, plane2);

			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane2, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane2;
				startPos = pos;
				t = 0.0;

				return vec3(1.0, 1.0, 0.0);
			}

			if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane2, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane2;
				startPos = pos;
				t = 0.0;

				return vec3(-1.0, -1.0, 0.0);
			}

			
			
			dotProduct = dot(pos.xyz, plane3);

			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane3, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane3;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, 1.0, 0.0);
			}

			if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane3, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane3;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, -1.0, 0.0);
			}



			dotProduct = dot(pos.xyz, plane4);

			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane4, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane4;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, 1.0, 1.0);
			}

			else if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane4, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane4;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, -1.0, -1.0);
			}



			dotProduct = dot(pos.xyz, plane5);

			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane5, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane5;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, 0.0, 1.0);
			}

			else if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane5, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane5;
				startPos = pos;
				t = 0.0;

				return vec3(0.0, 0.0, -1.0);
			}



			dotProduct = dot(pos.xyz, plane6);

			if (dotProduct < -maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane6, rotationAngle);
				pos.xyz += 2.0 * maxDotProduct * plane6;
				startPos = pos;
				t = 0.0;

				return vec3(1.0, 0.0, 1.0);
			}

			else if (dotProduct > maxDotProduct)
			{
				rotateAboutVector(pos.xyz, rayDirectionVec.xyz, plane6, -rotationAngle);
				pos.xyz -= 2.0 * maxDotProduct * plane6;
				startPos = pos;
				t = 0.0;

				return vec3(-1.0, 0.0, -1.0);
			}



			return vec3(0.0, 0.0, 0.0);
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

	fogGlsl = "return mix(color, fogColor, 1.0 - exp(-length(pos) * fogScaling));";

	geodesicGlsl = `
		vec4 pos = startPos + t * rayDirectionVec;
		
		globalColor += teleportPos(pos, startPos, rayDirectionVec, t);
	`;

	getColorGlsl = `
		// The  color predominantly comes from the room we're in, and then there's a little extra from the position in that room.
		return vec3(
			.25 + .75 * (.5 * (sin(baseColor.x + globalColor.x + pos.x / 5.0) + 1.0)),
			.25 + .75 * (.5 * (sin(baseColor.y + globalColor.y + pos.y / 5.0) + 1.0)),
			.25 + .75 * (.5 * (sin(baseColor.z + globalColor.z + pos.z / 5.0) + 1.0))
		);
	`;

	updateTGlsl = `
		float t1 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, maxDotProduct));
		float t2 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane1, -maxDotProduct));
		float t3 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, maxDotProduct));
		float t4 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane2, -maxDotProduct));
		float t5 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane3, maxDotProduct));
		float t6 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane3, -maxDotProduct));
		float t7 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane4, maxDotProduct));
		float t8 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane4, -maxDotProduct));
		float t9 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane5, maxDotProduct));
		float t10 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane5, -maxDotProduct));
		float t11 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane6, maxDotProduct));
		float t12 = abs(getTToPlane(pos.xyz, rayDirectionVec.xyz, plane6, -maxDotProduct));

		float minTToPlane = ${getMinGlslString("t", 12)};
		t += min(minTToPlane + .01, distance) * stepFactor;
	`;

	lightGlsl = `
		vec4 lightDirection1 = normalize(vec4(1.0, 2.0, 3.0, 1.0) - pos);
		vec4 lightDirection2 = normalize(vec4(1.0, -2.0, 3.0, 1.0) - pos);
		vec4 lightDirection3 = normalize(vec4(-1.0, 2.0, 3.0, 1.0) - pos);
		vec4 lightDirection4 = normalize(vec4(1.0, 2.0, -3.0, 1.0) - pos);
		
		float dotProduct1 = dot(surfaceNormal, lightDirection1);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);
		float dotProduct3 = dot(surfaceNormal, lightDirection3);
		float dotProduct4 = dot(surfaceNormal, lightDirection4);

		float twoWayDotProduct1 = max(dotProduct1, -.5 * dotProduct1);
		float twoWayDotProduct2 = max(dotProduct2, -.5 * dotProduct2);
		float twoWayDotProduct3 = max(dotProduct3, -.5 * dotProduct3);
		float twoWayDotProduct4 = max(dotProduct4, -.5 * dotProduct4);

		float maxTwoWayDotProduct = ${getMaxGlslString("twoWayDotProduct", 2)};

		float lightIntensity = lightBrightness * maxTwoWayDotProduct * 1.25;
	`;

	cameraPos = [-1, 0, 0, 1];
	normalVec = [0, 0, 0, 1];
	upVec = [0, 0, 1, 0];
	rightVec = [0, 1, 0, 0];
	forwardVec = [1, 0, 0, 0];

	// Non-standard method for rotating the frame vectors in a plane.
	rotateVectors(axis, angle)
	{
		const s = Math.sin(angle);
		const c = Math.cos(angle);
		const oc = 1 - c;

		const rotationMatrix = [
			[
				oc * axis[0] * axis[0] + c,
				oc * axis[0] * axis[1] - axis[2] * s,
				oc * axis[2] * axis[0] + axis[1] * s
			],
			[
				oc * axis[0] * axis[1] + axis[2] * s,
				oc * axis[1] * axis[1] + c,
				oc * axis[1] * axis[2] - axis[0] * s
			],
			[
				oc * axis[2] * axis[0] - axis[1] * s,
				oc * axis[1] * axis[2] + axis[0] * s,
				oc * axis[2] * axis[2] + c
			]
		];

		this.cameraPos = ThurstonGeometry.mat3TimesVector(rotationMatrix, this.cameraPos).concat(1);
		this.forwardVec = ThurstonGeometry.mat3TimesVector(rotationMatrix, this.forwardVec)
			.concat(0);
		this.rightVec = ThurstonGeometry.mat3TimesVector(rotationMatrix, this.rightVec).concat(0);
		this.upVec = ThurstonGeometry.mat3TimesVector(rotationMatrix, this.upVec).concat(0);
	}

	teleportCamera()
	{
		for (let i = 0; i < dodecahedronPlanes.length; i++)
		{
			const plane = dodecahedronPlanes[i];

			const dotProduct = this.cameraPos[0] * plane[0]
				+ this.cameraPos[1] * plane[1]
				+ this.cameraPos[2] * plane[2];

			if (dotProduct < -maxDotProduct)
			{
				this.rotateVectors(plane, -rotationAngle);

				this.cameraPos[0] += 2 * maxDotProduct * plane[0];
				this.cameraPos[1] += 2 * maxDotProduct * plane[1];
				this.cameraPos[2] += 2 * maxDotProduct * plane[2];

				this.uniformData.baseColor[0] += baseColorIncreases[i][0];
				this.uniformData.baseColor[1] += baseColorIncreases[i][1];
				this.uniformData.baseColor[2] += baseColorIncreases[i][2];

				return;
			}

			else if (dotProduct > maxDotProduct)
			{
				this.rotateVectors(plane, rotationAngle);

				this.cameraPos[0] -= 2 * maxDotProduct * plane[0];
				this.cameraPos[1] -= 2 * maxDotProduct * plane[1];
				this.cameraPos[2] -= 2 * maxDotProduct * plane[2];

				this.uniformData.baseColor[0] -= baseColorIncreases[i][0];
				this.uniformData.baseColor[1] -= baseColorIncreases[i][1];
				this.uniformData.baseColor[2] -= baseColorIncreases[i][2];

				return;
			}
		}
	}

	uniformGlsl = `
		uniform float wallThickness;
		uniform float rotationAngle;
		uniform vec3 baseColor;
	`;
	uniformNames = ["wallThickness", "rotationAngle", "baseColor"];
	uniformData = {
		wallThickness: 1.56,
		rotationAngle: Math.PI * .6,
		baseColor: [0, 0, 0]
	};

	updateUniforms(gl, uniformList)
	{
		gl.uniform1f(uniformList["wallThickness"], this.uniformData.wallThickness);
		gl.uniform1f(uniformList["rotationAngle"], this.uniformData.rotationAngle);
		gl.uniform3fv(uniformList["baseColor"], this.uniformData.baseColor);
	}

	uiElementsUsed = "#wall-thickness-slider, #gluing-angle-slider";

	initUI()
	{
		const wallThicknessSlider = $("#wall-thickness-slider");
		const wallThicknessSliderValue = $("#wall-thickness-slider-value");

		wallThicknessSlider.value = 10000;
		wallThicknessSliderValue.textContent = 0.57;

		wallThicknessSlider.addEventListener("input", () =>
		{
			const wallThickness = 1.56 + (1 - parseInt(wallThicknessSlider.value) / 10000) * .075;

			wallThicknessSliderValue.textContent = (Math.round(
				(-wallThickness + 1.617) * 1000
			) / 100).toFixed(2);

			this.uniformData.wallThickness = wallThickness;
		});



		const rotationAngleSlider = $("#gluing-angle-slider");
		const rotationAngleSliderValue = $("#gluing-angle-slider-value");

		rotationAngleSlider.value = 6000;
		rotationAngleSliderValue.textContent = Math.round(Math.PI * .6 * 100) / 100;

		rotationAngleSlider.addEventListener("input", () =>
		{
			rotationAngle = parseInt(rotationAngleSlider.value) / 10000 * Math.PI;

			rotationAngleSliderValue.textContent = (Math.round(
				parseInt(rotationAngleSlider.value) / 10000 * Math.PI * 100
			) / 100).toFixed(2);

			this.uniformData.rotationAngle = rotationAngle;
		});
	}
}