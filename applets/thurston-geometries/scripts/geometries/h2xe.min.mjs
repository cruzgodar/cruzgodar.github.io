import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getMaxGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";class H2xEGeometry extends BaseGeometry{geodesicGlsl=`float h2Mag = sqrt(abs(
		rayDirectionVec.x * rayDirectionVec.x
		+ rayDirectionVec.y * rayDirectionVec.y
		- rayDirectionVec.z * rayDirectionVec.z
	));
	
	vec4 pos = vec4(
		cosh(h2Mag * t) * startPos.xyz + sinh(h2Mag * t) * rayDirectionVec.xyz / h2Mag,
		startPos.w + t * rayDirectionVec.w
	);`;dotProductGlsl="return v.x * w.x + v.y * w.y - v.z * w.z + v.w * w.w;";normalizeGlsl=`float magnitude = sqrt(abs(geometryDot(dir, dir)));
	
	return dir / magnitude;`;fogGlsl="return color;//mix(color, fogColor, 1.0 - exp(-totalT * fogScaling * 8.0));";functionGlsl=`float sinh(float x)
		{
			return .5 * (exp(x) - exp(-x));
		}

		float cosh(float x)
		{
			return .5 * (exp(x) + exp(-x));
		}

		float asinh(float x)
		{
			return log(x + sqrt(x*x + 1.0));
		}

		float acosh(float x)
		{
			return log(x + sqrt(x*x - 1.0));
		}

		// vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		// {
		// 	float c = cos(gluingAngle);
		// 	float s = sin(gluingAngle);

		// 	vec4 teleportVec1 = vec4(1.0, 0.0, 0.0, 0.577350269);
		// 	mat4 teleportMat1 = mat4(
		// 		2.0, 0.0, 0.0, 1.73205081,
		// 		0.0, c, s, 0.0,
		// 		0.0, -s, c, 0.0,
		// 		1.73205081, 0.0, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec2 = vec4(-1.0, 0.0, 0.0, 0.577350269);
		// 	mat4 teleportMat2 = mat4(
		// 		2.0, 0.0, 0.0, -1.73205081,
		// 		0.0, c, -s, 0.0,
		// 		0.0, s, c, 0.0,
		// 		-1.73205081, 0.0, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec3 = vec4(0.0, 1.0, 0.0, 0.577350269);
		// 	mat4 teleportMat3 = mat4(
		// 		c, 0.0, s, 0.0,
		// 		0.0, 2.0, 0.0, 1.73205081,
		// 		-s, 0.0, c, 0.0,
		// 		0.0, 1.73205081, 0.0, 2.0
		// 	);

		// 	vec4 teleportVec4 = vec4(0.0, -1.0, 0.0, 0.577350269);
		// 	mat4 teleportMat4 = mat4(
		// 		c, 0.0, -s, 0.0,
		// 		0.0, 2.0, 0.0, -1.73205081,
		// 		s, 0.0, c, 0.0,
		// 		0.0, -1.73205081, 0.0, 2.0
		// 	);



		// 	if (dot(pos, teleportVec1) < 0.0)
		// 	{
		// 		pos = teleportMat1 * pos;

		// 		// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
		// 		// position, not the current one, so we need to calculate that current
		// 		// position to teleport the vector correctly. The correct tangent vector
		// 		// is just the derivative of the geodesic at the current value of t.

		// 		rayDirectionVec = teleportMat1 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(1.0, 0.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec2) < 0.0)
		// 	{
		// 		pos = teleportMat2 * pos;

		// 		rayDirectionVec = teleportMat2 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(-1.0, 0.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec3) < 0.0)
		// 	{
		// 		pos = teleportMat3 * pos;

		// 		rayDirectionVec = teleportMat3 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(0.0, 1.0, 0.0);
		// 	}

		// 	if (dot(pos, teleportVec4) < 0.0)
		// 	{
		// 		pos = teleportMat4 * pos;

		// 		rayDirectionVec = teleportMat4 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

		// 		startPos = pos;
				
		// 		totalT += t;
		// 		t = 0.0;

		// 		return vec3(0.0, -1.0, 0.0);
		// 	}

		// 	return vec3(0.0, 0.0, 0.0);
		// }
	`;followGeodesic(pos,dir,t){var e=Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2]),e=0===e?[pos[0],pos[1],pos[2],pos[3]+t*dir[3]]:[Math.cosh(e*t)*pos[0]+Math.sinh(e*t)*dir[0]/e,Math.cosh(e*t)*pos[1]+Math.sinh(e*t)*dir[1]/e,Math.cosh(e*t)*pos[2]+Math.sinh(e*t)*dir[2]/e,pos[3]+t*dir[3]],o=Math.sqrt(-e[0]*e[0]-e[1]*e[1]+e[2]*e[2]);return e[0]/=o,e[1]/=o,e[2]/=o,e}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],cameraPos[2],0])}correctVectors(){var t=this.dotProduct(this.cameraPos,this.upVec),e=this.dotProduct(this.cameraPos,this.rightVec),o=this.dotProduct(this.cameraPos,this.forwardVec);for(let s=0;s<4;s++)this.upVec[s]+=t*this.cameraPos[s],this.rightVec[s]+=e*this.cameraPos[s],this.forwardVec[s]+=o*this.cameraPos[s];this.upVec=this.normalize(this.upVec),this.rightVec=this.normalize(this.rightVec),this.forwardVec=this.normalize(this.forwardVec)}dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]-vec1[2]*vec2[2]+vec1[3]*vec2[3]}normalize(vec){var t=Math.sqrt(Math.abs(this.dotProduct(vec,vec)));return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}}class H2xERooms extends H2xEGeometry{static distances=`
		float spacing = 1.09;

		float distance1 = wallThickness - length(vec2(acosh(pos.x), mod(pos.w + spacing / 2.0, spacing) - spacing / 2.0));
	`;distanceEstimatorGlsl=`
		${H2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance",6)};

		return minDistance;
	`;getColorGlsl=`
		${H2xERooms.distances}

		float minDistance = ${getMaxGlslString("distance",6)};

		float wColor = floor((pos.w + spacing / 2.0) / spacing);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance2)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		if (minDistance == distance3)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance4)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance5)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}

		if (minDistance == distance6)
		{
			return vec3(
				.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
			);
		}
	`;lightGlsl=`
		// The cap of .05 fixes a very weird bug where the top and bottom of spheres had tiny dots of incorrect lighting.

		vec4 lightDirection1 = normalize(vec4(2.0, 2.0, 2.0, -3.0) - pos);
		float dotProduct1 = abs(dot(surfaceNormal, lightDirection1));

		float lightIntensity = 1.5 * lightBrightness * dotProduct1;
	`;cameraPos=[0,0,-1,0];normalVec=[0,0,-1,0];upVec=[0,0,0,1];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}uniformGlsl="uniform float wallThickness;";uniformNames=["wallThickness"];updateUniforms(gl,uniformList){var t=.9557-sliderValues.wallThickness/10;gl.uniform1f(uniformList.wallThickness,t)}uiElementsUsed="#wall-thickness-slider";initUI(){var t=$("#wall-thickness-slider"),e=$("#wall-thickness-slider-value");t.min=-.45,t.max=.6,t.value=.6,e.textContent=.6,sliderValues.wallThickness=.6}}class H2xESpheres extends H2xEGeometry{static distances=`
		float distance1 = length(vec2(acosh(pos.z), mod(pos.w + .785398, 1.570796) - .785398)) - .5;
	`;distanceEstimatorGlsl=`
		${H2xESpheres.distances}

		float minDistance = distance1;

		return minDistance;
	`;getColorGlsl=`
		${H2xESpheres.distances}

		float minDistance = distance1;

		float wColor = floor((pos.w + .785398) / 1.570796);

		if (minDistance == distance1)
		{
			return vec3(
				.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
				.65 * (.5 * (sin(wColor * 89.0) + 1.0))
			);
		}

		// if (minDistance == distance2)
		// {
		// 	return vec3(
		// 		.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 89.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance3)
		// {
		// 	return vec3(
		// 		.65 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance4)
		// {
		// 	return vec3(
		// 		.75 + .25 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.75 + .25 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.65 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }

		// if (minDistance == distance5)
		// {
		// 	return vec3(
		// 		.88 + .12 * (.5 * (sin(wColor * 7.0) + 1.0)),
		// 		.88 + .12 * (.5 * (sin(wColor * 11.0) + 1.0)),
		// 		.88 + .12 * (.5 * (sin(wColor * 17.0) + 1.0))
		// 	);
		// }
	`;lightGlsl=`
		// This is very weird, but it fixes an issue where the north and south poles
		// of spheres had dots of incorrect lighting.
		pos.xyz = normalize(pos.xyz) / 1.001;
		surfaceNormal = getSurfaceNormal(pos);
		
		vec4 lightDirection1 = normalize(vec4(0.0, 1.0, 0.0, 2.0) - pos);
		float dotProduct1 = dot(surfaceNormal, lightDirection1);

		vec4 lightDirection2 = normalize(vec4(1.0, 0.0, -1.0, 1.0) - pos);
		float dotProduct2 = dot(surfaceNormal, lightDirection2);

		float lightIntensity = 1.3 * lightBrightness * max(dotProduct1, dotProduct2);

		lightIntensity = 1.0;
	`;cameraPos=[0,0,1,0];normalVec=[0,0,-1,0];upVec=[0,0,0,1];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];getMovingSpeed(){return 1}}export{H2xERooms,H2xESpheres};