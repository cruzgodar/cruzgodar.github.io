import{ThurstonGeometry}from"../class.min.mjs";import{BaseGeometry,getColorGlslString,getMinGlslString}from"./base.min.mjs";class S3Geometry extends BaseGeometry{geodesicGlsl="vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;";fogGlsl="return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));";customDotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}updateCameraPos(cameraPos,tangentVec,dt){var t=[...cameraPos];for(let o=0;o<4;o++)t[o]=Math.cos(dt)*t[o]+Math.sin(dt)*tangentVec[o];var e=ThurstonGeometry.magnitude(t);return t[0]/=e,t[1]/=e,t[2]/=e,t[3]/=e,t}getGeodesicDirection(pos1,pos2){var t=new Array(4);for(let o=0;o<4;o++)t[o]=(pos2[o]-Math.cos(1)*pos1[o])/Math.sin(1);var e=ThurstonGeometry.magnitude(t);return[ThurstonGeometry.normalize(t),e]}getNormalVec(cameraPos){return ThurstonGeometry.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],-cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[-pos[0],-pos[1],-pos[2],-pos[3]]}getGammaTriplePrime(_pos,dir){return[-dir[0],-dir[1],-dir[2],-dir[3]]}gammaTriplePrimeIsLinearlyIndependent=!1}class S3Rooms extends S3Geometry{static distances=`
		float distance1 = acos(pos.x) - .92;
		float distance2 = acos(-pos.x) - .92;
		float distance3 = acos(pos.y) - .92;
		float distance4 = acos(-pos.y) - .92;
		float distance5 = acos(pos.z) - .92;
		float distance6 = acos(-pos.z) - .92;
		float distance7 = acos(pos.w) - .92;
		float distance8 = acos(-pos.w) - .92;
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}class S3Spheres extends S3Geometry{distanceEstimatorGlsl=`
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}function hsvToRgb(h,s,v){function t(n){var t=(n+6*h)%6;return v-v*s*Math.max(0,Math.min(t,Math.min(4-t,1)))}return[255*t(5),255*t(3),255*t(1)]}function getHopfFiber(index,numFibers){var t=index/numFibers*(2*Math.PI),e=Math.PI/2,o=hsvToRgb(e/(2*Math.PI),Math.abs(t%Math.PI-Math.PI/2)/(Math.PI/2),1),t=[Math.cos(t)*Math.sin(e),Math.sin(t)*Math.sin(e),Math.cos(e)],e=ThurstonGeometry.normalize([1+t[2],-t[1],t[0],0]),t=ThurstonGeometry.normalize([0,t[0],t[1],1+t[2]]);return[`float distance${index+1} = greatCircleDistance(
		pos,
		vec4(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}),
		vec4(${t[0]}, ${t[1]}, ${t[2]}, ${t[3]}),
		.025);
	`,o]}class S3HopfFibration extends S3Geometry{constructor(){super();this.distanceEstimatorGlsl="";var t=new Array(20);for(let o=0;o<20;o++){var e=getHopfFiber(o,20);this.distanceEstimatorGlsl+=e[0],t[o]=e[1]}this.distanceEstimatorGlsl+=`float minDistance = ${getMinGlslString("distance",20)};`,this.getColorGlsl=this.distanceEstimatorGlsl+getColorGlslString("distance","minDistance",t),this.distanceEstimatorGlsl+="return minDistance;"}functionGlsl=`
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}class S3RoomsTeleport extends S3Geometry{functionGlsl=`
		ivec4 closestQ8Point(vec4 pos)
		{
			float maxEntry = max(
				max(abs(pos.x), abs(pos.y)),
				max(abs(pos.z), abs(pos.w))
			);

			if (maxEntry == pos.x)
			{
				return ivec4(1, 0, 0, 0);
			}

			if (maxEntry == -pos.x)
			{
				return ivec4(-1, 0, 0, 0);
			}

			if (maxEntry == pos.y)
			{
				return ivec4(0, 1, 0, 0);
			}

			if (maxEntry == -pos.y)
			{
				return ivec4(0, -1, 0, 0);
			}

			if (maxEntry == pos.z)
			{
				return ivec4(0, 0, 1, 0);
			}

			if (maxEntry == -pos.z)
			{
				return ivec4(0, 0, -1, 0);
			}

			if (maxEntry == pos.w)
			{
				return ivec4(0, 0, 0, 1);
			}

			if (maxEntry == -pos.w)
			{
				return ivec4(0, 0, 0, -1);
			}
		}

		void teleportPos(inout vec4 pos, inout vec4 rayDirectionVec, ivec4 p1, ivec4 p2)
		{
			// The first block rotates two variables in the plane we're passing through.
			// The second one teleports back. The sign of the entry corresponding to p2 must be preserved.
			if (p1.x == 0 && p2.x == 0)
			{
				if (p1.y == 0 && p2.y == 0)
				{
					float temp = pos.x;
					pos.x = -pos.y;
					pos.y = temp;
					
					temp = rayDirectionVec.x;
					rayDirectionVec.x = -rayDirectionVec.y;
					rayDirectionVec.y = temp;
				}

				else if (p1.z == 0 && p2.z == 0)
				{
					float temp = pos.x;
					pos.x = -pos.z;
					pos.z = temp;

					temp = rayDirectionVec.x;
					rayDirectionVec.x = -rayDirectionVec.z;
					rayDirectionVec.z = temp;
				}

				else
				{
					float temp = pos.x;
					pos.x = -pos.w;
					pos.w = temp;

					temp = rayDirectionVec.x;
					rayDirectionVec.x = -rayDirectionVec.w;
					rayDirectionVec.w = temp;
				}
			}

			else if (p1.y == 0 && p2.y == 0)
			{
				if (p1.z == 0 && p2.z == 0)
				{
					float temp = pos.y;
					pos.y = -pos.z;
					pos.z = temp;

					temp = rayDirectionVec.y;
					rayDirectionVec.y = -rayDirectionVec.z;
					rayDirectionVec.z = temp;
				}
				
				else
				{
					float temp = pos.y;
					pos.y = -pos.w;
					pos.w = temp;

					temp = rayDirectionVec.y;
					rayDirectionVec.y = -rayDirectionVec.w;
					rayDirectionVec.w = temp;
				}
			}

			else
			{
				float temp = pos.z;
				pos.z = -pos.w;
				pos.w = temp;

				temp = rayDirectionVec.z;
				rayDirectionVec.z = -rayDirectionVec.w;
				rayDirectionVec.w = temp;
			}



			if (p2.w == -1)
			{
				if (p1.x == 1)
				{
					float temp = pos.x;
					pos.x = pos.w;
					pos.w = -temp;
					
					temp = rayDirectionVec.x;
					rayDirectionVec.x = rayDirectionVec.w;
					rayDirectionVec.w = -temp;
				}

				else if (p1.x == -1)
				{
					float temp = pos.x;
					pos.x = -pos.w;
					pos.w = temp;
					
					temp = rayDirectionVec.x;
					rayDirectionVec.x = -rayDirectionVec.w;
					rayDirectionVec.w = temp;
				}

				else if (p1.y == 1)
				{
					float temp = pos.y;
					pos.y = pos.w;
					pos.w = -temp;
					
					temp = rayDirectionVec.y;
					rayDirectionVec.y = rayDirectionVec.w;
					rayDirectionVec.w = -temp;
				}

				else if (p1.y == -1)
				{
					float temp = pos.y;
					pos.y = -pos.w;
					pos.w = temp;
					
					temp = rayDirectionVec.y;
					rayDirectionVec.y = -rayDirectionVec.w;
					rayDirectionVec.w = temp;
				}

				else if (p1.z == 1)
				{
					float temp = pos.z;
					pos.z = pos.w;
					pos.w = -temp;
					
					temp = rayDirectionVec.z;
					rayDirectionVec.z = rayDirectionVec.w;
					rayDirectionVec.w = -temp;
				}

				else if (p1.z == -1)
				{
					float temp = pos.z;
					pos.z = -pos.w;
					pos.w = temp;
					
					temp = rayDirectionVec.z;
					rayDirectionVec.z = -rayDirectionVec.w;
					rayDirectionVec.w = temp;
				}
			}
		}
	`;raymarchSetupGlsl="ivec4 oldClosestPoint = closestQ8Point(startPos);";geodesicGlsl=`
		vec4 pos = cos(t) * startPos + sin(t) * rayDirectionVec;
		
		ivec4 newClosestPoint = closestQ8Point(pos);

		if (newClosestPoint != oldClosestPoint)
		{
			//We need the geodesic from the teleported point in the same direction we were going.
			rayDirectionVec = normalize(-sin(t) * startPos + cos(t) * rayDirectionVec);

			teleportPos(pos, rayDirectionVec, newClosestPoint, oldClosestPoint);

			startPos = pos;
			t = 0.0;
		}

		oldClosestPoint = newClosestPoint;
	`;static distances=`
		float distance1 = acos(pos.x) - .92;
		float distance2 = acos(-pos.x) - .92;
		float distance3 = acos(pos.y) - .92;
		float distance4 = acos(-pos.y) - .92;
		float distance5 = acos(pos.z) - .92;
		float distance6 = acos(-pos.z) - .92;
		float distance7 = acos(pos.w) - .92;
		float distance8 = acos(-pos.w) - .92;
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
	`;cameraPos=[0,0,0,-1];normalVec=[0,0,0,1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}export{S3Rooms,S3Spheres,S3HopfFibration,S3RoomsTeleport};