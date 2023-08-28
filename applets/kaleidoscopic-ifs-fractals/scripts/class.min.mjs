import anime from"/scripts/anime.min.js";import{changeOpacity}from"/scripts/src/animation.min.mjs";import{Applet}from"/scripts/src/applets.min.mjs";import{aspectRatio}from"/scripts/src/layout.min.mjs";import{addTemporaryListener}from"/scripts/src/main.min.mjs";import{Wilson}from"/scripts/wilson.min.mjs";class KaleidoscopicIFSFractal extends Applet{currentlyDrawing=!1;currentlyAnimatingParameters=!1;currentlyDragging=!1;drawStartTime=0;mouseX=0;mouseY=0;movingForwardKeyboard=!1;movingBackwardKeyboard=!1;movingRightKeyboard=!1;movingLeftKeyboard=!1;movingForwardTouch=!1;movingBackwardTouch=!1;wasMovingTouch=!1;movingSpeed=0;nextMoveVelocity=[0,0,0];moveVelocity=[0,0,0];moveFriction=.94;moveVelocityStopThreshhold=5e-4;distanceToScene=1;lastTimestamp=-1;theta=3.2954;phi=1.9657;nextThetaVelocity=0;nextPhiVelocity=0;thetaVelocity=0;phiVelocity=0;panFriction=.94;panVelocityStartThreshhold=.005;panVelocityStopThreshhold=5e-4;imageSize=500;imageWidth=500;imageHeight=500;numSierpinskiIterations=24;scale=2;imagePlaneCenterPos=[];forwardVec=[];rightVec=[];upVec=[];cameraPos=[2.1089,.41345,.95325];polyhedronIndex=0;focalLength=2;lightPos=[[0,0,5],[5,5,5],[0,0,5]];n1=[[-.57735,0,.816496],[1,0,0],[.707107,0,.707107]];n2=[[.288675,-.5,.816496],[0,1,0],[0,.707107,.707107]];n3=[[.288675,.5,.816496],[0,0,1],[-.707107,0,.707107]];n4=[[],[],[0,-.707107,.707107]];numNs=[3,3,4];scaleCenter=[[0,0,1],[.57735,.57735,.57735],[0,0,1]];rotationAngleX1=0;rotationAngleY1=0;rotationAngleZ1=0;rotationAngleX2=0;rotationAngleY2=0;rotationAngleZ2=0;rotationAngleX1Old=0;rotationAngleY1Old=0;rotationAngleZ1Old=0;rotationAngleX2Old=0;rotationAngleY2Old=0;rotationAngleZ2Old=0;rotationAngleX1Delta=0;rotationAngleY1Delta=0;rotationAngleZ1Delta=0;rotationAngleX2Delta=0;rotationAngleY2Delta=0;rotationAngleZ2Delta=0;parameterAnimationFrame=0;constructor(t){super(t);var i={renderer:"gpu",shader:`
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
			const float lightBrightness = 2.0;
			
			uniform int imageSize;
			
			
			
			const float clipDistance = 1000.0;
			const int maxMarches = 32;
			const vec3 fogColor = vec3(0.0, 0.0, 0.0);
			const float fogScaling = .2;
			const int maxIterations = 24;
			
			
			
			const vec3 color1 = vec3(1.0, 0.0, 0.0);
			const vec3 color2 = vec3(0.0, 1.0, 0.0);
			const vec3 color3 = vec3(0.0, 0.0, 1.0);
			const vec3 color4 = vec3(1.0, 1.0, 0.0);
			
			
			
			uniform vec3 scaleCenter;
			
			uniform int numNs;
			
			uniform vec3 n1;
			uniform vec3 n2;
			uniform vec3 n3;
			uniform vec3 n4;
			
			
			
			const float scale = 2.0;
			
			
			
			uniform mat3 rotationMatrix1;
			uniform mat3 rotationMatrix2;
			
			
			
			float distanceEstimator(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1;
					}
					
					float t2 = dot(mutablePos, n2);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2;
					}
					
					float t3 = dot(mutablePos, n3);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3;
					}
					
					if (numNs >= 4)
					{
						float t4 = dot(mutablePos, n4);
						
						if (t4 < 0.0)
						{
							mutablePos -= 2.0 * t4 * n4;
						}
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenter;
					
					mutablePos = rotationMatrix2 * mutablePos;
				}
				
				return length(mutablePos) * pow(1.0/scale, float(maxIterations));
			}
			
			
			
			vec3 getColor(vec3 pos)
			{
				vec3 mutablePos = pos;
				
				vec3 color = vec3(1.0, 1.0, 1.0);
				float colorScale = .5;
				
				
				
				//We'll find the closest vertex, scale everything by a factor of 2 centered on that vertex (so that we don't need to recalculate the vertices), and repeat.
				for (int iteration = 0; iteration < maxIterations; iteration++)
				{
					//Fold space over on itself so that we can reference only the top vertex.
					float t1 = dot(mutablePos, n1);
					
					if (t1 < 0.0)
					{
						mutablePos -= 2.0 * t1 * n1;
						
						color = mix(color, color1, colorScale);
					}
					
					float t2 = dot(mutablePos, n2);
					
					if (t2 < 0.0)
					{
						mutablePos -= 2.0 * t2 * n2;
						
						color = mix(color, color2, colorScale);
					}
					
					float t3 = dot(mutablePos, n3);
					
					if (t3 < 0.0)
					{
						mutablePos -= 2.0 * t3 * n3;
						
						color = mix(color, color3, colorScale);
					}
					
					if (numNs >= 4)
					{
						float t4 = dot(mutablePos, n4);
						
						if (t4 < 0.0)
						{
							mutablePos -= 2.0 * t4 * n4;
							
							color = mix(color, color4, colorScale);
						}
					}
					
					
					
					mutablePos = rotationMatrix1 * mutablePos;
					
					//Scale the system -- this one takes me a fair bit of thinking to get. What's happening here is that we're stretching from a vertex, but since we never scale the vertices, the four new ones are the four closest to the vertex we scaled from. Now (x, y, z) will get farther and farther away from the origin, but that makes sense -- we're really just zooming in on the tetrahedron.
					mutablePos = scale * mutablePos - (scale - 1.0) * scaleCenter;
					
					mutablePos = rotationMatrix2 * mutablePos;
					
					colorScale *= .5;
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
				vec3 rayDirectionVec = normalize(startPos - cameraPos) * .9;
				
				vec3 finalColor = fogColor;
				
				float epsilon = .0000001;
				
				float t = 0.0;
				
				
				
				for (int iteration = 0; iteration < maxMarches; iteration++)
				{
					vec3 pos = startPos + t * rayDirectionVec;
					
					float distance = distanceEstimator(pos);
					
					//This lowers the detail far away, which makes everything run nice and fast.
					epsilon = max(.0000006, 3.0 * t / float(imageSize));
					
					
					
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
				//Uncomment to use 2x antialiasing.
				//vec3 finalColor = (raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio + .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y + .5 / float(imageSize))) + raymarch(imagePlaneCenterPos + rightVec * (uv.x * aspectRatio - .5 / float(imageSize)) + upVec * (uv.y - .5 / float(imageSize)))) / 4.0;
					
				vec3 finalColor = raymarch(imagePlaneCenterPos + rightVec * uv.x * aspectRatioX + upVec * uv.y / aspectRatioY);
				
				gl_FragColor = vec4(finalColor.xyz, 1.0);
			}
		`,canvasWidth:500,canvasHeight:500,useFullscreen:!0,trueFullscreen:!0,useFullscreenButton:!0,enterFullscreenButtonIconPath:"/graphics/general-icons/enter-fullscreen.png",exitFullscreenButtonIconPath:"/graphics/general-icons/exit-fullscreen.png",switchFullscreenCallback:this.changeResolution.bind(this),mousedownCallback:this.onGrabCanvas.bind(this),touchstartCallback:this.onGrabCanvas.bind(this),mousedragCallback:this.onDragCanvas.bind(this),touchmoveCallback:this.onDragCanvas.bind(this),mouseupCallback:this.onReleaseCanvas.bind(this),touchendCallback:this.onReleaseCanvas.bind(this)},t=(this.wilson=new Wilson(t,i),this.wilson.render.initUniforms(["aspectRatioX","aspectRatioY","imageSize","cameraPos","imagePlaneCenterPos","forwardVec","rightVec","upVec","focalLength","lightPos","scaleCenter","n1","n2","n3","n4","numNs","rotationMatrix1","rotationMatrix2"]),this.calculateVectors(),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.scaleCenter,this.scaleCenter[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength),this.wilson.gl.uniform3fv(this.wilson.uniforms.n1,this.n1[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n2,this.n2[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n3,this.n3[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n4,this.n4[this.polyhedronIndex]),this.wilson.gl.uniform1i(this.wilson.uniforms.numNs,this.numNs[this.polyhedronIndex]),this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix1,!1,[1,0,0,0,1,0,0,0,1]),this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix2,!1,[1,0,0,0,1,0,0,0,1]),this.handleKeydownEvent.bind(this)),i=(addTemporaryListener({object:document.documentElement,event:"keydown",callback:t}),this.handleKeyupEvent.bind(this));addTemporaryListener({object:document.documentElement,event:"keyup",callback:i});addTemporaryListener({object:window,event:"resize",callback:()=>this.changeResolution()}),window.requestAnimationFrame(this.drawFrame.bind(this))}drawFrame(t){var i=t-this.lastTimestamp;if(this.lastTimestamp=t,0!=i){this.wilson.render.drawFrame();let t=!1;this.movingForwardKeyboard||this.movingBackwardKeyboard||this.movingRightKeyboard||this.movingLeftKeyboard||this.movingForwardTouch||this.movingBackwardTouch?(this.updateCameraParameters(),t=!0):50<=i&&(this.nextThetaVelocity=0,this.nextPhiVelocity=0,this.thetaVelocity=0,this.phiVelocity=0,this.movingForwardTouch=!1,this.movingBackwardTouch=!1,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),0===this.thetaVelocity&&0===this.phiVelocity||(this.theta+=this.thetaVelocity,this.phi+=this.phiVelocity,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.thetaVelocity*=this.panFriction,this.phiVelocity*=this.panFriction,this.thetaVelocity*this.thetaVelocity+this.phiVelocity*this.phiVelocity<this.panVelocityStopThreshhold*this.panVelocityStopThreshhold&&(this.thetaVelocity=0,this.phiVelocity=0),this.calculateVectors(),t=!0),0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]||(this.cameraPos[0]+=this.moveVelocity[0],this.cameraPos[1]+=this.moveVelocity[1],this.cameraPos[2]+=this.moveVelocity[2],this.moveVelocity[0]*=this.moveFriction,this.moveVelocity[1]*=this.moveFriction,this.moveVelocity[2]*=this.moveFriction,this.moveVelocity[0]*this.moveVelocity[0]+this.moveVelocity[1]*this.moveVelocity[1]+this.moveVelocity[2]*this.moveVelocity[2]<this.moveVelocityStopThreshhold*this.movingSpeed*this.moveVelocityStopThreshhold*this.movingSpeed&&(this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0),this.calculateVectors(),t=!0),t&&window.requestAnimationFrame(this.drawFrame.bind(this))}}calculateVectors(){this.forwardVec=[Math.cos(this.theta)*Math.sin(this.phi),Math.sin(this.theta)*Math.sin(this.phi),Math.cos(this.phi)],this.rightVec=this.normalize([this.forwardVec[1],-this.forwardVec[0],0]),this.upVec=this.crossProduct(this.rightVec,this.forwardVec),this.distanceToScene=this.distanceEstimator(this.cameraPos[0],this.cameraPos[1],this.cameraPos[2]),this.focalLength=this.distanceToScene/2,this.rightVec[0]*=this.focalLength/2,this.rightVec[1]*=this.focalLength/2,this.upVec[0]*=this.focalLength/2,this.upVec[1]*=this.focalLength/2,this.upVec[2]*=this.focalLength/2,this.imagePlaneCenterPos=[this.cameraPos[0]+this.focalLength*this.forwardVec[0],this.cameraPos[1]+this.focalLength*this.forwardVec[1],this.cameraPos[2]+this.focalLength*this.forwardVec[2]],this.wilson.gl.uniform3fv(this.wilson.uniforms.cameraPos,this.cameraPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.imagePlaneCenterPos,this.imagePlaneCenterPos),this.wilson.gl.uniform3fv(this.wilson.uniforms.forwardVec,this.forwardVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.rightVec,this.rightVec),this.wilson.gl.uniform3fv(this.wilson.uniforms.upVec,this.upVec),this.wilson.gl.uniform1f(this.wilson.uniforms.focalLength,this.focalLength)}dotProduct(t,i){return t[0]*i[0]+t[1]*i[1]+t[2]*i[2]}crossProduct(t,i){return[t[1]*i[2]-t[2]*i[1],t[2]*i[0]-t[0]*i[2],t[0]*i[1]-t[1]*i[0]]}matMul(t,i){return[[t[0][0]*i[0][0]+t[0][1]*i[1][0]+t[0][2]*i[2][0],t[0][0]*i[0][1]+t[0][1]*i[1][1]+t[0][2]*i[2][1],t[0][0]*i[0][2]+t[0][1]*i[1][2]+t[0][2]*i[2][2]],[t[1][0]*i[0][0]+t[1][1]*i[1][0]+t[1][2]*i[2][0],t[1][0]*i[0][1]+t[1][1]*i[1][1]+t[1][2]*i[2][1],t[1][0]*i[0][2]+t[1][1]*i[1][2]+t[1][2]*i[2][2]],[t[2][0]*i[0][0]+t[2][1]*i[1][0]+t[2][2]*i[2][0],t[2][0]*i[0][1]+t[2][1]*i[1][1]+t[2][2]*i[2][1],t[2][0]*i[0][2]+t[2][1]*i[1][2]+t[2][2]*i[2][2]]]}normalize(t){var i=Math.sqrt(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);return[t[0]/i,t[1]/i,t[2]/i]}distanceEstimator(i,e,o){for(let t=0;t<this.numSierpinskiIterations;t++){var s=this.dotProduct([i,e,o],this.n1[this.polyhedronIndex]),s=(s<0&&(i-=2*s*this.n1[this.polyhedronIndex][0],e-=2*s*this.n1[this.polyhedronIndex][1],o-=2*s*this.n1[this.polyhedronIndex][2]),this.dotProduct([i,e,o],this.n2[this.polyhedronIndex])),s=(s<0&&(i-=2*s*this.n2[this.polyhedronIndex][0],e-=2*s*this.n2[this.polyhedronIndex][1],o-=2*s*this.n2[this.polyhedronIndex][2]),this.dotProduct([i,e,o],this.n3[this.polyhedronIndex])),s=(s<0&&(i-=2*s*this.n3[this.polyhedronIndex][0],e-=2*s*this.n3[this.polyhedronIndex][1],o-=2*s*this.n3[this.polyhedronIndex][2]),4<=this.numNs[this.polyhedronIndex]&&(s=this.dotProduct([i,e,o],this.n4[this.polyhedronIndex]))<0&&(i-=2*s*this.n4[this.polyhedronIndex][0],e-=2*s*this.n4[this.polyhedronIndex][1],o-=2*s*this.n4[this.polyhedronIndex][2]),i),a=e,n=o,h=[[Math.cos(this.rotationAngleZ1),-Math.sin(this.rotationAngleZ1),0],[Math.sin(this.rotationAngleZ1),Math.cos(this.rotationAngleZ1),0],[0,0,1]],r=[[Math.cos(this.rotationAngleY1),0,-Math.sin(this.rotationAngleY1)],[0,1,0],[Math.sin(this.rotationAngleY1),0,Math.cos(this.rotationAngleY1)]],l=[[1,0,0],[0,Math.cos(this.rotationAngleX1),-Math.sin(this.rotationAngleX1)],[0,Math.sin(this.rotationAngleX1),Math.cos(this.rotationAngleX1)]],c=this.matMul(this.matMul(h,r),l);i=c[0][0]*s+c[0][1]*a+c[0][2]*n,e=c[1][0]*s+c[1][1]*a+c[1][2]*n,o=c[2][0]*s+c[2][1]*a+c[2][2]*n,s=i=this.scale*i-(this.scale-1)*this.scaleCenter[this.polyhedronIndex][0],a=e=this.scale*e-(this.scale-1)*this.scaleCenter[this.polyhedronIndex][1],n=o=this.scale*o-(this.scale-1)*this.scaleCenter[this.polyhedronIndex][2],h=[[Math.cos(this.rotationAngleZ2),-Math.sin(this.rotationAngleZ2),0],[Math.sin(this.rotationAngleZ2),Math.cos(this.rotationAngleZ2),0],[0,0,1]],r=[[Math.cos(this.rotationAngleY2),0,-Math.sin(this.rotationAngleY2)],[0,1,0],[Math.sin(this.rotationAngleY2),0,Math.cos(this.rotationAngleY2)]],l=[[1,0,0],[0,Math.cos(this.rotationAngleX2),-Math.sin(this.rotationAngleX2)],[0,Math.sin(this.rotationAngleX2),Math.cos(this.rotationAngleX2)]],i=(c=this.matMul(this.matMul(h,r),l))[0][0]*s+c[0][1]*a+c[0][2]*n,e=c[1][0]*s+c[1][1]*a+c[1][2]*n,o=c[2][0]*s+c[2][1]*a+c[2][2]*n}return Math.sqrt(i*i+e*e+o*o)*Math.pow(this.scale,-this.numSierpinskiIterations)}onGrabCanvas(t,i,e){this.nextThetaVelocity=0,this.nextPhiVelocity=0,this.thetaVelocity=0,this.phiVelocity=0,"touchstart"===e.type&&(2===e.touches.length?(this.movingForwardTouch=!0,this.movingBackwardTouch=!1,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,window.requestAnimationFrame(this.drawFrame.bind(this))):3===e.touches.length?(this.movingForwardTouch=!1,this.movingBackwardTouch=!0,this.moveVelocity[0]=0,this.moveVelocity[1]=0,this.moveVelocity[2]=0,this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0,window.requestAnimationFrame(this.drawFrame.bind(this))):(this.movingForwardTouch=!1,this.movingBackwardTouch=!1),this.wasMovingTouch=!1)}onDragCanvas(t,i,e,o,s){"touchmove"===s.type&&this.wasMovingTouch?this.wasMovingTouch=!1:(this.theta+=e*Math.PI/2,this.nextThetaVelocity=e*Math.PI/2,this.theta>=2*Math.PI?this.theta-=2*Math.PI:this.theta<0&&(this.theta+=2*Math.PI),this.phi+=o*Math.PI/2,this.nextPhiVelocity=o*Math.PI/2,this.phi>Math.PI-.01?this.phi=Math.PI-.01:this.phi<.01&&(this.phi=.01),this.calculateVectors(),window.requestAnimationFrame(this.drawFrame.bind(this)))}onReleaseCanvas(t,i,e){"touchend"===e.type&&(this.movingForwardTouch=!1,this.movingBackwardTouch=!1,this.wasMovingTouch=!0,0===this.moveVelocity[0])&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),"touchend"===e.type&&e.touches,(0===length||"mouseup"===e.type)&&this.nextThetaVelocity*this.nextThetaVelocity+this.nextPhiVelocity*this.nextPhiVelocity>=this.panVelocityStartThreshhold*this.panVelocityStartThreshhold&&(this.thetaVelocity=this.nextThetaVelocity,this.phiVelocity=this.nextPhiVelocity)}handleKeydownEvent(t){"INPUT"===document.activeElement.tagName||"w"!==t.key&&"s"!==t.key&&"d"!==t.key&&"a"!==t.key||(this.nextMoveVelocity=[0,0,0],this.moveVelocity=[0,0,0],"w"===t.key?this.movingForwardKeyboard=!0:"s"===t.key&&(this.movingBackwardKeyboard=!0),"d"===t.key?this.movingRightKeyboard=!0:"a"===t.key&&(this.movingLeftKeyboard=!0),window.requestAnimationFrame(this.drawFrame.bind(this)))}handleKeyupEvent(t){"INPUT"===document.activeElement.tagName||"w"!==t.key&&"s"!==t.key&&"d"!==t.key&&"a"!==t.key||(0===this.moveVelocity[0]&&0===this.moveVelocity[1]&&0===this.moveVelocity[2]&&(this.moveVelocity[0]=this.nextMoveVelocity[0],this.moveVelocity[1]=this.nextMoveVelocity[1],this.moveVelocity[2]=this.nextMoveVelocity[2],this.nextMoveVelocity[0]=0,this.nextMoveVelocity[1]=0,this.nextMoveVelocity[2]=0),"w"===t.key?this.movingForwardKeyboard=!1:"s"===t.key&&(this.movingBackwardKeyboard=!1),"d"===t.key?this.movingRightKeyboard=!1:"a"===t.key&&(this.movingLeftKeyboard=!1))}updateCameraParameters(){this.movingSpeed=Math.min(Math.max(1e-6,this.distanceToScene/20),.02);var t=[...this.cameraPos];this.movingForwardKeyboard||this.movingForwardTouch?(this.cameraPos[0]+=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]+=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]+=this.movingSpeed*this.forwardVec[2]):(this.movingBackwardKeyboard||this.movingBackwardTouch)&&(this.cameraPos[0]-=this.movingSpeed*this.forwardVec[0],this.cameraPos[1]-=this.movingSpeed*this.forwardVec[1],this.cameraPos[2]-=this.movingSpeed*this.forwardVec[2]),this.movingRightKeyboard?(this.cameraPos[0]+=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]+=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]+=this.movingSpeed*this.rightVec[2]/this.focalLength):this.movingLeftKeyboard&&(this.cameraPos[0]-=this.movingSpeed*this.rightVec[0]/this.focalLength,this.cameraPos[1]-=this.movingSpeed*this.rightVec[1]/this.focalLength,this.cameraPos[2]-=this.movingSpeed*this.rightVec[2]/this.focalLength),this.nextMoveVelocity[0]=this.cameraPos[0]-t[0],this.nextMoveVelocity[1]=this.cameraPos[1]-t[1],this.nextMoveVelocity[2]=this.cameraPos[2]-t[2],this.calculateVectors()}changeResolution(t=this.imageSize){this.imageSize=Math.max(100,t),this.wilson.fullscreen.currentlyFullscreen?1<=aspectRatio?(this.imageWidth=this.imageSize,this.imageHeight=Math.floor(this.imageSize/aspectRatio)):(this.imageWidth=Math.floor(this.imageSize*aspectRatio),this.imageHeight=this.imageSize):(this.imageWidth=this.imageSize,this.imageHeight=this.imageSize),this.wilson.changeCanvasSize(this.imageWidth,this.imageHeight),this.imageWidth>=this.imageHeight?(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,this.imageWidth/this.imageHeight),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,1)):(this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioX,1),this.wilson.gl.uniform1f(this.wilson.uniforms.aspectRatioY,this.imageWidth/this.imageHeight)),this.wilson.gl.uniform1i(this.wilson.uniforms.imageSize,this.imageSize),window.requestAnimationFrame(this.drawFrame.bind(this))}updateParameters(t,i,e,o,s,a){var n=this;anime({targets:n,rotationAngleX1:t,rotationAngleY1:i,rotationAngleZ1:e,rotationAngleX2:o,rotationAngleY2:s,rotationAngleZ2:a,duration:1e3,easing:"easeOutQuad",update:n.updateMatrices.bind(n)})}updateMatrices(){var t=[[Math.cos(this.rotationAngleZ1),-Math.sin(this.rotationAngleZ1),0],[Math.sin(this.rotationAngleZ1),Math.cos(this.rotationAngleZ1),0],[0,0,1]],i=[[Math.cos(this.rotationAngleY1),0,-Math.sin(this.rotationAngleY1)],[0,1,0],[Math.sin(this.rotationAngleY1),0,Math.cos(this.rotationAngleY1)]],e=[[1,0,0],[0,Math.cos(this.rotationAngleX1),-Math.sin(this.rotationAngleX1)],[0,Math.sin(this.rotationAngleX1),Math.cos(this.rotationAngleX1)]],o=this.matMul(this.matMul(t,i),e);this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix1,!1,[o[0][0],o[1][0],o[2][0],o[0][1],o[1][1],o[2][1],o[0][2],o[1][2],o[2][2]]),t=[[Math.cos(this.rotationAngleZ2),-Math.sin(this.rotationAngleZ2),0],[Math.sin(this.rotationAngleZ2),Math.cos(this.rotationAngleZ2),0],[0,0,1]],i=[[Math.cos(this.rotationAngleY2),0,-Math.sin(this.rotationAngleY2)],[0,1,0],[Math.sin(this.rotationAngleY2),0,Math.cos(this.rotationAngleY2)]],e=[[1,0,0],[0,Math.cos(this.rotationAngleX2),-Math.sin(this.rotationAngleX2)],[0,Math.sin(this.rotationAngleX2),Math.cos(this.rotationAngleX2)]],o=this.matMul(this.matMul(t,i),e),this.wilson.gl.uniformMatrix3fv(this.wilson.uniforms.rotationMatrix2,!1,[o[0][0],o[1][0],o[2][0],o[0][1],o[1][1],o[2][1],o[0][2],o[1][2],o[2][2]]),window.requestAnimationFrame(this.drawFrame.bind(this))}async changePolyhedron(t){await changeOpacity(this.wilson.canvas,0),this.polyhedronIndex=t,this.wilson.gl.uniform3fv(this.wilson.uniforms.lightPos,this.lightPos[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.scaleCenter,this.scaleCenter[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n1,this.n1[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n2,this.n2[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n3,this.n3[this.polyhedronIndex]),this.wilson.gl.uniform3fv(this.wilson.uniforms.n4,this.n4[this.polyhedronIndex]),this.wilson.gl.uniform1i(this.wilson.uniforms.numNs,this.numNs[this.polyhedronIndex]),window.requestAnimationFrame(this.drawFrame.bind(this)),changeOpacity(this.wilson.canvas,1)}}export{KaleidoscopicIFSFractal};