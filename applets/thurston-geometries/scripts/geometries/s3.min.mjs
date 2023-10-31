import{ThurstonGeometry}from"../class.min.mjs";function getS3BaseData(){return{geodesicGlsl:"vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;",fogGlsl:"return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));",customDotProduct:(vec1,vec2)=>vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3],updateCameraPos:(cameraPos,tangentVec,dt)=>{var t=[...cameraPos];for(let o=0;o<4;o++)t[o]=Math.cos(dt)*t[o]+Math.sin(dt)*tangentVec[o];var e=ThurstonGeometry.magnitude(t);return t[0]/=e,t[1]/=e,t[2]/=e,t[3]/=e,t},getGeodesicDirection(pos1,pos2){var t=new Array(4);for(let o=0;o<4;o++)t[o]=(pos2[o]-Math.cos(1)*pos1[o])/Math.sin(1);var e=ThurstonGeometry.magnitude(t);return[ThurstonGeometry.normalize(t),e]},getNormalVec:cameraPos=>ThurstonGeometry.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],-cameraPos[3]]),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[-pos[0],-pos[1],-pos[2],-pos[3]],getGammaTriplePrime:(_pos,dir)=>[-dir[0],-dir[1],-dir[2],-dir[3]],gammaTriplePrimeIsLinearlyIndependent:!1}}function getS3RoomsData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
			float distance1 = acos(pos.x) - .92;
			float distance2 = acos(-pos.x) - .92;
			float distance3 = acos(pos.y) - .92;
			float distance4 = acos(-pos.y) - .92;
			float distance5 = acos(pos.z) - .92;
			float distance6 = acos(-pos.z) - .92;
			float distance7 = acos(pos.w) - .92;
			float distance8 = acos(-pos.w) - .92;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			return -minDistance;
		`,getColorGlsl:`
			float distance1 = acos(pos.x) - .92;
			float distance2 = acos(-pos.x) - .92;
			float distance3 = acos(pos.y) - .92;
			float distance4 = acos(-pos.y) - .92;
			float distance5 = acos(pos.z) - .92;
			float distance6 = acos(-pos.z) - .92;
			float distance7 = acos(pos.w) - .92;
			float distance8 = acos(-pos.w) - .92;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					min(distance7, distance8)
				)
			);

			if (minDistance == distance1)
			{
				return vec3(1.0, 0.0, 0.0);
			}

			if (minDistance == distance2)
			{
				return vec3(0.0, 1.0, 1.0);
			}

			if (minDistance == distance3)
			{
				return vec3(0.0, 1.0, 0.0);
			}

			if (minDistance == distance4)
			{
				return vec3(1.0, 0.0, 1.0);
			}

			if (minDistance == distance5)
			{
				return vec3(0.0, 0.0, 1.0);
			}

			if (minDistance == distance6)
			{
				return vec3(1.0, 1.0, 0.0);
			}

			if (minDistance == distance7)
			{
				return vec3(1.0, 0.5, 0.0);
			}

			if (minDistance == distance8)
			{
				return vec3(.5, 0.0, 1.0);
			}
		`,lightGlsl:`
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
		`,cameraPos:[0,0,0,-1],normalVec:[0,0,0,1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>1}}function getS3SpheresData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

			return minDistance;
		`,getColorGlsl:`
			float distance1 = acos(pos.x) - .3;
			float distance2 = acos(-pos.x) - .3;
			float distance3 = acos(pos.y) - .3;
			float distance4 = acos(-pos.y) - .3;
			float distance5 = acos(pos.z) - .3;
			float distance6 = acos(-pos.z) - .3;
			float distance7 = acos(pos.w) - .3;

			float minDistance = min(
				min(
					min(distance1, distance2),
					min(distance3, distance4)
				),
				min(
					min(distance5, distance6),
					distance7
				)
			);

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
		`,lightGlsl:`
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
		`,cameraPos:[0,0,0,-1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>1}}function getHopfFiber(index,numFibers){var t=index/numFibers*(2*Math.PI),e=Math.PI/2,o=hsvToRgb(e/(2*Math.PI),Math.abs(t%Math.PI-Math.PI/2)/(Math.PI/2),1),t=[Math.cos(t)*Math.sin(e),Math.sin(t)*Math.sin(e),Math.cos(e)],e=ThurstonGeometry.normalize([1+t[2],-t[1],t[0],0]),t=ThurstonGeometry.normalize([0,t[0],t[1],1+t[2]]);return[`float distance${index} = greatCircleDistance(
		pos,
		vec4(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}),
		vec4(${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}),
		.025);
	`,o]}function getMinDistanceCode(numFibers){let t="float minDistance = ";for(let e=0;e<numFibers-1;e++)t+=`min(distance${e}, `;return t+="distance"+(numFibers-1)+")".repeat(numFibers-1)+";"}function getColorCode(numFibers,colors){let t="";for(let e=0;e<numFibers;e++)t+=`if (minDistance == distance${e}) { return vec3(${colors[e][0]/255}, ${colors[e][1]/255}, ${colors[e][2]/255}); }
		`;return t}function getS3HopfFibrationData(){let t="";var e=new Array(20);for(let i=0;i<20;i++){var o=getHopfFiber(i,20);t+=o[0],e[i]=o[1]}var a=(t+=getMinDistanceCode(20))+getColorCode(20,e);return t+="return minDistance;",{...getS3BaseData(),functionGlsl:`
			//p and v must be orthonormal.
			float greatCircleDistance(vec4 pos, vec4 p, vec4 v, float r)
			{
				float dot1 = dot(pos, p);
				float dot2 = dot(pos, v);

				return acos(sqrt(dot1 * dot1 + dot2 * dot2)) - r;
			}
		`,distanceEstimatorGlsl:t,getColorGlsl:a,lightGlsl:`
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
		`,cameraPos:[0,0,0,-1],normalVec:[0,0,0,1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>1}}function hsvToRgb(h,s,v){function t(n){var t=(n+6*h)%6;return v-v*s*Math.max(0,Math.min(t,Math.min(4-t,1)))}return[255*t(5),255*t(3),255*t(1)]}export{getS3RoomsData,getS3SpheresData,getS3HopfFibrationData};