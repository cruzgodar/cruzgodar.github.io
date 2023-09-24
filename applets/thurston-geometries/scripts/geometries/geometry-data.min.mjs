import{ThurstonGeometry}from"../class.min.min.mjs";function getE3BaseData(){return{geodesicGlsl:"vec4 pos = cameraPos + t * rayDirectionVec;",fogGlsl:"return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));",updateCameraPos:(cameraPos,tangentVec,dt)=>{var t=[...cameraPos];for(let e=0;e<4;e++)t[e]=t[e]+dt*tangentVec[e];return t},getGeodesicDirection(pos1,pos2){var t=new Array(4);for(let o=0;o<4;o++)t[o]=pos2[o]-pos1[o];var e=ThurstonGeometry.magnitude(t);return[ThurstonGeometry.normalize(t),e]},getNormalVec:()=>[0,0,0,1],getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:()=>[0,0,0,0],getGammaTriplePrime:()=>[0,0,0,0],gammaTriplePrimeIsLinearlyIndependent:!1}}function getS3BaseData(){return{geodesicGlsl:"vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;",fogGlsl:"return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));",updateCameraPos:(cameraPos,tangentVec,dt)=>{var t=[...cameraPos];for(let o=0;o<4;o++)t[o]=Math.cos(dt)*t[o]+Math.sin(dt)*tangentVec[o];var e=ThurstonGeometry.magnitude(t);return t[0]/=e,t[1]/=e,t[2]/=e,t[3]/=e,t},getGeodesicDirection(pos1,pos2){var t=new Array(4);for(let o=0;o<4;o++)t[o]=(pos2[o]-Math.cos(1)*pos1[o])/Math.sin(1);var e=ThurstonGeometry.magnitude(t);return[ThurstonGeometry.normalize(t),e]},getNormalVec:cameraPos=>ThurstonGeometry.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],-cameraPos[3]]),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[-pos[0],-pos[1],-pos[2],-pos[3]],getGammaTriplePrime:(_pos,dir)=>[-dir[0],-dir[1],-dir[2],-dir[3]],gammaTriplePrimeIsLinearlyIndependent:!1}}function getH3BaseData(){return{geodesicGlsl:"vec4 pos = cosh(t) * cameraPos + sinh(t) * rayDirectionVec;",fogGlsl:`return mix(
			color,
			fogColor,
			0.0/*1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)*/
		);`,updateCameraPos:(cameraPos,tangentVec,dt)=>{var t=[...cameraPos];for(let o=0;o<4;o++)t[o]=Math.cosh(dt)*t[o]+Math.sinh(dt)*tangentVec[o];var e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2]-t[3]*t[3];return t[0]/=-e,t[1]/=-e,t[2]/=-e,t[3]/=-e,t},getNormalVec:cameraPos=>ThurstonGeometry.normalize([cameraPos[0],cameraPos[1],cameraPos[2],-cameraPos[3]]),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[...pos],getGammaTriplePrime:(_pos,dir)=>[...dir],gammaTriplePrimeIsLinearlyIndependent:!1}}function getE3RoomsData(){return{...getE3BaseData(),distanceEstimatorGlsl:`
			float distance1 = -length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) + 1.3;

			return distance1;
		`,getColorGlsl:`
			return vec3(
				.25 + .75 * (.5 * (sin(pos.x) + 1.0)),
				.25 + .75 * (.5 * (sin(pos.y) + 1.0)),
				.25 + .75 * (.5 * (sin(pos.z) + 1.0))
			);
		`,lightGlsl:`
			vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
			float dotProduct1 = dot(surfaceNormal, lightDirection1);

			vec4 lightDirection2 = normalize(vec4(1.0, 1.0, 1.0, 0.0) - pos);
			float dotProduct2 = dot(surfaceNormal, lightDirection2);

			float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2)) * 1.5;
		`,cameraPos:[1,1,1,1],normalVec:[0,0,0,1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>3}}function getE3SpheresData(){return{...getE3BaseData(),distanceEstimatorGlsl:`
			float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

			return distance1;
		`,getColorGlsl:`
			return vec3(
				.25 + .75 * (.5 * (sin(floor(pos.x + .5) * 40.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.y + .5) * 57.0) + 1.0)),
				.25 + .75 * (.5 * (sin(floor(pos.z + .5) * 89.0) + 1.0))
			);
		`,lightGlsl:`
			vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
			float dotProduct1 = dot(surfaceNormal, lightDirection1);

			float lightIntensity = lightBrightness * max(dotProduct1, -.5 * dotProduct1) * 1.25;
		`,cameraPos:[0,0,0,1],normalVec:[0,0,0,1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>3}}function getS3RoomsData(){return{...getS3BaseData(),distanceEstimatorGlsl:`
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
		`,cameraPos:[0,0,0,-1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>1}}function getH3SpheresData(){return{...getH3BaseData(),distanceEstimatorGlsl:`
		float distance1 = length(mod(pos.xyz, 2.0) - vec3(1.0, 1.0, 1.0)) - 0.5;

		return distance1;
		`,getColorGlsl:`
			return vec3(1.0, 0.0, 0.0);
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
		`,cameraPos:[0,0,0,1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:cameraPos=>Math.min(1/Math.acosh(cameraPos[3]),1)}}export{getE3RoomsData,getE3SpheresData,getS3RoomsData,getS3SpheresData,getH3SpheresData};