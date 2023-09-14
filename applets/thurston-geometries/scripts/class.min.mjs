import{RaymarchApplet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends RaymarchApplet{theta=4.6601;phi=2.272;cameraPos=[.0828,2.17,1.8925];onSpherePos=[0,0,1];onSpherePosVelocity=[0,0,0];globalNormalVec=[0,0,1];localForwardVec=[1,0];globalForwardVec=[1,0,0];localRightVec=[0,1];globalRightVec=[0,1,0];globalNorthStarVec=[1,0,0];constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec3 cameraPos;
			uniform vec3 imagePlaneCenterPos;
			uniform vec3 forwardVec;
			uniform vec3 rightVec;
			uniform vec3 upVec;
			
			uniform float focalLength;
			
			uniform vec3 lightPos;
			const float lightBrightness = 1.5;
			
			uniform int imageSize;
			
			uniform int maxIterations;
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;

			uniform vec3 onSpherePos;
			uniform vec3 globalForwardVec;
			uniform vec3 globalRightVec;
			uniform vec3 globalNormalVec;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				float distance1 = length(pos) - 1.0;
				float distance2 = length(pos - onSpherePos) - .05;
				float distance3 = length(pos - onSpherePos - globalForwardVec / 4.0) - .05;
				float distance4 = length(pos - onSpherePos - globalRightVec / 4.0) - .05;
				float distance5 = length(pos - onSpherePos - globalNormalVec / 4.0) - .05;

				float minDistance = min(min(min(min(distance1, distance2), distance3), distance4), distance5);

				return minDistance;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				float distance1 = length(pos) - 1.0;
				float distance2 = length(pos - onSpherePos) - .05;
				float distance3 = length(pos - onSpherePos - globalForwardVec / 4.0) - .05;
				float distance4 = length(pos - onSpherePos - globalRightVec / 4.0) - .05;
				float distance5 = length(pos - onSpherePos - globalNormalVec / 4.0) - .05;
				
				float minDistance = min(min(min(min(distance1, distance2), distance3), distance4), distance5);

				if (minDistance == distance1)
				{
					return vec3(1.0, 1.0, 1.0);
				}

				if (minDistance == distance2)
				{
					return vec3(.75, .75, .75);
				}

				if (minDistance == distance3)
				{
					return vec3(1.0, 0.0, 0.0);
				}

				if (minDistance == distance4)
				{
					return vec3(0.0, 1.0, 0.0);
				}

				if (minDistance == distance5)
				{
					return vec3(0.0, 0.0, 1.0);
				}
			}
			
			
			
			vec3 getSurfaceNormal(vec3 pos)
			{
				float xStep1 = distanceEstimator(pos + vec3(.000001, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec3(0.0, .000001, 0.0));
				float zStep1 = distanceEstimator(pos + vec3(0.0, 0.0, .000001));
				
				float xStep2 = distanceEstimator(pos - vec3(.000001, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec3(0.0, .000001, 0.0));
				float zStep2 = distanceEstimator(pos - vec3(0.0, 0.0, .000001));
				
				return normalize(vec3(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2));
			}
			
			
			
			vec3 computeShading(vec3 pos, int iteration)
			{
				vec3 surfaceNormal = getSurfaceNormal(pos);
				
				vec3 lightDirection = normalize(lightPos - pos);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * max(dotProduct, -.25 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec3 startPos)
			{
				//That factor of .9 is important -- without it, we're always stepping as far as possible, which results in artefacts and weirdness.
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9 / stepFactor;
				
				vec3 finalColor = fogColor;
				
				float epsilon = 0.0;
				
				float t = 0.0;
				
				float lastDistance = 1000.0;
				
				
				
				for (int iteration = 0; iteration < 1024; iteration++)
				{
					if (iteration == maxMarches)
					{
						break;
					}
					
					
					
					vec3 pos = startPos + t * rayDirectionVec;
					
					//This prevents overstepping, and is honestly a pretty clever fix.
					float distance = min(distanceEstimator(pos), lastDistance);
					lastDistance = distance;
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, .5 * t / float(imageSize));
					
					
					
					if (distance < epsilon)
					{
						finalColor = computeShading(pos, iteration);
						break;
					}
					
					else if (t > clipDistance)
					{
						break;
					}
					
					
					
					t += distance;
				}
				
				
				
				return finalColor;
			}
			
			
			
			void main(void)
			{
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY), 1.0);
			}
		`,canvasWidth:1e3,canvasHeight:1e3,worldCenterX:-4.6601,worldCenterY:-2.272,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","maxMarches","stepFactor","maxIterations","onSpherePos","globalForwardVec","globalRightVec","globalNormalVec"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxIterations,this.maxIterations),this.wilson.gl.uniform3fv(this.wilson.uniforms.onSpherePos,this.onSpherePos),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalForwardVec,this.globalForwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalRightVec,this.globalRightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalNormalVec,this.globalNormalVec),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.pan.update(t),this.zoom.update(t),this.moveUpdate(t),this.updateSpherePos(t),this.calculateVectors(),this.updateCameraParameters(),this.wilson.worldCenterY=Math.min(Math.max(this.wilson.worldCenterY,.01-Math.PI),-.01),this.calculateGlobalVectors(),this.wilson.gl.uniform3fv(this.wilson.uniforms.onSpherePos,this.onSpherePos),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalForwardVec,this.globalForwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalRightVec,this.globalRightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.globalNormalVec,this.globalNormalVec),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}distanceEstimator(x,y,z){return Math.sqrt(x*x+y*y+z*z)-1}calculateGlobalVectors(){this.globalNormalVec=RaymarchApplet.normalize([this.onSpherePos[0],this.onSpherePos[1],this.onSpherePos[2]]);var t=RaymarchApplet.crossProduct(this.globalNormalVec,this.globalNorthStarVec),i=RaymarchApplet.scaleVector(RaymarchApplet.dotProduct(this.globalNormalVec,this.globalNorthStarVec),this.globalNorthStarVec);this.globalForwardVec=RaymarchApplet.addVectors(RaymarchApplet.scaleVector(Math.cos(-this.wilson.worldCenterX),this.globalNorthStarVec),RaymarchApplet.addVectors(RaymarchApplet.scaleVector(Math.sin(-this.wilson.worldCenterX),t),RaymarchApplet.scaleVector(1-Math.cos(-this.wilson.worldCenterX),i))),this.globalRightVec=RaymarchApplet.addVectors(RaymarchApplet.scaleVector(Math.cos(-this.wilson.worldCenterX-Math.PI/2),this.globalNorthStarVec),RaymarchApplet.addVectors(RaymarchApplet.scaleVector(Math.sin(-this.wilson.worldCenterX-Math.PI/2),t),RaymarchApplet.scaleVector(1-Math.cos(-this.wilson.worldCenterX-Math.PI/2),i)))}updateSpherePos(timeElapsed){if(this.onSpherePosVelocity[0]||this.onSpherePosVelocity[1]||this.onSpherePosVelocity[2]){[...this.onSpherePos];var i=timeElapsed/300;for(let t=0;t<3;t++)this.onSpherePos[t]=Math.cos(i)*this.onSpherePos[t]+Math.sin(i)*this.onSpherePosVelocity[t]}}handleKeydownEvent(e){"INPUT"!==document.activeElement.tagName&&(e.preventDefault(),"ArrowUp"===e.key?this.onSpherePosVelocity=[this.globalForwardVec[0],this.globalForwardVec[1],this.globalForwardVec[2]]:"ArrowDown"===e.key&&(this.onSpherePosVelocity=[-this.globalForwardVec[0],-this.globalForwardVec[1],-this.globalForwardVec[2]]),"ArrowRight"===e.key?this.onSpherePosVelocity=[this.globalRightVec[0],this.globalRightVec[1],this.globalRightVec[2]]:"ArrowLeft"===e.key&&(this.onSpherePosVelocity=[-this.globalRightVec[0],-this.globalRightVec[1],-this.globalRightVec[2]]))}handleKeyupEvent(){this.onSpherePosVelocity=[0,0,0]}changeResolution(resolution=this.imageSize){this.imageSize=resolution,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize)}}export{ThurstonGeometry};