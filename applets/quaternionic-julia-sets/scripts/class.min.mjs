import anime from"/scripts/anime.min.js";import{changeOpacity,opacityAnimationTime}from"/scripts/src/animation.min.mjs";import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class QuaternionicJuliaSet extends Applet{currentlyDragging=!1;movingForwardKeyboard=!1;movingBackwardKeyboard=!1;movingRightKeyboard=!1;movingLeftKeyboard=!1;movingSliceUpKeyboard=!1;movingSliceDownKeyboard=!1;movingForwardTouch=!1;movingBackwardTouch=!1;wasMovingTouch=!1;movingSpeed=0;switchBulbButtonElement=null;switchMovementButtonElement=null;randomizeCButtonElement=null;cXInputElement=null;cYInputElement=null;cZInputElement=null;cWInputElement=null;nextMoveVelocity=[0,0,0,0];moveVelocity=[0,0,0,0];moveFriction=.91;moveVelocityStopThreshhold=5e-4;distanceToScene=1;lastTimestamp=-1;theta=1.21557;phi=2.10801;nextThetaVelocity=0;nextPhiVelocity=0;thetaVelocity=0;phiVelocity=0;panFriction=.88;panVelocityStartThreshhold=.005;panVelocityStopThreshhold=5e-4;imageSize=500;imageWidth=500;imageHeight=500;maxIterations=16;maxMarches=100;imagePlaneCenterPos=[];forwardVec=[];rightVec=[];upVec=[];cameraPos=[-1.11619,-2.63802,1.67049];focalLength=2;lightPos=[-5,-5,5];c=[-.54,-.25,-.668];kSlice=0;juliaProportion=1;movingPos=0;constructor(canvas,switchBulbButtonElement,switchMovementButtonElement,randomizeCButtonElement,cXInputElement,cYInputElement,cZInputElement,cWInputElement){super(canvas),this.switchBulbButtonElement=switchBulbButtonElement,this.switchMovementButtonElement=switchMovementButtonElement,this.randomizeCButtonElement=randomizeCButtonElement,this.cXInputElement=cXInputElement,this.cYInputElement=cYInputElement,this.cZInputElement=cZInputElement,this.cWInputElement=cWInputElement;var t={renderer:"gpu",shader:`
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
			
			uniform float kSlice;
			
			
			uniform vec3 c;
			uniform float juliaProportion;
			
			
			
			vec4 qmul(vec4 z, vec4 w)
			{
				return vec4(z.x*w.x - z.y*w.y - z.z*w.z - z.w*w.w, z.x*w.y + z.y*w.x + z.z*w.w - z.w*w.z, z.x*w.z - z.y*w.w + z.z*w.x + z.w*w.y, z.x*w.w + z.y*w.z - z.z*w.y + z.w*w.x);
			}
			
			
			float distanceEstimator(vec3 pos)
			{
				vec4 z = vec4(pos, kSlice);
				vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
				float r;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					r = length(z);
					
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					zPrime = 2.0 * qmul(z, zPrime);
					
					z = qmul(z, z);
					
					z += mix(vec4(pos, kSlice), vec4(c, kSlice), juliaProportion);
				}
				
				
				r = length(z);
				float distance1 = .5 * r * log(r) / length(zPrime);
				float distance2 = length(pos - c) - .05;
				
				
				
				if (distance2 < distance1 && drawSphere == 1)
				{
					return distance2;
				}
				
				return distance1;
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec4 z = vec4(pos, kSlice);
				vec4 zPrime = vec4(1.0, 0.0, 0.0, 0.0);
				float r;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				for (int iteration = 0; iteration < 100; iteration++)
				{
					r = length(z);
					
					if (r > 16.0 || iteration >= maxIterations)
					{
						break;
					}
					
					zPrime = 2.0 * qmul(z, zPrime);
					
					z = qmul(z, z);
					
					z += mix(vec4(pos, kSlice), vec4(c, kSlice), juliaProportion);
					
					color = mix(color, abs(normalize(z.xyz)), colorScale);
					
					colorScale *= .5;
				}
				
				color /= max(max(color.x, color.y), color.z);
				
				
				r = length(z);
				float distance1 = .5 * r * log(r) / length(zPrime);
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
				
				gl_FragColor = vec4(raymarch(imagePlaneCenterPos + rightVec * (uv.x) * aspectRatioX + upVec * (uv.y) / aspectRatioY), 1.0);
			}
		`,canvasWidth:500,canvasHeight:500,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:()=>this.changeResolution(this.imageSize),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(canvas,t),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","drawSphere","c","juliaProportion","maxMarches","stepFactor","maxIterations","kSlice"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,1),this.wilson.gl.uniform1f(this.wilson.uniforms.kSlice,0),this.wilson.gl.uniform1i(this.wilson.uniforms.maxMarches,this.maxMarches),this.wilson.gl.uniform1f(this.wilson.uniforms.stepFactor,1),this.wilson.gl.uniform1i(this.wilson.uniforms.maxIterations,this.maxIterations),this.handleKeydownEvent.bind(this)),t=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:t}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(timestamp){var t=timestamp-this.lastTimestamp;this.lastTimestamp=timestamp,0==t||(this.wilson.render.drawFrame(),(this.movingForwardKeyboard||this.movingBackwardKeyboard||this.movingRightKeyboard||this.movingLeftKeyboard||this.movingForwardTouch||this.movingBackwardTouch||this.movingSliceUpKeyboard||this.movingSliceDownKeyboard)&&this.updateCameraParameters(),0===this.thetaVelocity&&0===this.phiVelocity||(this.theta+=this.thetaVelocity,this.phi+=this.phiVelocity,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.thetaVelocity*=this.panFriction,this.phiVelocity*=this.panFriction,this.thetaVelocity*this.thetaVelocity+this.phiVelocity*this.phiVelocity<this.panVelocityStopThreshhold*this.panVelocityStopThreshhold&&(this.thetaVelocity=0,this.phiVelocity=0),this.calculateVectors()),0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&0===this.moveVelocity[3]||(this.movingPos?(this.cameraPos[0]+=this.moveVelocity[0],this.cameraPos[1]+=this.moveVelocity[1],this.cameraPos[2]+=this.moveVelocity[2]):(this.c[0]+=this.moveVelocity[0],this.c[1]+=this.moveVelocity[1],this.c[2]+=this.moveVelocity[2],this.kSlice+=this.moveVelocity[3],this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&this.cWInputElement&&(this.cXInputElement.value=Math.round(1e6*this.c[0])/1e6,this.cYInputElement.value=Math.round(1e6*this.c[1])/1e6,this.cZInputElement.value=Math.round(1e6*this.c[2])/1e6,this.cWInputElement.value=Math.round(1e6*this.kSlice)/1e6),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.kSlice,this.kSlice)),this.moveVelocity[0]*=this.moveFriction,this.moveVelocity[1]*=this.moveFriction,this.moveVelocity[2]*=this.moveFriction,this.moveVelocity[3]*=this.moveFriction,this.moveVelocity[0]*this.moveVelocity[0]+this.moveVelocity[1]*this.moveVelocity[1]+this.moveVelocity[2]*this.moveVelocity[2]+this.moveVelocity[3]*this.moveVelocity[3]<this.moveVelocityStopThreshhold*this.movingSpeed*this.moveVelocityStopThreshhold*this.movingSpeed&&(this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.moveVelocity[3]=0),this.calculateVectors()),this.animationPaused)||window.requestAnimationFrame(this.drawFrame.bind(this))}calculateVectors(){this.forwardVec=[Math.cos(this.theta)*Math.sin(this.phi),Math.sin(this.theta)*Math.sin(this.phi),Math.cos(this.phi)],this.rightVec=this.normalize([this.forwardVec[1],-this.forwardVec[0],0]),this.upVec=this.crossProduct(this.rightVec,this.forwardVec),this.distanceToScene=this.distanceEstimator(this.cameraPos[0],this.cameraPos[1],this.cameraPos[2]),this.focalLength=this.distanceToScene/2,this.rightVec[0]*=this.focalLength/2,this.rightVec[1]*=this.focalLength/2,this.upVec[0]*=this.focalLength/2,this.upVec[1]*=this.focalLength/2,this.upVec[2]*=this.focalLength/2,this.imagePlaneCenterPos=[this.cameraPos[0]+this.focalLength*this.forwardVec[0],this.cameraPos[1]+this.focalLength*this.forwardVec[1],this.cameraPos[2]+this.focalLength*this.forwardVec[2]],this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength)}dotProduct(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]}dotProduct4(vec1,vec2){return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]+vec1[3]*vec2[3]}crossProduct(vec1,vec2){return[vec1[1]*vec2[2]-vec1[2]*vec2[1],vec1[2]*vec2[0]-vec1[0]*vec2[2],vec1[0]*vec2[1]-vec1[1]*vec2[0]]}normalize(vec){var t=Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]);return[vec[0]/t,vec[1]/t,vec[2]/t]}qmul(x1,y1,z1,w1,x2,y2,z2,w2){return[x1*x2-y1*y2-z1*z1-w1*w2,x1*y2+y1*x2+z1*w2-w1*z2,x1*z2-y1*w2+z1*x2+w1*y2,x1*w2+y1*z2-z1*y2+w1*x2]}distanceEstimator(x,y,z){let t=[x,y,z,this.kSlice],i=[1,0,0,0],e=0;for(let o=0;o<4*this.maxIterations&&!(16<(e=Math.sqrt(this.dotProduct4(t,t))));o++)(i=this.qmul(...t,...i))[0]*=2,i[1]*=2,i[2]*=2,i[3]*=2,(t=this.qmul(...t,...t))[0]+=(1-this.juliaProportion)*x+this.juliaProportion*this.c[0],t[1]+=(1-this.juliaProportion)*y+this.juliaProportion*this.c[1],t[2]+=(1-this.juliaProportion)*z+this.juliaProportion*this.c[2],t[3]+=this.kSlice;return.5*Math.log(e)*e/Math.sqrt(this.dotProduct4(i,i))}onGrabCanvas(x,y,event){this.nextThetaVelocity=0,this.nextPhiVelocity=0,this.thetaVelocity=0,this.phiVelocity=0,"touchstart"===event.type&&(2===event.touches.length?(this.movingForwardTouch=!0,this.movingBackwardTouch=!1,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.moveVelocity[3]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,this.nextMoveVelocity[3]=0):3===event.touches.length?(this.movingForwardTouch=!1,this.movingBackwardTouch=!0,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.moveVelocity[3]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,this.nextMoveVelocity[3]=0):(this.movingForwardTouch=!1,this.movingBackwardTouch=!1),this.wasMovingTouch=!1)}onDragCanvas(x,y,xDelta,yDelta,event){"touchmove"===event.type&&this.wasMovingTouch?this.wasMovingTouch=!1:(this.theta+=xDelta*Math.PI/2,this.nextThetaVelocity=xDelta*Math.PI/2,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi+=yDelta*Math.PI/2,this.nextPhiVelocity=yDelta*Math.PI/2,this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.calculateVectors())}onReleaseCanvas(x,y,event){"touchend"===event.type&&(this.movingForwardTouch=!1,this.movingBackwardTouch=!1,this.wasMovingTouch=!0,0===this.moveVelocity[0])&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.moveVelocity[3]=this.nextMoveVelocity[3],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,this.nextMoveVelocity[3]=0),("touchend"===event.type&&0===event.touches.length||"mouseup"===event.type)&&this.nextThetaVelocity*this.nextThetaVelocity+this.nextPhiVelocity*this.nextPhiVelocity>=this.panVelocityStartThreshhold*this.panVelocityStartThreshhold&&(this.thetaVelocity=this.nextThetaVelocity,this.phiVelocity=this.nextPhiVelocity)}handleKeydownEvent(e){"INPUT"===document.activeElement.tagName||"w"!==e.key&&"s"!==e.key&&"d"!==e.key&&"a"!==e.key&&"e"!==e.key&&"q"!==e.key||(this.nextMoveVelocity=[0,0,0,0],this.moveVelocity=[0,0,0,0],"w"===e.key?this.movingForwardKeyboard=!0:"s"===e.key&&(this.movingBackwardKeyboard=!0),"d"===e.key?this.movingRightKeyboard=!0:"a"===e.key&&(this.movingLeftKeyboard=!0),"e"===e.key?this.movingSliceUpKeyboard=!0:"q"===e.key&&(this.movingSliceDownKeyboard=!0))}handleKeyupEvent(e){"INPUT"===document.activeElement.tagName||"w"!==e.key&&"s"!==e.key&&"d"!==e.key&&"a"!==e.key&&"e"!==e.key&&"q"!==e.key||(0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&0===this.moveVelocity[3]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.moveVelocity[3]=this.nextMoveVelocity[3],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,this.nextMoveVelocity[3]=0),"w"===e.key?this.movingForwardKeyboard=!1:"s"===e.key&&(this.movingBackwardKeyboard=!1),"d"===e.key?this.movingRightKeyboard=!1:"a"===e.key&&(this.movingLeftKeyboard=!1),"e"===e.key?this.movingSliceUpKeyboard=!1:"q"===e.key&&(this.movingSliceDownKeyboard=!1))}updateCameraParameters(){var t,i;this.movingSpeed=Math.min(Math.max(1e-6,this.distanceToScene/20),.02),this.movingPos?(t=[...this.cameraPos],this.movingForwardKeyboard||this.movingForwardTouch?(this.cameraPos[0]+=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]+=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]+=this.movingSpeed*this.forwardVec[2]):(this.movingBackwardKeyboard||this.movingBackwardTouch)&&(this.cameraPos[0]-=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]-=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]-=this.movingSpeed*this.forwardVec[2]),this.movingRightKeyboard?(this.cameraPos[0]+=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]+=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]+=this.movingSpeed*this.rightVec[2]/this.focalLength):this.movingLeftKeyboard&&(this.cameraPos[0]-=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]-=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]-=this.movingSpeed*this.rightVec[2]/this.focalLength),this.nextMoveVelocity[0]=this.cameraPos[0]-t[0],this.nextMoveVelocity[1]=this.cameraPos[1]-t[1],this.nextMoveVelocity[2]=this.cameraPos[2]-t[2]):(t=[...this.c],i=this.kSlice,this.movingForwardKeyboard||this.movingForwardTouch?(this.c[0]+=.5*this.movingSpeed*this.forwardVec[0],this.c[1]+=.5*this.movingSpeed*this.forwardVec[1],this.c[2]+=.5*this.movingSpeed*this.forwardVec[2]):(this.movingBackwardKeyboard||this.movingBackwardTouch)&&(this.c[0]-=.5*this.movingSpeed*this.forwardVec[0],this.c[1]-=.5*this.movingSpeed*this.forwardVec[1],this.c[2]-=.5*this.movingSpeed*this.forwardVec[2]),this.movingRightKeyboard?(this.c[0]+=.5*this.movingSpeed*this.rightVec[0]/this.focalLength,this.c[1]+=.5*this.movingSpeed*this.rightVec[1]/this.focalLength,this.c[2]+=.5*this.movingSpeed*this.rightVec[2]/this.focalLength):this.movingLeftKeyboard&&(this.c[0]-=.5*this.movingSpeed*this.rightVec[0]/this.focalLength,this.c[1]-=.5*this.movingSpeed*this.rightVec[1]/this.focalLength,this.c[2]-=.5*this.movingSpeed*this.rightVec[2]/this.focalLength),this.movingSliceUpKeyboard?this.kSlice+=.5*this.movingSpeed:this.movingSliceDownKeyboard&&(this.kSlice-=.5*this.movingSpeed),this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&this.cWInputElement&&(this.cXInputElement.value=Math.round(1e6*this.c[0])/1e6,this.cYInputElement.value=Math.round(1e6*this.c[1])/1e6,this.cZInputElement.value=Math.round(1e6*this.c[2])/1e6,this.cWInputElement.value=Math.round(1e6*this.kSlice)/1e6),this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.wilson.gl.uniform1f(this.wilson.uniforms.kSlice,this.kSlice),this.nextMoveVelocity[0]=this.c[0]-t[0],this.nextMoveVelocity[1]=this.c[1]-t[1],this.nextMoveVelocity[2]=this.c[2]-t[2],this.nextMoveVelocity[3]=this.kSlice-i),this.calculateVectors()}changeResolution(resolution){this.imageSize=resolution,this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize)}randomizeC(animateChange=!0){this.updateC([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1,this.c[3]],animateChange)}updateC(newC,animateChange=!0){this.cXInputElement&&this.cYInputElement&&this.cZInputElement&&(this.cXInputElement.value=Math.round(1e6*newC[0])/1e6,this.cYInputElement.value=Math.round(1e6*newC[1])/1e6,this.cZInputElement.value=Math.round(1e6*newC[2])/1e6);const t={t:0},i=[...this.c];anime({targets:t,t:1,duration:1500*animateChange+10,easing:"easeOutQuad",update:()=>{this.c[0]=(1-t.t)*i[0]+t.t*newC[0],this.c[1]=(1-t.t)*i[1]+t.t*newC[1],this.c[2]=(1-t.t)*i[2]+t.t*newC[2],this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c)}})}switchBulb(){if(0===this.juliaProportion||1===this.juliaProportion){const t=this.juliaProportion,i=1-this.juliaProportion,e=(this.switchBulbButtonElement&&changeOpacity(this.switchBulbButtonElement,0).then(()=>{this.switchBulbButtonElement.textContent=0===t?"Switch to Mandelbrot Set":"Switch to Julia Set",changeOpacity(this.switchBulbButtonElement,1)}),0===this.juliaProportion?(this.wilson.gl.uniform3fv(this.wilson.uniforms.c,this.c),this.movingPos||this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,1),setTimeout(()=>{this.switchBulbButtonElement&&this.randomizeCButtonElement&&(changeOpacity(this.switchMovementButtonElement,1),changeOpacity(this.randomizeCButtonElement,1))},opacityAnimationTime)):(this.movingPos=!0,this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,0),this.switchBulbButtonElement&&this.randomizeCButtonElement&&(changeOpacity(this.switchMovementButtonElement,0),changeOpacity(this.randomizeCButtonElement,0))),{t:0});anime({targets:e,t:1,duration:1500,easing:"easeOutQuad",update:()=>{this.juliaProportion=(1-e.t)*t+e.t*i,this.wilson.gl.uniform1f(this.wilson.uniforms.juliaProportion,this.juliaProportion)}})}}switchMovement(){this.movingPos=!this.movingPos,this.switchMovementButtonElement&&changeOpacity(this.switchMovementButtonElement,0).then(()=>{this.switchMovementButtonElement.textContent=this.movingPos?"Change Julia Set":"Move Camera",changeOpacity(this.switchMovementButtonElement,1)}),this.wilson.gl.uniform1i(this.wilson.uniforms.drawSphere,this.movingPos?0:1)}}export{QuaternionicJuliaSet};