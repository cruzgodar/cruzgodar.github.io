import{ThurstonGeometry}from"../class.min.mjs";function getS3BaseData(){return{geodesicGlsl:"vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;",fogGlsl:"return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));",updateCameraPos:(cameraPos,tangentVec,dt)=>{var t=[...cameraPos];for(let e=0;e<4;e++)t[e]=Math.cos(dt)*t[e]+Math.sin(dt)*tangentVec[e];var o=ThurstonGeometry.magnitude(t);return t[0]/=o,t[1]/=o,t[2]/=o,t[3]/=o,t},getGeodesicDirection(pos1,pos2){var t=new Array(4);for(let e=0;e<4;e++)t[e]=(pos2[e]-Math.cos(1)*pos1[e])/Math.sin(1);var o=ThurstonGeometry.magnitude(t);return[ThurstonGeometry.normalize(t),o]},getNormalVec:cameraPos=>ThurstonGeometry.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],-cameraPos[3]]),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[-pos[0],-pos[1],-pos[2],-pos[3]],getGammaTriplePrime:(_pos,dir)=>[-dir[0],-dir[1],-dir[2],-dir[3]],gammaTriplePrimeIsLinearlyIndependent:!1}}function getS3RoomsData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
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
		`,cameraPos:[0,0,0,-1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>1}}function getHopfFiber(index){var t=2*Math.random()*Math.PI,o=2*Math.random()*Math.PI,e=hsvToRgb(o/(2*Math.PI),Math.abs(t%Math.PI-Math.PI/2)/(Math.PI/2),1),t=[Math.cos(t)*Math.sin(o),Math.sin(t)*Math.sin(o),Math.cos(o)],o=ThurstonGeometry.normalize([1+t[2],-t[1],t[0],0]),t=ThurstonGeometry.normalize([0,t[0],t[1],1+t[2]]);return[`float distance${index} = greatCircleDistance(
		pos,
		vec4(${o[0]}, ${o[1]}, ${o[2]}, ${o[3]}),
		vec4(${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}),
		.025);
	`,e]}function getMinDistanceCode(numFibers){let t="float minDistance = ";for(let o=0;o<numFibers-1;o++)t+=`min(distance${o}, `;return t+="distance"+(numFibers-1)+")".repeat(numFibers-1)+";"}function getColorCode(numFibers,colors){let t="";for(let o=0;o<numFibers;o++)t+=`if (minDistance == distance${o}) { return vec3(${colors[o][0]/255}, ${colors[o][1]/255}, ${colors[o][2]/255}); }
		`;return t}function getS3HopfFibrationData(){let t="";var o=new Array(20);for(let i=0;i<20;i++){var e=getHopfFiber(i);t+=e[0],o[i]=e[1]}var a=(t+=getMinDistanceCode(20))+getColorCode(20,o);return t+="return minDistance;",{...getS3BaseData(),functionGlsl:`
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