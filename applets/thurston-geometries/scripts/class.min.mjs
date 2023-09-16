import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class ThurstonGeometry extends Applet{resolution=400;focalLength=.1;maxMarches=100;cameraPos=[0,0,0,-1];normalVec=[0,0,0,-1];upVec=[0,0,1,0];rightVec=[0,1,0,0];forwardVec=[1,0,0,0];movingAmount=[0,0];movingSpeed=0;lastWorldCenterX;lastWorldCenterY;constructor({canvas}){super(canvas);var t={renderer:"gpu",shader:`
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
			
			const float lightBrightness = 1.0;
			
			uniform int resolution;
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .07;
			const float fov = 1.0;
			const float radius = .3;
			
			
			
			float distanceEstimator(vec4 pos)
			{
				float distance1 = acos(pos.x) - radius;
				float distance2 = acos(-pos.x) - radius;
				float distance3 = acos(pos.y) - radius;
				float distance4 = acos(-pos.y) - radius;
				float distance5 = acos(pos.z) - radius;
				float distance6 = acos(-pos.z) - radius;

				float minDistance = min(
					min(
						min(distance1, distance2),
						min(distance3, distance4)
					),
					min(distance5, distance6)
				);

				return minDistance;
			}
			
			
			
			vec3 getColor(vec4 pos)
			{
				float distance1 = acos(pos.x) - radius;
				float distance2 = acos(-pos.x) - radius;
				float distance3 = acos(pos.y) - radius;
				float distance4 = acos(-pos.y) - radius;
				float distance5 = acos(pos.z) - radius;
				float distance6 = acos(-pos.z) - radius;

				float minDistance = min(
					min(
						min(distance1, distance2),
						min(distance3, distance4)
					),
					min(distance5, distance6)
				);

				if (minDistance == distance1)
				{
					return vec3(1.0, 0.0, 0.0);
				}

				if (minDistance == distance2)
				{
					return vec3(0.0, 1.0, 0.0);
				}

				if (minDistance == distance3)
				{
					return vec3(0.0, 0.0, 1.0);
				}

				if (minDistance == distance4)
				{
					return vec3(1.0, 1.0, 0.0);
				}

				if (minDistance == distance5)
				{
					return vec3(0.0, 1.0, 1.0);
				}

				if (minDistance == distance6)
				{
					return vec3(1.0, 0.0, 1.0);
				}
			}
			
			
			
			vec4 getSurfaceNormal(vec4 pos)
			{
				float xStep1 = distanceEstimator(pos + vec4(.00001, 0.0, 0.0, 0.0));
				float yStep1 = distanceEstimator(pos + vec4(0.0, .00001, 0.0, 0.0));
				float zStep1 = distanceEstimator(pos + vec4(0.0, 0.0, .00001, 0.0));
				float wStep1 = distanceEstimator(pos + vec4(0.0, 0.0, 0.0, .00001));
				
				float xStep2 = distanceEstimator(pos - vec4(.00001, 0.0, 0.0, 0.0));
				float yStep2 = distanceEstimator(pos - vec4(0.0, .00001, 0.0, 0.0));
				float zStep2 = distanceEstimator(pos - vec4(0.0, 0.0, .00001, 0.0));
				float wStep2 = distanceEstimator(pos - vec4(0.0, 0.0, 0.0, .00001));
				
				return normalize(vec4(xStep1 - xStep2, yStep1 - yStep2, zStep1 - zStep2, wStep1 - wStep2));
			}
			
			
			
			vec3 computeShading(vec4 pos, int iteration)
			{
				vec4 surfaceNormal = getSurfaceNormal(pos);
				
				vec4 lightDirection1 = normalize(vec4(1.0, 1.0, 1.0, 1.0) - pos);
				float dotProduct1 = dot(surfaceNormal, lightDirection1);

				vec4 lightDirection2 = normalize(vec4(-1.0, -1.0, -1.0, 1.0) - pos);
				float dotProduct2 = dot(surfaceNormal, lightDirection2);

				float lightIntensity = lightBrightness * max(abs(dotProduct1), abs(dotProduct2));
				
				//The last factor adds ambient occlusion.
				vec3 color = getColor(pos) * lightIntensity * max((1.0 - float(iteration) / float(maxMarches)), 0.0);
				
				//Apply fog.
				return mix(color, fogColor, 1.0 - exp(-acos(dot(pos, cameraPos)) * fogScaling));
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
				gl_FragColor = vec4(raymarch(normalize(forwardVec * focalLength + rightVec * uv.x * aspectRatioX * focalLength * fov + upVec * uv.y / aspectRatioY * focalLength * fov)), 1.0);
			}
		`,canvasWidth:this.resolution,canvasHeight:this.resolution,worldCenterX:0,worldCenterY:0,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","resolution","cameraPos","normalVec","upVec","rightVec","forwardVec","focalLength","maxMarches","stepFactor"]),this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t,e=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==e||(t=this.distanceEstimator(...this.cameraPos),this.movingSpeed=t,this.pan.update(e),this.zoom.update(e),this.calculateVectors(e),this.correctVectors(),this.focalLength=t/2,this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform4fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform4fv(this.wilson.uniforms.normalVec,this.normalVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform4fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.render.drawFrame(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}distanceEstimator(x,y,z,w){return Math.min(Math.min(Math.min(Math.acos(x)-.1,Math.acos(-x)-.1),Math.min(Math.acos(y)-.1,Math.acos(-y)-.1)),Math.min(Math.acos(z)-.1,Math.acos(-z)-.1))}calculateVectors(timeElapsed,ignoreMovingForward=!1){var i=this.lastWorldCenterX-this.wilson.worldCenterX,s=this.lastWorldCenterY-this.wilson.worldCenterY;if(this.lastWorldCenterX=this.wilson.worldCenterX,this.lastWorldCenterY=this.wilson.worldCenterY,i&&(i=this.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:-i}),this.forwardVec=i[0],this.rightVec=i[1]),s&&(i=this.rotateVectors({vec1:this.forwardVec,vec2:this.upVec,theta:-s}),this.forwardVec=i[0],this.upVec=i[1]),this.movingAmount[0]||this.movingAmount[1]){var o=timeElapsed/1e3;let t=0===this.movingAmount[0]||ignoreMovingForward?1===this.movingAmount[1]?[...this.rightVec]:[-this.rightVec[0],-this.rightVec[1],-this.rightVec[2],-this.rightVec[3]]:1===this.movingAmount[0]?[...this.forwardVec]:[-this.forwardVec[0],-this.forwardVec[1],-this.forwardVec[2],-this.forwardVec[3]];for(let e=0;e<4;e++)this.cameraPos[e]=Math.cos(o)*this.cameraPos[e]+Math.sin(o)*t[e];this.correctCameraPos(),this.normalVec=ThurstonGeometry.normalize([this.cameraPos[0],this.cameraPos[1],this.cameraPos[2],this.cameraPos[3]]);var s=this.getCurvature(this.cameraPos,t);t=ThurstonGeometry.normalize([t[0]-s*this.normalVec[0]*o,t[1]-s*this.normalVec[1]*o,t[2]-s*this.normalVec[2]*o,t[3]-s*this.normalVec[3]*o]),0===this.movingAmount[0]||ignoreMovingForward?(this.rightVec=[this.movingAmount[1]*t[0],this.movingAmount[1]*t[1],this.movingAmount[1]*t[2],this.movingAmount[1]*t[3]],i=this.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:-Math.PI/2}),this.forwardVec=i[1]):(this.forwardVec=[this.movingAmount[0]*t[0],this.movingAmount[0]*t[1],this.movingAmount[0]*t[2],this.movingAmount[0]*t[3]],s=this.rotateVectors({vec1:this.forwardVec,vec2:this.rightVec,theta:Math.PI/2}),this.rightVec=s[0]),0===this.movingAmount[0]||0===this.movingAmount[1]||ignoreMovingForward||this.calculateVectors(timeElapsed,!0)}}correctCameraPos(){var t=ThurstonGeometry.magnitude(this.cameraPos);this.cameraPos[0]/=t,this.cameraPos[1]/=t,this.cameraPos[2]/=t,this.cameraPos[3]/=t}correctVectors(){var t=ThurstonGeometry.dotProduct(this.normalVec,this.upVec),e=ThurstonGeometry.dotProduct(this.normalVec,this.rightVec),i=ThurstonGeometry.dotProduct(this.normalVec,this.forwardVec);for(let s=0;s<4;s++)this.upVec[s]-=t*this.normalVec[s],this.rightVec[s]-=e*this.normalVec[s],this.forwardVec[s]-=i*this.normalVec[s]}getCurvature(pos,dir){var t=[...dir],e=[-pos[0],-pos[1],-pos[2],-pos[3]],i=ThurstonGeometry.dotProduct(t,e),t=ThurstonGeometry.magnitude(t),e=ThurstonGeometry.magnitude(e);return Math.sqrt((t*e)**2-i**2)/t**3}rotateVectors({vec1,vec2,theta}){var t=Math.cos(theta),e=Math.sin(theta);return[[vec1[0]*t+vec2[0]*e,vec1[1]*t+vec2[1]*e,vec1[2]*t+vec2[2]*e,vec1[3]*t+vec2[3]*e],[-vec1[0]*e+vec2[0]*t,-vec1[1]*e+vec2[1]*t,-vec1[2]*e+vec2[2]*t,-vec1[3]*e+vec2[3]*t]]}handleKeydownEvent(e){"INPUT"!==document.activeElement.tagName&&("w"===e.key?(e.preventDefault(),this.movingAmount[0]=1):"s"===e.key&&(e.preventDefault(),this.movingAmount[0]=-1),"d"===e.key?(e.preventDefault(),this.movingAmount[1]=1):"a"===e.key&&(e.preventDefault(),this.movingAmount[1]=-1))}handleKeyupEvent(e){"INPUT"!==document.activeElement.tagName&&("w"!==e.key&&"s"!==e.key||(e.preventDefault(),this.movingAmount[0]=0),"d"===e.key||"a"===e.key)&&(e.preventDefault(),this.movingAmount[1]=0)}changeResolution(resolution=this.resolution){this.resolution=resolution;let t,e;e=this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(t=this.resolution,Math.floor(this.resolution/aspectRatio)):(t=Math.floor(this.resolution*aspectRatio),this.resolution):(t=this.resolution,this.resolution),this.wilson.changeCanvasSize(t,e),t>=e?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,t/e),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,t/e)),this.wilson.gl.uniform1i(this.wilson.uniforms.resolution,this.resolution)}static magnitude(vec){return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]+vec[3]*vec[3])}static normalize(vec){var t=ThurstonGeometry.magnitude(vec);return[vec[0]/t,vec[1]/t,vec[2]/t,vec[3]/t]}static dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}}export{ThurstonGeometry};