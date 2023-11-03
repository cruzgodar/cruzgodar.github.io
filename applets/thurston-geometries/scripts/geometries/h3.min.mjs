import{ThurstonGeometry}from"../class.min.mjs";import{BaseGeometry,getMinGlslString}from"./base.min.mjs";class H3Geometry extends BaseGeometry{geodesicGlsl="vec4 pos = cosh(t) * cameraPos + sinh(t) * rayDirectionVec;";fogGlsl=`return mix(
		color,
		fogColor,
		0.0//1.0 - exp(-acosh(-dot(pos, cameraPos)) * fogScaling)
	);`;functionGlsl=`float sinh(float x)
	{
		return .5 * (exp(x) - exp(-x));
	}

	float cosh(float x)
	{
		return .5 * (exp(x) + exp(-x));
	}

	float acosh(float x)
	{
		return log(x + sqrt(x*x - 1.0));
	}`;customDotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]-vec1[3]*vec2[3]}updateCameraPos(cameraPos,tangentVec,dt){var e=new Array(4);for(let o=0;o<4;o++)e[o]=Math.cosh(dt)*cameraPos[o]+Math.sinh(dt)*tangentVec[o];var t=Math.sqrt(-e[0]*e[0]-e[1]*e[1]-e[2]*e[2]+e[3]*e[3]);return e[0]/=t,e[1]/=t,e[2]/=t,e[3]/=t,e}getNormalVec(cameraPos){return ThurstonGeometry.normalize([cameraPos[0],cameraPos[1],cameraPos[2],-cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[...pos]}getGammaTriplePrime(_pos,dir){return[...dir]}gammaTriplePrimeIsLinearlyIndependent=!1}class H3Spheres extends H3Geometry{static distances=`
		float distance1 = acosh(dot(pos, vec4(1.0, 1.0, -1.0, 2.0))) - 0.75;
		float distance2 = acosh(dot(pos, vec4(1.0, -1.0, 1.0, 2.0))) - 0.75;
		float distance3 = acosh(dot(pos, vec4(1.0, -1.0, -1.0, 2.0))) - 0.75;
		float distance4 = acosh(dot(pos, vec4(-1.0, 1.0, 1.0, 2.0))) - 0.75;
		float distance5 = acosh(dot(pos, vec4(-1.0, 1.0, -1.0, 2.0))) - 0.75;
		float distance6 = acosh(dot(pos, vec4(-1.0, -1.0, 1.0, 2.0))) - 0.75;
		float distance7 = acosh(dot(pos, vec4(-1.0, -1.0, -1.0, 2.0))) - 0.75;
	`;distanceEstimatorGlsl=`
		${H3Spheres.distances}

		float minDistance = ${getMinGlslString("distance",7)};

		return minDistance;
	`;getColorGlsl=`
		${H3Spheres.distances}
		
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
	`;cameraPos=[0,0,0,1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return.25}}export{H3Spheres};