import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getMinGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";class S2xEGeometry extends BaseGeometry{geodesicGlsl=`vec4 pos = vec4(
		cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
		startPos.w + t * rayDirectionVec.w
	);`;fogGlsl="return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));";followGeodesic(pos,dir,t){var s=Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2]),s=[Math.cos(s*t)*pos[0]+Math.sin(s*t)*dir[0]/s,Math.cos(s*t)*pos[1]+Math.sin(s*t)*dir[1]/s,Math.cos(s*t)*pos[2]+Math.sin(s*t)*dir[2]/s,pos[3]+t*dir[3]],e=Math.sqrt(s[0]*s[0]+s[1]*s[1]+s[2]*s[2]);return s[0]/=e,s[1]/=e,s[2]/=e,s}getGeodesicDirection(pos1,pos2,t){}getGeodesicDistance(pos1,pos2){}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],0])}getGammaPrime(_pos,dir){}getGammaDoublePrime(pos){}getGammaTriplePrime(_pos,dir){}gammaTriplePrimeIsLinearlyIndependent=!1}class S2xERooms extends S2xEGeometry{static distances=`
		float distance1 = length(vec2(acos(pos.x), pos.w)) - wallThickness;
		float distance2 = length(vec2(acos(-pos.x), pos.w)) - wallThickness;
		float distance3 = length(vec2(acos(pos.y), pos.w)) - wallThickness;
		float distance4 = length(vec2(acos(-pos.y), pos.w)) - wallThickness;
	`;distanceEstimatorGlsl=`
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance",4)};

		return minDistance;
	`;getColorGlsl=`
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance",4)};

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
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, -1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;cameraPos=[0,0,-1,0];normalVec=[0,0,-1,0];upVec=[0,0,0,1];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}uniformGlsl="uniform float wallThickness;";uniformNames=["wallThickness"];updateUniforms(gl,uniformList){var s=sliderValues.wallThickness;gl.uniform1f(uniformList.wallThickness,s)}uiElementsUsed="#wall-thickness-slider";initUI(){var s=$("#wall-thickness-slider"),e=$("#wall-thickness-slider-value");s.min=.1,s.max=1,s.value=.2,e.textContent=.2,sliderValues.wallThickness=.2}}export{S2xERooms};