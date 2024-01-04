import{ThurstonGeometry}from"../class.min.mjs";import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getMinGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";class H3Geometry extends BaseGeometry{geodesicGlsl="vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;";dotProductGlsl="return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;";normalizeGlsl=`float magnitude = sqrt(abs(geometryDot(dir, dir)));
		
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

	float asinh(float x)
	{
		return log(x + sqrt(x*x + 1.0));
	}

	float acosh(float x)
	{
		return log(x + sqrt(x*x - 1.0));
	}`;dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]-vec1[3]*vec2[3]}normalize(vec){var t=Math.sqrt(Math.abs(this.dotProduct(vec,vec)));return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}getGeodesicDirection(pos1,pos2,t){var e=Math.cosh(t),o=Math.sinh(t),e=[(pos2[0]-e*pos1[0])/o,(pos2[1]-e*pos1[1])/o,(pos2[2]-e*pos1[2])/o,(pos2[3]-e*pos1[3])/o];return this.normalize(e)}getGeodesicDistance(pos1,pos2){var t=this.dotProduct(pos1,pos2);return Math.acosh(-t)}followGeodesic(pos,dir,t){var e=new Array(4);for(let r=0;r<4;r++)e[r]=Math.cosh(t)*pos[r]+Math.sinh(t)*dir[r];var o=this.dotProduct(e,e),o=Math.sqrt(-o);return e[0]/=o,e[1]/=o,e[2]/=o,e[3]/=o,e}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[...pos]}getGammaTriplePrime(_pos,dir){return[...dir]}gammaTriplePrimeIsLinearlyIndependent=!1}class H3Spheres extends H3Geometry{static distances=`
		float distance1 = acosh(-geometryDot(pos, vec4(0.0, 0.0, 0.0, 1.0))) - wallThickness;

		// Translate the reflection plane to the x = 0 plane, then get the distance to it.
		// The DE to x = 0 is abs(asinh(pos.x)).
		float distance2 = abs(asinh(
			dot(
				vec4(1.41608, 0.0, 0.0, 1.00263),
				pos
			)
		));
		
		float distance3 = abs(asinh(
			dot(
				vec4(1.41608, 0.0, 0.0, -1.00263),
				pos
			)
		));

		float distance4 = abs(asinh(
			dot(
				vec4(0.0, 1.41608, 0.0, 1.00263),
				pos
			)
		));
		
		float distance5 = abs(asinh(
			dot(
				vec4(0.0, 1.41608, 0.0, -1.00263),
				pos
			)
		));
	`;distanceEstimatorGlsl=`
		${H3Spheres.distances}

		float minDistance = ${getMinGlslString("distance",5)};

		return minDistance;
	`;getColorGlsl=`
		${H3Spheres.distances}
		
		float minDistance = ${getMinGlslString("distance",5)};

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

		return vec3(1.0, 0.5, 1.0);
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
	`;functionGlsl=`float sinh(float x)
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

		const vec4 teleportVec1 = vec4(1.0, 0.0, 0.0, 0.64764842);
		const mat4 teleportMat1 = mat4(
			2.5, 0.0, 0.0, sqrt(21.0)/2.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			sqrt(21.0)/2.0, 0.0, 0.0, 2.5
		);

		const vec4 teleportVec2 = vec4(-1.0, 0.0, 0.0, 0.64764842);
		const mat4 teleportMat2 = mat4(
			2.5, 0.0, 0.0, -sqrt(21.0)/2.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			-sqrt(21.0)/2.0, 0.0, 0.0, 2.5
		);

		const vec4 teleportVec3 = vec4(0.0, 1.0, 0.0, 0.64764842);
		const mat4 teleportMat3 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 2.5, 0.0, sqrt(21.0)/2.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, sqrt(21.0)/2.0, 0.0, 2.5
		);

		const vec4 teleportVec4 = vec4(0.0, -1.0, 0.0, 0.64764842);
		const mat4 teleportMat4 = mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 2.5, 0.0, -sqrt(21.0)/2.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, -sqrt(21.0)/2.0, 0.0, 2.5
		);

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t)
		{
			if (dot(pos, teleportVec1) < 0.0)
			{
				pos = teleportMat1 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat1 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				t = 0.0;

				return vec3(1.0, 0.0, 0.0);
			}

			if (dot(pos, teleportVec2) < 0.0)
			{
				pos = teleportMat2 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat2 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				t = 0.0;

				return vec3(0.0, 1.0, 1.0);
			}

			if (dot(pos, teleportVec3) < 0.0)
			{
				pos = teleportMat3 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat3 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				t = 0.0;

				return vec3(0.0, 1.0, 1.0);
			}

			if (dot(pos, teleportVec4) < 0.0)
			{
				pos = teleportMat4 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat4 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				t = 0.0;

				return vec3(0.0, 1.0, 1.0);
			}

			return vec3(0.0, 0.0, 0.0);
		}
	`;geodesicGlsl=`
		vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;

		globalColor += teleportPos(pos, startPos, rayDirectionVec, t);

		// if (dot(pos, vec4(1.0, 0.0, 0.0, 0.64764842)) < 0.0)
		// {
		// 	return vec3(1.0, geometryDot(pos, rayDirectionVec), 1.0);
		// }
	`;correctVectors(){var t=this.dotProduct(this.cameraPos,this.upVec),e=this.dotProduct(this.cameraPos,this.rightVec),o=this.dotProduct(this.cameraPos,this.forwardVec);for(let r=0;r<4;r++)this.upVec[r]+=t*this.cameraPos[r],this.rightVec[r]+=e*this.cameraPos[r],this.forwardVec[r]+=o*this.cameraPos[r];this.upVec=this.normalize(this.upVec),this.rightVec=this.normalize(this.rightVec),this.forwardVec=this.normalize(this.forwardVec)}getMovingSpeed(){return.5}cameraPos=[0,0,0,1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,-1,0,0];forwardVec=[-1,0,0,0];static teleportations=[[[1,0,0,.64764842],[[2.5,0,0,Math.sqrt(21)/2],[0,1,0,0],[0,0,1,0],[Math.sqrt(21)/2,0,0,2.5]]]];teleportCamera(){for(let t=0;t<H3Spheres.teleportations.length;t++)ThurstonGeometry.dotProduct(this.cameraPos,H3Spheres.teleportations[t][0])<0&&(this.cameraPos=ThurstonGeometry.mat4TimesVector(H3Spheres.teleportations[t][1],this.cameraPos),this.forwardVec=ThurstonGeometry.mat4TimesVector(H3Spheres.teleportations[t][1],this.forwardVec),this.rightVec=ThurstonGeometry.mat4TimesVector(H3Spheres.teleportations[t][1],this.rightVec),this.upVec=ThurstonGeometry.mat4TimesVector(H3Spheres.teleportations[t][1],this.upVec),console.log(this.dotProduct(this.forwardVec,this.cameraPos)))}uniformGlsl=`
		uniform float wallThickness;
	`;uniformNames=["wallThickness"];updateUniforms(gl,uniformList){var t=sliderValues.wallThickness;gl.uniform1f(uniformList.wallThickness,t)}uiElementsUsed="#wall-thickness-slider";initUI(){var t=$("#wall-thickness-slider"),e=$("#wall-thickness-slider-value");t.min=.2,t.max=1,t.value=.2,e.textContent=.2,sliderValues.wallThickness=.2}}export{H3Spheres};