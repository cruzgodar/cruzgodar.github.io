import{ThurstonGeometry}from"../class.min.mjs";import{sliderValues}from"../index.min.mjs";import{BaseGeometry,getMinGlslString}from"./base.min.mjs";import{$}from"/scripts/src/main.min.mjs";const baseColorIncreases=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],baseColor=[0,0,0];class H3Geometry extends BaseGeometry{geodesicGlsl=`vec4 pos = cosh(t) * startPos + sinh(t) * rayDirectionVec;

	globalColor += teleportPos(pos, startPos, rayDirectionVec, t, totalT);`;dotProductGlsl="return v.x * w.x + v.y * w.y + v.z * w.z - v.w * w.w;";normalizeGlsl=`float magnitude = sqrt(abs(geometryDot(dir, dir)));
		
	return dir / magnitude;`;fogGlsl="return mix(color, fogColor, 1.0 - exp(-(totalT - 2.0) * fogScaling * 6.0));";functionGlsl=`float sinh(float x)
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

		vec3 teleportPos(inout vec4 pos, inout vec4 startPos, inout vec4 rayDirectionVec, inout float t, inout float totalT)
		{
			float c = cos(gluingAngle);
			float s = sin(gluingAngle);

			vec4 teleportVec1 = vec4(1.0, 0.0, 0.0, 0.577350269);
			mat4 teleportMat1 = mat4(
				2.0, 0.0, 0.0, 1.73205081,
				0.0, c, s, 0.0,
				0.0, -s, c, 0.0,
				1.73205081, 0.0, 0.0, 2.0
			);

			vec4 teleportVec2 = vec4(-1.0, 0.0, 0.0, 0.577350269);
			mat4 teleportMat2 = mat4(
				2.0, 0.0, 0.0, -1.73205081,
				0.0, c, -s, 0.0,
				0.0, s, c, 0.0,
				-1.73205081, 0.0, 0.0, 2.0
			);

			vec4 teleportVec3 = vec4(0.0, 1.0, 0.0, 0.577350269);
			mat4 teleportMat3 = mat4(
				c, 0.0, s, 0.0,
				0.0, 2.0, 0.0, 1.73205081,
				-s, 0.0, c, 0.0,
				0.0, 1.73205081, 0.0, 2.0
			);

			vec4 teleportVec4 = vec4(0.0, -1.0, 0.0, 0.577350269);
			mat4 teleportMat4 = mat4(
				c, 0.0, -s, 0.0,
				0.0, 2.0, 0.0, -1.73205081,
				s, 0.0, c, 0.0,
				0.0, -1.73205081, 0.0, 2.0
			);

			vec4 teleportVec5 = vec4(0.0, 0.0, 1.0, 0.577350269);
			mat4 teleportMat5 = mat4(
				c, s, 0.0, 0.0,
				-s, c, 0.0, 0.0,
				0.0, 0.0, 2.0, 1.73205081,
				0.0, 0.0, 1.73205081, 2.0
			);

			vec4 teleportVec6 = vec4(0.0, 0.0, -1.0, 0.577350269);
			mat4 teleportMat6 = mat4(
				c, -s, 0.0, 0.0,
				s, c, 0.0, 0.0,
				0.0, 0.0, 2.0, -1.73205081,
				0.0, 0.0, -1.73205081, 2.0
			);



			if (dot(pos, teleportVec1) < 0.0)
			{
				pos = teleportMat1 * pos;

				// !!!IMPORTANT!!! rayDirectionVec is the tangent vector from the *starting*
				// position, not the current one, so we need to calculate that current
				// position to teleport the vector correctly. The correct tangent vector
				// is just the derivative of the geodesic at the current value of t.

				rayDirectionVec = teleportMat1 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(1.0, 0.0, 0.0);
			}

			if (dot(pos, teleportVec2) < 0.0)
			{
				pos = teleportMat2 * pos;

				rayDirectionVec = teleportMat2 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(-1.0, 0.0, 0.0);
			}

			if (dot(pos, teleportVec3) < 0.0)
			{
				pos = teleportMat3 * pos;

				rayDirectionVec = teleportMat3 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 1.0, 0.0);
			}

			if (dot(pos, teleportVec4) < 0.0)
			{
				pos = teleportMat4 * pos;

				rayDirectionVec = teleportMat4 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, -1.0, 0.0);
			}

			if (dot(pos, teleportVec5) < 0.0)
			{
				pos = teleportMat5 * pos;

				rayDirectionVec = teleportMat5 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, 1.0);
			}

			if (dot(pos, teleportVec6) < 0.0)
			{
				pos = teleportMat6 * pos;

				rayDirectionVec = teleportMat6 * (sinh(t) * startPos + cosh(t) * rayDirectionVec);

				startPos = pos;
				
				totalT += t;
				t = 0.0;

				return vec3(0.0, 0.0, -1.0);
			}

			return vec3(0.0, 0.0, 0.0);
		}
	`;dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]-vec1[3]*vec2[3]}normalize(vec){var t=Math.sqrt(Math.abs(this.dotProduct(vec,vec)));return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}getGeodesicDirection(pos1,pos2,t){var e=Math.cosh(t),o=Math.sinh(t),e=[(pos2[0]-e*pos1[0])/o,(pos2[1]-e*pos1[1])/o,(pos2[2]-e*pos1[2])/o,(pos2[3]-e*pos1[3])/o];return this.normalize(e)}getGeodesicDistance(pos1,pos2){var t=this.dotProduct(pos1,pos2);return Math.acosh(-t)}followGeodesic(pos,dir,t){var e=new Array(4);for(let r=0;r<4;r++)e[r]=Math.cosh(t)*pos[r]+Math.sinh(t)*dir[r];var o=this.dotProduct(e,e),o=Math.sqrt(-o);return e[0]/=o,e[1]/=o,e[2]/=o,e[3]/=o,e}getNormalVec(cameraPos){return this.normalize([-cameraPos[0],-cameraPos[1],-cameraPos[2],cameraPos[3]])}getGammaPrime(_pos,dir){return[...dir]}getGammaDoublePrime(pos){return[...pos]}getGammaTriplePrime(_pos,dir){return[...dir]}gammaTriplePrimeIsLinearlyIndependent=!1;lightGlsl=`
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
	`;correctVectors(){var t=this.dotProduct(this.cameraPos,this.upVec),e=this.dotProduct(this.cameraPos,this.rightVec),o=this.dotProduct(this.cameraPos,this.forwardVec);for(let r=0;r<4;r++)this.upVec[r]+=t*this.cameraPos[r],this.rightVec[r]+=e*this.cameraPos[r],this.forwardVec[r]+=o*this.cameraPos[r];this.upVec=this.normalize(this.upVec),this.rightVec=this.normalize(this.rightVec),this.forwardVec=this.normalize(this.forwardVec)}teleportCamera(rotatedForwardVec,recomputeRotation){var t=Math.cos(sliderValues.gluingAngle),e=Math.sin(sliderValues.gluingAngle),o=[[[1,0,0,1/Math.sqrt(3)],[[2,0,0,Math.sqrt(3)],[0,t,-e,0],[0,e,t,0],[Math.sqrt(3),0,0,2]]],[[-1,0,0,1/Math.sqrt(3)],[[2,0,0,-Math.sqrt(3)],[0,t,e,0],[0,-e,t,0],[-Math.sqrt(3),0,0,2]]],[[0,1,0,1/Math.sqrt(3)],[[t,0,-e,0],[0,2,0,Math.sqrt(3)],[e,0,t,0],[0,Math.sqrt(3),0,2]]],[[0,-1,0,1/Math.sqrt(3)],[[t,0,e,0],[0,2,0,-Math.sqrt(3)],[-e,0,t,0],[0,-Math.sqrt(3),0,2]]],[[0,0,1,1/Math.sqrt(3)],[[t,-e,0,0],[e,t,0,0],[0,0,2,Math.sqrt(3)],[0,0,Math.sqrt(3),2]]],[[0,0,-1,1/Math.sqrt(3)],[[t,e,0,0],[-e,t,0,0],[0,0,2,-Math.sqrt(3)],[0,0,-Math.sqrt(3),2]]]];for(let r=0;r<o.length;r++)ThurstonGeometry.dotProduct(this.cameraPos,o[r][0])<0&&(this.cameraPos=ThurstonGeometry.mat4TimesVector(o[r][1],this.cameraPos),this.forwardVec=ThurstonGeometry.mat4TimesVector(o[r][1],this.forwardVec),this.rightVec=ThurstonGeometry.mat4TimesVector(o[r][1],this.rightVec),this.upVec=ThurstonGeometry.mat4TimesVector(o[r][1],this.upVec),recomputeRotation(ThurstonGeometry.mat4TimesVector(o[r][1],rotatedForwardVec)),baseColor[0]+=baseColorIncreases[r][0],baseColor[1]+=baseColorIncreases[r][1],baseColor[2]+=baseColorIncreases[r][2])}}class H3Rooms extends H3Geometry{static distances=`
		float distance1 = wallThickness - acosh(-geometryDot(pos, vec4(0.0, 0.0, 0.0, 1.0)));

		// Translate the reflection plane to the x = 0 plane, then get the distance to it.
		// The DE to x = 0 is abs(asinh(pos.x)).
		float distance2 = abs(asinh(
			dot(
				vec4(1.30156, 0.0, 0.0, 0.833108),
				pos
			)
		));
		
		float distance3 = abs(asinh(
			dot(
				vec4(1.30156, 0.0, 0.0, -0.833108),
				pos
			)
		));

		float distance4 = abs(asinh(
			dot(
				vec4(0.0, 1.30156, 0.0, 0.833108),
				pos
			)
		));
		
		float distance5 = abs(asinh(
			dot(
				vec4(0.0, -1.30156, 0.0, 0.833108),
				pos
			)
		));

		float distance6 = abs(asinh(
			dot(
				vec4(0.0, 0.0, 1.30156, 0.833108),
				pos
			)
		));
		
		float distance7 = abs(asinh(
			dot(
				vec4(0.0, 0.0, -1.30156, 0.833108),
				pos
			)
		));
	`;distanceEstimatorGlsl=`
		${H3Rooms.distances}

		float minDistance = ${getMinGlslString("distance",7)};

		return minDistance;
	`;getColorGlsl=`
		return vec3(
			.25 + .75 * (.5 * (sin(floor(baseColor.x + globalColor.x + .5) * 40.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.y + globalColor.y + .5) * 57.0) + 1.0)),
			.25 + .75 * (.5 * (sin(floor(baseColor.z + globalColor.z + .5) * 89.0) + 1.0))
		);
	`;getMovingSpeed(){return 1.5}cameraPos=[0,0,0,1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];uniformGlsl=`
		uniform float wallThickness;
		uniform float gluingAngle;
		uniform vec3 baseColor;
	`;uniformNames=["wallThickness","gluingAngle","baseColor"];updateUniforms(gl,uniformList){var t=1.5-(sliderValues.wallThickness- -.357)/.5*.5;gl.uniform1f(uniformList.wallThickness,t),gl.uniform1f(uniformList.gluingAngle,sliderValues.gluingAngle),gl.uniform3fv(uniformList.baseColor,baseColor)}uiElementsUsed="#wall-thickness-slider, #gluing-angle-slider";initUI(){var t=$("#wall-thickness-slider"),e=$("#wall-thickness-slider-value"),t=(t.min=-.357,t.max=.143,t.value=.143,e.textContent=.143,sliderValues.wallThickness=.143,$("#gluing-angle-slider")),e=$("#gluing-angle-slider-value");t.min=0,t.max=2*Math.PI,t.value=0,e.textContent=0,sliderValues.gluingAngle=0}}export{H3Rooms};