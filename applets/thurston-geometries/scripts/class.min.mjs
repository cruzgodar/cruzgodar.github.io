import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends Applet{resolution=500;aspectRatioX=1;aspectRatioY=1;cameraPos;normalVec;upVec;rightVec;forwardVec;rotatedForwardVec;rotatedUpVec;movingAmount=[0,0,0];getMovingSpeed;updateCameraPos;getGeodesicDirection;getNormalVec;getGammaPrime;getGammaDoublePrime;getGammaTriplePrime;keysPressed={w:!1,a:!1,s:!1,d:!1," ":!1,Shift:!1};constructor({canvas}){super(canvas);var e={renderer:"gpu",shader:`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},e=(this.wilson=new Wilson(canvas,e),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),e=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:e}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:e})}run({updateCameraPos,getGeodesicDirection,getNormalVec,getGammaPrime,getGammaDoublePrime,getGammaTriplePrime,gammaTriplePrimeIsLinearlyIndependent,distanceEstimatorGlsl,geodesicGlsl,getColorGlsl,fogGlsl,lightGlsl,cameraPos,normalVec,upVec,rightVec,forwardVec,getMovingSpeed}){this.updateCameraPos=updateCameraPos,this.getGeodesicDirection=getGeodesicDirection,this.getNormalVec=getNormalVec,this.getGammaPrime=getGammaPrime,this.getGammaDoublePrime=getGammaDoublePrime,this.getGammaTriplePrime=getGammaTriplePrime,this.gammaTriplePrimeIsLinearlyIndependent=gammaTriplePrimeIsLinearlyIndependent,this.cameraPos=cameraPos,this.normalVec=normalVec,this.upVec=upVec,this.rightVec=rightVec,this.forwardVec=forwardVec,this.getMovingSpeed=getMovingSpeed;var e=`
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
			
			const float clipDistance = 10000.0;
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = 1.0;



			float sinh(float x)
			{
				return .5 * (exp(x) - exp(-x));
			}

			float cosh(float x)
			{
				return .5 * (exp(x) + exp(-x));
			}

			float acosh(float x)
			{
				return log(x + sqrt(x*x + 1.0));
			}



			float getBanding(float amount, float numBands)
			{
				return 1.0 - floor(mod(amount * numBands, 2.0)) / 2.0;
			}
			
			
			
			float distanceEstimator(vec4 pos)
			{
				${distanceEstimatorGlsl}
			}
			
			vec3 getColor(vec4 pos)
			{
				${getColorGlsl}
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
				
				${lightGlsl}

				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				${fogGlsl}
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
				vec3 finalColor = fogColor;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					${geodesicGlsl}
					
					float distance = distanceEstimator(pos);
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					else if (t > clipDistance)
					{
						break;
					}
					
					t += distance * stepFactor;
				}
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(normalize(forwardVec + rightVec * uv.x * aspectRatioX * fov + upVec * uv.y / aspectRatioY * fov)), 1.0);
			}
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(e),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","resolution","cameraPos","normalVec","upVec","rightVec","forwardVec"]),this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var e,t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.pan.update(t),this.movingAmount[0]=this.keysPressed.w?1:this.keysPressed.s?-1:0,this.movingAmount[1]=this.keysPressed.d?1:this.keysPressed.a?-1:0,this.movingAmount[2]=this.keysPressed[" "]?1:this.keysPressed.Shift?-1:0,(e=Math.abs(this.movingAmount[0])+Math.abs(this.movingAmount[1])+Math.abs(this.movingAmount[2]))&&(e=1/Math.sqrt(e),this.movingAmount[0]&&(this.handleMoving([this.movingAmount[0],0,0],t*e),this.correctVectors()),this.movingAmount[1]&&(this.handleMoving([0,this.movingAmount[1],0],t*e),this.correctVectors()),this.movingAmount[2])&&(this.handleMoving([0,0,this.movingAmount[2]],t*e),this.correctVectors()),this.handleRotating(),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.rotatedUpVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.rotatedForwardVec),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}handleMoving(movingAmount,timeElapsed){var e=ThurstonGeometry.normalize([movingAmount[0]*this.forwardVec[0]+movingAmount[1]*this.rightVec[0]+movingAmount[2]*this.upVec[0],movingAmount[0]*this.forwardVec[1]+movingAmount[1]*this.rightVec[1]+movingAmount[2]*this.upVec[1],movingAmount[0]*this.forwardVec[2]+movingAmount[1]*this.rightVec[2]+movingAmount[2]*this.upVec[2],movingAmount[0]*this.forwardVec[3]+movingAmount[1]*this.rightVec[3]+movingAmount[2]*this.upVec[3]]),t=timeElapsed/1e3*this.getMovingSpeed(this.cameraPos),o=this.getCurvature(this.cameraPos,e),i=this.updateCameraPos(this.cameraPos,e,t),e=ThurstonGeometry.normalize([e[0]+o*this.normalVec[0]*t,e[1]+o*this.normalVec[1]*t,e[2]+o*this.normalVec[2]*t,e[3]+o*this.normalVec[3]*t]);this.gammaTriplePrimeIsLinearlyIndependent,this.cameraPos=i,this.normalVec=this.getNormalVec(this.cameraPos),1===movingAmount[0]?this.forwardVec=[...e]:-1===movingAmount[0]?(o=ThurstonGeometry.rotateVectors(e,this.rightVec,Math.PI),this.forwardVec=o[0]):1===movingAmount[1]?this.rightVec=[...e]:-1===movingAmount[1]?(t=ThurstonGeometry.rotateVectors(e,this.forwardVec,Math.PI),this.rightVec=t[0]):1===movingAmount[2]?this.upVec=[...e]:-1===movingAmount[2]&&(i=ThurstonGeometry.rotateVectors(e,this.forwardVec,Math.PI),this.upVec=i[0])}parallelTransport(newCameraPos,vecToTransport){var e=this.updateCameraPos(this.cameraPos,vecToTransport,1),[t,o]=this.getGeodesicDirection(e,newCameraPos),e=this.updateCameraPos(e,t,o/2),[t,o]=this.getGeodesicDirection(this.cameraPos,e),e=this.updateCameraPos(this.cameraPos,t,2*o),[t]=this.getGeodesicDirection(newCameraPos,e);return t}handleRotating(){this.wilson.worldCenterY=Math.min(Math.max(this.wilson.worldCenterY,-Math.PI/2+.01),Math.PI/2-.01);var e=ThurstonGeometry.rotateVectors(this.forwardVec,this.rightVec,this.wilson.worldCenterX),e=(this.forwardVec=e[0],this.rightVec=e[1],this.wilson.worldCenterX=0,ThurstonGeometry.rotateVectors(this.forwardVec,this.upVec,this.wilson.worldCenterY));this.rotatedForwardVec=e[0],this.rotatedUpVec=e[1]}correctVectors(){var e=ThurstonGeometry.dotProduct(this.normalVec,this.upVec),t=ThurstonGeometry.dotProduct(this.normalVec,this.rightVec),o=ThurstonGeometry.dotProduct(this.normalVec,this.forwardVec);for(let i=0;i<4;i++)this.upVec[i]-=e*this.normalVec[i],this.rightVec[i]-=t*this.normalVec[i],this.forwardVec[i]-=o*this.normalVec[i];this.upVec=ThurstonGeometry.normalize(this.upVec),this.rightVec=ThurstonGeometry.normalize(this.rightVec),this.forwardVec=ThurstonGeometry.normalize(this.forwardVec)}getCurvature(pos,dir){var e=this.getGammaPrime(pos,dir),t=this.getGammaDoublePrime(pos,dir),o=ThurstonGeometry.dotProduct(e,t),e=ThurstonGeometry.magnitude(e),t=ThurstonGeometry.magnitude(t);return Math.sqrt((e*t)**2-o**2)/e**3}handleKeydownEvent(e){"INPUT"!==document.activeElement.tagName&&Object.prototype.hasOwnProperty.call(this.keysPressed,e.key)&&(e.preventDefault(),this.keysPressed[e.key]=!0)}handleKeyupEvent(e){"INPUT"!==document.activeElement.tagName&&Object.prototype.hasOwnProperty.call(this.keysPressed,e.key)&&(e.preventDefault(),this.keysPressed[e.key]=!1)}changeResolution(resolution=this.resolution){this.resolution=resolution;let e,t;this.wilson.fullscreen.currentlyFullscreen?(e=Math.min(this.resolution,Math.floor(this.resolution*aspectRatio)),t=Math.min(this.resolution,Math.floor(this.resolution/aspectRatio)),this.wilson.worldWidth=Math.max(2,2*aspectRatio),this.wilson.worldHeight=Math.max(2,2/aspectRatio)):(e=this.resolution,t=this.resolution),this.wilson.changeCanvasSize(e,t),e>=t?(this.aspectRatioX=e/t,this.aspectRatioY=1):(this.aspectRatioX=1,this.aspectRatioY=e/t),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.aspectRatioX),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.aspectRatioY),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution)}static rotateVectors(vec1,vec2,theta){var e=Math.cos(theta),t=Math.sin(theta);return[[vec1[0]*e+vec2[0]*t,vec1[1]*e+vec2[1]*t,vec1[2]*e+vec2[2]*t,vec1[3]*e+vec2[3]*t],[-vec1[0]*t+vec2[0]*e,-vec1[1]*t+vec2[1]*e,-vec1[2]*t+vec2[2]*e,-vec1[3]*t+vec2[3]*e]]}static addVectors(vec1,vec2){return[vec1[0]+vec2[0],vec1[1]+vec2[1],vec1[2]+vec2[2],vec1[3]+vec2[3]]}static scaleVector(c,vec){return[c*vec[0],c*vec[1],c*vec[2],c*vec[2]]}static magnitude(vec){return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]+vec[3]*vec[3])}static normalize(vec){var e=ThurstonGeometry.magnitude(vec);return[vec[0]/e,vec[1]/e,vec[2]/e,vec[3]/e]}static dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}}export{ThurstonGeometry};