import{ThurstonGeometry}from"../class.min.mjs";import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getMaxGlslString,getMinGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";class E3Geometry extends BaseGeometry{}class E3Rooms extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + wallThickness;

		return distance1;
	`;getColorGlsl=`
		return vec3(
			.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
			.25 + .75 * (.5 * (sin(pos.z) + 1.0))
		);
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
	`;cameraPos=[1,1,1,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];uniformGlsl="uniform float wallThickness;";uniformNames=["wallThickness"];updateUniforms(gl,uniformList){var o=1.5-(sliderValues.wallThickness+.85)/2*.2;gl.uniform1f(uniformList.wallThickness,o)}uiElementsUsed="#wall-thickness-slider";initUI(){var o=$("#wall-thickness-slider"),t=$("#wall-thickness-slider-value");o.min=-.85,o.max=1.15,o.value=1.15,t.textContent=1.15,sliderValues.wallThickness=1.15}}class E3Spheres extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
	`;getColorGlsl=`
		return vec3(
			.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
		);
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
	`;cameraPos=[0,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0]}const dodecahedronPlanes=[[.52573112,.85065077,0],[.52573112,-.85065077,0],[0,.52573112,.85065077],[0,.52573112,-.85065077],[.85065077,0,.52573112],[-.85065077,0,.52573112]],baseColorIncreases=[[1,0,0],[1,1,0],[0,1,0],[0,1,1],[0,0,1],[1,0,1]],maxDotProduct=1.3763819,baseColor=[0,0,0];class E3SeifertWeberSpace extends E3Geometry{distanceEstimatorGlsl=`
		float distance1 = length(pos.xyz) - wallThickness;

		return -distance1;
	`;functionGlsl=`
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
	`;fogGlsl="return mix(color, fogColor, 1.0 - exp(-length(pos) * fogScaling));";geodesicGlsl=`
		vec4 pos = startPos + t * rayDirectionVec;
		
		globalColor += teleportPos(pos, startPos, rayDirectionVec, t);
	`;getColorGlsl=`
		// The  color predominantly comes from the room we're in, and then there's a little extra from the position in that room.
		return vec3(
			.25 + .75 * (.5 * (sin(baseColor.x + globalColor.x + pos.x / 5.0) + 1.0)),
			.25 + .75 * (.5 * (sin(baseColor.y + globalColor.y + pos.y / 5.0) + 1.0)),
			.25 + .75 * (.5 * (sin(baseColor.z + globalColor.z + pos.z / 5.0) + 1.0))
		);
	`;updateTGlsl=`
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

		float minTToPlane = ${getMinGlslString("t",12)};
		t += min(minTToPlane + .01, distance) * stepFactor;
	`;lightGlsl=`
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

		float maxTwoWayDotProduct = ${getMaxGlslString("twoWayDotProduct",2)};

		float lightIntensity = lightBrightness * maxTwoWayDotProduct * 1.25;
	`;cameraPos=[-1,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];rotateVectors(axis,angle,rotatedForwardVec){var o=Math.sin(angle),t=Math.cos(angle),e=1-t,o=[[e*axis[0]*axis[0]+t,e*axis[0]*axis[1]-axis[2]*o,e*axis[2]*axis[0]+axis[1]*o],[e*axis[0]*axis[1]+axis[2]*o,e*axis[1]*axis[1]+t,e*axis[1]*axis[2]-axis[0]*o],[e*axis[2]*axis[0]-axis[1]*o,e*axis[1]*axis[2]+axis[0]*o,e*axis[2]*axis[2]+t]];return this.cameraPos=ThurstonGeometry.mat3TimesVector(o,this.cameraPos).concat(1),this.forwardVec=ThurstonGeometry.mat3TimesVector(o,this.forwardVec).concat(0),this.rightVec=ThurstonGeometry.mat3TimesVector(o,this.rightVec).concat(0),this.upVec=ThurstonGeometry.mat3TimesVector(o,this.upVec).concat(0),ThurstonGeometry.mat3TimesVector(o,rotatedForwardVec).concat(0)}teleportCamera(rotatedForwardVec,recomputeRotation){for(let a=0;a<dodecahedronPlanes.length;a++){var o,t=dodecahedronPlanes[a],e=this.cameraPos[0]*t[0]+this.cameraPos[1]*t[1]+this.cameraPos[2]*t[2];if(e<-maxDotProduct)return o=this.rotateVectors(t,-sliderValues.gluingAngle,rotatedForwardVec),this.cameraPos[0]+=2*maxDotProduct*t[0],this.cameraPos[1]+=2*maxDotProduct*t[1],this.cameraPos[2]+=2*maxDotProduct*t[2],recomputeRotation(o),baseColor[0]+=baseColorIncreases[a][0],baseColor[1]+=baseColorIncreases[a][1],void(baseColor[2]+=baseColorIncreases[a][2]);if(e>maxDotProduct)return o=this.rotateVectors(t,sliderValues.gluingAngle,rotatedForwardVec),this.cameraPos[0]-=2*maxDotProduct*t[0],this.cameraPos[1]-=2*maxDotProduct*t[1],this.cameraPos[2]-=2*maxDotProduct*t[2],recomputeRotation(o),baseColor[0]-=baseColorIncreases[a][0],baseColor[1]-=baseColorIncreases[a][1],void(baseColor[2]-=baseColorIncreases[a][2])}}uniformGlsl=`
		uniform float wallThickness;
		uniform float rotationAngle;
		uniform vec3 baseColor;
	`;uniformNames=["wallThickness","rotationAngle","baseColor"];updateUniforms(gl,uniformList){var o=1.635-(sliderValues.wallThickness- -.18)/.75*(1.635-1.57);gl.uniform1f(uniformList.wallThickness,o),gl.uniform1f(uniformList.rotationAngle,sliderValues.gluingAngle),gl.uniform3fv(uniformList.baseColor,baseColor)}uiElementsUsed="#wall-thickness-slider, #gluing-angle-slider";initUI(){var o=$("#wall-thickness-slider"),t=$("#wall-thickness-slider-value"),o=(o.min=-.18,o.max=.57,o.value=.57,t.textContent=.57,sliderValues.wallThickness=.57,$("#gluing-angle-slider")),t=$("#gluing-angle-slider-value");o.min=0,o.max=Math.PI,o.value=.3*Math.PI,t.textContent=(.3*Math.PI).toFixed(3),sliderValues.gluingAngle=.3*Math.PI}}export{E3Geometry,E3Rooms,E3Spheres,E3SeifertWeberSpace};