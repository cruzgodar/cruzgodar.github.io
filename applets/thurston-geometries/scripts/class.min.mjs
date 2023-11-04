import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends Applet{resolution=500;aspectRatioX=1;aspectRatioY=1;fov=1.15;geometryData;rotatedForwardVec;rotatedUpVec;movingAmount=[0,0,0];rollingAmount=0;keysPressed={w:!1,a:!1,s:!1,d:!1," ":!1,Shift:!1,e:!1,q:!1};numTouches=0;constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keyup",callback:t}),this.handleTouchEvent.bind(this));addTemporaryListener({object:canvas.parentNode.nextElementSibling,event:"touchstart",callback:t}),addTemporaryListener({object:canvas.parentNode.nextElementSibling,event:"touchend",callback:t})}run(geometryData){this.geometryData=geometryData;var t=`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec4 cameraPos;
			uniform vec4 normalVec;
			uniform vec4 upVec;
			uniform vec4 rightVec;
			uniform vec4 forwardVec;
			
			uniform int resolution;

			const float lightBrightness = 1.0;
			
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			uniform float fov;

			${this.geometryData.functionGlsl??""}



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				${this.geometryData.distanceEstimatorGlsl}
			}
			
			vec3 getColor(vec4 pos)
			{
				${this.geometryData.getColorGlsl}
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos)
			{
				float xStep1 = distanceEstimator(pos + vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec4(0.0, epsilon, 0.0, 0.0));
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, epsilon, 0.0));
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, epsilon));
				
				float xStep2 = distanceEstimator(pos - vec4(epsilon, 0.0, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec4(0.0, epsilon, 0.0, 0.0));
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, epsilon, 0.0));
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, epsilon));
				
				return normalize(vec4(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2, wStep1 - wStep2));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				${this.geometryData.lightGlsl}

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				${this.geometryData.fogGlsl}
			}



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
				// if (p1.x != 0)
				// {
				// 	pos.x = -pos.x;
				// }

				// else if (p1.y != 0)
				// {
				// 	pos.y = -pos.y;
				// }

				// else if (p1.z != 0)
				// {
				// 	pos.z = -pos.z;
				// }

				// else
				// {
				// 	pos.w = -pos.w;
				// }

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

						return;
					}

					if (p1.z == 0 && p2.z == 0)
					{
						float temp = pos.x;
						pos.x = -pos.z;
						pos.z = temp;

						temp = rayDirectionVec.x;
						rayDirectionVec.x = -rayDirectionVec.z;
						rayDirectionVec.z = temp;

						return;
					}

					float temp = pos.x;
					pos.x = -pos.w;
					pos.w = temp;

					temp = rayDirectionVec.x;
					rayDirectionVec.x = -rayDirectionVec.w;
					rayDirectionVec.w = temp;

					return;
				}

				if (p1.y == 0 && p2.y == 0)
				{
					if (p1.z == 0 && p2.z == 0)
					{
						float temp = pos.y;
						pos.y = -pos.z;
						pos.z = temp;

						temp = rayDirectionVec.y;
						rayDirectionVec.y = -rayDirectionVec.z;
						rayDirectionVec.z = temp;

						return;
					}
					
					float temp = pos.y;
					pos.y = -pos.w;
					pos.w = temp;

					temp = rayDirectionVec.y;
					rayDirectionVec.y = -rayDirectionVec.w;
					rayDirectionVec.w = temp;

					return;
				}

				float temp = pos.z;
				pos.z = -pos.w;
				pos.w = temp;

				temp = rayDirectionVec.z;
				rayDirectionVec.z = -rayDirectionVec.w;
				rayDirectionVec.w = temp;

				return;
			}
			
			
			
			vec3 raymarch(vec4 startPos, vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;

				ivec4 oldClosestPoint = closestQ8Point(startPos);
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					${this.geometryData.geodesicGlsl}

					ivec4 newClosestPoint = closestQ8Point(pos);

					if (newClosestPoint != oldClosestPoint)
					{
						//We need the geodesic from the teleported point in the same direction we were going.
						rayDirectionVec = normalize(-sin(t) * startPos + cos(t) * rayDirectionVec);

						teleportPos(pos, rayDirectionVec, newClosestPoint, oldClosestPoint);

						startPos = pos;
						t = 0.0;
						oldClosestPoint = closestQ8Point(pos);
					}
					
					float distance = distanceEstimator(pos);
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					t += distance * stepFactor;

					oldClosestPoint = newClosestPoint;
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(cameraPos, normalize(forwardVec + rightVec * uv.x * aspectRatioX * fov + upVec * uv.y / aspectRatioY * fov)), 1.0);
			}
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(t),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","resolution","fov","cameraPos","normalVec","upVec","rightVec","forwardVec"]),this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution),this.wilson.gl.uniform1f(this.wilson.uniforms.fov,this.fov),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.geometryData.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.geometryData.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.geometryData.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.geometryData.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.geometryData.forwardVec),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var e=timestamp-this.lastTimestamp;if(this.lastTimestamp=timestamp,0!=e){this.pan.update(e),this.keysPressed.w||2===this.numTouches?this.movingAmount[0]=1:(this.keysPressed.s||3<=this.numTouches)&&(this.movingAmount[0]=-1),this.keysPressed.d?this.movingAmount[1]=1:this.keysPressed.a&&(this.movingAmount[1]=-1),this.keysPressed[" "]?this.movingAmount[2]=1:this.keysPressed.Shift&&(this.movingAmount[2]=-1),this.keysPressed.e?(console.log(this.geometryData.cameraPos),this.rollingAmount=1):this.keysPressed.q&&(this.rollingAmount=-1);var o=this.movingAmount[0]!==0+this.movingAmount[1]!==0+this.movingAmount[2]!==0;if(o){var o=1/o;this.movingAmount[0]&&(this.handleMoving([Math.sign(this.movingAmount[0]),0,0],e*o*Math.abs(this.movingAmount[0])),this.correctVectors()),this.movingAmount[1]&&(this.handleMoving([0,Math.sign(this.movingAmount[1]),0],e*o*Math.abs(this.movingAmount[1])),this.correctVectors()),this.movingAmount[2]&&(this.handleMoving([0,0,Math.sign(this.movingAmount[2])],e*o*Math.abs(this.movingAmount[2])),this.correctVectors());for(let t=0;t<3;t++)this.movingAmount[t]*=ThurstonGeometry.moveFriction**(e/6.944),Math.abs(this.movingAmount[t])<ThurstonGeometry.moveStopThreshhold&&(this.movingAmount[t]=0)}this.correctVectors(),this.handleRotating(),this.rollingAmount&&(this.wilson.worldCenterY&&(this.wilson.worldCenterY=0,this.geometryData.upVec=[...this.rotatedUpVec],this.geometryData.forwardVec=[...this.rotatedForwardVec]),o=e*this.rollingAmount*.0015,[this.geometryData.rightVec,this.geometryData.upVec]=ThurstonGeometry.rotateVectors(this.geometryData.rightVec,this.geometryData.upVec,o),this.rollingAmount*=ThurstonGeometry.rollingFriction**(e/6.944),Math.abs(this.rollingAmount)<ThurstonGeometry.rollingStopThreshhold)&&(this.rollingAmount=0),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.geometryData.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.geometryData.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.rotatedUpVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.geometryData.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.rotatedForwardVec),this.wilson.render.drawFrame(),this.animationPaused||window.requestAnimationFrame(this.drawFrame.bind(this))}}handleMoving(movingAmount,timeElapsed){var t=ThurstonGeometry.normalize([movingAmount[0]*this.geometryData.forwardVec[0]+movingAmount[1]*this.geometryData.rightVec[0]+movingAmount[2]*this.geometryData.upVec[0],movingAmount[0]*this.geometryData.forwardVec[1]+movingAmount[1]*this.geometryData.rightVec[1]+movingAmount[2]*this.geometryData.upVec[1],movingAmount[0]*this.geometryData.forwardVec[2]+movingAmount[1]*this.geometryData.rightVec[2]+movingAmount[2]*this.geometryData.upVec[2],movingAmount[0]*this.geometryData.forwardVec[3]+movingAmount[1]*this.geometryData.rightVec[3]+movingAmount[2]*this.geometryData.upVec[3]]),e=timeElapsed/1e3*this.geometryData.getMovingSpeed(this.geometryData.cameraPos),o=this.getCurvature(this.geometryData.cameraPos,t),i=this.geometryData.updateCameraPos(this.geometryData.cameraPos,t,e),t=ThurstonGeometry.normalize([t[0]+o*this.geometryData.normalVec[0]*e,t[1]+o*this.geometryData.normalVec[1]*e,t[2]+o*this.geometryData.normalVec[2]*e,t[3]+o*this.geometryData.normalVec[3]*e]);this.geometryData.gammaTriplePrimeIsLinearlyIndependent,this.geometryData.cameraPos=i,this.geometryData.normalVec=this.geometryData.getNormalVec(this.geometryData.cameraPos),1===movingAmount[0]?this.geometryData.forwardVec=[...t]:-1===movingAmount[0]?(o=ThurstonGeometry.rotateVectors(t,this.geometryData.rightVec,Math.PI),this.geometryData.forwardVec=o[0]):1===movingAmount[1]?this.geometryData.rightVec=[...t]:-1===movingAmount[1]?(e=ThurstonGeometry.rotateVectors(t,this.geometryData.forwardVec,Math.PI),this.geometryData.rightVec=e[0]):1===movingAmount[2]?this.geometryData.upVec=[...t]:-1===movingAmount[2]&&(i=ThurstonGeometry.rotateVectors(t,this.geometryData.forwardVec,Math.PI),this.geometryData.upVec=i[0])}parallelTransport(newCameraPos,vecToTransport){var t=this.geometryData.updateCameraPos(this.geometryData.cameraPos,vecToTransport,1),[e,o]=this.geometryData.getGeodesicDirection(t,newCameraPos),t=this.geometryData.updateCameraPos(t,e,o/2),[e,o]=this.geometryData.getGeodesicDirection(this.geometryData.cameraPos,t),t=this.geometryData.updateCameraPos(this.geometryData.cameraPos,e,2*o),[e]=this.geometryData.getGeodesicDirection(newCameraPos,t);return e}handleRotating(){this.wilson.worldCenterY=Math.min(Math.max(this.wilson.worldCenterY,-Math.PI/2+.01),Math.PI/2-.01);var t=ThurstonGeometry.rotateVectors(this.geometryData.forwardVec,this.geometryData.rightVec,this.wilson.worldCenterX),t=(this.geometryData.forwardVec=t[0],this.geometryData.rightVec=t[1],this.wilson.worldCenterX=0,ThurstonGeometry.rotateVectors(this.geometryData.forwardVec,this.geometryData.upVec,this.wilson.worldCenterY));this.rotatedForwardVec=t[0],this.rotatedUpVec=t[1]}correctVectors(){var t=this.geometryData.dotProduct(this.geometryData.normalVec,this.geometryData.upVec),e=this.geometryData.dotProduct(this.geometryData.normalVec,this.geometryData.rightVec),o=this.geometryData.dotProduct(this.geometryData.normalVec,this.geometryData.forwardVec);for(let i=0;i<4;i++)this.geometryData.upVec[i]-=t*this.geometryData.normalVec[i],this.geometryData.rightVec[i]-=e*this.geometryData.normalVec[i],this.geometryData.forwardVec[i]-=o*this.geometryData.normalVec[i];this.geometryData.upVec=ThurstonGeometry.normalize(this.geometryData.upVec),this.geometryData.rightVec=ThurstonGeometry.normalize(this.geometryData.rightVec),this.geometryData.forwardVec=ThurstonGeometry.normalize(this.geometryData.forwardVec)}getCurvature(pos,dir){var t=this.geometryData.getGammaPrime(pos,dir),e=this.geometryData.getGammaDoublePrime(pos,dir),o=ThurstonGeometry.dotProduct(t,e),t=ThurstonGeometry.magnitude(t),e=ThurstonGeometry.magnitude(e);return Math.sqrt((t*e)**2-o**2)/t**3}handleKeydownEvent(e){var t=1===e.key.length?e.key.toLowerCase():e.key;Object.prototype.hasOwnProperty.call(this.keysPressed,t)&&(e.preventDefault(),this.keysPressed[t]=!0)}handleKeyupEvent(e){var t=1===e.key.length?e.key.toLowerCase():e.key;Object.prototype.hasOwnProperty.call(this.keysPressed,t)&&(e.preventDefault(),this.keysPressed[t]=!1)}handleTouchEvent(e){this.numTouches=e.touches.length}changeResolution(resolution=this.resolution){this.resolution=resolution;let t,e;this.wilson.fullscreen.currentlyFullscreen?(t=Math.min(this.resolution,Math.floor(this.resolution*aspectRatio)),e=Math.min(this.resolution,Math.floor(this.resolution/aspectRatio)),this.wilson.worldWidth=Math.max(2,2*aspectRatio),this.wilson.worldHeight=Math.max(2,2/aspectRatio)):(t=this.resolution,e=this.resolution),this.wilson.changeCanvasSize(t,e),t>=e?(this.aspectRatioX=t/e,this.aspectRatioY=1):(this.aspectRatioX=1,this.aspectRatioY=t/e),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.aspectRatioX),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.aspectRatioY),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution)}static moveFriction=.96;static moveStopThreshhold=.01;static rollingFriction=.92;static rollingStopThreshhold=.01;static rotateVectors(vec1,vec2,theta){var t=Math.cos(theta),e=Math.sin(theta);return[[vec1[0]*t+vec2[0]*e,vec1[1]*t+vec2[1]*e,vec1[2]*t+vec2[2]*e,vec1[3]*t+vec2[3]*e],[-vec1[0]*e+vec2[0]*t,-vec1[1]*e+vec2[1]*t,-vec1[2]*e+vec2[2]*t,-vec1[3]*e+vec2[3]*t]]}static addVectors(vec1,vec2){return[vec1[0]+vec2[0],vec1[1]+vec2[1],vec1[2]+vec2[2],vec1[3]+vec2[3]]}static scaleVector(c,vec){return[c*vec[0],c*vec[1],c*vec[2],c*vec[2]]}static magnitude(vec){return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]+vec[3]*vec[3])}static normalize(vec){var t=ThurstonGeometry.magnitude(vec);return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}static dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}}export{ThurstonGeometry};