import{BaseGeometry,getMinGlslString}from"./base.min.mjs";class S2xEGeometry extends BaseGeometry{geodesicGlsl=`vec4 pos = vec4(
		cos(length(rayDirectionVec.xyz) * t) * startPos.xyz + sin(length(rayDirectionVec.xyz) * t) * normalize(rayDirectionVec.xyz),
		startPos.w + t * rayDirectionVec.w
	);`;fogGlsl="return mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 5.0));";followGeodesic(pos,dir,t){var o=Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2]),o=0===o?[pos[0],pos[1],pos[2],pos[3]+t*dir[3]]:[Math.cos(o*t)*pos[0]+Math.sin(o*t)*dir[0]/o,Math.cos(o*t)*pos[1]+Math.sin(o*t)*dir[1]/o,Math.cos(o*t)*pos[2]+Math.sin(o*t)*dir[2]/o,pos[3]+t*dir[3]],s=Math.sqrt(o[0]*o[0]+o[1]*o[1]+o[2]*o[2]);return o[0]/=s,o[1]/=s,o[2]/=s,o}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],0])}}class S2xERooms extends S2xEGeometry{static distances=`
		float distance1 = length(vec2(acos(pos.x), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance2 = length(vec2(acos(-pos.x), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance3 = length(vec2(acos(pos.y), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance4 = length(vec2(acos(-pos.y), mod(pos.w + .5, 1.0) - .5)) - .35;
		float distance5 = length(vec2(acos(pos.z), mod(pos.w + .5, 1.0) - .5)) - .35;
	`;distanceEstimatorGlsl=`
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance",5)};

		return minDistance;
	`;getColorGlsl=`
		${S2xERooms.distances}

		float minDistance = ${getMinGlslString("distance",5)};

		if (minDistance == distance1)
		{
			if (length(vec2(acos(pos.x), mod(pos.w + .5, 1.0) - .5)) - .35 < 0.0)
			{
				return vec3(
					0.0, 0.0, 0.0
				);
			}
			return vec3(
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.5 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.5 * (.5 * (sin(floor(pos.w + .5) * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.5 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.5 * (.5 * (sin(floor(pos.w + .5) * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.5 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.5 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.5 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.9 + .1 * (.5 * (sin(floor(pos.w + .5) * 7.0) + 1.0)),
				.9 + .1 * (.5 * (sin(floor(pos.w + .5) * 11.0) + 1.0)),
				.9 + .1 * (.5 * (sin(floor(pos.w + .5) * 17.0) + 1.0))
			);
		}
	`;lightGlsl=`
		vec4 lightDirection1 = normalize(vec4(0.0, 0.0, 1.0, -1.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(0.0, 0.0, 0.0, 1.0) - mod(pos.w + 8.5, 16.0) - 8.5);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
	`;cameraPos=[0,0,-1,0];normalVec=[0,0,-1,0];upVec=[0,0,0,1];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}export{S2xERooms};