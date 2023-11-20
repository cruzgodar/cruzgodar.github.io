import{ThurstonGeometry}from"../class.min.mjs";import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getColorGlslString,getMinGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";class S3Geometry extends BaseGeometry{geodesicGlsl="vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;";fogGlsl="return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));";followGeodesic(pos,dir,t){var s=[...pos];for(let o=0;o<4;o++)s[o]=Math.cos(t)*s[o]+Math.sin(t)*dir[o];var e=ThurstonGeometry.magnitude(s);return s[0]/=e,s[1]/=e,s[2]/=e,s[3]/=e,s}getGeodesicDirection(pos1,pos2,t){var s=Math.cos(t),e=Math.sin(t),s=[(pos2[0]-s*pos1[0])/e,(pos2[1]-s*pos1[1])/e,(pos2[2]-s*pos1[2])/e,(pos2[3]-s*pos1[3])/e];return this.normalize(s)}getGeodesicDistance(pos1,pos2){var s=this.dotProduct(pos1,pos2);return Math.acos(s)}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],-cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[-pos[0],-pos[1],-pos[2],-pos[3]]}getGammaTriplePrime(_pos,dir){return[-dir[0],-dir[1],-dir[2],-dir[3]]}gammaTriplePrimeIsLinearlyIndependent=!1}class S3Rooms extends S3Geometry{static distances=`
		float distance1 = acos(pos.x) - wallThickness;
		float distance2 = acos(-pos.x) - wallThickness;
		float distance3 = acos(pos.y) - wallThickness;
		float distance4 = acos(-pos.y) - wallThickness;
		float distance5 = acos(pos.z) - wallThickness;
		float distance6 = acos(-pos.z) - wallThickness;
		float distance7 = acos(pos.w) - wallThickness;
		float distance8 = acos(-pos.w) - wallThickness;
	`;distanceEstimatorGlsl=`
		${S3Rooms.distances}

		float minDistance = ${getMinGlslString("distance",8)};

		return -minDistance;
	`;getColorGlsl=`
		${S3Rooms.distances}

		float minDistance = ${getMinGlslString("distance",8)};

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
			return vec3(0.5, 0.0, 1.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
		if (minDistance == distance8)
		{
			return vec3(1.0, 0.5, 0.0) * getBanding(pos.x + pos.y + pos.z, 10.0);
		}
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, -1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}uniformGlsl="uniform float wallThickness;";uniformNames=["wallThickness"];updateUniforms(gl,uniformList){var s=.97-(sliderValues.wallThickness- -.15)/.5*(.97-.92);gl.uniform1f(uniformList.wallThickness,s)}uiElementsUsed="#wall-thickness-slider";initUI(){var s=$("#wall-thickness-slider"),t=$("#wall-thickness-slider-value");s.min=-.15,s.max=.35,s.value=.35,t.textContent=.35.toFixed(3),sliderValues.wallThickness=.35}}class S3Spheres extends S3Geometry{distanceEstimatorGlsl=`
		float distance1 = abs(acos(pos.x) - .3);
		float distance2 = abs(acos(-pos.x) - .3);
		float distance3 = abs(acos(pos.y) - .3);
		float distance4 = abs(acos(-pos.y) - .3);
		float distance5 = abs(acos(pos.z) - .3);
		float distance6 = abs(acos(-pos.z) - .3);
		float distance7 = abs(acos(pos.w) - .3);

		float minDistance = ${getMinGlslString("distance",7)};

		return minDistance;
	`;getColorGlsl=`
		float distance1 = abs(acos(pos.x) - .3);
		float distance2 = abs(acos(-pos.x) - .3);
		float distance3 = abs(acos(pos.y) - .3);
		float distance4 = abs(acos(-pos.y) - .3);
		float distance5 = abs(acos(pos.z) - .3);
		float distance6 = abs(acos(-pos.z) - .3);
		float distance7 = abs(acos(pos.w) - .3);

		float minDistance = ${getMinGlslString("distance",7)};

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
	`;lightGlsl=`
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}function hsvToRgb(h,s,v){function t(n){var t=(n+6*h)%6;return v-v*s*Math.max(0,Math.min(t,Math.min(4-t,1)))}return[255*t(5),255*t(3),255*t(1)]}function getHopfFiber(index,numFibers){var s=index/numFibers*(2*Math.PI),t=Math.PI/2,e=hsvToRgb(t/(2*Math.PI),Math.abs(s%Math.PI-Math.PI/2)/(Math.PI/2),1),s=[Math.cos(s)*Math.sin(t),Math.sin(s)*Math.sin(t),Math.cos(t)],t=this.normalize([1+s[2],-s[1],s[0],0]),s=this.normalize([0,s[0],s[1],1+s[2]]);return[`float distance${index+1} = greatCircleDistance(
		pos,
		vec4(${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}),
		vec4(${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}),
		fiberThickness);
	`,e]}class S3HopfFibration extends S3Geometry{constructor(){super();this.distanceEstimatorGlsl="";var s=new Array(20);for(let e=0;e<20;e++){var t=getHopfFiber(e,20);this.distanceEstimatorGlsl+=t[0],s[e]=t[1]}this.distanceEstimatorGlsl+=`float minDistance = ${getMinGlslString("distance",20)};`,this.getColorGlsl=this.distanceEstimatorGlsl+getColorGlslString("distance","minDistance",s),this.distanceEstimatorGlsl+="return minDistance;"}functionGlsl=`
		//p and v must be orthonormal.
		float greatCircleDistance(vec4 pos, vec4 p, vec4 v, float r)
		{
			float dot1 = dot(pos, p);
			float dot2 = dot(pos, v);

			return acos(sqrt(dot1 * dot1 + dot2 * dot2)) - r;
		}
	`;lightGlsl=`
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}uniformGlsl="uniform float fiberThickness;";uniformNames=["fiberThickness"];uniformData={fiberThickness:.025};updateUniforms(gl,uniformList){gl.uniform1f(uniformList.fiberThickness,sliderValues.fiberThickness)}uiElementsUsed="#fiber-thickness-slider";initUI(){var s=$("#fiber-thickness-slider"),t=$("#fiber-thickness-slider-value");s.min=.005,s.max=.1,s.value=.025,t.textContent=.025.toFixed(3),sliderValues.fiberThickness=.025}}export{S3Rooms,S3Spheres,S3HopfFibration};