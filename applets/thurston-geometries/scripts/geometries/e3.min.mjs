import{ThurstonGeometry}from"../class.min.mjs";function getE3BaseData(){return{geodesicGlsl:"vec4 pos = cameraPos + t * rayDirectionVec;",fogGlsl:"return mix(color, fogColor, 1.0 - exp(-length(pos - cameraPos) * fogScaling));",customDotProduct:(vec1,vec2)=>vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3],updateCameraPos:(cameraPos,tangentVec,dt)=>{var e=[...cameraPos];for(let t=0;t<4;t++)e[t]=e[t]+dt*tangentVec[t];return e},getGeodesicDirection(pos1,pos2){var e=new Array(4);for(let o=0;o<4;o++)e[o]=pos2[o]-pos1[o];var t=ThurstonGeometry.magnitude(e);return[ThurstonGeometry.normalize(e),t]},getNormalVec:()=>[0,0,0,1],getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:()=>[0,0,0,0],getGammaTriplePrime:()=>[0,0,0,0],gammaTriplePrimeIsLinearlyIndependent:!1}}function getE3RoomsData(){return{...getE3BaseData(),distanceEstimatorGlsl:`
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
		`,cameraPos:[0,0,0,1],normalVec:[0,0,0,1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:()=>3}}export{getE3RoomsData,getE3SpheresData};