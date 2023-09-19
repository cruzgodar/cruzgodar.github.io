import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends Applet{resolution=500;aspectRatioX=1;aspectRatioY=1;cameraPos;normalVec;upVec;rightVec;forwardVec;movingAmount=[0,0];movingSpeed=1;lastWorldCenterX;lastWorldCenterY;updateCameraPos;getNormalVec;getGammaPrime;getGammaDoublePrime;constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
			precision highp float;
			varying vec2 uv;
			
			void main(void)
			{
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t})}run({updateCameraPos,getNormalVec,getGammaPrime,getGammaDoublePrime,distanceEstimatorGlsl,geodesicGlsl,getColorGlsl,fogGlsl,lightGlsl,cameraPos,normalVec,upVec,rightVec,forwardVec,movingSpeed}){this.updateCameraPos=updateCameraPos,this.getNormalVec=getNormalVec,this.getGammaPrime=getGammaPrime,this.getGammaDoublePrime=getGammaDoublePrime,this.cameraPos=cameraPos,this.normalVec=normalVec,this.upVec=upVec,this.rightVec=rightVec,this.forwardVec=forwardVec,this.movingSpeed=movingSpeed;var t=`
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
			
			const float clipDistance = 1000.0;
			const float epsilon = 0.00001;
			const int maxMarches = 100;
			const float stepFactor = .99;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = 1.0;



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
		`;this.wilson.render.shaderPrograms=[],this.wilson.render.loadNewShader(t),this.wilson.gl.useProgram(this.wilson.render.shaderPrograms[0]),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","resolution","cameraPos","normalVec","upVec","rightVec","forwardVec"]),this.wilson.worldCenterX=0,this.wilson.worldCenterY=0,this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.pan.update(t),this.zoom.update(t),this.calculateVectors(t),this.correctVectors(),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}calculateVectors(timeElapsed,ignoreMovingForward=!1){var t,e=(this.lastWorldCenterX-this.wilson.worldCenterX)*this.aspectRatioX,o=(this.lastWorldCenterY-this.wilson.worldCenterY)*this.aspectRatioY;this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,e&&(e=ThurstonGeometry.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:-e}),this.forwardVec=e[0],this.rightVec=e[1]),o&&(e=ThurstonGeometry.rotateVectors({vec1:this.forwardVec,vec2:this.upVec,theta:-o}),this.forwardVec=e[0],this.upVec=e[1]),(this.movingAmount[0]||this.movingAmount[1])&&(o=timeElapsed/1e3*this.movingSpeed,e=0===this.movingAmount[0]||ignoreMovingForward?1===this.movingAmount[1]?[...this.rightVec]:[-this.rightVec[0],-this.rightVec[1],-this.rightVec[2],-this.rightVec[3]]:1===this.movingAmount[0]?[...this.forwardVec]:[-this.forwardVec[0],-this.forwardVec[1],-this.forwardVec[2],-this.forwardVec[3]],this.updateCameraPos(this.cameraPos,e,o),this.normalVec=this.getNormalVec(this.cameraPos),t=this.getCurvature(this.cameraPos,e),e=ThurstonGeometry.normalize([e[0]-t*this.normalVec[0]*o,e[1]-t*this.normalVec[1]*o,e[2]-t*this.normalVec[2]*o,e[3]-t*this.normalVec[3]*o]),0===this.movingAmount[0]||ignoreMovingForward?(this.rightVec=[this.movingAmount[1]*e[0],this.movingAmount[1]*e[1],this.movingAmount[1]*e[2],this.movingAmount[1]*e[3]],t=ThurstonGeometry.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:-Math.PI/2}),this.forwardVec=t[1]):(this.forwardVec=[this.movingAmount[0]*e[0],this.movingAmount[0]*e[1],this.movingAmount[0]*e[2],this.movingAmount[0]*e[3]],o=ThurstonGeometry.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:Math.PI/2}),this.rightVec=o[0]),0===this.movingAmount[0]||0===this.movingAmount[1]||ignoreMovingForward||this.calculateVectors(timeElapsed,!0))}correctVectors(){var t=ThurstonGeometry.dotProduct(this.normalVec,this.upVec),e=ThurstonGeometry.dotProduct(this.normalVec,this.rightVec),o=ThurstonGeometry.dotProduct(this.normalVec,this.forwardVec);for(let i=0;i<4;i++)this.upVec[i]-=t*this.normalVec[i],this.rightVec[i]-=e*this.normalVec[i],this.forwardVec[i]-=o*this.normalVec[i]}getCurvature(pos,dir){var t=this.getGammaPrime(pos,dir),e=this.getGammaDoublePrime(pos,dir),o=ThurstonGeometry.dotProduct(t,e),t=ThurstonGeometry.magnitude(t),e=ThurstonGeometry.magnitude(e);return Math.sqrt((t*e)**2-o**2)/t**3}handleKeydownEvent(e){"INPUT"!==document.activeElement.tagName&&("w"===e.key?(e.preventDefault(),this.movingAmount[0]=1):"s"===e.key&&(e.preventDefault(),this.movingAmount[0]=-1),"d"===e.key?(e.preventDefault(),this.movingAmount[1]=1):"a"===e.key&&(e.preventDefault(),this.movingAmount[1]=-1))}handleKeyupEvent(e){"INPUT"!==document.activeElement.tagName&&("w"!==e.key&&"s"!==e.key||(e.preventDefault(),this.movingAmount[0]=0),"d"===e.key||"a"===e.key)&&(e.preventDefault(),this.movingAmount[1]=0)}changeResolution(resolution=this.resolution){this.resolution=resolution;let t,e;e=this.wilson.fullscreen.currentlyFullscreen?(t=Math.min(this.resolution,Math.floor(this.resolution*aspectRatio)),Math.min(this.resolution,Math.floor(this.resolution/aspectRatio))):(t=this.resolution,this.resolution),this.wilson.changeCanvasSize(t,e),t>=e?(this.aspectRatioX=t/e,this.aspectRatioY=1):(this.aspectRatioX=1,this.aspectRatioY=t/e),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.aspectRatioX),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.aspectRatioY),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution)}static rotateVectors({vec1,vec2,theta}){var t=Math.cos(theta),e=Math.sin(theta);return[[vec1[0]*t+vec2[0]*e,vec1[1]*t+vec2[1]*e,vec1[2]*t+vec2[2]*e,vec1[3]*t+vec2[3]*e],[-vec1[0]*e+vec2[0]*t,-vec1[1]*e+vec2[1]*t,-vec1[2]*e+vec2[2]*t,-vec1[3]*e+vec2[3]*t]]}static magnitude(vec){return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]+vec[3]*vec[3])}static normalize(vec){var t=ThurstonGeometry.magnitude(vec);return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}static dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}}export{ThurstonGeometry};