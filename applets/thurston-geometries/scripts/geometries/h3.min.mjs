import{ThurstonGeometry}from"../class.min.mjs";function getH3BaseData(){return{geodesicGlsl:"vec4 pos = cosh(t) * cameraPos + sinh(t) * rayDirectionVec;",fogGlsl:`return mix(
			color,
			fogColor,
			0.0/*1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)*/
		);`,updateCameraPos:(cameraPos,tangentVec,dt)=>{var e=[...cameraPos];for(let o=0;o<4;o++)e[o]=Math.cosh(dt)*e[o]+Math.sinh(dt)*tangentVec[o];var t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2]-e[3]*e[3];return e[0]/=-t,e[1]/=-t,e[2]/=-t,e[3]/=-t,e},getNormalVec:cameraPos=>ThurstonGeometry.normalize([cameraPos[0],cameraPos[1],cameraPos[2],-cameraPos[3]]),getGammaPrime:(_pos,dir)=>[...dir],getGammaDoublePrime:pos=>[...pos],getGammaTriplePrime:(_pos,dir)=>[...dir],gammaTriplePrimeIsLinearlyIndependent:!1}}function getH3SpheresData(){return{...getH3BaseData(),distanceEstimatorGlsl:`
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
		`,cameraPos:[0,0,0,1],normalVec:[0,0,0,-1],upVec:[0,0,1,0],rightVec:[0,1,0,0],forwardVec:[1,0,0,0],getMovingSpeed:cameraPos=>Math.min(1/Math.acosh(cameraPos[3]),1)}}export{getH3SpheresData};