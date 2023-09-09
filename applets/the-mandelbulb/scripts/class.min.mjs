import anime from"/scripts/anime.min.js";import{RaymarchApplet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class Mandelbulb extends RaymarchApplet{cXInputElement=null;cYInputElement=null;cZInputElement=null;rotationAngleXInputElement=null;rotationAngleYInputElement=null;rotationAngleZInputElement=null;power=8;c=[0,0,0];cOld=[0,0,0];cDelta=[0,0,0];rotationAngleX=0;rotationAngleY=0;rotationAngleZ=0;juliaProportion=0;movingPos=1;constructor({canvas,cXInputElement,cYInputElement,cZInputElement,rotationAngleXInputElement,rotationAngleYInputElement,rotationAngleZInputElement}){super(canvas),this.cXInputElement=cXInputElement,this.cYInputElement=cYInputElement,this.cZInputElement=cZInputElement,this.rotationAngleXInputElement=rotationAngleXInputElement,this.rotationAngleYInputElement=rotationAngleYInputElement,this.rotationAngleZInputElement=rotationAngleZInputElement;var t={renderer:"gpu",shader:`
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
			
			uniform int drawSphere;
			
			uniform int maxIterations;
			
			
			
			const float clipDistance = 1000.0;
			uniform int maxMarches;
			uniform float stepFactor;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .1;
			
			
			
			uniform mat3 rotationMatrix;
			
			uniform float power;
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
				}
				
				
				
				float distance1 = .5 * log(r) * r / dr;
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					return distance2;
				}
				
				
				
				return distance1;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 z = pos;
				
				float r = length(z);
				float dr = 1.0;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					float theta = acos(z.z / r);
					
					float phi = atan(z.y, z.x);
					
					dr = pow(r, power - 1.0) * power * dr + 1.0;
					
					theta *= power;
					
					phi *= power;
					
					z = pow(r, power) * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
					
					z += mix(pos, c, juliaProportion);
					
					z = rotationMatrix * z;
					
					r = length(z);
					
					color = mix(color, abs(z / r), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				
				
				float distance1 = .5 * log(r) * r / dr;
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					color = vec3(1.0, 1.0, 1.0);
				}
				
				
				
				return color;
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
				
				//int slowedDown = 0;
				
				
				
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
					
					//Uncomment to add aggressive understepping when close to the fractal boundary, which helps to prevent flickering but is a significant performance hit.
					/*
					else if (lastDistance / distance > .9999 && slowedDown == 0)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .125;
						
						slowedDown = 1;
					}
					
					else if (lastDistance / distance <= .9999 && slowedDown == 1)
					{
						rayDirectionVec = normalize(startPos - cameraPos) * .9;
						
						slowedDown = 0;
					}
					*/
					
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
		`,canvasWidth:500,canvasHeight:500,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","drawSphere","power","c","juliaProportion","rotationMatrix","maxMarches","stepFactor","maxIterations"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0),this.wilson.gl.uniform1f(this.wilson.uniforms.power,8),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,0),this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix,!1,[1,0,0,0,1,0,0,0,1]),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxIterations,this.maxIterations),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t});addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.wilson.render.drawFrame(),this.pan.update(t),this.zoom.update(t),(this.movingForwardKeyboard||this.movingBackwardKeyboard||this.movingRightKeyboard||this.movingLeftKeyboard||this.movingForwardTouch||this.movingBackwardTouch)&&this.updateCameraParameters(),0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]||(this.movingPos&&(this.cameraPos[0]+=this.moveVelocity[0],this.cameraPos[1]+=this.moveVelocity[1],this.cameraPos[2]+=this.moveVelocity[2]),this.moveVelocity[0]*=this.moveFriction,this.moveVelocity[1]*=this.moveFriction,this.moveVelocity[2]*=this.moveFriction,this.moveVelocity[0]**2+this.moveVelocity[1]**2+this.moveVelocity[2]**2<(this.moveVelocityStopThreshhold*this.movingSpeed)**2&&(this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0)),this.calculateVectors(),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}updateRotationMatrix(){var t=[[Math.cos(this.rotationAngleZ),-Math.sin(this.rotationAngleZ),0],[Math.sin(this.rotationAngleZ),Math.cos(this.rotationAngleZ),0],[0,0,1]],i=[[Math.cos(this.rotationAngleY),0,-Math.sin(this.rotationAngleY)],[0,1,0],[Math.sin(this.rotationAngleY),0,Math.cos(this.rotationAngleY)]],o=[[1,0,0],[0,Math.cos(this.rotationAngleX),-Math.sin(this.rotationAngleX)],[0,Math.sin(this.rotationAngleX),Math.cos(this.rotationAngleX)]],t=RaymarchApplet.matMul(RaymarchApplet.matMul(t,i),o);this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix,!1,[t[0][0],t[1][0],t[2][0],t[0][1],t[1][1],t[2][1],t[0][2],t[1][2],t[2][2]])}distanceEstimator(x,y,z){var t=[x,y,z];let i=0,o=1;for(let h=0;h<4*this.maxIterations&&!(16<(i=Math.sqrt(RaymarchApplet.dotProduct(t,t))));h++){Math.acos(t[2]/i),Math.atan2(t[1],t[0]);o=Math.pow(i,this.power-1)*this.power*o+1,this.power,this.power;var e=Math.pow(i,this.power),e=(t[0]=e*Math.sin(this.theta)*Math.cos(this.phi)+((1-this.juliaProportion)*x+this.juliaProportion*this.c[0]),t[1]=e*Math.sin(this.theta)*Math.sin(this.phi)+((1-this.juliaProportion)*y+this.juliaProportion*this.c[1]),t[2]=e*Math.cos(this.theta)+((1-this.juliaProportion)*z+this.juliaProportion*this.c[2]),t[0]),n=t[1],s=t[2],a=[[Math.cos(this.rotationAngleZ),-Math.sin(this.rotationAngleZ),0],[Math.sin(this.rotationAngleZ),Math.cos(this.rotationAngleZ),0],[0,0,1]],r=[[Math.cos(this.rotationAngleY),0,-Math.sin(this.rotationAngleY)],[0,1,0],[Math.sin(this.rotationAngleY),0,Math.cos(this.rotationAngleY)]],l=[[1,0,0],[0,Math.cos(this.rotationAngleX),-Math.sin(this.rotationAngleX)],[0,Math.sin(this.rotationAngleX),Math.cos(this.rotationAngleX)]],a=RaymarchApplet.matMul(RaymarchApplet.matMul(a,r),l);t[0]=a[0][0]*e+a[0][1]*n+a[0][2]*s,t[1]=a[1][0]*e+a[1][1]*n+a[1][2]*s,t[2]=a[2][0]*e+a[2][1]*n+a[2][2]*s}return.5*Math.log(i)*i/o}changeResolution(resolution=this.imageSize){this.imageSize=resolution,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize)}randomizeRotation(animateChange=!0){const t={t:0},i=this.rotationAngleX,o=this.rotationAngleY,e=this.rotationAngleZ,n=2*Math.random()-1,s=2*Math.random()-1,a=2*Math.random()-1;this.rotationAngleXInputElement&&this.rotationAngleYInputElement&&this.rotationAngleZInputElement&&(this.rotationAngleXInputElement.value=Math.round(1e6*n)/1e6,this.rotationAngleYInputElement.value=Math.round(1e6*s)/1e6,this.rotationAngleZInputElement.value=Math.round(1e6*a)/1e6),anime({targets:t,t:1,duration:1e3*animateChange+10,easing:"easeOutSine",update:()=>{this.rotationAngleX=(1-t.t)*i+t.t*n,this.rotationAngleY=(1-t.t)*o+t.t*s,this.rotationAngleZ=(1-t.t)*e+t.t*a,this.updateRotationMatrix()}})}randomizeC(animateChange=!0){const t={t:0},i=this.c[0],o=this.c[1],e=this.c[2],n=1.5*Math.random()-.75,s=1.5*Math.random()-.75,a=1.5*Math.random()-.75;this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*n)/1e6,this.cYInputElement.value=Math.round(1e6*s)/1e6,this.cZInputElement.value=Math.round(1e6*a)/1e6),anime({targets:t,t:1,duration:1e3*animateChange+10,easing:"easeOutSine",update:()=>{this.c[0]=(1-t.t)*i+t.t*n,this.c[1]=(1-t.t)*o+t.t*s,this.c[2]=(1-t.t)*e+t.t*a,this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c)}})}switchBulb(){0===this.juliaProportion?(this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.movingPos||this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,1)):(this.movingPos=!0,this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0));const t={t:0},i=this.juliaProportion,o=0===this.juliaProportion?1:0;anime({targets:t,t:1,duration:1e3,easing:"easeOutSine",update:()=>{this.juliaProportion=(1-t.t)*i+t.t*o,this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,this.juliaProportion)}})}}export{Mandelbulb};