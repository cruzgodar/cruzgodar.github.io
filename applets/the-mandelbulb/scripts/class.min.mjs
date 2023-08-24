import anime from"/scripts/anime.js";import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class Mandelbulb extends Applet{cXInputElement=null;cYInputElement=null;cZInputElement=null;rotationAngleXInputElement=null;rotationAngleYInputElement=null;rotationAngleZInputElement=null;currentlyDrawing=!1;currentlyAnimatingParameters=!1;currentlyDragging=!1;drawStartTime=0;mouseX=0;mouseY=0;movingForwardKeyboard=!1;movingBackwardKeyboard=!1;movingRightKeyboard=!1;movingLeftKeyboard=!1;movingForwardTouch=!1;movingBackwardTouch=!1;wasMovingTouch=!1;movingSpeed=0;nextMoveVelocity=[0,0,0];moveVelocity=[0,0,0];moveFriction=.91;moveVelocityStopThreshhold=5e-4;distanceToScene=1;lastTimestamp=-1;theta=4.6601;phi=2.272;nextThetaVelocity=0;nextPhiVelocity=0;thetaVelocity=0;phiVelocity=0;panFriction=.88;panVelocityStartThreshhold=.005;panVelocityStopThreshhold=5e-4;imageSize=500;imageWidth=500;imageHeight=500;maxIterations=16;maxMarches=100;imagePlaneCenterPos=[];forwardVec=[];rightVec=[];upVec=[];cameraPos=[.0828,2.17,1.8925];focalLength=2;lightPos=[0,0,5];power=8;c=[0,0,0];cOld=[0,0,0];cDelta=[0,0,0];rotationAngleX=0;rotationAngleY=0;rotationAngleZ=0;juliaProportion=0;movingPos=1;constructor(t,i,e,o,s,a,h){super(t),this.cXInputElement=i,this.cYInputElement=e,this.cZInputElement=o,this.rotationAngleXInputElement=s,this.rotationAngleYInputElement=a,this.rotationAngleZInputElement=h;i={renderer:"gpu",shader:`
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
				//Uncomment to use 2x antialiasing.
				//vec3 finalColor = (raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize)))) / 4.0;
				
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY), 1.0);
			}
		`,canvasWidth:500,canvasHeight:500,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},this.wilson=new Wilson(t,i),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","drawSphere","power","c","juliaProportion","rotationMatrix","maxMarches","stepFactor","maxIterations"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0),this.wilson.gl.uniform1f(this.wilson.uniforms.power,8),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,0),this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix,!1,[1,0,0,0,1,0,0,0,1]),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxIterations,this.maxIterations),e=this.handleKeydownEvent.bind(this),addTemporaryListener({object:document.documentElement,event:"keydown",callback:e}),o=this.handleKeyupEvent.bind(this);addTemporaryListener({object:document.documentElement,event:"keyup",callback:o});addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(t){var i=t-this.lastTimestamp;this.lastTimestamp=t,0==i||(this.wilson.render.drawFrame(),this.movingForwardKeyboard||this.movingBackwardKeyboard||this.movingRightKeyboard||this.movingLeftKeyboard||this.movingForwardTouch||this.movingBackwardTouch?this.updateCameraParameters():50<=i&&(this.nextThetaVelocity=0,this.nextPhiVelocity=0,this.thetaVelocity=0,this.phiVelocity=0,this.movingForwardTouch=!1,this.movingBackwardTouch=!1,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),0===this.thetaVelocity&&0===this.phiVelocity||(this.theta+=this.thetaVelocity,this.phi+=this.phiVelocity,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.thetaVelocity*=this.panFriction,this.phiVelocity*=this.panFriction,this.thetaVelocity*this.thetaVelocity+this.phiVelocity*this.phiVelocity<this.panVelocityStopThreshhold*this.panVelocityStopThreshhold&&(this.thetaVelocity=0,this.phiVelocity=0),this.calculateVectors()),0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]||(this.movingPos?(this.cameraPos[0]+=this.moveVelocity[0],this.cameraPos[1]+=this.moveVelocity[1],this.cameraPos[2]+=this.moveVelocity[2]):(this.c[0]+=this.moveVelocity[0],this.c[1]+=this.moveVelocity[1],this.c[2]+=this.moveVelocity[2],this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*this.c[0])/1e6,this.cYInputElement.value=Math.round(1e6*this.c[1])/1e6,this.cZInputElement.value=Math.round(1e6*this.c[2])/1e6),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c)),this.moveVelocity[0]*=this.moveFriction,this.moveVelocity[1]*=this.moveFriction,this.moveVelocity[2]*=this.moveFriction,this.moveVelocity[0]*this.moveVelocity[0]+this.moveVelocity[1]*this.moveVelocity[1]+this.moveVelocity[2]*this.moveVelocity[2]<this.moveVelocityStopThreshhold*this.movingSpeed*this.moveVelocityStopThreshhold*this.movingSpeed&&(this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0),this.calculateVectors()),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}calculateVectors(){this.forwardVec=[Math.cos(this.theta)*Math.sin(this.phi),Math.sin(this.theta)*Math.sin(this.phi),Math.cos(this.phi)],this.rightVec=this.normalize([this.forwardVec[1],-this.forwardVec[0],0]),this.upVec=this.crossProduct(this.rightVec,this.forwardVec),this.distanceToScene=this.distanceEstimator(this.cameraPos[0],this.cameraPos[1],this.cameraPos[2]),this.focalLength=this.distanceToScene/2,this.rightVec[0]*=this.focalLength/2,this.rightVec[1]*=this.focalLength/2,this.upVec[0]*=this.focalLength/2,this.upVec[1]*=this.focalLength/2,this.upVec[2]*=this.focalLength/2,this.imagePlaneCenterPos=[this.cameraPos[0]+this.focalLength*this.forwardVec[0],this.cameraPos[1]+this.focalLength*this.forwardVec[1],this.cameraPos[2]+this.focalLength*this.forwardVec[2]],this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength)}dotProduct(t,i){return t[0]*i[0]+t[1]*i[1]+t[2]*i[2]}crossProduct(t,i){return[t[1]*i[2]-t[2]*i[1],t[2]*i[0]-t[0]*i[2],t[0]*i[1]-t[1]*i[0]]}matMul(t,i){return[[t[0][0]*i[0][0]+t[0][1]*i[1][0]+t[0][2]*i[2][0],t[0][0]*i[0][1]+t[0][1]*i[1][1]+t[0][2]*i[2][1],t[0][0]*i[0][2]+t[0][1]*i[1][2]+t[0][2]*i[2][2]],[t[1][0]*i[0][0]+t[1][1]*i[1][0]+t[1][2]*i[2][0],t[1][0]*i[0][1]+t[1][1]*i[1][1]+t[1][2]*i[2][1],t[1][0]*i[0][2]+t[1][1]*i[1][2]+t[1][2]*i[2][2]],[t[2][0]*i[0][0]+t[2][1]*i[1][0]+t[2][2]*i[2][0],t[2][0]*i[0][1]+t[2][1]*i[1][1]+t[2][2]*i[2][1],t[2][0]*i[0][2]+t[2][1]*i[1][2]+t[2][2]*i[2][2]]]}updateRotationMatrix(){var t=[[Math.cos(this.rotationAngleZ),-Math.sin(this.rotationAngleZ),0],[Math.sin(this.rotationAngleZ),Math.cos(this.rotationAngleZ),0],[0,0,1]],i=[[Math.cos(this.rotationAngleY),0,-Math.sin(this.rotationAngleY)],[0,1,0],[Math.sin(this.rotationAngleY),0,Math.cos(this.rotationAngleY)]],e=[[1,0,0],[0,Math.cos(this.rotationAngleX),-Math.sin(this.rotationAngleX)],[0,Math.sin(this.rotationAngleX),Math.cos(this.rotationAngleX)]],t=this.matMul(this.matMul(t,i),e);this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix,!1,[t[0][0],t[1][0],t[2][0],t[0][1],t[1][1],t[2][1],t[0][2],t[1][2],t[2][2]])}normalize(t){var i=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);return[t[0]/i,t[1]/i,t[2]/i]}distanceEstimator(i,e,o){var s=[i,e,o];let a=0,h=1;for(let t=0;t<4*this.maxIterations&&!(16<(a=Math.sqrt(this.dotProduct(s,s))));t++){Math.acos(s[2]/a),Math.atan2(s[1],s[0]);h=Math.pow(a,this.power-1)*this.power*h+1,this.power,this.power;var n=Math.pow(a,this.power),n=(s[0]=n*Math.sin(this.theta)*Math.cos(this.phi)+((1-this.juliaProportion)*i+this.juliaProportion*this.c[0]),s[1]=n*Math.sin(this.theta)*Math.sin(this.phi)+((1-this.juliaProportion)*e+this.juliaProportion*this.c[1]),s[2]=n*Math.cos(this.theta)+((1-this.juliaProportion)*o+this.juliaProportion*this.c[2]),s[0]),r=s[1],c=s[2],l=[[Math.cos(this.rotationAngleZ),-Math.sin(this.rotationAngleZ),0],[Math.sin(this.rotationAngleZ),Math.cos(this.rotationAngleZ),0],[0,0,1]],m=[[Math.cos(this.rotationAngleY),0,-Math.sin(this.rotationAngleY)],[0,1,0],[Math.sin(this.rotationAngleY),0,Math.cos(this.rotationAngleY)]],g=[[1,0,0],[0,Math.cos(this.rotationAngleX),-Math.sin(this.rotationAngleX)],[0,Math.sin(this.rotationAngleX),Math.cos(this.rotationAngleX)]],l=this.matMul(this.matMul(l,m),g);s[0]=l[0][0]*n+l[0][1]*r+l[0][2]*c,s[1]=l[1][0]*n+l[1][1]*r+l[1][2]*c,s[2]=l[2][0]*n+l[2][1]*r+l[2][2]*c}return.5*Math.log(a)*a/h}onGrabCanvas(t,i,e){this.nextThetaVelocity=0,this.nextPhiVelocity=0,this.thetaVelocity=0,this.phiVelocity=0,"touchstart"===e.type&&(2===e.touches.length?(this.movingForwardTouch=!0,this.movingBackwardTouch=!1,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0):3===e.touches.length?(this.movingForwardTouch=!1,this.movingBackwardTouch=!0,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0):(this.movingForwardTouch=!1,this.movingBackwardTouch=!1),this.wasMovingTouch=!1)}onDragCanvas(t,i,e,o,s){"touchmove"===s.type&&this.wasMovingTouch?this.wasMovingTouch=!1:(this.theta+=e*Math.PI/2,this.nextThetaVelocity=e*Math.PI/2,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi+=o*Math.PI/2,this.nextPhiVelocity=o*Math.PI/2,this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.calculateVectors())}onReleaseCanvas(t,i,e){"touchend"===e.type&&(this.movingForwardTouch=!1,this.movingBackwardTouch=!1,this.wasMovingTouch=!0,0===this.moveVelocity[0])&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),"touchend"===e.type&&e.touches,(0===length||"mouseup"===e.type)&&this.nextThetaVelocity*this.nextThetaVelocity+this.nextPhiVelocity*this.nextPhiVelocity>=this.panVelocityStartThreshhold*this.panVelocityStartThreshhold&&(this.thetaVelocity=this.nextThetaVelocity,this.phiVelocity=this.nextPhiVelocity)}handleKeydownEvent(t){"INPUT"===document.activeElement.tagName||"w"!==t.key&&"s"!==t.key&&"d"!==t.key&&"a"!==t.key||(this.nextMoveVelocity=[0,0,0],this.moveVelocity=[0,0,0],"w"===t.key?this.movingForwardKeyboard=!0:"s"===t.key&&(this.movingBackwardKeyboard=!0),"d"===t.key?this.movingRightKeyboard=!0:"a"===t.key&&(this.movingLeftKeyboard=!0))}handleKeyupEvent(t){"INPUT"===document.activeElement.tagName||"w"!==t.key&&"s"!==t.key&&"d"!==t.key&&"a"!==t.key||(0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),"w"===t.key?this.movingForwardKeyboard=!1:"s"===t.key&&(this.movingBackwardKeyboard=!1),"d"===t.key?this.movingRightKeyboard=!1:"a"===t.key&&(this.movingLeftKeyboard=!1))}updateCameraParameters(){var t;this.movingSpeed=Math.min(Math.max(1e-6,this.distanceToScene/20),.02),this.movingPos?(t=[...this.cameraPos],this.movingForwardKeyboard||this.movingForwardTouch?(this.cameraPos[0]+=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]+=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]+=this.movingSpeed*this.forwardVec[2]):(this.movingBackwardKeyboard||this.movingBackwardTouch)&&(this.cameraPos[0]-=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]-=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]-=this.movingSpeed*this.forwardVec[2]),this.movingRightKeyboard?(this.cameraPos[0]+=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]+=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]+=this.movingSpeed*this.rightVec[2]/this.focalLength):this.movingLeftKeyboard&&(this.cameraPos[0]-=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]-=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]-=this.movingSpeed*this.rightVec[2]/this.focalLength),this.nextMoveVelocity[0]=this.cameraPos[0]-t[0],this.nextMoveVelocity[1]=this.cameraPos[1]-t[1],this.nextMoveVelocity[2]=this.cameraPos[2]-t[2]):(t=[...this.c],this.movingForwardKeyboard||this.movingForwardTouch?(this.c[0]+=.5*this.movingSpeed*this.forwardVec[0],this.c[1]+=.5*this.movingSpeed*this.forwardVec[1],this.c[2]+=.5*this.movingSpeed*this.forwardVec[2]):(this.movingBackwardKeyboard||this.movingBackwardTouch)&&(this.c[0]-=.5*this.movingSpeed*this.forwardVec[0],this.c[1]-=.5*this.movingSpeed*this.forwardVec[1],this.c[2]-=.5*this.movingSpeed*this.forwardVec[2]),this.movingRightKeyboard?(this.c[0]+=.5*this.movingSpeed*this.rightVec[0]/this.focalLength,this.c[1]+=.5*this.movingSpeed*this.rightVec[1]/this.focalLength,this.c[2]+=.5*this.movingSpeed*this.rightVec[2]/this.focalLength):this.movingLeftKeyboard&&(this.c[0]-=.5*this.movingSpeed*this.rightVec[0]/this.focalLength,this.c[1]-=.5*this.movingSpeed*this.rightVec[1]/this.focalLength,this.c[2]-=.5*this.movingSpeed*this.rightVec[2]/this.focalLength),this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*this.c[0])/1e6,this.cYInputElement.value=Math.round(1e6*this.c[1])/1e6,this.cZInputElement.value=Math.round(1e6*this.c[2])/1e6),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.nextMoveVelocity[0]=this.c[0]-t[0],this.nextMoveVelocity[1]=this.c[1]-t[1],this.nextMoveVelocity[2]=this.c[2]-t[2]),this.calculateVectors()}changeResolution(t=this.imageSize){this.imageSize=t,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize)}randomizeRotation(t=!0){const i={t:0},e=this.rotationAngleX,o=this.rotationAngleY,s=this.rotationAngleZ,a=2*Math.random()-1,h=2*Math.random()-1,n=2*Math.random()-1;this.rotationAngleXInputElement&&this.rotationAngleYInputElement&&this.rotationAngleZInputElement&&(this.rotationAngleXInputElement.value=Math.round(1e6*a)/1e6,this.rotationAngleYInputElement.value=Math.round(1e6*h)/1e6,this.rotationAngleZInputElement.value=Math.round(1e6*n)/1e6),anime({targets:i,t:1,duration:1e3*t+10,easing:"easeOutSine",update:()=>{this.rotationAngleX=(1-i.t)*e+i.t*a,this.rotationAngleY=(1-i.t)*o+i.t*h,this.rotationAngleZ=(1-i.t)*s+i.t*n,this.updateRotationMatrix()}})}randomizeC(t=!0){const i={t:0},e=this.c[0],o=this.c[1],s=this.c[2],a=1.5*Math.random()-.75,h=1.5*Math.random()-.75,n=1.5*Math.random()-.75;this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*a)/1e6,this.cYInputElement.value=Math.round(1e6*h)/1e6,this.cZInputElement.value=Math.round(1e6*n)/1e6),anime({targets:i,t:1,duration:1e3*t+10,easing:"easeOutSine",update:()=>{this.c[0]=(1-i.t)*e+i.t*a,this.c[1]=(1-i.t)*o+i.t*h,this.c[2]=(1-i.t)*s+i.t*n,this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c)}})}switchBulb(){0===this.juliaProportion?(this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.movingPos||this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,1)):(this.movingPos=!0,this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0));const t={t:0},i=this.juliaProportion,e=0===this.juliaProportion?1:0;anime({targets:t,t:1,duration:1e3,easing:"easeOutSine",update:()=>{this.juliaProportion=(1-t.t)*i+t.t*e,this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,this.juliaProportion)}})}switchMovement(){this.movingPos=!this.movingPos,this.movingPos?this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0):this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,1)}}export{Mandelbulb};