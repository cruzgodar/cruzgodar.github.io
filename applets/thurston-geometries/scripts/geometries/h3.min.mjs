import{ThurstonGeometry}from"../class.min.mjs";import{getMaxGlslString,getMinGlslString}from"./base.min.mjs";import{E3Geometry}from"./e3.min.mjs";import{$}from"/scripts/src/main.min.mjs";const dodecahedronPlanes=[[.52573112,.85065077,0],[.52573112,-.85065077,0],[0,.52573112,.85065077],[0,.52573112,-.85065077],[.85065077,0,.52573112],[-.85065077,0,.52573112]],baseColorIncreases=[[1,0,0],[1,1,0],[0,1,0],[0,1,1],[0,0,1],[1,0,1]],maxDotProduct=1.3763819;let rotationAngle=1.88495559215;class H3Rooms extends E3Geometry{distanceEstimatorGlsl=`
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
	`;cameraPos=[-1,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];rotateVectors(axis,angle){var o=Math.sin(angle),t=Math.cos(angle),e=1-t,o=[[e*axis[0]*axis[0]+t,e*axis[0]*axis[1]-axis[2]*o,e*axis[2]*axis[0]+axis[1]*o],[e*axis[0]*axis[1]+axis[2]*o,e*axis[1]*axis[1]+t,e*axis[1]*axis[2]-axis[0]*o],[e*axis[2]*axis[0]-axis[1]*o,e*axis[1]*axis[2]+axis[0]*o,e*axis[2]*axis[2]+t]];this.cameraPos=ThurstonGeometry.mat3TimesVector(o,this.cameraPos).concat(1),this.forwardVec=ThurstonGeometry.mat3TimesVector(o,this.forwardVec).concat(0),this.rightVec=ThurstonGeometry.mat3TimesVector(o,this.rightVec).concat(0),this.upVec=ThurstonGeometry.mat3TimesVector(o,this.upVec).concat(0)}teleportCamera(){for(let e=0;e<dodecahedronPlanes.length;e++){var o=dodecahedronPlanes[e],t=this.cameraPos[0]*o[0]+this.cameraPos[1]*o[1]+this.cameraPos[2]*o[2];if(t<-maxDotProduct)return this.rotateVectors(o,-rotationAngle),this.cameraPos[0]+=2*maxDotProduct*o[0],this.cameraPos[1]+=2*maxDotProduct*o[1],this.cameraPos[2]+=2*maxDotProduct*o[2],this.uniformData.baseColor[0]+=baseColorIncreases[e][0],this.uniformData.baseColor[1]+=baseColorIncreases[e][1],void(this.uniformData.baseColor[2]+=baseColorIncreases[e][2]);if(t>maxDotProduct)return this.rotateVectors(o,rotationAngle),this.cameraPos[0]-=2*maxDotProduct*o[0],this.cameraPos[1]-=2*maxDotProduct*o[1],this.cameraPos[2]-=2*maxDotProduct*o[2],this.uniformData.baseColor[0]-=baseColorIncreases[e][0],this.uniformData.baseColor[1]-=baseColorIncreases[e][1],void(this.uniformData.baseColor[2]-=baseColorIncreases[e][2])}}uniformGlsl=`
		uniform float wallThickness;
		uniform float rotationAngle;
		uniform vec3 baseColor;
	`;uniformNames=["wallThickness","rotationAngle","baseColor"];uniformData={wallThickness:1.56,rotationAngle:.6*Math.PI,baseColor:[0,0,0]};updateUniforms(gl,uniformList){gl.uniform1f(uniformList.wallThickness,this.uniformData.wallThickness),gl.uniform1f(uniformList.rotationAngle,this.uniformData.rotationAngle),gl.uniform3fv(uniformList.baseColor,this.uniformData.baseColor)}uiElementsUsed="#wall-thickness-slider, #gluing-angle-slider";initUI(){const t=$("#wall-thickness-slider"),e=$("#wall-thickness-slider-value"),o=(t.value=1e4,e.textContent=.57,t.addEventListener("input",()=>{var o=1.56+.075*(1-parseInt(t.value)/1e4);e.textContent=(Math.round(1e3*(1.617-o))/100).toFixed(2),this.uniformData.wallThickness=o}),$("#gluing-angle-slider")),a=$("#gluing-angle-slider-value");o.value=6e3,a.textContent=Math.round(.6*Math.PI*100)/100,o.addEventListener("input",()=>{rotationAngle=parseInt(o.value)/1e4*Math.PI,a.textContent=(Math.round(parseInt(o.value)/1e4*Math.PI*100)/100).toFixed(2),this.uniformData.rotationAngle=rotationAngle})}}export{H3Rooms};