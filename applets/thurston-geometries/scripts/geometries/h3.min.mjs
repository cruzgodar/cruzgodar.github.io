import{BaseGeometry,getMinGlslString}from"./base.min.mjs";class H3Geometry extends BaseGeometry{geodesicGlsl="vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;";dotProductGlsl="return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;";normalizeGlsl=`float magnitude = sqrt(abs(geometryDot(dir, dir)));
		
	return dir / magnitude;`;fogGlsl=`return mix(
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
	}`;dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]-vec1[3]*vec2[3]}normalize(vec){var t=Math.sqrt(Math.abs(this.dotProduct(vec,vec)));return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}getGeodesicDirection(pos1,pos2,t){var e=Math.cosh(t),o=Math.sinh(t),e=[(pos2[0]-e*pos1[0])/o,(pos2[1]-e*pos1[1])/o,(pos2[2]-e*pos1[2])/o,(pos2[3]-e*pos1[3])/o];return this.normalize(e)}getGeodesicDistance(pos1,pos2){var t=this.dotProduct(pos1,pos2);return Math.acosh(-t)}followGeodesic(pos,dir,t){var e=new Array(4);for(let s=0;s<4;s++)e[s]=Math.cosh(t)*pos[s]+Math.sinh(t)*dir[s];var o=this.dotProduct(e,e),o=Math.sqrt(-o);return e[0]/=o,e[1]/=o,e[2]/=o,e[3]/=o,e}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[...pos]}getGammaTriplePrime(_pos,dir){return[...dir]}gammaTriplePrimeIsLinearlyIndependent=!1}class H3Spheres extends H3Geometry{static distances=`
		float distance1 = acosh(-geometryDot(pos, vec4(1.0, 1.0, -1.0, 2.0))) - .7;
		float distance2 = acosh(-geometryDot(pos, vec4(1.0, -1.0, 1.0, 2.0))) - .7;
		float distance3 = acosh(-geometryDot(pos, vec4(1.0, -1.0, -1.0, 2.0))) - .7;
		float distance4 = acosh(-geometryDot(pos, vec4(-1.0, 1.0, 1.0, 2.0))) - .7;
		float distance5 = acosh(-geometryDot(pos, vec4(-1.0, 1.0, -1.0, 2.0))) - .7;
		float distance6 = acosh(-geometryDot(pos, vec4(-1.0, -1.0, 1.0, 2.0))) - .7;
		float distance7 = acosh(-geometryDot(pos, vec4(-1.0, -1.0, -1.0, 2.0))) - .7;
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
	`;correctVectors(){var t=this.dotProduct(this.cameraPos,this.upVec),e=this.dotProduct(this.cameraPos,this.rightVec),o=this.dotProduct(this.cameraPos,this.forwardVec);for(let s=0;s<4;s++)this.upVec[s]+=t*this.cameraPos[s],this.rightVec[s]+=e*this.cameraPos[s],this.forwardVec[s]+=o*this.cameraPos[s];this.upVec=this.normalize(this.upVec),this.rightVec=this.normalize(this.rightVec),this.forwardVec=this.normalize(this.forwardVec)}getMovingSpeed(){return.25}cameraPos=[0,0,0,1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0]}export{H3Spheres};