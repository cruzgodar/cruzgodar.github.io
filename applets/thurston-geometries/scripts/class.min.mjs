import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends Applet{resolution=400;focalLength=.1;maxMarches=100;lightPos=[1/Math.sqrt(2),1/Math.sqrt(2),1/Math.sqrt(2),1/Math.sqrt(2)];cameraPos=[0,0,0,-1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];movingAmount=[0,0];lastWorldCenterX;lastWorldCenterY;constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
			precision highp float;
			
			varying vec2 uv;
			
			uniform float aspectRatioX;
			uniform float aspectRatioY;
			
			uniform vec4 cameraPos;
			uniform vec4 normalVec;
			uniform vec4 upVec;
			uniform vec4 rightVec;
			uniform vec4 forwardVec;
			
			uniform float focalLength;
			
			uniform vec4 lightPos;
			const float lightBrightness = 3.0;
			
			uniform int resolution;
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;
			
			
			
			float distanceEstimator(vec4 pos)
			{
				float distance1 = acos(pos.w) - .1;
				// float distance2 = acos(-pos.x) - .1;
				// float distance3 = acos(pos.y) - .1;
				// float distance4 = acos(-pos.y) - .1;

				// float minDistance = min(distance1, distance2);

				return distance1;
			}
			
			
			
			vec3 getColor(vec4 pos)
			{
				float distance1 = acos(pos.w) - .1;
				//float distance2 = acos(-pos.x) - .1;
				// float distance3 = acos(pos.y) - .1;
				// float distance4 = acos(-pos.y) - .1;

				// float minDistance = min(distance1, distance2);

				// if (minDistance == distance1)
				// {
				// 	return vec3(1.0, 0.0, 0.0);
				// }

				// if (minDistance == distance2)
				// {
				// 	return vec3(0.0, 1.0, 0.0);
				// }

				return vec3(1.0, 0.0, 0.0);
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos)
			{
				float xStep1 = distanceEstimator(pos + vec4(.000001, 0.0, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec4(0.0, .000001, 0.0, 0.0));
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, .000001, 0.0));
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, .000001));
				
				float xStep2 = distanceEstimator(pos - vec4(.000001, 0.0, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec4(0.0, .000001, 0.0, 0.0));
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, .000001, 0.0));
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, .000001));
				
				return normalize(vec4(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2, wStep1 - wStep2));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				vec4 lightDirection = normalize(lightPos - pos);

				lightDirection -= lightDirection * dot(lightDirection, normalVec);
				
				float dotProduct = dot(surfaceNormal, lightDirection);
				
				float lightIntensity = lightBrightness * max(dotProduct, -.25 * dotProduct);
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-distance(pos, cameraPos) * fogScaling));
			}
			
			
			
			vec3 raymarch(vec4 rayDirectionVec)
			{
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
					
					
					
					vec4 pos = cos(t) * cameraPos + sin(t) * rayDirectionVec;
					
					//This prevents overstepping.
					float distance = min(distanceEstimator(pos), lastDistance);
					lastDistance = distance;
					// float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0001, .5 * t / float(resolution));
					
					
					
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
				gl_FragColor = vec4(raymarch(normalize(forwardVec * focalLength + rightVec * uv.x * aspectRatioX * focalLength / 2.0 + upVec * uv.y / aspectRatioY * focalLength / 2.0)), 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","resolution","cameraPos","normalVec","upVec","rightVec","forwardVec","focalLength","lightPos","maxMarches","stepFactor"]),this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.pan.update(t),this.zoom.update(t),this.calculateVectors(t),this.correctVectors(),this.focalLength=this.distanceEstimator(...this.cameraPos)/2,this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}distanceEstimator(x,y,z,w){return Math.acos(w)-.1}calculateVectors(timeElapsed,ignoreMovingForward=!1){var o=this.lastWorldCenterX-this.wilson.worldCenterX,i=this.lastWorldCenterY-this.wilson.worldCenterY;if(this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,o&&(o=this.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:-o}),this.forwardVec=o[0],this.rightVec=o[1]),i&&(o=this.rotateVectors({vec1:this.forwardVec,vec2:this.upVec,theta:-i}),this.forwardVec=o[0],this.upVec=o[1]),this.movingAmount[0]||this.movingAmount[1]){var s=timeElapsed/1e3;let t=0===this.movingAmount[0]||ignoreMovingForward?1===this.movingAmount[1]?[...this.forwardVec]:[-this.forwardVec[0],-this.forwardVec[1],-this.forwardVec[2],-this.forwardVec[3]]:1===this.movingAmount[0]?[...this.forwardVec]:[-this.forwardVec[0],-this.forwardVec[1],-this.forwardVec[2],-this.forwardVec[3]];for(let e=0;e<4;e++)this.cameraPos[e]=Math.cos(s)*this.cameraPos[e]+Math.sin(s)*t[e];this.correctCameraPos(),this.normalVec=ThurstonGeometry.normalize([this.cameraPos[0],this.cameraPos[1],this.cameraPos[2],this.cameraPos[3]]);var i=this.getCurvature(this.cameraPos,t);t=ThurstonGeometry.normalize([t[0]-i*this.normalVec[0]*s,t[1]-i*this.normalVec[1]*s,t[2]-i*this.normalVec[2]*s,t[3]-i*this.normalVec[3]*s]),0===this.movingAmount[0]||ignoreMovingForward?(this.forwardVec=[this.movingAmount[1]*t[0],this.movingAmount[1]*t[1],this.movingAmount[1]*t[2],this.movingAmount[1]*t[3]],o=this.rotateVectors({vec1:this.forwardVec,vec2:this.forwardVec,theta:-Math.PI/2}),this.forwardVec=o[1]):(this.forwardVec=[this.movingAmount[0]*t[0],this.movingAmount[0]*t[1],this.movingAmount[0]*t[2],this.movingAmount[0]*t[3]],i=this.rotateVectors({vec1:this.forwardVec,vec2:this.forwardVec,theta:Math.PI/2}),this.forwardVec=i[0]),0===this.movingAmount[0]||0===this.movingAmount[1]||ignoreMovingForward||this.calculateVectors(timeElapsed,!0)}}correctCameraPos(){var t=ThurstonGeometry.magnitude(this.cameraPos);this.cameraPos[0]/=t,this.cameraPos[1]/=t,this.cameraPos[2]/=t,this.cameraPos[3]/=t}correctVectors(){var t=ThurstonGeometry.dotProduct(this.normalVec,this.upVec),e=ThurstonGeometry.dotProduct(this.normalVec,this.rightVec),o=ThurstonGeometry.dotProduct(this.normalVec,this.forwardVec);for(let i=0;i<4;i++)this.upVec[i]-=t*this.normalVec[i],this.rightVec[i]-=e*this.normalVec[i],this.forwardVec[i]-=o*this.normalVec[i]}getCurvature(pos,dir){var t=[...dir],e=[-pos[0],-pos[1],-pos[2],-pos[3]],o=ThurstonGeometry.dotProduct(t,e),t=ThurstonGeometry.magnitude(t),e=ThurstonGeometry.magnitude(e);return Math.sqrt((t*e)**2-o**2)/t**3}rotateVectors({vec1,vec2,theta}){var t=Math.cos(theta),e=Math.sin(theta);return[[vec1[0]*t+vec2[0]*e,vec1[1]*t+vec2[1]*e,vec1[2]*t+vec2[2]*e,vec1[3]*t+vec2[3]*e],[-vec1[0]*e+vec2[0]*t,-vec1[1]*e+vec2[1]*t,-vec1[2]*e+vec2[2]*t,-vec1[3]*e+vec2[3]*t]]}handleKeydownEvent(e){"INPUT"!==document.activeElement.tagName&&("w"===e.key?(e.preventDefault(),this.movingAmount[0]=1):"s"===e.key&&(e.preventDefault(),this.movingAmount[0]=-1),"d"===e.key?(e.preventDefault(),this.movingAmount[1]=1):"a"===e.key&&(e.preventDefault(),this.movingAmount[1]=-1))}handleKeyupEvent(e){"INPUT"!==document.activeElement.tagName&&("w"!==e.key&&"s"!==e.key||(e.preventDefault(),this.movingAmount[0]=0),"d"===e.key||"a"===e.key)&&(e.preventDefault(),this.movingAmount[1]=0)}changeResolution(resolution=this.resolution){this.resolution=resolution;let t,e;e=this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(t=this.resolution,Math.floor(this.resolution/aspectRatio)):(t=Math.floor(this.resolution*aspectRatio),this.resolution):(t=this.resolution,this.resolution),this.wilson.changeCanvasSize(t,e),t>=e?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,t/e),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,t/e)),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution)}static magnitude(vec){return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]+vec[3]*vec[3])}static normalize(vec){var t=ThurstonGeometry.magnitude(vec);return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}static dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}}export{ThurstonGeometry};